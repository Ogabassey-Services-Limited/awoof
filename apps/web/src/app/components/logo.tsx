import React from 'react';
import Image from 'next/image';
import GraduationCap from "../../../public/images/noto_graduation-cap.svg";

interface LogoProps {
  color?: 'blue'|'white';
}

export default function Logo({ color = 'white' }: LogoProps) {
  const colorClass = {
    white: 'text-white',
    blue: 'text-[#1D4ED8]',
  }

  return (
    <div className="relative inline-block">
        {/* Awoof Text */}
        <span className={`text-4xl font-bold italic ${colorClass[color]}`}>
        Awoof
      </span>

      {/* Graduation Cap Icon */}
      <div className="absolute -top-4 w-10 h-10 -rotate-12">
        <Image
          src={GraduationCap}
          alt="Graduation Cap"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      
      
    </div>
  );
}