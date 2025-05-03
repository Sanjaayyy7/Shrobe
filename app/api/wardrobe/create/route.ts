import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    const { title } = await req.json()
    
    if (!title || typeof title !== 'string') {
      return new Response(JSON.stringify({ error: 'Title is required and must be a string' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const { data, error } = await supabase
      .from('wardrobes')
      .insert({ user_id: user.id, title })
      .select()

    if (error) {
      console.error('Error creating wardrobe:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    return new Response(JSON.stringify(data), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
} 