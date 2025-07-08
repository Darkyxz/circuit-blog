import Link from "next/link";
import React from "react";
import styles from "./menuCategories.module.css";

const MenuCategories = () => {
  return (
    <div className={styles.categoryList}>
      <Link
        href="/blog?cat=programming"
        className={`${styles.categoryItem} ${styles.programming}`}
      >
        Programación
      </Link>
      <Link href="/blog?cat=artificial-intelligence" className={`${styles.categoryItem} ${styles.ai}`}>
        Inteligencia Artificial
      </Link>
      <Link href="/blog?cat=gaming" className={`${styles.categoryItem} ${styles.gaming}`}>
        Gaming
      </Link>
      <Link href="/blog?cat=docker" className={`${styles.categoryItem} ${styles.docker}`}>
        Docker
      </Link>
      <Link href="/blog?cat=web-development" className={`${styles.categoryItem} ${styles.webdev}`}>
        Desarrollo Web
      </Link>
      <Link href="/blog?cat=machine-learning" className={`${styles.categoryItem} ${styles.ml}`}>
        Machine Learning
      </Link>
    </div>
  );
};

export default MenuCategories;
