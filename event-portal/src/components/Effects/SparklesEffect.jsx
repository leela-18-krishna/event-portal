import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Particle = ({ id, x, y, color, angle, velocity, type }) => (
  <motion.div
    initial={{ x: `${x}vw`, y: `${y}vh`, opacity: 1, scale: 1, rotate: 0 }}
    animate={{ 
      x: `${x + Math.cos(angle) * velocity}vw`, 
      y: `${y + Math.sin(angle) * velocity - 80}vh`, 
      opacity: 0,
      rotate: 1080,
      scale: type === 'paper' ? [1, 1.5, 0.5] : 0
    }}
    transition={{ duration: 4, ease: "easeOut" }}
    className="fixed pointer-events-none z-[9999]"
    style={{ 
      backgroundColor: type === 'paper' ? color : 'transparent',
      width: type === 'paper' ? '12px' : 'auto',
      height: type === 'paper' ? '6px' : 'auto',
      fontSize: type === 'emoji' ? '24px' : '0px',
      boxShadow: type === 'paper' ? `0 0 10px ${color}` : 'none'
    }}
  >
    {type === 'emoji' ? id : ''}
  </motion.div>
);

const SparklesEffect = ({ events }) => {
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState([]);
  const triggeredEvents = useRef(new Set());

  useEffect(() => {
    const checkNewLive = () => {
      if (!events || events.length === 0) return;

      const now = new Date();
      events.forEach(e => {
        const start = new Date(e.date);
        const diff = now.getTime() - start.getTime();
        
        // If event started in the last 15 seconds and we haven't triggered for it yet
        if (diff >= 0 && diff < 15000 && !triggeredEvents.current.has(e._id)) {
          triggeredEvents.current.add(e._id);
          triggerBlast();
        }
      });
    };

    const triggerBlast = () => {
      const newParticles = [];
      const colors = ['#fbbf24', '#f59e0b', '#fb7185', '#818cf8', '#2dd4bf', '#ffffff'];
      const emojis = ['⭐', '🎉', '🎊', '🔥', '✨', '🏆'];
      
      const origins = [
        { x: 10, y: 100 }, { x: 30, y: 100 }, { x: 50, y: 100 }, { x: 70, y: 100 }, { x: 90, y: 100 }
      ];

      origins.forEach(origin => {
        for (let i = 0; i < 25; i++) {
          newParticles.push({
            id: Math.random(),
            x: origin.x,
            y: origin.y,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: -Math.PI / 2 + (Math.random() - 0.5),
            velocity: 40 + Math.random() * 60,
            type: 'paper'
          });
        }
        for (let i = 0; i < 8; i++) {
          newParticles.push({
            id: emojis[Math.floor(Math.random() * emojis.length)],
            x: origin.x,
            y: origin.y,
            color: '',
            angle: -Math.PI / 2 + (Math.random() - 0.5),
            velocity: 30 + Math.random() * 50,
            type: 'emoji'
          });
        }
      });

      setParticles(newParticles);
      setShow(true);
      setTimeout(() => {
        setShow(false);
        setParticles([]);
      }, 6000);
    };

    const timer = setInterval(checkNewLive, 2000);
    return () => clearInterval(timer);
  }, [events]);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4 }}
            className="fixed inset-0 bg-gradient-to-b from-amber-400/50 via-amber-500/30 to-transparent pointer-events-none z-[9998] blur-3xl shadow-[inset_0_0_200px_rgba(251,191,36,0.6)]"
          />
        )}
      </AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <AnimatePresence>
          {show && particles.map((p, idx) => (
            <Particle key={idx} {...p} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SparklesEffect;
