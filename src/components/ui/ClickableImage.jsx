"use client";

import { useState } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";
import styles from "./ClickableImage.module.css";

const ClickableImage = ({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "",
  showZoomIcon = true,
  ...props 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className={`${styles.imageContainer} ${containerClassName}`}
        onClick={handleImageClick}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={`${styles.image} ${className}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          {...props}
        />
        {showZoomIcon && (
          <div className={styles.zoomIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 11h6" stroke="currentColor" strokeWidth="2"/>
              <path d="M11 8v6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        )}
      </div>
      
      <ImageModal
        src={src}
        alt={alt}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ClickableImage;
