import { useState } from 'react';

const PasswordInput = ({ password, placeholder, onChange, onBlur }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        required
        className="auth-input password-field"
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={password}
        onChange={onChange}
        onBlur={onBlur}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setShowPassword(!showPassword)}
      >
        <span className="material-symbols-outlined">
          {showPassword ? 'password_2' : 'password_2_off'}
        </span>
      </button>
    </div>
  );
};

export default PasswordInput;
