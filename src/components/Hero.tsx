import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, PieChart, Wallet, DollarSign, CreditCard } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large glowing orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-tertiary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        
        {/* Additional smaller orbs for depth */}
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-primary/10 rounded-full blur-2xl parallax-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-2xl parallax-fast"></div>
        
        {/* Floating icons with parallax */}
        <TrendingUp className="absolute top-20 left-10 text-primary/30 w-16 h-16 animate-float parallax-slow" style={{ animationDelay: "0s" }} />
        <PieChart className="absolute top-40 right-20 text-secondary/30 w-20 h-20 animate-float parallax-fast" style={{ animationDelay: "1s" }} />
        <Wallet className="absolute bottom-40 left-1/4 text-tertiary/30 w-12 h-12 animate-float parallax-slow" style={{ animationDelay: "2s" }} />
        <DollarSign className="absolute top-1/2 right-10 text-primary/30 w-14 h-14 animate-float parallax-fast" style={{ animationDelay: "1.5s" }} />
        <CreditCard className="absolute bottom-20 right-1/3 text-secondary/30 w-16 h-16 animate-float parallax-slow" style={{ animationDelay: "0.5s" }} />
        
        {/* Additional decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary rounded-full animate-pulse parallax-fast"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-secondary rounded-full animate-pulse parallax-slow" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute top-3/4 right-1/2 w-3 h-3 bg-tertiary rounded-full animate-pulse parallax-fast" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Smartest Way to{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent neon-text">
                Manage Money
              </span>
            </h1>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              AI that helps you track, analyze, and save effortlessly. Take control of your finances with intelligent insights.
            </p>
          </div>

          <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary via-secondary to-tertiary hover:opacity-90 transition-all text-lg px-8 py-6 rounded-full shadow-[var(--shadow-neon-blue)] hover:shadow-[var(--shadow-glow)]"
              onClick={() => navigate("/login")}
            >
              Try Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="mt-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-tertiary/30 blur-3xl"></div>
              <div className="relative glass neon-border rounded-2xl p-6">
                <div className="aspect-video bg-gradient-to-br from-accent to-background rounded-xl p-6 overflow-hidden">
                  {/* Sample Dashboard UI */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="glass neon-border p-4 rounded-lg">
                      <p className="text-xs text-foreground/60 mb-1">Balance</p>
                      <p className="text-2xl font-bold text-tertiary">₹45,250</p>
                    </div>
                    <div className="glass neon-border p-4 rounded-lg">
                      <p className="text-xs text-foreground/60 mb-1">Income</p>
                      <p className="text-2xl font-bold text-primary">₹65,000</p>
                    </div>
                    <div className="glass neon-border p-4 rounded-lg">
                      <p className="text-xs text-foreground/60 mb-1">Expenses</p>
                      <p className="text-2xl font-bold text-secondary">₹19,750</p>
                    </div>
                  </div>
                  
                  <div className="glass neon-border p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold">Recent Transactions</p>
                      <span className="text-xs text-foreground/60">This Week</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: "Salary", amount: "+₹50,000", color: "text-tertiary" },
                        { name: "Rent", amount: "-₹15,000", color: "text-secondary" },
                        { name: "Groceries", amount: "-₹2,500", color: "text-secondary" }
                      ].map((tx, i) => (
                        <div key={i} className="flex items-center justify-between text-sm glass p-2 rounded">
                          <span className="text-foreground/80">{tx.name}</span>
                          <span className={`font-semibold ${tx.color}`}>{tx.amount}</span>
                        </div>
                      ))}
                    </div>
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
