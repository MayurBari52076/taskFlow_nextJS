'use client';

import { motion, useReducedMotion } from 'framer-motion';

const strandVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.8, delay: i * 0.15, ease: 'easeInOut' },
      opacity: { duration: 0.3, delay: i * 0.15 },
    },
  }),
};

// Gentle continuous float that kicks in once the draw-in animation has settled
const driftAnimation = {
  y: [0, -10, 0, 8, 0],
  x: [0, 4, 0, -4, 0],
};

const driftTransition = {
  duration: 8,
  delay: 2.3,
  repeat: Infinity,
  ease: 'easeInOut',
};

export default function Braid() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 480 480"
      width="100%"
      height="100%"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
      animate={reduceMotion ? undefined : driftAnimation}
      transition={reduceMotion ? undefined : driftTransition}
    >
      <motion.path
        d="M 60 40 C 220 120, 260 200, 60 240 C -140 280, -100 360, 60 440"
        stroke="var(--accent)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        custom={0}
        variants={strandVariants}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
      />
      <motion.path
        d="M 240 20 C 180 120, 300 200, 240 240 C 180 280, 300 360, 240 460"
        stroke="#ffb020"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        custom={1}
        variants={strandVariants}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
      />
      <motion.path
        d="M 420 40 C 260 120, 220 200, 420 240 C 620 280, 580 360, 420 440"
        stroke="#1fb975"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        custom={2}
        variants={strandVariants}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
      />
    </motion.svg>
  );
}