import React from 'react'
import SignupImage from "../../../../../public/images/Signup screen.svg";
import Image from 'next/image';

function AboutScreenshot() {
  return (
    <div className="w-full max-w-lg">
      <div className="min-h-[320px] sm:min-h-[480px] lg:h-[840px] max-w-lg bg-gradient-to-b from-[#5076E0] to-transparent rounded-3xl lg:rounded-4xl flex items-center justify-center">
        <div className="p-6 sm:p-10 lg:p-16 w-full flex justify-center">
          <Image
            src={SignupImage}
            alt="Signup Screenshot"
            className="w-full h-auto max-h-[70vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default AboutScreenshot