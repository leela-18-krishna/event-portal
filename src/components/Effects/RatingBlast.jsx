import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RatingBlast = ({ rating, trigger }) => {
  const [active, setActive] = useState(false);
  const emojis = rating === 5 ? ['⭐', '🔥', '💖', '👑', '🎉', '🏆'] : ['✨', '👍', '😊', '🙌'];

  useEffect(() => {
    if (trigger) {
      setActive(true);
      const timer = setTimeout(() => setActive(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000] flex items-center justify-center overflow-hidden">
      {/* Global Glow */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 2 }}
        className={`absolute inset-0 ${rating === 5 ? 'bg-amber-400' : 'bg-indigo-400'} blur-3xl`}
      />
      
      {/* Emoji Rain */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: 1000, 
            x: Math.random() * 2000 - 1000, 
            opacity: 1,
            rotate: 0,
            scale: 1 
          }}
          animate={{ 
            y: -1000, 
            x: Math.random() * 2000 - 1000,
            rotate: 360,
            scale: 2,
            opacity: 0 
          }}
          transition={{ 
            duration: 2 + Math.random() * 1,
            ease: "easeOut",
            delay: Math.random() * 0.5
          }}
          className="absolute text-4xl"
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </motion.div>
      ))}
    </div>
  );
};

export default RatingBlast;
