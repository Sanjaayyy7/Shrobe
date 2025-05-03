import CreateWardrobeForm from '@/components/create-wardrobe-form'
import AuthForm from '@/components/auth-form'

export default function CreateWardrobePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Wardrobe Management</h1>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-center">Step 1: Authentication</h2>
        <AuthForm />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">Step 2: Create a Wardrobe</h2>
        <CreateWardrobeForm />
      </div>
    </div>
  )
} 