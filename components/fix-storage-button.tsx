"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function FixStorageButton() {
  const [isFixing, setIsFixing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fixStorage = async () => {
    setIsFixing(true)
    setResult(null)

    try {
      // Step 1: Create the bucket if it doesn't exist
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()

      if (listError) {
        setResult(`Error listing buckets: ${listError.message}`)
        return
      }

      const bucketExists = buckets.some((b) => b.name === 'listings')

      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket('listings', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        })
        if (createError) {
          setResult(`Error creating bucket: ${createError.message}`)
          return
        }
      }

      // Step 2: Call your custom RPC or fallback API
      const { error: rpcError } = await supabase.rpc('fix_storage_policies')

      if (rpcError) {
        console.warn('RPC not found, falling back to API...')
        
        // Try alternative direct policies
        try {
          // First attempt - direct SQL via service role (if available)
          // Drop conflicting policies
          await supabase.storage.from('listings').remove(['test.txt']).catch(() => {});
          
          // Make the bucket public
          await supabase.storage.updateBucket('listings', {
            public: true,
            fileSizeLimit: 5 * 1024 * 1024, // 5MB
          });

          // Fall back to API
          const res = await fetch('/api/fix-storage', { method: 'POST' })

          if (!res.ok) {
            setResult(`API Error: ${res.statusText}`)
            return
          }

          const json = await res.json()
          setResult(`${json.message} (via API fallback)`)
        } catch (fallbackErr) {
          console.error("Fallback error:", fallbackErr);
          setResult(`Error fixing policies. Please contact support.`);
        }
      } else {
        setResult("Storage policies fixed successfully via RPC")
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setResult(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown'}`)
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="mt-4">
      <div className="bg-red-900/50 border border-red-500/30 p-4 rounded-md mb-3">
        <h3 className="text-red-300 font-bold mb-2">Having trouble uploading images?</h3>
        <p className="text-white/80 text-sm mb-3">
          If you're getting an error message about "row-level security policy" when trying to upload images,
          click the button below to fix storage permissions.
        </p>
        <button
          onClick={fixStorage}
          disabled={isFixing}
          className="bg-[#FF5CB1] text-white px-4 py-2 rounded text-sm hover:bg-opacity-90 disabled:opacity-50"
        >
          {isFixing ? "Fixing Storage..." : "Fix Storage Permissions"}
        </button>
      </div>

      {result && (
        <div
          className={`mt-2 p-2 text-sm rounded ${
            result.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          {result}
        </div>
      )}
    </div>
  )
}
