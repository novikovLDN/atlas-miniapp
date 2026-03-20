"use client";

import dynamic from "next/dynamic";
import SplashScreen from "@/components/SplashScreen";

const HomeClient = dynamic(() => import("@/components/HomeClient"), {
  ssr: false,
  loading: () => <SplashScreen onFinish={() => {}} />,
});

export default function Home() {
  return <HomeClient />;
}
