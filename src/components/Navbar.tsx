import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass neon-border backdrop-blur-md" : ""
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/spendwise-logo.svg" alt="SpendWise AI" className="w-10 h-10" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent neon-text">
              SpendWise AI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection("home")} className="text-foreground hover:text-primary transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection("features")} className="text-foreground hover:text-primary transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-foreground hover:text-primary transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection("testimonials")} className="text-foreground hover:text-primary transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection("contact")} className="text-foreground hover:text-primary transition-colors">
              Contact
            </button>
          </div>

          <Button 
            className="bg-gradient-to-r from-primary via-secondary to-tertiary hover:opacity-90 transition-all shadow-[var(--shadow-neon-blue)] hover:shadow-[var(--shadow-glow)]"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
