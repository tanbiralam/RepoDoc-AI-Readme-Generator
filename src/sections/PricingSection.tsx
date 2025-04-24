"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "19.99",
      description: "For power users and teams",
      features: [
        "Unlimited README generations",
        "Premium templates",
        "Export as Markdown file",
        "Commit to GitHub repository",
        "Priority support",
      ],
      popular: false,
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
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that&apos;s right for you
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={item}
              whileHover={{ y: -5 }}
              className={`relative rounded-xl overflow-hidden border ${
                plan.popular
                  ? "border-blue-500 shadow-md"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0">
                  <div className="flex justify-center transform -translate-y-1/2">
                    <span className="inline-flex rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="ml-1 text-xl text-gray-500">/month</span>
                </div>
                <p className="mt-4 text-gray-600">{plan.description}</p>

                <div className="mt-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                      >
                        <svg
                          className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-3 text-gray-600">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link href="/auth">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className={`w-full py-3 ${
                          plan.popular
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {plan.popular ? "Get Started" : "Choose Plan"}
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Need a custom plan?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact us for custom pricing plans tailored to your specific
              requirements.
            </p>
            <div>
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    Contact Sales
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
