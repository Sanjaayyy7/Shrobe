"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Bell, MessageSquare, User, Plus, Menu } from "lucide-react"

export default function Header() {
  const [activeTab, setActiveTab] = useState("discover")
  const userName = "Alex" // This would come from auth state in a real app

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/feed" className="text-2xl font-bold text-white">
              Shrobe
            </Link>
            
            <nav className="hidden md:flex items-center ml-6 space-x-1">
              <button 
                onClick={() => setActiveTab("discover")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === "discover" 
                    ? "bg-white/10 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                Discover
              </button>
              <button 
                onClick={() => setActiveTab("nearby")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === "nearby" 
                    ? "bg-white/10 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                Nearby
              </button>
            </nav>
          </div>

          {/* Welcome message - Mobile hidden, visible on md+ */}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white/70">
              Hi, <span className="text-white">{userName}</span>
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Add to Closet Button */}
            <button className="hidden md:flex items-center space-x-1 px-4 py-1.5 bg-[#E91E63] hover:bg-[#D81B60] text-white rounded-full text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add to Closet</span>
            </button>
            
            {/* Mobile Add Button */}
            <button className="md:hidden flex items-center justify-center w-8 h-8 bg-[#E91E63] text-white rounded-full">
              <Plus className="w-4 h-4" />
            </button>
            
            {/* Icons */}
            <button className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            <button className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-[#E91E63] rounded-full"></span>
            </button>
            
            <button className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors relative">
              <MessageSquare className="w-5 h-5" />
            </button>
            
            <button className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <User className="w-5 h-5" />
            </button>
            
            {/* Mobile Menu */}
            <button className="md:hidden w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 