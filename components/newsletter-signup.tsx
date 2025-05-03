"use client"

import type React from "react"
import { useState } from "react"
import { supabase, isSupabaseDemoMode } from "@/lib/supabase"
import { mockSignups, generateId } from "@/lib/mock-data"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showTableHelp, setShowTableHelp] = useState(false)
  const isDemoMode = isSupabaseDemoMode()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email" })
      return
    }

    setIsLoading(true)
    setMessage(null)
    setShowTableHelp(false)

    try {
      // Check if we're in demo mode
      if (isDemoMode) {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Check if email already exists in mock data
        if (mockSignups.some(signup => signup.email === email)) {
          setMessage({
            type: "error",
            text: "This email is already registered with us.",
          })
          return
        }
        
        // Mock successful signup
        mockSignups.push({
          id: generateId(),
          email,
          created_at: new Date().toISOString()
        })
        
        setEmail("")
        setMessage({ 
          type: "success", 
          text: "Thanks for signing up!" 
        })
        return
      }

      // Use real Supabase in non-demo mode
      const { error } = await supabase.from("signups").insert([{ email }])

      if (error) {
        // Don't log as error if table doesn't exist - this is expected during setup
        const errorMessage = error.message || "Unknown error occurred"

        // Check if the table doesn't exist
        if (errorMessage.includes && errorMessage.includes("does not exist")) {
          setMessage({
            type: "error",
            text: "The signup system is not set up yet.",
          })
          setShowTableHelp(true)
          return
        }

        // For other errors, log them
        console.error("Supabase error:", error)

        // Handle duplicate email
        if (error.code === "23505") {
          setMessage({
            type: "error",
            text: "This email is already registered with us.",
          })
          return
        }

        // Generic error
        setMessage({
          type: "error",
          text: "Failed to save your email. Please try again.",
        })
        return
      }

      // Success case
      setEmail("")
      setMessage({ type: "success", text: "Thanks for signing up!" })
    } catch (error) {
      console.error("Error saving email:", error)

      // Safe error handling
      setMessage({
        type: "error",
        text: "Failed to save your email. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-grow">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent text-gray-800"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`py-3 px-6 text-white font-medium rounded-lg whitespace-nowrap ${
            isLoading
              ? "bg-primary-purple/70 cursor-not-allowed"
              : "bg-primary-purple hover:bg-primary-purple/90 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2"
          }`}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-2 p-2 text-sm rounded-lg ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {showTableHelp && !isDemoMode && (
        <div className="mt-2 p-2 text-sm rounded-lg bg-blue-100 text-blue-800">
          <p>
            <span className="font-bold">Administrator Notice:</span> The database table for storing signups hasn't been
            created yet. Please check the debug panel in the bottom right corner for instructions.
          </p>
        </div>
      )}
    </div>
  )
}
