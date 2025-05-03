import Link from "next/link"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="bg-dark-bg text-white py-16 md:py-24">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-primary-pink block mb-2">BUY IT.</span>
            <span className="text-primary-pink block mb-2">TRADE IT.</span>
            <span className="text-primary-pink block mb-2">RENT IT.</span>
            <span>SHARE YOUR STYLE.</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-lg">
            Transform your wardrobe with Shrobe. Browse through closets, find your style, and share yours with the
            world. Sustainable fashion has never been this easy.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#closets"
              className="bg-primary-pink hover:bg-primary-pink/90 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:-translate-y-1"
            >
              Explore Closets
            </Link>
            <Link
              href="/signup"
              className="bg-transparent border-2 border-primary-purple text-primary-purple font-bold py-3 px-8 rounded-full hover:bg-primary-purple/10 transition-all transform hover:-translate-y-1"
            >
              Share Your Style
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl transform perspective-1000 rotate-y-minus-5">
              <Image
                src="/images/sustainable-fashion-4.png"
                alt="Wardrobe showcase"
                width={400}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
