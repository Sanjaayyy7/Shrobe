"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

function formatTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function MessageLists() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState<any[]>([])

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

  // Obtener lista de chats (usuarios con los que tengo mensajes)
  useEffect(() => {
    if (!user) return
    const fetchChats = async () => {
      // Obtener todos los mensajes donde soy sender o receiver
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("timestamp", { ascending: false })
      if (error) return
      // Agrupar por otro usuario (el que no soy yo)
      const chatMap = new Map()
      messages.forEach((msg: any) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        if (!chatMap.has(otherId)) {
          chatMap.set(otherId, { ...msg, otherId })
        }
      })
      setChats(Array.from(chatMap.values()))
    }
    fetchChats()
  }, [user, supabase])

  // Obtener info de usuario (nombre/avatar) para cada chat
  const [userInfos, setUserInfos] = useState<{ [key: string]: any }>({})
  useEffect(() => {
    const fetchUserInfos = async () => {
      const ids = chats.map(chat => chat.otherId)
      if (ids.length === 0) return
      const { data, error } = await supabase
        .from("User")
        .select("id, full_name, user_name, mail")
        .in("id", ids)
      if (!error && data) {
        const infoMap: { [key: string]: any } = {}
        data.forEach((u: any) => {
          infoMap[u.id] = u
        })
        setUserInfos(infoMap)
      }
    }
    fetchUserInfos()
  }, [chats, supabase])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando chats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <span className="text-2xl font-bold bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] bg-clip-text text-transparent">Mensajes</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {chats.length === 0 ? (
            <motion.div
              key="no-chats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-96 text-gray-400"
            >
              <User className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg">No tienes chats todavía</p>
              <p className="text-sm">¡Empieza una conversación desde el perfil de otro usuario!</p>
            </motion.div>
          ) : (
            chats.map((chat, i) => {
              const info = userInfos[chat.otherId] || {}
              return (
                <motion.div
                  key={chat.otherId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="flex items-center gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer"
                  onClick={() => router.push(`/messages/${chat.otherId}`)}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={info.avatar_url} alt={info.full_name || info.user_name || "U"} />
                    <AvatarFallback>{(info.full_name || info.user_name || "U").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate">{info.full_name || info.user_name || chat.otherId}</span>
                      <span className="text-xs text-gray-400 ml-2">{formatTime(chat.timestamp)}</span>
                    </div>
                    <div className="text-gray-300 truncate text-sm max-w-xs">
                      {chat.content}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
