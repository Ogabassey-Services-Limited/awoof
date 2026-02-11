import React from "react";
import Image from "next/image";
import Link from "next/link";
import PartnerImage from "../../../../public/images/PartnerImage.svg";

function Partner() {
  return (
    <div className="m-6 sm:m-12 lg:m-24 xl:m-32 flex justify-center px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row justify-between items-center lg:justify-baseline w-full max-w-[1200px] px-6 sm:px-10 lg:px-16 py-8 sm:py-9 rounded-3xl lg:rounded-4xl border border-[#1D4ED8] bg-gradient-to-r from-[#1D4ED8] to-[#FFFFFF] overflow-hidden relative min-h-[280px]">
        <div className="max-w-sm z-10 text-center lg:text-left">
          <h2 className="text-white font-black text-2xl sm:text-3xl md:text-4xl leading-tight mb-3 sm:mb-4">
            Reach Thousands of Verified Students
          </h2>

          <p className="text-white text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed">
            Join our network, post your deals, and track redemption with your
            own dashboard.
          </p>

          <Link
            href="/auth/vendor/register"
            className="inline-block bg-white text-[#1D4ED8] font-semibold px-6 sm:px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
          >
            Partner with us
          </Link>
        </div>
        <Image
          src={PartnerImage}
          alt="Partner Illustration"
          className="absolute right-0 bottom-0 lg:-right-2 w-32 sm:w-40 lg:w-auto h-auto opacity-90 lg:opacity-100 z-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

export default Partner;
