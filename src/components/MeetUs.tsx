import React, { useState, useEffect } from 'react';
import SphereImageGrid, { ImageData } from "@/src/components/ui/img-sphere";
import { motion } from "motion/react";

// Blank images with placeholder info
const BASE_IMAGES: Omit<ImageData, 'id'>[] = Array.from({ length: 12 }).map((_, i) => ({
  src: "", // Blank source as requested
  alt: `Team Member ${i + 1}`,
  title: `Team Member ${i + 1}`,
  description: "Role / Description goes here."
}));

// Generate more images by repeating the base set
const IMAGES: ImageData[] = [];
for (let i = 0; i < 130; i++) {
  const baseIndex = i % BASE_IMAGES.length;
  const baseImage = BASE_IMAGES[baseIndex];
  IMAGES.push({
    id: `img-${i + 1}`,
    ...baseImage,
    alt: `${baseImage.alt} (${Math.floor(i / BASE_IMAGES.length) + 1})`
  });
}

export default function MeetUs() {
  const [size, setSize] = useState(600);

  useEffect(() => {
    const handleResize = () => {
      // Responsive sizing: make it smaller on mobile
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        setSize(Math.min(screenWidth - 8, 600)); // Mobile Enlarged++
      } else if (screenWidth < 1024) {
        setSize(900); // Tablet Enlarged++
      } else {
        setSize(1100); // Desktop Enlarged++
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const config = {
    containerSize: size,
    sphereRadius: size * 0.33,
    dragSensitivity: 0.8,
    momentumDecay: 0.96,
    maxRotationSpeed: 6,
    baseImageScale: 0.11, // Increased scale
    hoverScale: 1.5, // Increased magnifying effect
    perspective: 1000,
    autoRotate: true,
    autoRotateSpeed: 0.2
  };

  return (
    <section className="w-full relative z-20 flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-brand-highlight mb-4 tracking-tight">Meet Us</h2>
        <p className="text-brand-pink max-w-lg mx-auto font-medium">
          Let us introduce ourselves so you get to know 130 individuals with the brightest minds in computing
        </p>
      </motion.div>

      <div className="flex justify-center items-center w-full max-w-full overflow-hidden -translate-x-2">
        <SphereImageGrid
          images={IMAGES}
          className="mx-auto"
          {...config}
        />
      </div>
    </section>
  );
}
