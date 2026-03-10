import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturedSection } from '@/components/landing/FeaturedSection';
import { MeetCharactersSection } from '@/components/landing/MeetCharactersSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <LandingNav />
      <HeroSection />
      <FeaturedSection />
      <MeetCharactersSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <LandingFooter />
    </div>
  );
};

export default Landing;
