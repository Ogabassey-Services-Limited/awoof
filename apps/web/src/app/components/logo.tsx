import React from 'react';
import Image from 'next/image';

export default function Logo() {
  return (
    <div className="relative inline-block">
      <Image
        src="/images/awoofLogoMain.png"
        alt="Awoof Logo"
        width={120}
        height={40}
        className="object-contain"
      />
    </div>
  );
}