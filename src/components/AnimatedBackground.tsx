import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
}

const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [cursorTrails, setCursorTrails] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    // Generate particles
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      const colors = ['hsl(217 91% 60%)', 'hsl(280 80% 60%)', 'hsl(173 80% 50%)'];
      
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();

    // Animate particles
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x + particle.speedX;
        let newY = particle.y + particle.speedY;
        
        // Wrap around screen edges
        if (newX > window.innerWidth) newX = 0;
        if (newX < 0) newX = window.innerWidth;
        if (newY > window.innerHeight) newY = 0;
        if (newY < 0) newY = window.innerHeight;
        
        return {
          ...particle,
          x: newX,
          y: newY,
        };
      }));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Cursor trail effect
    let trailId = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newTrail = {
        id: trailId++,
        x: e.clientX,
        y: e.clientY,
      };
      
      setCursorTrails(prev => [...prev, newTrail]);
      
      // Remove trail after animation
      setTimeout(() => {
        setCursorTrails(prev => prev.filter(trail => trail.id !== newTrail.id));
      }, 600);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Animated Particles */}
      <div className="particles-bg">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle animate-particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 6}px ${particle.color}`,
              animationDelay: `${particle.id * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Cursor Trails */}
      {cursorTrails.map(trail => (
        <div
          key={trail.id}
          className="cursor-trail"
          style={{
            left: `${trail.x - 10}px`,
            top: `${trail.y - 10}px`,
          }}
        />
      ))}

      {/* Parallax Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-2]">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full parallax-slow" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-secondary/40 rounded-full parallax-fast" />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-tertiary/20 rounded-full parallax-slow" />
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-primary/50 rounded-full parallax-fast" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-secondary/30 rounded-full parallax-slow" />
        
        {/* Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="hsl(280 80% 60%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(173 80% 50%)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d="M 100 200 Q 400 100 700 300 T 1200 200"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
          />
          <path
            d="M 200 400 Q 600 300 900 500 T 1100 400"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </svg>
      </div>
    </>
  );
};

export default AnimatedBackground;
