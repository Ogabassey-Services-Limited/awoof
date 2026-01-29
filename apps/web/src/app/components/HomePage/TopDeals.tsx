import React from "react";
import Image from "next/image";
import TopDeals_1 from '../../../../public/images/TopDeals-1.svg';
import TopDeals_2 from '../../../../public/images/TopDeals-2.svg';
import TopDeals_3 from '../../../../public/images/TopDeals-3.svg';
import TopDeals_4 from '../../../../public/images/TopDeals-4.svg';
import TopDeals_5 from '../../../../public/images/TopDeals-5.svg';

export default function TopDeals() {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="pt-9">
        <p className="inline-block bg-gradient-to-b from-[#CAD5F6] to-[#FFFFFF] bg-clip-text text-transparent font-black text-[10.85vw] leading-tight">
          Our Top Deals
        </p>
      </div>
      <div className='relative mt-5 flex justify-center items-end min-w-[90vw] max-w-6xl h-[840px] bg-gradient-to-b from-[#5076E0] to-transparent rounded-4xl'>
        <Image
            src={TopDeals_1}
            alt="Screenshot"
        />
        <Image
            src={TopDeals_2}
            alt="Screenshot Snippet"
            className="absolute left-15 bottom-85"
        />
        <Image
            src={TopDeals_3}
            alt="Screenshot Snippet"
            className="absolute left-15 bottom-2"
        />
        <Image
            src={TopDeals_4}
            alt="Screenshot Snippet"
            className="absolute right-9 bottom-85"
        />
        <Image
            src={TopDeals_5}
            alt="Screenshot Snippet"
            className="absolute right-9 bottom-3"
        />

      </div>
    </div>
  );
}
