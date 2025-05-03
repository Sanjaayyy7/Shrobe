import Link from "next/link"
import Image from "next/image"

const closets = [
  {
    id: 1,
    name: "Jimena's Closet",
    items: 42,
    size: "S/M",
    styles: ["Minimal", "Business", "Neutral"],
    images: [
      "/images/sustainable-fashion-1.png",
      "/images/minimalist-fashion-1.png",
      "/images/eco-fashion-1.png",
      "/images/sustainable-fashion-3.png",
      "/images/minimalist-fashion-2.png",
      "/images/eco-fashion-2.png",
    ],
  },
  {
    id: 2,
    name: "Alex's Closet",
    items: 57,
    size: "M/L",
    styles: ["Colorful", "Bohemian", "Creative"],
    images: [
      "/images/vintage-fashion-1.png",
      "/images/upcycled-fashion-1.png",
      "/images/vintage-fashion-2.png",
      "/images/community-fashion-1.png",
      "/images/closet-sharing-1.png",
      "/images/upcycled-fashion-2.png",
    ],
  },
  {
    id: 3,
    name: "Morgan's Closet",
    items: 33,
    size: "XS/S",
    styles: ["Luxury", "Formal", "Designer"],
    images: [
      "/images/sustainable-fashion-2.png",
      "/images/community-fashion-2.png",
      "/images/closet-sharing-2.png",
      "/images/sustainable-fashion-4.png",
      "/images/minimalist-fashion-1.png",
      "/images/eco-fashion-1.png",
    ],
  },
]

export default function FeaturedClosets() {
  return (
    <section id="closets" className="bg-gray-900 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Featured <span className="text-primary-purple">Closets</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {closets.map((closet) => (
            <div
              key={closet.id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="h-48 bg-gray-700 grid grid-cols-3 grid-rows-2 gap-1">
                {closet.images.map((src, i) => (
                  <div key={i} className="bg-gray-600 overflow-hidden">
                    <Image
                      src={src || "/placeholder.svg"}
                      alt={`Item in ${closet.name}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{closet.name}</h3>
                <div className="flex justify-between text-gray-400 text-sm mb-4">
                  <span>{closet.items} items</span>
                  <span>Mostly size {closet.size}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {closet.styles.map((style, i) => (
                    <span key={i} className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                      {style}
                    </span>
                  ))}
                </div>

                <div className="text-center">
                  <Link
                    href={`#closet-${closet.id}`}
                    className="block w-full bg-primary-pink hover:bg-primary-pink/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Take a look
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
