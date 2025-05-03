"use client"

import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AnimatedBackground from "@/components/animated-background"
import GradientBackground from "@/components/gradient-background"

export default function Closet() {
    return (
        <main className="bg-black text-white">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GradientBackground />
                <AnimatedBackground variant="dots" opacity={0.05} />
            </div>

            <Header />

            <div className="container mx-auto px-4 py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
                    <span className="text-primary-pink">Closets</span>
                </h1>
            </div>

            <Footer />
        </main>
    )
}
