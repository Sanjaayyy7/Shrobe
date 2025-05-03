"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CreateWardrobeForm() {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: any; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // Get the current session to ensure user is logged in
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setResult({ error: 'You must be logged in to create a wardrobe' })
        return
      }

      // Call the API endpoint
      const response = await fetch('/api/wardrobe/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResult({ error: data.error || 'Something went wrong' })
      } else {
        setResult({ success: data })
        setTitle('')
      }
    } catch (error) {
      console.error('Error creating wardrobe:', error)
      setResult({ error: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Wardrobe</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Wardrobe Name
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="My Fashion Collection"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Wardrobe'}
        </button>
      </form>
      
      {result && (
        <div className="mt-4">
          {result.error ? (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              Error: {result.error}
            </div>
          ) : result.success ? (
            <div className="p-3 bg-green-100 text-green-700 rounded-md">
              <p>Wardrobe created successfully!</p>
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(result.success, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
} 