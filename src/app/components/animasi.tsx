import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

const AnimatedNumber = ({ value, className = "" }: AnimatedNumberProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <motion.span
        key={value}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  );
};

export default AnimatedNumber;