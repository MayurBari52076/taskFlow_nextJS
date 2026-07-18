'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { FiCheckSquare } from 'react-icons/fi';

const CARDS = [
  { title: 'Design review', tag: 'Today', color: '#6355ff', rotate: -6, x: -70, y: 0, delay: 0 },
  { title: 'Client call notes', tag: 'Tomorrow', color: '#ffb020', rotate: 4, x: 40, y: 70, delay: 0.15 },
  { title: 'Ship v2.1', tag: 'This week', color: '#1fb975', rotate: -3, x: -20, y: 150, delay: 0.3 },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: (card) => ({
    opacity: 1,
    scale: 1,
    y: [20, 0, -8, 0, 6, 0],
    transition: {
      opacity: { duration: 0.5, delay: card.delay },
      scale: { duration: 0.5, delay: card.delay },
      y: {
        duration: 7,
        delay: card.delay,
        times: [0, 0.1, 0.35, 0.6, 0.8, 1],
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }),
};

export default function TaskStack() {
  const reduceMotion = useReducedMotion();

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '360px', height: '340px', margin: '0 auto' }}>
      {CARDS.map((card, i) => (
        <motion.div
          key={card.title}
          className="glass-surface"
          custom={card}
          initial={reduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          variants={cardVariants}
          style={{
            position: 'absolute',
            top: card.y,
            left: `calc(50% + ${card.x}px)`,
            transform: `translateX(-50%) rotate(${card.rotate}deg)`,
            width: '250px',
            padding: '18px',
            zIndex: i,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: card.color }} />
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {card.tag}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiCheckSquare size={17} color={card.color} />
            <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{card.title}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}