import { useEffect, useState } from "react";
import { PlusCircle, Sparkles, BarChart2, Bell } from "lucide-react";

const steps = [
  {
    icon: PlusCircle,
    title: "Add Transaction",
    description: "Manually add or automatically capture expenses from SMS, receipts, or bank sync.",
  },
  {
    icon: Sparkles,
    title: "AI Categorizes",
    description: "Our AI instantly categorizes transactions and identifies spending patterns.",
  },
  {
    icon: BarChart2,
    title: "Dashboard Updates",
    description: "Your personalized dashboard updates in real-time with beautiful visualizations.",
  },
  {
    icon: Bell,
    title: "Get Smart Alerts",
    description: "Receive intelligent notifications about budgets, savings tips, and unusual spending.",
  },
];

const HowItWorks = () => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setTimeout(() => {
              setVisibleSteps((prev) => [...prev, index]);
            }, index * 200);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".step-item").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SpendWise AI
            </span>{" "}
            Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to transform your financial life with AI-powered insights.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                data-index={index}
                className={`step-item text-center transition-all duration-500 ${
                  visibleSteps.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-4 border-primary flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-20 -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
