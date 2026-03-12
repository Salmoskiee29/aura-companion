import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturedSection } from '@/components/landing/FeaturedSection';
import { MeetCharactersSection } from '@/components/landing/MeetCharactersSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { CyberBackground } from '@/components/landing/CyberBackground';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      <CyberBackground />
      <div className="relative z-10">
        <LandingNav />
        <HeroSection />
        <FeaturedSection />
        <MeetCharactersSection />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
        <LandingFooter />
      </div>
    </div>
  );
};

export default Landing;
