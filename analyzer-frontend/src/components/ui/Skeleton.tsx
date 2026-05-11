import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = 'md' 
}) => {
  const inlineStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || '1rem',
  };

  const roundedClass = styles[`rounded-${rounded}`];

  return (
    <div 
      className={`${styles.skeleton} ${roundedClass} ${className}`} 
      style={inlineStyle}
    />
  );
};
