import NewsletterSignup from "./newsletter-signup"
import Logo from "./logo"

export default function SignupSection() {
  return (
    <section className="bg-gradient-to-r from-primary-pink to-primary-purple py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <Logo size="medium" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">Get Early Access</h2>
          <p className="text-white text-center text-lg mb-8 opacity-90">
            Be the first to know when we launch and unlock exclusive deals!
          </p>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <NewsletterSignup />
          </div>
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>
    </section>
  )
}
