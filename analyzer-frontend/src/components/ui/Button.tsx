import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  glow = false,
  className = '',
  ...props 
}) => {
  const variantClass = styles[variant];
  const glowClass = glow ? styles.glow : '';

  return (
    <button 
      className={`${styles.button} ${variantClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
