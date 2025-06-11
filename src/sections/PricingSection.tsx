"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Zap, Star } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "0",
      description: "Perfect for trying out the service",
      features: [
        "Generate up to 3 READMEs",
        "AI-powered content generation",
        "Copy to clipboard",
        "Basic editing features",
      ],
      popular: false,
      icon: <Star className="w-5 h-5" />,
    },
    {
      id: "pro",
      name: "Pro",
      price: "6.99",
      description: "For regular GitHub users",
      features: [
        "Unlimited README generation",
        "Advanced AI analysis",
        "Download as Markdown file",
        "Direct commit to GitHub",
        "Advanced editing features",
        "Priority support",
      ],
      popular: true,
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative bg-gray-950 py-24 overflow-hidden"
    >
      {/* Background decorative elements - matching theme */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl transform translate-x-1/2"></div>
      <div className="absolute bottom-1/3 left-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl transform -translate-x-1/2"></div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <div className="flex items-center rounded-full border border-gray-800 bg-gray-900 px-3 py-1 text-sm font-medium text-gray-300">
              <span className="text-blue-400">Pricing</span>
            </div>
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that&apos;s right for you | All plans include our
            core AI-powered README generation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{
                y: -4,
                boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.2)",
              }}
              className={`relative rounded-xl overflow-hidden backdrop-blur-sm border transition-all duration-300 group
                ${
                  plan.popular
                    ? "border-blue-500/50 bg-blue-950/10"
                    : "border-gray-700 bg-gray-900/80 hover:border-gray-600"
                }
              `}
            >
              {plan.popular && (
                <div className="absolute top-4 inset-x-0 z-30">
                  <div className="flex justify-center">
                    <span className="inline-flex rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-1 text-xs font-medium text-white shadow-md translate-y-[-50%]">
                      Most Popular
                    </span>
                  </div>
                </div>
              )}

              <div
                className={`p-6 flex flex-col h-full ${
                  plan.popular ? "pt-8" : ""
                }`}
              >
                <div className="mb-auto">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 ${
                      plan.popular
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-800 text-gray-400 group-hover:bg-gray-700"
                    }`}
                  >
                    {plan.icon}
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="ml-1 text-lg text-gray-400">/month</span>
                  </div>

                  <p className="text-gray-400 mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-start"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <div
                            className={`flex-shrink-0 rounded-full p-1 ${
                              plan.popular
                                ? "text-blue-400 bg-blue-500/10"
                                : "text-gray-400 bg-gray-800"
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span className="ml-3 text-gray-300 text-sm">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link href="/sign-in">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className={`w-full py-2.5 transition-all duration-300 ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/20"
                            : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        {plan.id === "free"
                          ? "Get Started Free"
                          : "Get Started"}
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
