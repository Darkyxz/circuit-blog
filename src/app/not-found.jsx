import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.description}>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.homeBtn}>
            🏠 Volver al Inicio
          </Link>
          <Link href="/blog" className={styles.blogBtn}>
            📝 Ver Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
