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

export default function InputLine({ error, placeholder, value, onChange }) {
  return (
    <motion.div
      style={{ width: '100%' }}
      animate={error ? 'animate' : ''}
      variants={shake}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="links__search"
        style={{
          borderColor: error ? 'red' : '#89939E',
        }}
      />
    </motion.div>
  );
}
