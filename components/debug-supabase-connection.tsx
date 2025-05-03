"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseDemoMode } from "@/lib/supabase"

export default function DebugSupabaseConnection() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Testing connection...")
  const [envVars, setEnvVars] = useState<{url: string, hasKey: boolean}>({
    url: "",
    hasKey: false
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    async function checkConnection() {
      try {
        // Check if we're in demo mode
        if (isSupabaseDemoMode()) {
          setConnectionStatus("DEMO MODE - You need to set environment variables")
          setEnvVars({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
            hasKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
          })
          return
        }
        
        // Test the connection by making a simple query
        const { data, error } = await supabase.from("signups").select("count", { count: "exact", head: true })
        
        if (error) {
          console.error("Connection error:", error)
          setConnectionStatus(`ERROR: ${error.message}`)
        } else {
          setConnectionStatus("Connected to Supabase successfully!")
        }
        
        // Display environment variables (safe version)
        setEnvVars({
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
          hasKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        })
      } catch (error) {
        console.error("Unexpected error:", error)
        setConnectionStatus(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    
    checkConnection()
  }, [])
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Supabase Connection Status</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
        </button>
      </div>
      
      <div className={`mt-2 ${connectionStatus.includes("ERROR") ? "text-red-600" : 
                             connectionStatus.includes("DEMO") ? "text-yellow-600" : "text-green-600"}`}>
        {connectionStatus}
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-2 text-sm">
          <div>
            <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span> 
            <span className="ml-2">{envVars.url}</span>
          </div>
          <div>
            <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span> 
            <span className="ml-2">{envVars.hasKey ? "Set (value hidden)" : "Not set"}</span>
          </div>
          <div className="mt-4 text-gray-600">
            <p className="mb-2">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Create a <code className="bg-gray-100 px-1">.env.local</code> file in the project root</li>
              <li>Add these variables from your Supabase dashboard:
                <pre className="bg-gray-100 p-2 mt-1 rounded">
{`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
                </pre>
              </li>
              <li>Restart your Next.js server</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
} 