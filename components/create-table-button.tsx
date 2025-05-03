"use client"

import { useState } from "react"

export default function CreateTableButton() {
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const createTable = async () => {
    setIsCreating(true)
    setResult(null)

    try {
      // Call our server action to create the table
      const response = await fetch("/api/create-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create table")
      }

      setResult("Table creation initiated! Please refresh the page in a few seconds.")
    } catch (error) {
      console.error("Error creating table:", error)
      setResult(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={createTable}
        disabled={isCreating}
        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
      >
        {isCreating ? "Creating Table..." : "Create Signups Table"}
      </button>

      {result && (
        <div
          className={`mt-2 p-2 text-sm rounded ${
            result.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          {result}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        <p>Note: You may need to manually create the table in the Supabase dashboard.</p>
        <p>Go to SQL Editor and run the SQL script shown below.</p>
      </div>
    </div>
  )
}
