"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, ArrowLeft, Loader } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function ChatPage() {
  const supabase = createClientComponentClient()
  const params = useParams()
  const router = useRouter()
  const receiverId = params?.id as string

  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const [receiverInfo, setReceiverInfo] = useState<any>(null)
  const [sending, setSending] = useState(false)

  // Obtener el usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        setUser(data.session.user)
      } else {
        router.push("/login")
      }
    }
    getUser()
  }, [])

  // Obtener info del usuario receptor
  useEffect(() => {
    if (!receiverId) return
    const fetchReceiverInfo = async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("id, full_name, user_name, profile_picture_url")
        .eq("id", receiverId)
        .single()
      if (!error && data) {
        setReceiverInfo(data)
      }
    }
    fetchReceiverInfo()
  }, [receiverId])

  // Cargar mensajes y suscribirse a nuevos
  useEffect(() => {
    if (!user) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })

      if (data) setMessages(data)
    }

    fetchMessages()

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new
          // Solo añadir si es un mensaje entre estos dos usuarios
          if (
            user &&
            ((m.sender_id === user.id && m.receiver_id === receiverId) ||
              (m.sender_id === receiverId && m.receiver_id === user.id))
          ) {
            setMessages((prev) => [...prev, m])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, receiverId])

  useEffect(() => {
    if (!user || !receiverId) return
  
    const markMessagesAsSeen = async () => {
      console.log("Marcando como vistos:", { userId: user.id, receiverId })
  
      const { data, error } = await supabase
        .from("messages")
        .update({ seen: true })
        .match({
          receiver_id: user.id,
          sender_id: receiverId,
          seen: false,
        })
  
      if (error) {
        console.error("❌ Error al marcar mensajes como vistos:", error)
      } else {
        console.log("✅ Mensajes marcados como vistos:", data)
      }
    }
  
    markMessagesAsSeen()
  }, [user, receiverId])
  

  // Scroll automático al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return
    setSending(true)

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: newMessage,
      })
      .select()

    setSending(false)
    if (!error && data && data.length > 0) {
      setMessages((prev) => [...prev, data[0]])
      setNewMessage("")
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header mejorado */}
      <div className="sticky top-0 bg-black px-4 py-3 border-b border-white/10 flex items-center gap-3 z-10">
        <Button size="icon" variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {receiverInfo && (
          <Avatar className="w-10 h-10">
            <AvatarImage src={receiverInfo.profile_picture_url} alt={receiverInfo.full_name || receiverInfo.user_name || "U"} />
            <AvatarFallback>{(receiverInfo.full_name || receiverInfo.user_name || "U").charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        <span className="font-semibold text-lg truncate">
          {receiverInfo?.full_name || receiverInfo?.user_name}
        </span>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map((msg, i) => {
          const isMine = user && msg.sender_id === user.id
          return (
            <div
              key={msg.id || i}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-xl text-sm break-words shadow-md "
                  ${isMine
                    ? "bg-gradient-to-br from-pink-500 to-purple-400 text-white ml-auto"
                    : "bg-gradient-to-br from-blue-500 to-purple-500 text-white mr-auto"}
                `}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="p-4 border-t border-white/10 bg-black/80 flex gap-2"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-900/60 text-white placeholder:text-gray-400"
          placeholder="Escribe tu mensaje..."
        />
        <Button type="submit" disabled={newMessage.trim() === "" || sending}>
          {sending ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  )
}
