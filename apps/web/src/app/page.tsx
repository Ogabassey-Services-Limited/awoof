// import { headers } from "next/headers";
// import LandingPage from "./(desktop)/page";

import Header from "./components/Header";
import Banner from "./components/HomePage/banner";
import PhoneImage from "../../public/images/iPhone 13 Pro.svg";
import GraduationCap from "../../public/images/noto_graduation-large-cap.svg";
import BestDeals from "../../public/images/BestDealsIcon.svg";
import New from "../../public/images/NewIcon.svg";
import Cloud from "../../public/images/Cloud.svg";
import Image from "next/image";
import About from "./components/HomePage/About";
import TopDeals from "./components/HomePage/TopDeals";
import FAQ from "./components/HomePage/FAQ";
import Partner from "./components/HomePage/Partner";
import Footer from "./components/Footer";

export default async function Home() {
  // const headersList = await headers(); //as unknown as Awaited<ReturnType<typeof headers>>;
  // const ua = headersList.get("user-agent") || "";
  // const isMobile = /mobile/i.test(ua);

  return (
    <main className="bg-[#F8F8F8] w-full">
      {/* {isMobile ? <h1>Mobile App Home</h1> : <LandingPage/>} */}
      <div className="bg-gradient-to-b from-[#1D4ED8] to-[#FFFFFF] h-[1024px] relative">
        {/* content stays centered */}
        <div className="flex justify-center relative z-30 h-full ">
          <div className="container">
            <Header />
            <Banner />
          </div>
        </div>

        {/* background phone */}
        <div className="absolute bottom-0 right-0">
          <Image
          className="absolute right-[250px] bottom-[480px] z-10"
          src={GraduationCap}
          alt="Graduation Cap"
        />
        <Image
          className="absolute right-[420px] bottom-[150px] z-10"
          src={BestDeals}
          alt="Best Deals"
          />
          <Image 
          className="absolute right-[40px] bottom-[600px] z-10"
          src={New}
          alt="New"
          />
        <Image
          className="relative bottom-0 right-0 z-5"
          src={PhoneImage}
          alt="Phone"
        />
        </div>
        
        <Image
          className="absolute bottom-0 left-0 z-0"
          src={Cloud}
          alt=""
        />
      </div>
      <About/>
      <TopDeals/>
      <FAQ/>
      <Partner/>
      <Footer/>
    </main>
  );
}
