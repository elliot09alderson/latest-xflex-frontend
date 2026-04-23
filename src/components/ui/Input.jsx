import { useState } from 'react';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  name,
  required = false,
  disabled = false,
  readOnly = false,
  className = '',
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-white/80">
          {label}
          {required && <span className="text-[#e94560] ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className={`
              absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
              transition-colors duration-200
              ${focused ? 'text-[#e94560]' : 'text-white/40'}
            `}
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full bg-white/5 backdrop-blur-xl
            border rounded-xl px-4 py-2.5 text-sm text-white
            placeholder:text-white/30
            outline-none transition-all duration-200
            ${Icon ? 'pl-11' : ''}
            ${error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
              : 'border-white/10 focus:border-[#e94560]/60 focus:ring-1 focus:ring-[#e94560]/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
