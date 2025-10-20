import React from "react";
import Image from "next/image";
import PartnerImage from "../../../../public/images/PartnerImage.svg";

function Partner() {
  return (
    <div className="m-32 justify-center">
      <div className="flex justify-baseline max-w-[1200px] px-16 py-9 rounded-4xl border border-[#1D4ED8] bg-gradient-to-r from-[#1D4ED8] to-[#FFFFFF] overflow-hidden relative">
        <div className="max-w-sm z-10">
          <h2 className="text-white font-black text-3xl md:text-4xl leading-tight mb-4">
            Reach Thousands of Verified Students
          </h2>

          <p className="text-white text-base md:text-lg mb-8 leading-relaxed">
            Join our network, post your deals, and track redemption with your
            own dashboard.
          </p>

          <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-lg">
            Partner with us
          </button>
        </div>
        <Image
          src={PartnerImage}
          alt="Partner Illustration"
          className="absolute -right-2 z-0"
        />
      </div>
    </div>
  );
}

export default Partner;
