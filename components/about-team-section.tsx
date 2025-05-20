import Image from "next/image"

const team = [
  {
    name: "Sanjay M.",
    role: "Founder",
    image: "/images/team-placeholder-1.jpg",
    blurb: "Dreamer, builder, and fashion enthusiast. Sanjay leads the vision and product direction at Shrobe.",
  },
  {
    name: "Jimena Cabrera",
    role: "Founder",
    image: "/images/team-placeholder-2.jpg",
    blurb: "Jimena is a Computer Science and Computer Engineering student at Universidad Carlos III de Madrid, who's doing an exchange year at UC Davis. She leads the technical and product vision of Shrobes, designing and building the platform from the ground up — including authentication, user profiles, messaging, listings, and real-time updates. She translates user needs into intuitive features, manages all Supabase integration, and ensures a smooth product experience end to end. Beyond code, she also drives platform strategy, iterates fast based on user feedback, and keeps the team moving forward.",
  },
  {
    name: "Jamie Lee",
    role: "Design & Brand",
    image: "/images/team-placeholder-3.jpg",
    blurb: "Crafting beautiful, intuitive experiences and keeping the brand fresh.",
  },
  {
    name: "Morgan Patel",
    role: "Community & Ops",
    image: "/images/team-placeholder-4.jpg",
    blurb: "Connecting with users and making the Shrobe community thrive.",
  },
]

export default function AboutTeamSection() {
  return (
    <section className="bg-gradient-to-b from-black to-gray-900 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary-pink text-sm uppercase tracking-wider inline-block mb-2">
            About Us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Meet the Team
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mt-3">
            We're a passionate group of creators, technologists, and fashion lovers on a mission to make style more sustainable, social, and fun.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <div
              key={i}
              className="bg-gray-800/70 rounded-2xl overflow-hidden shadow-xl border border-gray-700/40 flex flex-col items-center p-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden mb-6 border-4 border-primary-pink/40 bg-gray-900">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
              <span className="text-primary-pink text-sm font-medium mb-2">{member.role}</span>
              <p className="text-gray-300 text-sm text-center">{member.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 