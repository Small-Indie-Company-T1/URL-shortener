import React, { useState, useRef, useEffect } from 'react';

const DropDownCard = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '4px',
        }}
        onClick={() => setIsOpen(false)}
      >
        {isOpen && children}
      </div>
    </div>
  );
};

export default DropDownCard;
