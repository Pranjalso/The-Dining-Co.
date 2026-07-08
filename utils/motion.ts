type Direction = 'left' | 'right' | 'up' | 'down';
type TransitionType = 'spring' | 'tween' | 'inertia' | 'just';

export const fadeIn = (direction: Direction, type: TransitionType, delay: number, duration: number) => {
  return {
    hidden: {
      x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
      y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type,
        delay,
        duration,
        ease: "easeOut",
      },
    },
  };
};

export const staggerContainer = (staggerChildren: number, delayChildren?: number) => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren,
        delayChildren: delayChildren || 0,
      },
    },
  };
};

export const textVariant = (delay: number) => {
  return {
    hidden: {
      y: 50,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        duration: 1.25,
        delay,
      },
    },
  };
};

export const slideIn = {
  hidden: { x: -100, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};