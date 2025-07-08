"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./ImageModal.module.css";

const ImageModal = ({ src, alt, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className={styles.imageContainer}>
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className={styles.image}
            sizes="(max-width: 768px) 95vw, (max-width: 1200px) 90vw, 80vw"
            priority
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
