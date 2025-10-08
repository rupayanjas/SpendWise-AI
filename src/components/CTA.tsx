import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary opacity-95"></div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <Sparkles className="w-16 h-16 text-white mx-auto mb-6 animate-float" />
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Take Control of Your Money with SpendWise AI
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands who are already saving more, spending smarter, and living better with AI-powered financial insights.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-2xl">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 rounded-full"
            >
              Learn More
            </Button>
          </div>

          <p className="text-white/80 mt-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
