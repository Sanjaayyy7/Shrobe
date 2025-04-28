"use client"

import type React from "react"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function EmailSignupForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showTableHelp, setShowTableHelp] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Basic email validation
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      return
    }

    setIsLoading(true)
    setMessage(null)
    setShowTableHelp(false)

    try {
      // Insert the email into the signups table
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
      setMessage({
        type: "success",
        text: "Thanks for signing up! We'll keep you updated on our launch.",
      })
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
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent text-gray-800"
            disabled={isLoading}
            required
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {showTableHelp && (
          <div className="p-3 rounded-lg bg-blue-100 text-blue-800 text-sm">
            <p>
              <span className="font-bold">Administrator Notice:</span> The database table for storing signups hasn't
              been created yet. Please check the debug panel in the bottom right corner for instructions.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-6 text-white font-medium rounded-lg transition-colors ${
            isLoading
              ? "bg-primary-purple/70 cursor-not-allowed"
              : "bg-primary-purple hover:bg-primary-purple/90 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2"
          }`}
        >
          {isLoading ? "Signing up..." : "Sign Up for Updates"}
        </button>
      </form>
    </div>
  )
}
