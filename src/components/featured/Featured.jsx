import React from "react";
import styles from "./featured.module.css";
import ClickableImage from "@/components/ui/ClickableImage";

const Featured = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <b>¡Hola, soy Circuit Dev!</b> Descubre el mundo de la tecnología y programación.
      </h1>
      <div className={styles.post}>
        <ClickableImage
          src="/p1.jpeg"
          alt="Imagen destacada del blog Circuit Dev"
          containerClassName={styles.imgContainer}
          className={styles.image}
        />
        <div className={styles.textContainer}>
          <h1 className={styles.postTitle}>Explora las últimas tendencias en tecnología y desarrollo</h1>
          <p className={styles.postDesc}>
            Desde inteligencia artificial hasta desarrollo web, pasando por Docker, 
            gaming y machine learning. Mantente al día con las tecnologías que están 
            revolucionando el mundo digital. Aprende, experimenta y crea con las 
            herramientas más avanzadas del desarrollo moderno.
          </p>
          <button className={styles.button}>Leer Más</button>
        </div>
      </div>
    </div>
  );
};

export default Featured;
