import React from 'react';
import { motion } from 'framer-motion';

const shake = {
  animate: {
    x: [0, -6, 6, -6, 6, 0],
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

export default function RedShakeAnimation({ error, children }) {
  return (
    <motion.div
      style={{ width: '100%' }}
      animate={error ? 'animate' : ''}
      variants={shake}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            style: { borderColor: error ? 'red' : '' },
          });
        }
        return child;
      })}
    </motion.div>
  );
}
