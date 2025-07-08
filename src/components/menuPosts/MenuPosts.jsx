import ClickableImage from "@/components/ui/ClickableImage";
import Link from "next/link";
import React from "react";
import styles from "./menuPosts.module.css"

const MenuPosts = ({ withImage }) => {
  return (
    <div className={styles.items}>
      <Link href="/blog?cat=artificial-intelligence" className={styles.item}>
        {withImage && (
          <ClickableImage
            src="/p1.jpeg"
            alt="Imagen del post sobre IA"
            containerClassName={styles.imageContainer}
            className={styles.image}
            showZoomIcon={false}
          />
        )}
        <div className={styles.textContainer}>
          <span className={`${styles.category} ${styles.ai}`}>Inteligencia Artificial</span>
          <h3 className={styles.postTitle}>
            Cómo la IA está revolucionando el desarrollo de software moderno
          </h3>
          <div className={styles.detail}>
            <span className={styles.username}>Circuit Dev</span>
            <span className={styles.date}>- 08.01.2025</span>
          </div>
        </div>
      </Link>
      <Link href="/blog?cat=programming" className={styles.item}>
        {withImage && (
          <ClickableImage
            src="/p1.jpeg"
            alt="Imagen del post sobre programación"
            containerClassName={styles.imageContainer}
            className={styles.image}
            showZoomIcon={false}
          />
        )}
        <div className={styles.textContainer}>
          <span className={`${styles.category} ${styles.programming}`}>
            Programación
          </span>
          <h3 className={styles.postTitle}>
            Las mejores prácticas de código limpio en JavaScript y TypeScript
          </h3>
          <div className={styles.detail}>
            <span className={styles.username}>Circuit Dev</span>
            <span className={styles.date}>- 07.01.2025</span>
          </div>
        </div>
      </Link>
      <Link href="/blog?cat=docker" className={styles.item}>
        {withImage && (
          <ClickableImage
            src="/p1.jpeg"
            alt="Imagen del post sobre Docker"
            containerClassName={styles.imageContainer}
            className={styles.image}
            showZoomIcon={false}
          />
        )}
        <div className={styles.textContainer}>
          <span className={`${styles.category} ${styles.docker}`}>Docker</span>
          <h3 className={styles.postTitle}>
            Guía completa para containerizar aplicaciones Next.js con Docker
          </h3>
          <div className={styles.detail}>
            <span className={styles.username}>Circuit Dev</span>
            <span className={styles.date}>- 06.01.2025</span>
          </div>
        </div>
      </Link>
      <Link href="/blog?cat=gaming" className={styles.item}>
        {withImage && (
          <ClickableImage
            src="/p1.jpeg"
            alt="Imagen del post sobre gaming"
            containerClassName={styles.imageContainer}
            className={styles.image}
            showZoomIcon={false}
          />
        )}
        <div className={styles.textContainer}>
          <span className={`${styles.category} ${styles.gaming}`}>
            Gaming
          </span>
          <h3 className={styles.postTitle}>
            Desarrollando juegos web con Canvas API y WebGL: Tutorial práctico
          </h3>
          <div className={styles.detail}>
            <span className={styles.username}>Circuit Dev</span>
            <span className={styles.date}>- 05.01.2025</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MenuPosts;
