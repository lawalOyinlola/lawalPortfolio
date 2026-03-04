"use client";

import Navbar from "./Navbar";
import Preloader from "./Preloader";
import Footer from "./Footer";
import { useLoading } from "./providers/LoadingContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { loading, setLoading } = useLoading();

  return (
    <main
      className={`relative min-h-screen overflow-x-clip bg-background ${loading ? "overflow-hidden h-screen" : ""}`}
    >
      {loading && <Preloader setComplete={() => setLoading(false)} />}

      <div
        className={`relative z-10 bg-background transition-opacity duration-800 ${loading ? "opacity-0 invisible" : "opacity-100 visible"}`}
      >
        <Navbar ready={!loading} />
        {children}
        {/* Tail section that reveals footer underneath */}
        <div
          id="footer-reveal-sentinel"
          className="h-[20vh] pointer-events-none"
        />
        <Footer className="sticky inset-x-0 bottom-0 h-screen z-0" />
      </div>
    </main>
  );
}
