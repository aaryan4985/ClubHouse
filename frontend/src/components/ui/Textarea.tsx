import React, { useState, useEffect } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((
  { 
    className = "", 
    label, 
    error, 
    helperText, 
    maxLength, 
    showCount = true,
    value = '',
    onChange,
    onFocus,
    onBlur,
    disabled,
    required,
    placeholder,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(typeof value === 'string' ? value.length : 0);
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
        setCurrentValue(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // Limit to maxLength if specified
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      // Update state
      setCurrentValue(newValue);
      setCharCount(newValue.length);

      // Call parent onChange if it exists
      if (onChange) {
        onChange(e);
      }

      console.log('Current Value:', newValue); // Debugging line
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="w-full space-y-1">
        {/* Label */}
        {label && (
          <div className="flex justify-between items-center">
            <label 
              className={`block text-sm font-medium transition-colors duration-200
                ${disabled ? 'text-gray-400' : 'text-gray-200'}
                ${isFocused ? 'text-white' : ''}
                ${error ? 'text-red-400' : ''}
              `}
            >
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {/* Character counter - top */}
            {maxLength && showCount && (
              <span className={`text-xs transition-colors duration-200
                ${disabled ? 'text-gray-500' : 'text-gray-400'}
                ${isFocused ? 'text-white' : ''}
                ${error ? 'text-red-400' : ''}
                ${charCount >= (maxLength * 0.9) ? 'text-yellow-400' : ''}
              `}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        {/* Textarea Container */}
        <div className="relative">
          {/* Animated gradient border */}
          <div 
            className={`absolute -inset-0.5 rounded-lg 
              bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
              transition duration-300
              ${isFocused ? 'opacity-100 blur-[1px]' : 'opacity-0 blur-none'}
              ${disabled ? 'opacity-0' : ''}
              animate-gradient
            `}
          />

          {/* Textarea Input */}
          <textarea
            ref={ref}
            value={currentValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            className={`
              relative
              w-full
              min-h-[120px]
              rounded-lg
              border
              bg-gray-900
              px-4
              py-3
              text-base
              text-white
              placeholder:text-gray-500
              transition-all
              duration-200
              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:bg-gray-800
              ${error ? 'border-red-500' : 'border-gray-700'}
              ${isFocused ? 'border-transparent shadow-lg' : ''}
              hover:border-gray-600
              focus:outline-none
              ${className}
            `}
            {...props}
          />

          {/* Character counter - bottom right */}
          {!maxLength && showCount && (
            <div className={`absolute bottom-2 right-3 
              text-xs
              transition-colors duration-200
              ${disabled ? 'text-gray-500' : 'text-gray-400'}
              ${isFocused ? 'text-white' : ''}
            `}>
              {charCount} characters
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-400 animate-fadeIn mt-1">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="text-sm text-gray-400 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

// Add keyframes for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 6s linear infinite;
  }

  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

Textarea.displayName = "Textarea";

export default Textarea;
