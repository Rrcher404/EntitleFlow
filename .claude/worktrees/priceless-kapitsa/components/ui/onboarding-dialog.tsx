'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Slide {
  title: string;
  description: string;
  colors: {
    dark: string;
    light: string;
  };
}

const slides: Slide[] = [
  {
    title: 'Welcome to EntitleFlow',
    description: 'Track permits, projects, and approvals from one focused dashboard',
    colors: { dark: '#0f3c35', light: '#e8f5f2' },
  },
  {
    title: 'Map Reviewer Comments',
    description: 'Turn scattered feedback into structured, trackable action items',
    colors: { dark: '#4A2B00', light: '#FFE8C2' },
  },
  {
    title: 'Jurisdiction Intelligence',
    description: 'NC-specific guides for Greensboro, Raleigh, Charlotte and more',
    colors: { dark: '#0A3D30', light: '#CAF6E8' },
  },
  {
    title: 'Launch Faster',
    description: 'See your approval workflow in action with a guided walkthrough',
    colors: { dark: '#2D1457', light: '#E1D4FF' },
  },
];

/* Illustrated SVG scenes for each onboarding slide */
const SlideIllustration = ({ slideIndex, darkColor, lightColor }: { slideIndex: number; darkColor: string; lightColor: string }) => {
  const illustrations = [
    // Slide 0: Dashboard overview
    <svg key="0" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="400" height="300" fill={lightColor} />
      {/* Browser window frame */}
      <rect x="40" y="30" width="320" height="240" rx="8" fill="white" stroke={darkColor} strokeWidth="1.5" opacity="0.9" />
      <rect x="40" y="30" width="320" height="28" rx="8" fill={darkColor} opacity="0.1" />
      <circle cx="58" cy="44" r="4" fill={darkColor} opacity="0.3" />
      <circle cx="72" cy="44" r="4" fill={darkColor} opacity="0.2" />
      <circle cx="86" cy="44" r="4" fill={darkColor} opacity="0.15" />
      {/* Sidebar */}
      <rect x="40" y="58" width="70" height="212" fill={darkColor} opacity="0.06" />
      <rect x="50" y="72" width="50" height="6" rx="3" fill={darkColor} opacity="0.15" />
      <rect x="50" y="88" width="40" height="6" rx="3" fill={darkColor} opacity="0.1" />
      <rect x="50" y="104" width="45" height="6" rx="3" fill={darkColor} opacity="0.1" />
      <rect x="50" y="120" width="35" height="6" rx="3" fill={darkColor} opacity="0.1" />
      {/* KPI Cards */}
      <rect x="120" y="68" width="72" height="50" rx="6" fill={darkColor} opacity="0.08" />
      <rect x="200" y="68" width="72" height="50" rx="6" fill={darkColor} opacity="0.08" />
      <rect x="280" y="68" width="72" height="50" rx="6" fill={darkColor} opacity="0.08" />
      <text x="156" y="90" textAnchor="middle" fill={darkColor} fontSize="16" fontWeight="700" opacity="0.4">12</text>
      <text x="236" y="90" textAnchor="middle" fill={darkColor} fontSize="16" fontWeight="700" opacity="0.4">8</text>
      <text x="316" y="90" textAnchor="middle" fill={darkColor} fontSize="16" fontWeight="700" opacity="0.4">3</text>
      <rect x="132" y="100" width="48" height="4" rx="2" fill={darkColor} opacity="0.1" />
      <rect x="212" y="100" width="48" height="4" rx="2" fill={darkColor} opacity="0.1" />
      <rect x="292" y="100" width="48" height="4" rx="2" fill={darkColor} opacity="0.1" />
      {/* Chart area */}
      <rect x="120" y="128" width="232" height="80" rx="6" fill={darkColor} opacity="0.04" />
      <polyline points="130,190 165,170 200,180 235,155 270,160 305,140 340,150" fill="none" stroke={darkColor} strokeWidth="2" opacity="0.3" />
      {/* Activity list */}
      <rect x="120" y="218" width="232" height="10" rx="3" fill={darkColor} opacity="0.06" />
      <rect x="120" y="234" width="180" height="10" rx="3" fill={darkColor} opacity="0.04" />
      <rect x="120" y="250" width="200" height="10" rx="3" fill={darkColor} opacity="0.04" />
    </svg>,
    // Slide 1: Comment mapping
    <svg key="1" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="400" height="300" fill={lightColor} />
      {/* Document/plan sheet */}
      <rect x="60" y="40" width="200" height="220" rx="6" fill="white" stroke={darkColor} strokeWidth="1.5" opacity="0.9" />
      <rect x="75" y="56" width="120" height="8" rx="3" fill={darkColor} opacity="0.15" />
      <rect x="75" y="72" width="170" height="5" rx="2" fill={darkColor} opacity="0.06" />
      <rect x="75" y="82" width="160" height="5" rx="2" fill={darkColor} opacity="0.06" />
      <rect x="75" y="92" width="140" height="5" rx="2" fill={darkColor} opacity="0.06" />
      {/* Highlighted review comment areas on doc */}
      <rect x="75" y="110" width="100" height="20" rx="3" fill="#D4A937" opacity="0.2" />
      <rect x="75" y="145" width="130" height="20" rx="3" fill="#D4A937" opacity="0.2" />
      <rect x="75" y="190" width="80" height="20" rx="3" fill="#D4A937" opacity="0.2" />
      {/* Comment bubbles connected by lines */}
      <line x1="175" y1="120" x2="280" y2="80" stroke={darkColor} strokeWidth="1" opacity="0.2" strokeDasharray="4,3" />
      <line x1="205" y1="155" x2="280" y2="145" stroke={darkColor} strokeWidth="1" opacity="0.2" strokeDasharray="4,3" />
      <line x1="155" y1="200" x2="280" y2="210" stroke={darkColor} strokeWidth="1" opacity="0.2" strokeDasharray="4,3" />
      {/* Comment cards on right */}
      <rect x="280" y="60" width="100" height="45" rx="6" fill="white" stroke={darkColor} strokeWidth="1" opacity="0.9" />
      <circle cx="295" cy="75" r="8" fill={darkColor} opacity="0.15" />
      <rect x="308" y="72" width="60" height="5" rx="2" fill={darkColor} opacity="0.15" />
      <rect x="308" y="82" width="50" height="4" rx="2" fill={darkColor} opacity="0.08" />
      <circle cx="370" cy="92" r="5" fill="#22c55e" opacity="0.5" />
      <rect x="280" y="125" width="100" height="45" rx="6" fill="white" stroke={darkColor} strokeWidth="1" opacity="0.9" />
      <circle cx="295" cy="140" r="8" fill={darkColor} opacity="0.15" />
      <rect x="308" y="137" width="55" height="5" rx="2" fill={darkColor} opacity="0.15" />
      <rect x="308" y="147" width="45" height="4" rx="2" fill={darkColor} opacity="0.08" />
      <circle cx="370" cy="157" r="5" fill="#eab308" opacity="0.5" />
      <rect x="280" y="190" width="100" height="45" rx="6" fill="white" stroke={darkColor} strokeWidth="1" opacity="0.9" />
      <circle cx="295" cy="205" r="8" fill={darkColor} opacity="0.15" />
      <rect x="308" y="202" width="50" height="5" rx="2" fill={darkColor} opacity="0.15" />
      <rect x="308" y="212" width="60" height="4" rx="2" fill={darkColor} opacity="0.08" />
      <circle cx="370" cy="222" r="5" fill={darkColor} opacity="0.15" />
    </svg>,
    // Slide 2: Jurisdiction intelligence / Map
    <svg key="2" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="400" height="300" fill={lightColor} />
      {/* NC state shape (simplified) */}
      <path d="M80,120 L120,100 L180,95 L240,100 L300,90 L330,100 L340,115 L320,130 L280,125 L250,140 L200,135 L160,145 L120,140 L90,135 Z" fill="white" stroke={darkColor} strokeWidth="1.5" opacity="0.8" />
      {/* City pins */}
      <circle cx="290" cy="110" r="8" fill={darkColor} opacity="0.7" />
      <circle cx="290" cy="110" r="3" fill="white" />
      <circle cx="200" cy="125" r="8" fill="#D4A937" opacity="0.8" />
      <circle cx="200" cy="125" r="3" fill="white" />
      <circle cx="145" cy="130" r="8" fill={darkColor} opacity="0.5" />
      <circle cx="145" cy="130" r="3" fill="white" />
      {/* City labels */}
      <text x="290" y="100" textAnchor="middle" fill={darkColor} fontSize="8" fontWeight="600" opacity="0.6">Raleigh</text>
      <text x="200" y="115" textAnchor="middle" fill={darkColor} fontSize="8" fontWeight="600" opacity="0.6">Greensboro</text>
      <text x="145" y="148" textAnchor="middle" fill={darkColor} fontSize="8" fontWeight="600" opacity="0.6">Charlotte</text>
      {/* Info cards below map */}
      <rect x="50" y="170" width="140" height="80" rx="6" fill="white" stroke={darkColor} strokeWidth="1" opacity="0.9" />
      <rect x="65" y="182" width="80" height="6" rx="3" fill={darkColor} opacity="0.2" />
      <rect x="65" y="196" width="110" height="4" rx="2" fill={darkColor} opacity="0.08" />
      <rect x="65" y="206" width="100" height="4" rx="2" fill={darkColor} opacity="0.08" />
      <rect x="65" y="216" width="90" height="4" rx="2" fill={darkColor} opacity="0.08" />
      <rect x="65" y="232" width="50" height="8" rx="4" fill={darkColor} opacity="0.12" />
      <rect x="210" y="170" width="140" height="80" rx="6" fill="white" stroke={darkColor} strokeWidth="1" opacity="0.9" />
      <rect x="225" y="182" width="70" height="6" rx="3" fill={darkColor} opacity="0.2" />
      <rect x="225" y="196" width="110" height="4" rx="2" fill={darkColor} opacity="0.08" />
      <rect x="225" y="206" width="95" height="4" rx="2" fill={darkColor} opacity="0.08" />
      <rect x="225" y="216" width="105" height="4" rx="2" fill={darkColor} opacity="0.08" />
      <rect x="225" y="232" width="50" height="8" rx="4" fill={darkColor} opacity="0.12" />
    </svg>,
    // Slide 3: Guided walkthrough / Launch
    <svg key="3" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="400" height="300" fill={lightColor} />
      {/* Steps / timeline */}
      <circle cx="100" cy="80" r="20" fill={darkColor} opacity="0.15" />
      <text x="100" y="85" textAnchor="middle" fill={darkColor} fontSize="14" fontWeight="700" opacity="0.5">1</text>
      <line x1="120" y1="80" x2="180" y2="80" stroke={darkColor} strokeWidth="2" opacity="0.15" />
      <circle cx="200" cy="80" r="20" fill={darkColor} opacity="0.15" />
      <text x="200" y="85" textAnchor="middle" fill={darkColor} fontSize="14" fontWeight="700" opacity="0.5">2</text>
      <line x1="220" y1="80" x2="280" y2="80" stroke={darkColor} strokeWidth="2" opacity="0.15" />
      <circle cx="300" cy="80" r="20" fill={darkColor} opacity="0.8" />
      <text x="300" y="85" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">3</text>
      {/* Step labels */}
      <text x="100" y="112" textAnchor="middle" fill={darkColor} fontSize="9" fontWeight="500" opacity="0.4">Create</text>
      <text x="200" y="112" textAnchor="middle" fill={darkColor} fontSize="9" fontWeight="500" opacity="0.4">Review</text>
      <text x="300" y="112" textAnchor="middle" fill={darkColor} fontSize="9" fontWeight="500" opacity="0.6">Approve</text>
      {/* Approval card */}
      <rect x="80" y="135" width="240" height="120" rx="8" fill="white" stroke={darkColor} strokeWidth="1.5" opacity="0.9" />
      <rect x="100" y="152" width="100" height="8" rx="3" fill={darkColor} opacity="0.2" />
      <rect x="100" y="168" width="200" height="5" rx="2" fill={darkColor} opacity="0.06" />
      <rect x="100" y="180" width="180" height="5" rx="2" fill={darkColor} opacity="0.06" />
      {/* Status badge */}
      <rect x="100" y="198" width="60" height="18" rx="9" fill="#22c55e" opacity="0.2" />
      <text x="130" y="210" textAnchor="middle" fill="#16a34a" fontSize="9" fontWeight="600">Approved</text>
      {/* Checkmark */}
      <circle cx="280" cy="205" r="14" fill="#22c55e" opacity="0.15" />
      <polyline points="273,205 278,210 288,198" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Rocket at bottom */}
      <text x="200" y="280" textAnchor="middle" fill={darkColor} fontSize="10" fontWeight="500" opacity="0.3">Your workflow, ready to go</text>
    </svg>,
  ];

  return illustrations[slideIndex] || illustrations[0];
};

