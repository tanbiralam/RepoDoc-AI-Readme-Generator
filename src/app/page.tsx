import HeroSection from "@/sections/HeroSection";
import HowItWorksSection from "@/sections/HowItWorksSection";
import FeaturesSection from "@/sections/FeaturesSection";
import PricingSection from "@/sections/PricingSection";
import SecuritySection from "@/sections/SecuritySection";
import TestimonialsSection from "@/sections/TestimonialsSection";
import FAQSection from "@/sections/FAQSection";
import FooterSection from "@/sections/FooterSection";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Navbar />
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingSection />
        <SecuritySection />
        <TestimonialsSection />
        <FAQSection />
      </main>

      <FooterSection />
    </div>
  );
}
