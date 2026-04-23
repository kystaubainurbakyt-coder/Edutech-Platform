import { useState, useEffect } from "react"; 
import { Outlet } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Toaster } from "../components/ui/sonner";
import { ArrowUp } from "lucide-react"; 
import { Button } from "../components/ui/button"; 

export default function Layout() {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", 
    });
  }
  

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300 dark:bg-slate-950">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-center" />

      {/* SCROLL TO TOP BUTTON */}
      {showScroll && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full size-12 shadow-2xl animate-in fade-in zoom-in duration-300"
          size="icon"
        >
          <ArrowUp className="size-6" />
        </Button>
      )}
    </div>
  );
}