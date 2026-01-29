import React from 'react'
import SignupImage from "../../../../../public/images/Signup screen.svg";
import Image from 'next/image';

function AboutScreenshot() {
  return (
    <div>
        <div className='h-[840px] max-w-lg bg-gradient-to-b from-[#5076E0] to-transparent rounded-4xl'>
            <div className='p-16'>
                <Image
                src={SignupImage}
                alt="Signup Screenshot"
                />
            </div>
        </div>
    </div>
  )
}

export default AboutScreenshot