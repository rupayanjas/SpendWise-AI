import { Brain, Bell, BarChart3, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Machine learning algorithms analyze your spending patterns and provide personalized recommendations.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Bell,
    title: "Smart Budget Alerts",
    description: "Get real-time notifications when you're close to exceeding your budget limits.",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Visual Dashboards",
    description: "Beautiful, interactive charts that make understanding your finances simple and engaging.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Layers,
    title: "Multi-Source Tracking",
    description: "Automatically sync data from SMS, receipts, and bank accounts in one unified platform.",
    color: "from-indigo-500 to-indigo-600",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Smart Money Management
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to take control of your finances, powered by cutting-edge AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
