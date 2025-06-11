"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full fixed top-0 z-50"
    >
      <div className="absolute inset-0 bg-gray-950 backdrop-blur-lg border-b border-gray-800/30" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-5 flex justify-between items-center">
        <Link href="/" className="group relative z-10">
          <span className="text-xl font-bold text-white">
            RepoDoc
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {[
            { text: "How It Works", href: "#howitworks" },
            { text: "Features", href: "#features" },
            { text: "Pricing", href: "#pricing" },
            { text: "FAQ", href: "#faq" },
          ].map((item) => (
            <Link
              key={item.text}
              href={item.href}
              className="relative text-sm font-medium text-white hover:text-blue-400 transition-colors"
            >
              {item.text}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}

          <div className="flex items-center gap-6 pl-3">
            <Link
              href="/sign-in"
              className="flex items-center gap-1 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all duration-200 shadow-lg shadow-blue-500/20"
            >
              Sign In
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden relative z-50 p-2 rounded-full text-white hover:bg-white/10 transition-all focus:outline-none"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" strokeWidth={2} />
          ) : (
            <Menu className="w-6 h-6" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-950 z-40 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full gap-10 px-6"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-6 left-0 right-0 flex justify-center"
              >
                <span className="text-2xl font-bold text-white">RepoDoc</span>
              </motion.div>

              {[
                { text: "How It Works", href: "#howitworks" },
                { text: "Features", href: "#features" },
                { text: "Pricing", href: "#pricing" },
                { text: "FAQ", href: "#faq" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-xl font-medium text-white hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.text}
                  </Link>
                </motion.div>
              ))}

              <div className="flex flex-col items-center gap-8 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full max-w-xs"
                >
                  <Link
                    href="/sign-in"
                    className="flex items-center justify-center gap-2 w-full px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all duration-200 shadow-lg shadow-blue-500/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
