import styles from "./about.module.css";

const AboutPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Sobre Circuit Blog</h1>
        
        <div className={styles.section}>
          <h2 className={styles.subtitle}>¿Qué es Circuit Blog?</h2>
          <p className={styles.text}>
            Circuit Blog es tu destino principal para mantenerte al día con las últimas 
            tendencias en tecnología y desarrollo. Desde inteligencia artificial hasta 
            desarrollo web, pasando por Docker, gaming y machine learning.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.subtitle}>Nuestra Misión</h2>
          <p className={styles.text}>
            Compartir conocimiento técnico de calidad y ayudar a desarrolladores de 
            todos los niveles a crecer profesionalmente. Creemos en el aprendizaje 
            continuo y en la importancia de mantenerse actualizado en el mundo 
            tecnológico que cambia constantemente.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.subtitle}>Categorías que Cubrimos</h2>
          <div className={styles.categories}>
            <div className={styles.category}>
              <h3>🤖 Inteligencia Artificial</h3>
              <p>Machine Learning, Deep Learning, y las últimas innovaciones en IA</p>
            </div>
            <div className={styles.category}>
              <h3>💻 Programación</h3>
              <p>Mejores prácticas, frameworks modernos y técnicas de desarrollo</p>
            </div>
            <div className={styles.category}>
              <h3>🐳 Docker & DevOps</h3>
              <p>Containerización, CI/CD y herramientas de desarrollo modernas</p>
            </div>
            <div className={styles.category}>
              <h3>🎮 Gaming & Desarrollo</h3>
              <p>Desarrollo de juegos, WebGL, Canvas API y tecnologías interactivas</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.subtitle}>Únete a Nuestra Comunidad</h2>
          <p className={styles.text}>
            Si eres desarrollador, estudiante de programación, o simplemente apasionado 
            por la tecnología, Circuit Blog es el lugar perfecto para expandir tus 
            conocimientos y conectar con otros profesionales del sector.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
