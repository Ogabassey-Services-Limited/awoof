"use client";

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import Image from 'next/image';
import graduationCap from '../../../public/images/noto_graduation-cap.svg';

const inter = Inter({ subsets: ["latin"] });

export default function SplashScreen({ children }: { children: ReactNode }) {
    const [showSplash, setShowSplash] = useState(false)
    const [isFirstVisit, setIsFirstVisit] = useState(false)
  
    useEffect(() => {
      // Check if this is the first visit
      const hasVisited = localStorage.getItem('hasVisitedHome')
      
      if (!hasVisited || hasVisited === 'false') {
        setShowSplash(true)
        setIsFirstVisit(true)
        localStorage.setItem('hasVisitedHome', 'true')
        
        const timer = setTimeout(() => {
          setShowSplash(false)
        }, 2500)
        
        return () => clearTimeout(timer)
      }
    }, [])

  if (showSplash && isFirstVisit) {
    return (
      <div
        className={`${inter.className} fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700`}
      >
        <div className="text-center text-white animate-fade-in">
          <h1 className="text-4xl font-bold italic mb-8">Awoof
          <Image
            src= {graduationCap}
            alt="Graduation Cap"
            className="relative -top-14 left-1 w-8 h-8 rotate-12"
          /></h1>
          
        </div>
      </div>
    );
  }

  return children;
}
