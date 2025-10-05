import React from 'react';
import Image from 'next/image';
import GraduationCap from "../../../public/images/noto_graduation-cap.svg";

export default function Logo() {
  return (
    <div className="relative inline-block">
        {/* Awoof Text */}
      <span className="text-4xl font-bold text-white italic">
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