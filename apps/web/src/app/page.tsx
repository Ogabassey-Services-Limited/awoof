// import { headers } from "next/headers";
// import LandingPage from "./(desktop)/page";

import Header from "./components/Header";
import Banner from "./components/HomePage/banner";

export default async function Home() {
  // const headersList = await headers(); //as unknown as Awaited<ReturnType<typeof headers>>;
  // const ua = headersList.get("user-agent") || "";
  // const isMobile = /mobile/i.test(ua);

  return (
    <main>
      {/* {isMobile ? <h1>Mobile App Home</h1> : <LandingPage/>} */}
      <div className=" bg-linear-to-b from-[#1D4ED8] to-[#FFFFFF] flex justify-center">
        <div className="container">
          <Header />
          <Banner />
        </div>
      </div>
    </main>
  );
}
