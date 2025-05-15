"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Send, User } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Simulación de receptor (en app real, vendría de la URL o props)
const RECEIVER = {
  id: "other_user_id",
  name: "Mia",
  avatar: "/images/avatars/mia.jpg"
}

export default function MessagesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Obtener usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session?.user) {
        router.push("/login")
        return
      }
      setUser(data.session.user)
      setLoading(false)
    }
    fetchUser()
  }, [router, supabase])

  // Cargar mensajes
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
      .order("timestamp", { ascending: true })
    if (!error && data) setMessages(data)
  }

  // Enviar mensaje
  const sendMessage = async () => {
    if (newMessage.trim() === "" || !user) return
    setSending(true)
    await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: RECEIVER.id,
        content: newMessage,
        timestamp: new Date().toISOString()
      }
    ])
    setNewMessage("")
    setSending(false)
    // fetchMessages() // No hace falta, el realtime lo añade
  }

  // Real-time y scroll
  useEffect(() => {
    if (!user) return
    fetchMessages()
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        payload => {
          // Solo añadir si el mensaje es relevante para este chat
          if (
            (payload.new.sender_id === user.id && payload.new.receiver_id === RECEIVER.id) ||
            (payload.new.sender_id === RECEIVER.id && payload.new.receiver_id === user.id)
          ) {
            setMessages(prev => [...prev, payload.new])
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user])

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Loading
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando chat...</p>
        </div>
      </div>
    )
  }

  // Header sticky
  const ChatHeader = () => (
    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center px-4 py-3 gap-3">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <Avatar className="w-10 h-10">
        <AvatarImage src={RECEIVER.avatar} alt={RECEIVER.name} />
        <AvatarFallback>{RECEIVER.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-semibold text-white">{RECEIVER.name}</span>
        <span className="text-xs text-gray-400">Online</span>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === user.id
            return (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={RECEIVER.avatar} alt={RECEIVER.name} />
                    <AvatarFallback>{RECEIVER.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl shadow-md text-sm break-words ${
                    isMe
                      ? "bg-gradient-to-br from-[#ff65c5] to-[#c7aeef] text-white rounded-br-md"
                      : "bg-gray-800 text-white rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
                {isMe && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                    <AvatarFallback>{(user.user_metadata?.full_name || user.email || "U").charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <form
        className="p-4 border-t border-white/10 bg-black/80 flex gap-2"
        onSubmit={e => {
          e.preventDefault()
          sendMessage()
        }}
      >
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-900/60 border-white/10 text-white placeholder:text-gray-400"
          placeholder="Escribe tu mensaje..."
          disabled={sending}
          autoFocus
        />
        <Button type="submit" disabled={sending || newMessage.trim() === ""} className="bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white shadow-lg">
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  )
}

