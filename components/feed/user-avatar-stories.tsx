"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Story users data
const storyUsers = [
  { id: 1, name: "Mia", image: "/images/avatars/mia.jpg", hasNew: true },
  { id: 2, name: "Noah", image: "/images/avatars/noah.jpg", hasNew: true },
  { id: 3, name: "Emma", image: "/images/avatars/emma.jpg", hasNew: false },
  { id: 4, name: "Liam", image: "/images/avatars/liam.jpg", hasNew: true },
  { id: 5, name: "Ava", image: "/images/avatars/ava.jpg", hasNew: false },
  { id: 6, name: "Jackson", image: "/images/avatars/jackson.jpg", hasNew: false },
  { id: 7, name: "Isabella", image: "/images/avatars/isabella.jpg", hasNew: true },
  { id: 8, name: "Lucas", image: "/images/avatars/lucas.jpg", hasNew: false },
  { id: 9, name: "Sophia", image: "/images/avatars/sophia.jpg", hasNew: true },
  { id: 10, name: "Oliver", image: "/images/avatars/aiden.jpg", hasNew: false },
  { id: 11, name: "Amelia", image: "/images/avatars/zoe.jpg", hasNew: true },
  { id: 12, name: "Ethan", image: "/images/avatars/marcus.jpg", hasNew: false },
]

export default function UserAvatarStories() {
  const [viewedStories, setViewedStories] = useState<number[]>([])
  
  const handleStoryClick = (userId: number) => {
    // In a real app, this would open a modal with the story content
    // For now, just mark it as viewed
    if (!viewedStories.includes(userId)) {
      setViewedStories((prev) => [...prev, userId])
    }
  }
  
  return (
    <div className="py-2">
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex space-x-4 px-1">
          {storyUsers.map((user) => {
            const hasUnviewed = user.hasNew && !viewedStories.includes(user.id)
            
            return (
              <motion.div 
                key={user.id} 
                className="flex flex-col items-center space-y-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => handleStoryClick(user.id)}
                  className="focus:outline-none"
                  aria-label={`View ${user.name}'s story`}
                >
                  <div 
                    className={`w-[68px] h-[68px] rounded-full flex items-center justify-center p-[3px] ${
                      hasUnviewed 
                        ? 'bg-gradient-to-tr from-[#ff65c5] to-[#c7aeef]' 
                        : 'bg-white/20'
                    }`}
                  >
                    <div className="bg-[#0f0f0f] p-[2px] rounded-full w-full h-full flex items-center justify-center">
                      <Avatar className="w-full h-full border-2 border-[#0f0f0f]">
                        <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                        <AvatarFallback className="bg-[#333] text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </button>
                <span className="text-xs text-white/80 font-medium tracking-tight">
                  {user.name}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 