export function OnboardingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('entitleflow-onboarding-seen');
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const onNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  };

  const onPrev = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('entitleflow-onboarding-seen', 'true');
    setIsOpen(false);
  };

  const handleGetStarted = () => {
    localStorage.setItem('entitleflow-onboarding-seen', 'true');
    setIsOpen(false);
  };

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const isLastSlide = selectedIndex === slides.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative h-[500px] w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-xl"
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Carousel */}
            <div className="embla h-full" ref={emblaRef}>
              <div className="embla__container flex h-full">
                {slides.map((slide, index) => (
                  <div key={index} className="embla__slide min-w-0 flex-[0_0_100%]">
                    <div className="flex h-full flex-col">
                      {/* Image section */}
                      <div className="flex flex-1 items-center justify-center overflow-hidden">
                        <SlideIllustration
                          slideIndex={index}
                          darkColor={slide.colors.dark}
                          lightColor={slide.colors.light}
                        />
                      </div>

                      {/* Content section */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col gap-4 border-t border-border bg-card p-6"
                      >
                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold text-foreground">{slide.title}</h2>
                          <p className="text-sm text-muted-foreground">{slide.description}</p>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-2">
                          {slides.map((_, idx) => (
                            <motion.div
                              key={idx}
                              className="h-2 rounded-full transition-colors"
                              animate={{
                                width: idx === selectedIndex ? 24 : 8,
                                backgroundColor: idx === selectedIndex ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                              }}
                            />
                          ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={handleSkip}
                            variant="outline"
                            className="flex-1"
                          >
                            {isLastSlide ? 'Done' : 'Skip'}
                          </Button>
                          <Button
                            onClick={isLastSlide ? handleGetStarted : onNext}
                            className="flex-1 gap-2"
                          >
                            {isLastSlide ? 'Get Started' : 'Next'}
                            {!isLastSlide && <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
