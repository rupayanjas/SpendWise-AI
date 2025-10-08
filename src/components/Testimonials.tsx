import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingDown } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Freelance Designer",
    quote: "SpendWise AI helped me save ₹3,000/month by identifying unnecessary subscriptions I'd forgotten about!",
    savings: "₹3,000",
    avatar: "PS",
  },
  {
    name: "Rahul Mehta",
    role: "Software Engineer",
    quote: "The AI insights are incredible. It predicted my overspending before it happened and sent me alerts.",
    savings: "₹5,500",
    avatar: "RM",
  },
  {
    name: "Ananya Desai",
    role: "Small Business Owner",
    quote: "Managing business and personal expenses was chaos. SpendWise AI made it effortless and organized.",
    savings: "₹8,200",
    avatar: "AD",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Real People,{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Real Savings
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands who've transformed their financial lives with SpendWise AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-secondary font-bold">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-lg">{testimonial.savings}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">saved/mo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
          <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              50K+
            </div>
            <p className="text-muted-foreground">Active Users</p>
          </div>
          <div className="animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              ₹2.5Cr+
            </div>
            <p className="text-muted-foreground">Money Saved</p>
          </div>
          <div className="animate-scale-in" style={{ animationDelay: "0.6s" }}>
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              4.9★
            </div>
            <p className="text-muted-foreground">User Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
