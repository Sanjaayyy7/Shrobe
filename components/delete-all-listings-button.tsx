"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteAllUserListings } from "@/lib/database"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface DeleteAllListingsButtonProps {
  userId: string;
  onSuccess: () => void;
}

export default function DeleteAllListingsButton({ userId, onSuccess }: DeleteAllListingsButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const supabase = createClientComponentClient()

  const handleInitiateDelete = () => {
    setShowConfirmation(true)
    setResult(null)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setResult(null)

    try {
      // Verify the user is authenticated and is the same user
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || session.user.id !== userId) {
        setResult({
          success: false,
          message: "You can only delete your own listings"
        })
        setShowConfirmation(false)
        return
      }
      
      // Delete all listings
      const result = await deleteAllUserListings(userId)
      
      setResult({
        success: true,
        message: `Successfully deleted ${result.deleted} listings from your closet`
      })
      
      // Call the onSuccess callback to refresh the UI
      onSuccess()
    } catch (error) {
      console.error("Error deleting listings:", error)
      setResult({
        success: false,
        message: `Failed to delete listings: ${error instanceof Error ? error.message : "Unknown error"}`
      })
    } finally {
      setIsDeleting(false)
      setShowConfirmation(false)
    }
  }

  const handleCancelDelete = () => {
    setShowConfirmation(false)
  }

  return (
    <div className="relative">
      <button
        onClick={handleInitiateDelete}
        disabled={isDeleting}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {isDeleting ? "Deleting..." : "Delete All Listings"}
      </button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete All Listings</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete all your listings? This action cannot be undone and will remove all your items from the feed page.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete All"}
                {isDeleting && (
                  <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result message */}
      {result && (
        <div
          className={`mt-3 p-3 text-sm rounded ${
            result.success ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  )
} 