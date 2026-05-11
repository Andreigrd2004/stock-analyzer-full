import React, { InputHTMLAttributes, forwardRef } from 'react';
import styles from './TextInput.module.css';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({ 
  icon, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {icon && (
        <span className={`material-symbols-outlined ${styles.icon}`}>
          {icon}
        </span>
      )}
      <input 
        ref={ref}
        className={`${styles.input} ${icon ? styles.withIcon : ''}`}
        {...props}
      />
    </div>
  );
});

TextInput.displayName = 'TextInput';
