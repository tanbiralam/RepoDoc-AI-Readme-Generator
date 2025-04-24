"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <motion.h1
                className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span className="block mb-2">Create Professional</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  README Files
                </span>
                <span className="text-xl text-gray-600 font-normal mt-3 block">
                  In just seconds with AI-powered generation
                </span>
              </motion.h1>

              <motion.p
                className="mt-6 text-lg text-gray-600 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Make your GitHub projects stand out with beautifully formatted
                documentation. Our AI analyzes your repository to create
                tailored READMEs that perfectly showcase your work.
              </motion.p>

              <motion.div
                className="mt-10 flex flex-col sm:flex-row gap-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Link href="/auth">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="px-8 py-6 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-300 w-full sm:w-auto">
                      Get Started
                    </Button>
                  </motion.div>
                </Link>
                <Link href="#how-it-works">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="px-8 py-6 text-base font-medium text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-300 w-full sm:w-auto">
                      How It Works
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                className="mt-12 flex items-center gap-x-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 opacity-70 flex items-center justify-center text-xs text-white"
                      style={{ opacity: 1 - i * 0.15 }}
                    ></div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Trusted by{" "}
                  <span className="font-semibold text-gray-900">10,000+</span>{" "}
                  developers
                </p>
              </motion.div>
            </motion.div>

            {/* Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative mx-auto max-w-[500px]">
                <motion.div
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="relative z-20 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md"
                >
                  {/* Window controls */}
                  <div className="flex h-8 items-center gap-2 border-b border-gray-100 bg-gray-50 px-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                    <div className="ml-auto text-xs font-medium text-gray-400">
                      README.md
                    </div>
                  </div>

                  {/* README content */}
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="h-7 w-4/5 rounded-md bg-blue-50"></div>
                      <div className="h-7 w-3/5 rounded-md bg-blue-50"></div>
                      <div className="space-y-3">
                        <div className="h-4 w-full rounded-md bg-gray-100"></div>
                        <div className="h-4 w-11/12 rounded-md bg-gray-100"></div>
                        <div className="h-4 w-4/5 rounded-md bg-gray-100"></div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-10 w-24 rounded-md bg-blue-100 flex items-center justify-center">
                          <div className="h-4 w-16 rounded-md bg-blue-200"></div>
                        </div>
                        <div className="h-10 w-24 rounded-md bg-green-100 flex items-center justify-center">
                          <div className="h-4 w-16 rounded-md bg-green-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative elements */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute -bottom-6 -left-6 h-64 w-64 rounded-lg border border-blue-100 bg-blue-50"
                ></motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -top-6 -right-6 h-64 w-64 rounded-lg border border-indigo-100 bg-indigo-50"
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
