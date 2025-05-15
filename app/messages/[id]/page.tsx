"use client"

// app/messages/[id]/page.tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import React from 'react'

interface MessagePageProps {
  params: { id: string }
}

export default function MessagePage({ params }: MessagePageProps) {
  // Unwrap params using React.use() as required by Next.js
  const unwrappedParams = React.use(params as any) as { id: string }
  const userId = unwrappedParams.id
  
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Chat with User {userId}</h1>
      {/* Aquí puedes renderizar un componente cliente con el id como prop */}
    </main>
  )
}
