import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";

const CTA = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 relative overflow-hidden">
      <AnimatedBackground />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-6 animate-float" />
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Take Control of Your Money with{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent neon-text">
                SpendWise AI
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-2xl mx-auto">
              Join thousands who are already saving more, spending smarter, and living better with AI-powered financial insights.
            </p>
          </div>

          <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary via-secondary to-tertiary hover:opacity-90 transition-all text-lg px-8 py-6 rounded-full shadow-[var(--shadow-neon-blue)] hover:shadow-[var(--shadow-glow)]"
              onClick={() => navigate("/login")}
            >
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTA;
