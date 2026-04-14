import { useState } from 'react';

const PasswordInput = ({ password, placeholder, onChange, onBlur }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div>
      <input
        required
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={password}
        onChange={onChange}
        onBlur={onBlur}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {showPassword ? '🙈' : '👁️'}
      </button>
    </div>
  );
};

export default PasswordInput;
