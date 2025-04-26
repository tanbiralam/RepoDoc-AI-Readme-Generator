"use client";

import { motion } from "framer-motion";
import { ArrowRight, Github, Star } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gray-950 pt-16 pb-32">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-blue-500/20 opacity-20 blur-3xl" />
      </div>
      <div className="absolute h-40 w-full bg-gradient-to-b from-gray-950 to-transparent bottom-0 z-10" />

      <div className="container relative z-20 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="flex items-center rounded-full border border-gray-800 bg-gray-900 px-3 py-1 text-sm font-medium text-gray-300">
              <Star className="mr-1 h-3.5 w-3.5 text-yellow-500" />
              <span>AI-Powered README Generation</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl"
          >
            GitHub README Generator
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mb-10 max-w-xl text-lg text-gray-400"
          >
            Create impressive GitHub README files in seconds with our AI-powered
            generator. Highlight your projects effectively and make your
            repositories shine.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="#generate"
              className="group inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-3.5 text-base font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/25 transform hover:-translate-y-1"
            >
              Generate README
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="https://github.com/yourusername/github-readme-generator"
              className="inline-flex items-center justify-center rounded-lg border border-gray-700 bg-gray-900 px-6 py-3.5 text-base font-medium text-white transition-all duration-300 hover:bg-gray-800 transform hover:-translate-y-1"
            >
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="relative">
            {/* Code editor mockup */}
            <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-500">
                  github-readme-generator
                </div>
                <div className="w-16"></div>
              </div>
              <div className="grid grid-cols-12 divide-x divide-gray-800">
                <div className="col-span-3 bg-gray-950 p-4">
                  <div className="flex flex-col gap-2">
                    <div className="h-6 w-3/4 rounded bg-gray-800"></div>
                    <div className="h-6 w-2/3 rounded bg-gray-800"></div>
                    <div className="h-6 w-5/6 rounded bg-blue-900/30"></div>
                    <div className="h-6 w-4/5 rounded bg-gray-800"></div>
                  </div>
                </div>
                <div className="col-span-9 p-6 text-gray-300">
                  <div className="flex flex-col gap-4">
                    <div className="h-8 w-3/4 rounded bg-gradient-to-r from-blue-500/20 to-indigo-500/20 animate-pulse"></div>
                    <div className="h-4 w-full rounded bg-gray-800"></div>
                    <div className="h-4 w-11/12 rounded bg-gray-800"></div>
                    <div className="h-4 w-3/4 rounded bg-gray-800"></div>
                    <div className="mt-4 h-24 w-full rounded bg-gray-800/50 border border-gray-700"></div>
                    <div className="flex justify-end">
                      <div className="h-10 w-32 rounded bg-blue-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative glow effect */}
            <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10 blur-lg"></div>
          </div>

          {/* Decorative background pattern */}
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl"></div>
          <div className="absolute -top-20 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl"></div>
        </motion.div>
      </div>
    </div>
  );
}
