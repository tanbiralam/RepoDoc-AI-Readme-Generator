"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  Check,
  Terminal,
  RefreshCw,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  // Steps text content
  const steps = [
    { text: "Detecting repository language...", lang: "TypeScript" },
    { text: "Analyzing project structure...", files: 42 },
    { text: "Identifying key features...", features: 7 },
    { text: "Generating README content...", sections: 8 },
  ];

  // Auto advance through the steps with looping
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (currentStep < steps.length) {
      timer = setTimeout(() => {
        setCurrentStep((c) => c + 1);
        setTyping(true);

        // Set generation complete when reaching last step
        if (currentStep === steps.length - 1) {
          const completeTimer = setTimeout(() => {
            setGenerationComplete(true);
            setTyping(false);

            // Reset after showing completion for a moment
            const resetTimer = setTimeout(() => {
              setCurrentStep(0);
              setGenerationComplete(false);
            }, 3000);

            return () => clearTimeout(resetTimer);
          }, 2000);

          return () => clearTimeout(completeTimer);
        }
      }, 1800);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep, steps.length]);

  // Reset typing animation
  useEffect(() => {
    if (typing) {
      const typingTimer = setTimeout(() => {
        setTyping(false);
      }, 800);
      return () => clearTimeout(typingTimer);
    }
  }, [typing]);

  return (
    <div className="relative overflow-hidden bg-gray-950 pt-24 pb-24 min-h-screen flex items-center">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="container relative z-20 mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Column - Text content */}
          <div className="space-y-8 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-white">
                <Star className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                <span>AI-Powered README Generation</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-white"
            >
              GitHub README Generator
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-lg text-gray-300 leading-relaxed"
            >
              Create impressive GitHub README files in seconds with our
              AI-powered generator. Highlight your projects effectively and make
              your repositories shine.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Link
                href="#generate"
                className="group inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200"
              >
                Generate README
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column - Code editor mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative w-full"
          >
            {/* Code editor mockup */}
            <div className="overflow-hidden rounded-xl border border-gray-800/50 bg-gray-900/80 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-md">
                  <Terminal className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">
                    README Generator
                  </span>
                </div>
                <div className="w-16"></div>
              </div>

              <div className="p-6 text-gray-300 h-[380px] flex flex-col">
                <div className="flex-1 flex flex-col">
                  {/* Terminal window with animated typing */}
                  <div className="bg-gray-950 border border-gray-800 rounded-lg p-5 font-mono text-sm flex-1">
                    <div className="flex items-center mb-4">
                      <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center mr-2">
                        <Terminal className="h-3 w-3 text-blue-400" />
                      </div>
                      <div className="text-xs text-gray-400">
                        AI README Generator
                      </div>
                    </div>

                    <div className="space-y-3">
                      {steps.slice(0, currentStep + 1).map((step, index) => (
                        <div
                          key={index}
                          className={`flex flex-col space-y-1 ${
                            index === currentStep && typing
                              ? "opacity-80"
                              : "opacity-100"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-blue-500 mr-2">→</span>
                            <span
                              className={`${
                                index === currentStep && !generationComplete
                                  ? "text-green-400"
                                  : "text-blue-400"
                              }`}
                            >
                              {step.text}
                            </span>

                            {/* Show status indicator */}
                            {index === currentStep && !generationComplete && (
                              <span className="ml-2 inline-block">
                                {typing ? (
                                  <RefreshCw className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                                ) : (
                                  <span className="inline-block w-2 h-4 bg-blue-400 animate-blink"></span>
                                )}
                              </span>
                            )}

                            {/* Show check mark for completed steps */}
                            {(index < currentStep ||
                              (index === currentStep &&
                                generationComplete)) && (
                              <span className="ml-2 text-green-400">
                                <Check className="inline h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>

                          {/* Show result of each step */}
                          {(index < currentStep ||
                            (index === currentStep && !typing)) && (
                            <div className="ml-5 pl-2 border-l border-gray-800 text-xs">
                              {index === 0 && (
                                <div className="text-purple-400">
                                  Detected:{" "}
                                  <span className="text-yellow-300 font-semibold">
                                    {step.lang}
                                  </span>
                                </div>
                              )}
                              {index === 1 && (
                                <div className="text-purple-400">
                                  Found:{" "}
                                  <span className="text-yellow-300 font-semibold">
                                    {step.files} files
                                  </span>{" "}
                                  in repository
                                </div>
                              )}
                              {index === 2 && (
                                <div className="text-purple-400">
                                  Identified:{" "}
                                  <span className="text-yellow-300 font-semibold">
                                    {step.features} key features
                                  </span>
                                </div>
                              )}
                              {index === 3 && generationComplete && (
                                <div className="text-purple-400">
                                  Created:{" "}
                                  <span className="text-yellow-300 font-semibold">
                                    {step.sections} sections
                                  </span>{" "}
                                  in README.md
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Show completion message */}
                      {generationComplete && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 flex items-center text-green-400 bg-green-500/10 px-3 py-2 rounded-md"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          README.md generated successfully!
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500 ease-out"
                      style={{
                        width: `${
                          generationComplete
                            ? 100
                            : (currentStep / (steps.length - 1)) * 100
                        }%`,
                        backgroundColor: generationComplete
                          ? "#10B981"
                          : "#3B82F6",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-end mt-5">
                  <button
                    className={`px-5 py-2.5 text-sm font-semibold text-white rounded-full flex items-center gap-2 transition-all duration-200 shadow-lg ${
                      generationComplete
                        ? "bg-green-600 hover:bg-green-500 shadow-green-500/20"
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                    }`}
                  >
                    {generationComplete ? (
                      <>
                        Download README
                        <Download className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        {currentStep < steps.length - 1
                          ? "Processing..."
                          : "Generating..."}
                        <RefreshCw
                          className={`h-4 w-4 ${
                            currentStep < steps.length ? "animate-spin" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative glow effect */}
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-blue-400/20 opacity-20 blur-xl"></div>

            {/* Blue glow orbs */}
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-600/20 blur-2xl"></div>
          </motion.div>
        </div>
      </div>

      {/* Add custom blinking animation */}
      <style jsx global>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
}
