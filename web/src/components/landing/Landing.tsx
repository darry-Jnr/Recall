import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Footer } from "./Footer";

export function Landing() {
  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}
