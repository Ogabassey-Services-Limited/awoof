import React from "react";

function Applestore() {
  return (
    <div className="flex w-48 h-14 md:min-w-44 lg:w-64 lg:h-16 bg-black text-white rounded-xl over-2000:rounded-[0.8vw] items-center justify-center border border-white over-2000:min-w-[15vw] over-2000:h-auto over-2000:pb-3 over-2000:pt-2">
      <div className="mr-3">
        <svg
          viewBox="0 0 384 512"
          width="30"
          className="over-2000:w-[2.5vw] over-2000:h-[2.5vw]"
        >
          <path
            fill="currentColor"
            d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
          />
        </svg>
      </div>
      <div>
        <div className="text-xs over-2000:text-[0.8vw]/[1vw]">Download on the</div>
        <div className="text-2xl over-2000:text-[1.4vw]/[1.2vw] font-semibold font-sans -mt-1 ">
          App Store
        </div>
      </div>
    </div>
  );
}

export default Applestore;
