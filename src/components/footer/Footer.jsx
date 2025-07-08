import React from "react";
import styles from "./footer.module.css";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💻</div>
          <h1 className={styles.logoText}>Circuit-Blog</h1>
        </div>
        <p className={styles.desc}>
          Tu fuente confiable para las últimas tendencias en tecnología, 
          programación, inteligencia artificial y desarrollo. Explora tutoriales, 
          guías y análisis profundos del mundo tech. Mantente actualizado con 
          las herramientas que están definiendo el futuro digital.
        </p>
        <div className={styles.icons}>
          <Image src="/facebook.png" alt="Facebook" width={18} height={18} />
          <Image src="/instagram.png" alt="Instagram" width={18} height={18} />
          <Image src="/tiktok.png" alt="TikTok" width={18} height={18} />
          <Image src="/youtube.png" alt="YouTube" width={18} height={18} />
        </div>
      </div>
      <div className={styles.links}>
        <div className={styles.list}>
          <span className={styles.listTitle}>Links</span>
          <Link href="/">Homepage</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className={styles.list}>
          <span className={styles.listTitle}>Categorías</span>
          <Link href="/blog?cat=programming">Programación</Link>
          <Link href="/blog?cat=artificial-intelligence">Inteligencia Artificial</Link>
          <Link href="/blog?cat=docker">Docker</Link>
          <Link href="/blog?cat=gaming">Gaming</Link>
          <Link href="/blog?cat=web-development">Desarrollo Web</Link>
        </div>
        <div className={styles.list}>
          <span className={styles.listTitle}>Social</span>
          <Link href="https://www.facebook.com" target="_blank">Facebook</Link>
          <Link href="https://www.instagram.com" target="_blank">Instagram</Link>
          <Link href="https://www.tiktok.com" target="_blank">TikTok</Link>
          <Link href="https://www.youtube.com" target="_blank">YouTube</Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
