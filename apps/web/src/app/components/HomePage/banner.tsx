import React from "react";
import Applestore from "./applestore";
import Googleplaystore from "./googleplaystore";

export default function Banner() {
  return (
    <div className="absolute top-[13vh]">
      <div className="text-white max-w-[50%] mx-16 my-16 flex flex-col items-center">
        <div className="font-extrabold text-7xl leading-[95%] tracking-[0.1px] text-center font-inter justify-self-center">
          Your Student ID Just Got More Powerful
        </div>
        <div className="m-6 font-bold text-[20px] leading-[147%] tracking-[0.1px] text-center font-inter w-md justify-self-center">
          Unlock exclusive discounts on food, tech, and travel only for verified
          students.
        </div>
        <div className="flex justify-center space-x-4 max-w-md">
            <Googleplaystore/>
            <Applestore/>
        </div>
      </div>
    </div>
  );
}
