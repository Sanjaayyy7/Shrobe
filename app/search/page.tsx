'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [clothes, setClothes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 1) {
        handleSearch(query)
      } else {
        setUsers([])
        setClothes([])
      }
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [query])

  const handleSearch = async (text: string) => {
    setLoading(true)

    // Buscar usuarios
    const { data: usersData, error: userError } = await supabase
      .from('profiles') // tabla de usuarios
      .select('*')
      .ilike('username', `%${text}%`)

    // Buscar ropa
    const { data: clothesData, error: clothesError } = await supabase
      .from('clothes') // cambia por 'posts' si tu tabla de ropa se llama así
      .select('*')
      .ilike('title', `%${text}%`) // o 'description' si buscas por descripción

    if (userError || clothesError) {
      console.error(userError || clothesError)
    } else {
      setUsers(usersData || [])
      setClothes(clothesData || [])
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
        {/* Back button */}
        <div className="mb-2 mt-6">
            <Link
              href="/feed"
              className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Feed
            </Link>
        </div>

        <div className="flex justify-center">
            <input
                type="text"
                placeholder="Search users or clothes..."
                className="w-[80%] bg-neutral-900 text-white border border-neutral-700 px-4 py-2 rounded
                        mt-2 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>


      {loading && <p className="text-center text-neutral-400">Searching...</p>}

      {/* Usuarios */}
      {users.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <div className="space-y-4 mb-8">
            {users.map((user) => (
              <motion.div
                key={user.id}
                className="p-4 bg-neutral-800 rounded flex items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Image
                  src={user.avatar_url || '/images/default-avatar.png'}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-lg font-semibold">{user.username}</p>
                  <p className="text-sm text-neutral-400">{user.email}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Ropa */}
      {clothes.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Clothes</h2>
          <div className="grid grid-cols-3 gap-2">
            {clothes.map((item, index) => (
              <motion.div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Image
                  src={item.image_url || '/images/fallback.jpg'}
                  alt={item.title || 'Clothing item'}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {!loading && users.length === 0 && clothes.length === 0 && query.trim().length > 1 && (
        <p className="text-center mt-10 text-neutral-500">No results found</p>
      )}
    </div>
  )
}
