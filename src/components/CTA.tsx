import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Neon Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-tertiary/20"></div>
      
      {/* Decorative Glow Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tertiary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

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

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary via-secondary to-tertiary hover:opacity-90 transition-all text-lg px-8 py-6 rounded-full shadow-[var(--shadow-neon-blue)] hover:shadow-[var(--shadow-glow)]"
              onClick={() => navigate("/login")}
            >
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-primary/50 glass hover:bg-primary/10 hover:border-primary text-lg px-8 py-6 rounded-full"
            >
              Learn More
            </Button>
          </div>

          <p className="text-foreground/60 mt-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
