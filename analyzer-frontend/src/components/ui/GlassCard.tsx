import React from 'react';
import styles from './GlassCard.module.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glow?: 'none' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  style,
  glow = 'none',
  onClick,
}) => {
  const glowClass = glow !== 'none' ? styles[`glow-${glow}`] : '';
  
  return (
    <div className={`${styles.glassCard} ${glowClass} ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
};
