"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

function formatTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function MessageListPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [chats, setChats] = useState<any[]>([])
  const [userInfos, setUserInfos] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session?.user) {
        router.push("/login")
      } else {
        setUser(data.session.user)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!user?.id) return

    const fetchChats = async () => {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      if (error || !messages) return

      const chatMap = new Map()

      for (const msg of messages) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        if (!otherId || otherId === user.id) continue
        if (!chatMap.has(otherId)) {
          chatMap.set(otherId, {
            ...msg,
            otherId,
          })
        }
      }

      const chatArray = Array.from(chatMap.values())
      setChats(chatArray)

      const { data: users } = await supabase
        .from("profile")
        .select("id, full_name, user_name, profile_picture_url")
        .in("id", chatArray.map((chat) => chat.otherId))

      const infoMap: { [key: string]: any } = {}
      users?.forEach((u) => {
        infoMap[u.id] = u
      })
      setUserInfos(infoMap)
      setLoading(false)
    }

    fetchChats()
  }, [user?.id])

  if (loading) {
    return <p className="text-white p-6">Cargando...</p>
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="sticky top-0 z-10 bg-black/80 px-4 py-4 border-b border-white/10 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-2xl font-bold bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] bg-clip-text text-transparent">Messages</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {chats.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <User className="mx-auto w-10 h-10 opacity-30" />
              <p>There are no messages yet.</p>
            </div>
          ) : (
            chats.map((chat, i) => {
              const info = userInfos[chat.otherId] || {}
              const hasUnread = !chat.seen && chat.receiver_id === user.id
              return (
                <motion.div
                  key={chat.otherId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className={`flex items-center gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${hasUnread ? "border border-white rounded-xl" : ""}`}
                  onClick={() => router.push(`/messages/${chat.otherId}`)}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={info.profile_picture_url} alt={info.full_name || info.user_name || "U"} />
                    <AvatarFallback>{(info.full_name || info.user_name || "U").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate flex items-center gap-2">
                        {info.full_name || info.user_name || chat.otherId}
                        {hasUnread && <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">{formatTime(chat.created_at)}</span>
                    </div>
                    <div className="text-gray-300 truncate text-sm">{chat.content}</div>
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