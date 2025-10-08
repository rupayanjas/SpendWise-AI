import { Linkedin, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="glass border-t border-border/50 py-12 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent pointer-events-none"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary via-secondary to-tertiary rounded-lg flex items-center justify-center shadow-[var(--shadow-neon-blue)]">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">SpendWise AI</span>
            </div>
            <p className="text-foreground/60 max-w-md">
              Your intelligent financial companion. Track, analyze, and save smarter with AI-powered insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-foreground/60 hover:text-primary transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-foreground/60 hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#contact" className="text-foreground/60 hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Connect</h3>
            <div className="flex gap-4">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass neon-border hover:bg-primary/20 flex items-center justify-center transition-all hover:shadow-[var(--shadow-neon-blue)]"
              >
                <Linkedin className="w-5 h-5 text-foreground" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass neon-border hover:bg-secondary/20 flex items-center justify-center transition-all hover:shadow-[var(--shadow-neon-purple)]"
              >
                <Instagram className="w-5 h-5 text-foreground" />
              </a>
              <a 
                href="mailto:hello@spendwise.ai"
                className="w-10 h-10 rounded-full glass neon-border hover:bg-tertiary/20 flex items-center justify-center transition-all hover:shadow-[var(--shadow-neon-teal)]"
              >
                <Mail className="w-5 h-5 text-foreground" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/30 pt-8 text-center text-foreground/50">
          <p>© 2025 ChainStorm. All rights reserved. Built with SpendWise AI.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
