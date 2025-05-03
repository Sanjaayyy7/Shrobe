import Image from "next/image"

const features = [
  {
    id: 1,
    title: "Shop",
    description:
      "Browse thousands of stylish items from popular brands and independent designers. Buy pre-loved fashion at amazing prices.",
    image: "/images/eco-fashion-1.png",
  },
  {
    id: 2,
    title: "Rent",
    description:
      "Need something for just one occasion? Rent designer pieces for a fraction of the retail price and return when you're done.",
    image: "/images/community-fashion-1.png",
  },
  {
    id: 3,
    title: "Trade",
    description:
      "Swap your gently worn clothes for something new-to-you. Refresh your wardrobe without spending a dime.",
    image: "/images/closet-sharing-1.png",
  },
]

export default function FeaturesSection() {
  return (
    <section id="how-it-works" className="bg-dark-bg py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-gray-800 p-8 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-6 relative h-48 w-full overflow-hidden rounded-lg">
                <Image src={feature.image || "/placeholder.svg"} alt={feature.title} fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
