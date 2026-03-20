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

const SVGPlaceholder = ({ title, darkColor, lightColor }: { title: string; darkColor: string; lightColor: string }) => (
  <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
    <defs>
      <linearGradient id={`grad-${title}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={lightColor} />
        <stop offset="100%" stopColor={darkColor} stopOpacity={0.2} />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill={`url(#grad-${title})`} />
    <circle cx="200" cy="120" r="50" fill={darkColor} opacity={0.1} />
    <circle cx="120" cy="200" r="30" fill={darkColor} opacity={0.08} />
    <circle cx="280" cy="220" r="40" fill={darkColor} opacity={0.1} />
    <text x="200" y="260" textAnchor="middle" fill={darkColor} fontSize="14" fontWeight="500" opacity={0.4}>
      {title}
    </text>
  </svg>
);

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
                      <div className="flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br">
                        <SVGPlaceholder
                          title={slide.title}
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
