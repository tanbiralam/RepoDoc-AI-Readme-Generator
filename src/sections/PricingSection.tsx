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
        "Generate up to 5 READMEs",
        "Basic templates",
        "Export as Markdown file",
      ],
      popular: false,
      icon: <Star className="w-5 h-5" />,
    },
    {
      id: "pro",
      name: "Pro",
      price: "9.99",
      description: "For regular GitHub users",
      features: [
        "Generate up to 15 READMEs",
        "Advanced templates",
        "Export as Markdown file",
        "Commit to GitHub repository",
        "Priority support",
      ],
      popular: true,
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-gray-950 py-24"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="container relative z-10 mx-auto px-6 lg:px-8">
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
            <div className="flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-white">
              <span className="text-blue-400">Pricing</span>
            </div>
          </motion.div>
          <motion.h2
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Choose the plan that&apos;s right for you
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={item}
              whileHover={{
                y: -8,
                boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.15)",
              }}
              transition={{ duration: 0.3 }}
              className={`relative rounded-xl overflow-hidden backdrop-blur-sm border transition-all duration-300 group
                ${
                  plan.popular
                    ? "border-blue-500/50 bg-blue-950/10"
                    : "border-gray-800/50 bg-gray-900/80"
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
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                      plan.popular
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-800/80 text-gray-400"
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
                  <Link href="/auth">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className={`w-full py-2.5 ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/20"
                            : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
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
        </motion.div>
      </div>
    </section>
  );
}
