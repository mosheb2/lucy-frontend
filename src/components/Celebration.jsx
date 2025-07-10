import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// GitHub-style confetti colors
const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
  '#6c5ce7', '#a55eea', '#26de81', '#fd79a8',
  '#fdcb6e', '#e17055', '#74b9ff', '#00b894'
];

const ConfettiPiece = ({ id, startX, startY, angle, velocity, color, shape, size }) => {
  // Realistic physics constants
  const gravity = 800;
  const airResistance = 0.98;
  const wobbleFreq = Math.random() * 8 + 4;
  const spinSpeed = (Math.random() - 0.5) * 1000;
  const duration = Math.random() * 2 + 3;

  // Calculate realistic trajectory
  const vx = Math.cos(angle) * velocity;
  const vy = Math.sin(angle) * velocity;

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        width: size.width,
        height: size.height,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '2px',
        clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
        transformOrigin: 'center',
        zIndex: 1000,
      }}
      initial={{
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
        scale: 0.1,
      }}
      animate={{
        x: Array.from({ length: 100 }, (_, i) => {
          const t = (i / 99) * duration;
          const wobble = Math.sin(t * wobbleFreq) * 30;
          return vx * t * Math.pow(airResistance, t * 60) + wobble;
        }),
        y: Array.from({ length: 100 }, (_, i) => {
          const t = (i / 99) * duration;
          return -(vy * t - 0.5 * gravity * t * t) * Math.pow(airResistance, t * 30);
        }),
        rotate: Array.from({ length: 100 }, (_, i) => {
          const t = (i / 99) * duration;
          return spinSpeed * t;
        }),
        opacity: [1, 1, 1, 0.8, 0],
        scale: [0.1, 1, 1, 0.8, 0.3],
      }}
      transition={{
        duration: duration,
        ease: 'linear',
        times: Array.from({ length: 100 }, (_, i) => i / 99),
      }}
      exit={{
        opacity: 0,
        scale: 0,
        transition: { duration: 0.2 }
      }}
    />
  );
};

export default function Celebration({ visible }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!visible) return;

    const newPieces = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Create multiple bursts
    const burstCount = 5;
    const piecesPerBurst = 30;

    for (let burst = 0; burst < burstCount; burst++) {
      const burstDelay = burst * 200;
      const burstAngle = (burst / burstCount) * Math.PI * 2;
      const burstX = centerX + Math.cos(burstAngle) * 100;
      const burstY = centerY + Math.sin(burstAngle) * 100;

      setTimeout(() => {
        const burstPieces = [];
        for (let i = 0; i < piecesPerBurst; i++) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = Math.random() * 400 + 200;
          const shapes = ['rect', 'circle', 'triangle'];
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          
          burstPieces.push({
            id: `piece-${burst}-${i}-${Date.now()}`,
            startX: burstX,
            startY: burstY,
            angle: angle,
            velocity: velocity,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shape,
            size: {
              width: Math.random() * 8 + 4,
              height: Math.random() * 12 + 6,
            },
          });
        }
        setPieces(prev => [...prev, ...burstPieces]);
      }, burstDelay);
    }

    // Clear all pieces after animation
    setTimeout(() => {
      setPieces([]);
    }, 6000);
  }, [visible]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 999,
      }}
    >
      <AnimatePresence>
        {pieces.map(piece => (
          <ConfettiPiece key={piece.id} {...piece} />
        ))}
      </AnimatePresence>
    </div>
  );
}