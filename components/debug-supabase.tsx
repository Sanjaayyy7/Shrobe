"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DebugSupabase() {
  const [status, setStatus] = useState<string>("Not checked")
  const [isLoading, setIsLoading] = useState(false)
  const [showSql, setShowSql] = useState(false)
  const [tableExists, setTableExists] = useState(false)
  const [sqlCopied, setSqlCopied] = useState(false)

  const sqlScript = `-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create signups table
CREATE TABLE public.signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add row level security
ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting (anyone can sign up)
CREATE POLICY "Allow public to insert their email" ON public.signups
  FOR INSERT TO public WITH CHECK (true);

-- Create policy for selecting (anyone can select limited data)
CREATE POLICY "Allow public to select limited data" ON public.signups
  FOR SELECT TO public USING (true);`

  const checkConnection = async () => {
    setIsLoading(true)
    setStatus("Checking...")

    try {
      // Simple connection check - just try to access any public schema info
      // This avoids using system tables that might not be accessible
      const { error: connectionError } = await supabase.rpc("get_status").catch(() => ({ error: null })) // Ignore errors here, we'll check the table directly

      // Now check signups table
      const { data, error } = await supabase.from("signups").select("id").limit(1)

      if (error) {
        const errorMessage = error.message || "Unknown error"

        if (errorMessage.includes("does not exist")) {
          // This is expected during setup
          setStatus("Table 'signups' doesn't exist yet. You need to create it.")
          setShowSql(true)
          setTableExists(false)
        } else {
          console.error("Supabase table error:", error)
          setStatus(`Error: ${errorMessage}`)
        }
      } else {
        setStatus(`Connected! Database is accessible.`)
        setShowSql(false)
        setTableExists(true)
      }
    } catch (error) {
      console.error("Error checking Supabase connection:", error)
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlScript).then(() => {
      setSqlCopied(true)
      setTimeout(() => setSqlCopied(false), 2000)
    })
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg text-sm z-50 max-w-md">
      <h4 className="font-bold mb-2">Supabase Debug</h4>
      <p className="mb-2">Status: {status}</p>
      <p className="mb-2 text-xs">
        URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "❌ Missing"}
        <br />
        Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "❌ Missing"}
        <br />
        Table Exists: {tableExists ? "✓ Yes" : "❌ No"}
      </p>
      <button
        onClick={checkConnection}
        disabled={isLoading}
        className="bg-primary-purple text-white px-3 py-1 rounded text-xs hover:bg-primary-purple/90 mr-2"
      >
        {isLoading ? "Checking..." : "Check Connection"}
      </button>

      {!tableExists && (
        <div className="mt-4 border-t border-gray-700 pt-2">
          <div className="bg-yellow-800 text-yellow-200 p-2 rounded mb-2">
            <p className="font-bold">Table Setup Required</p>
            <p className="text-xs">The signups table needs to be created in your Supabase database.</p>
          </div>

          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold">Run this SQL in your Supabase SQL Editor:</p>
            <button onClick={copySqlToClipboard} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
              {sqlCopied ? "Copied!" : "Copy SQL"}
            </button>
          </div>
          <div className="bg-gray-900 p-2 rounded text-xs overflow-auto max-h-40">
            <pre>{sqlScript}</pre>
          </div>

          <div className="mt-2 text-xs">
            <p className="font-bold text-white">Steps to create the table:</p>
            <ol className="list-decimal pl-4 mt-1 space-y-1 text-gray-300">
              <li>
                Go to your{" "}
                <a
                  href="https://app.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-purple hover:underline"
                >
                  Supabase Dashboard
                </a>
              </li>
              <li>Select your project</li>
              <li>Go to the SQL Editor (left sidebar)</li>
              <li>Create a new query</li>
              <li>Paste the SQL above</li>
              <li>Click "Run" to execute</li>
              <li>Return to this page and click "Check Connection"</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
