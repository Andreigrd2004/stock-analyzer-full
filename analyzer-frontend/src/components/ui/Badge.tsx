import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  glow = false 
}) => {
  const variantClass = styles[variant];
  const glowClass = glow ? styles.glow : '';

  return (
    <span className={`${styles.badge} ${variantClass} ${glowClass} ${className}`}>
      {children}
    </span>
  );
};
