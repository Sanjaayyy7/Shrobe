import Link from "next/link"
import EmailSignupForm from "@/components/email-signup-form"
import Header from "@/components/header"
import Footer from "@/components/footer"
import DebugSupabaseSimple from "@/components/debug-supabase-simple"

export default function SignupPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-gray-900">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Get Early Access</h1>
            <p className="text-gray-600 mt-2">
              Sign up to be notified when Shrobe launches and get exclusive early access.
            </p>
          </div>

          <EmailSignupForm />

          <div className="mt-8 text-center">
            <Link href="/" className="text-primary-purple hover:text-primary-pink transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
      <DebugSupabaseSimple />
    </>
  )
}
