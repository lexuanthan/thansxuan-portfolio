"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Trang chủ" },
    { href: "/projects", label: "Portfolio" },
    { href: "/ai-tools", label: "AI Tools" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition">
            Thế giới của Thân LX
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative group text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col gap-1.5"
          >
            <div className={`w-6 h-0.5 bg-gray-800 transition-transform ${isOpen ? "rotate-45 translate-y-2" : ""}`}></div>
            <div className={`w-6 h-0.5 bg-gray-800 ${isOpen ? "opacity-0" : ""}`}></div>
            <div className={`w-6 h-0.5 bg-gray-800 transition-transform ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block p-2 hover:bg-blue-50 text-gray-700 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}