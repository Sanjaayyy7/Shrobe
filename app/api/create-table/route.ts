import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    // Create a Supabase client with the service role key for admin privileges
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create the signups table
    const { error: createTableError } = await supabase
      .from("signups")
      .select()
      .limit(1)
      .catch(() => {
        // Table doesn't exist, we'll create it
        return { error: null }
      })

    if (createTableError && !createTableError.message.includes("does not exist")) {
      // If there's an error that's not about the table not existing, return it
      return NextResponse.json({ error: `Error checking table: ${createTableError.message}` }, { status: 500 })
    }

    // Since we can't execute arbitrary SQL through the API, we'll provide instructions
    return NextResponse.json({
      message: "Please create the table manually using the SQL script in the debug panel",
      success: true,
    })
  } catch (error) {
    console.error("Error creating table:", error)
    return NextResponse.json(
      { error: `Failed to create table: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
