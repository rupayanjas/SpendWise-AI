import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, PieChart, Wallet } from "lucide-react";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[hsl(217,91%,98%)] to-background">
      {/* Floating Icons Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <TrendingUp className="absolute top-20 left-10 text-primary/20 w-16 h-16 animate-float" style={{ animationDelay: "0s" }} />
        <PieChart className="absolute top-40 right-20 text-secondary/20 w-20 h-20 animate-float" style={{ animationDelay: "1s" }} />
        <Wallet className="absolute bottom-40 left-1/4 text-primary/20 w-12 h-12 animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Smartest Way to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Manage Money
              </span>
            </h1>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              AI that helps you track, analyze, and save effortlessly. Take control of your finances with intelligent insights.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg px-8 py-6 rounded-full">
              Try Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-6 rounded-full">
              <Play className="mr-2 w-5 h-5" /> Watch Demo
            </Button>
          </div>

          <div className="mt-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-4 border border-border">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-muted-foreground">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
