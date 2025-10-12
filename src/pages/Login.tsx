import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Sparkles } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (!isLogin && !name)) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isLogin) {
      // Login logic
      const users = JSON.parse(localStorage.getItem("spendwise_users") || "[]");
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem("spendwise_current_user", JSON.stringify(user));
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials");
      }
    } else {
      // Signup logic
      const users = JSON.parse(localStorage.getItem("spendwise_users") || "[]");
      
      if (users.find((u: any) => u.email === email)) {
        toast.error("Email already exists");
        return;
      }
      
      const newUser = { name, email, password, id: Date.now() };
      users.push(newUser);
      localStorage.setItem("spendwise_users", JSON.stringify(users));
      localStorage.setItem("spendwise_current_user", JSON.stringify(newUser));
      toast.success("Account created successfully!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10">
        <Button
          variant="ghost"
          className="mb-6 text-foreground/70 hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Home
        </Button>

        <Card className="glass neon-border animate-scale-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <img src="/spendwise-logo.svg" alt="SpendWise AI" className="w-16 h-16" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              {isLogin ? "Welcome Back" : "Join SpendWise AI"}
            </CardTitle>
            <CardDescription className="text-foreground/70">
              {isLogin ? "Sign in to continue your financial journey" : "Create an account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-input/50 border-border/50 focus:border-primary"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary via-secondary to-tertiary hover:opacity-90 transition-all shadow-[var(--shadow-neon-blue)] hover:shadow-[var(--shadow-glow)]"
                size="lg"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-foreground/70 hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
