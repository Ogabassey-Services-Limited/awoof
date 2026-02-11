import React from "react";
import Image from "next/image";
import TopDeals_1 from '../../../../public/images/TopDeals-1.svg';
import TopDeals_2 from '../../../../public/images/TopDeals-2.svg';
import TopDeals_3 from '../../../../public/images/TopDeals-3.svg';
import TopDeals_4 from '../../../../public/images/TopDeals-4.svg';
import TopDeals_5 from '../../../../public/images/TopDeals-5.svg';

export default function TopDeals() {
  return (
    <div id="deals" className="flex flex-col justify-center items-center w-full px-4 sm:px-6 lg:px-8 overflow-x-hidden scroll-mt-20">
      <div className="pt-6 sm:pt-9 w-full max-w-7xl mx-auto text-center sm:text-left">
        <p className="inline-block bg-gradient-to-b from-[#CAD5F6] to-[#FFFFFF] bg-clip-text text-transparent font-black text-[8vw] sm:text-[10.85vw] leading-tight">
          Our Top Deals
        </p>
      </div>
      <div className="relative mt-5 flex justify-center items-end w-full max-w-6xl min-h-[420px] sm:min-h-[560px] lg:h-[840px] bg-gradient-to-b from-[#5076E0] to-transparent rounded-3xl lg:rounded-4xl mx-auto">
        <Image
          src={TopDeals_1}
          alt="Screenshot"
          className="w-full h-auto max-h-[50vh] sm:max-h-[65vh] lg:max-h-none object-contain object-bottom"
        />
        <Image
          src={TopDeals_2}
          alt="Screenshot Snippet"
          className="absolute left-2 sm:left-4 lg:left-[3.75rem] bottom-[20%] sm:bottom-24 lg:bottom-[21rem] w-[22%] sm:w-[24%] lg:w-auto h-auto"
        />
        <Image
          src={TopDeals_3}
          alt="Screenshot Snippet"
          className="absolute left-2 sm:left-4 lg:left-[3.75rem] bottom-1 lg:bottom-2 w-[22%] sm:w-[24%] lg:w-auto h-auto"
        />
        <Image
          src={TopDeals_4}
          alt="Screenshot Snippet"
          className="absolute right-2 sm:right-4 lg:right-9 bottom-[20%] sm:bottom-24 lg:bottom-[21rem] w-[22%] sm:w-[24%] lg:w-auto h-auto"
        />
        <Image
          src={TopDeals_5}
          alt="Screenshot Snippet"
          className="absolute right-2 sm:right-4 lg:right-9 bottom-1 lg:bottom-3 w-[22%] sm:w-[24%] lg:w-auto h-auto"
        />
      </div>
    </div>
  );
}
