'use client';

import Image from 'next/image';
import { useState } from 'react';
import styles from './optimizedImage.module.css';

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  fill = false,
  priority = false,
  className = '',
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`${styles.errorPlaceholder} ${className}`}>
        <span>📷</span>
      </div>
    );
  }

  return (
    <div className={`${styles.imageContainer} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`${styles.image} ${isLoading ? styles.loading : ''}`}
        {...props}
      />
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
