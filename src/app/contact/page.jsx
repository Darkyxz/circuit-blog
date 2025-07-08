import styles from "./contact.module.css";

const ContactPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Contacto</h1>
        
        <div className={styles.section}>
          <h2 className={styles.subtitle}>¡Conectemos!</h2>
          <p className={styles.text}>
            ¿Tienes alguna pregunta, sugerencia o quieres colaborar con nosotros? 
            Nos encantaría saber de ti. Estamos siempre abiertos a nuevas ideas 
            y oportunidades de colaboración.
          </p>
        </div>

        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <div className={styles.cardIcon}>📧</div>
            <h3 className={styles.cardTitle}>Email</h3>
            <p className={styles.cardText}>
              Para consultas generales, colaboraciones o feedback
            </p>
            <a href="mailto:info@circuit-blog.com" className={styles.cardLink}>
              info@circuit-blog.com
            </a>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.cardIcon}>💼</div>
            <h3 className={styles.cardTitle}>Colaboraciones</h3>
            <p className={styles.cardText}>
              ¿Eres desarrollador y quieres escribir para nosotros?
            </p>
            <a href="mailto:colaboraciones@circuit-blog.com" className={styles.cardLink}>
              colaboraciones@circuit-blog.com
            </a>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.cardIcon}>🐛</div>
            <h3 className={styles.cardTitle}>Reportar Issues</h3>
            <p className={styles.cardText}>
              ¿Encontraste un problema en el sitio? Ayúdanos a mejorarlo
            </p>
            <a href="mailto:support@circuit-blog.com" className={styles.cardLink}>
              support@circuit-blog.com
            </a>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.subtitle}>Síguenos en Redes Sociales</h2>
          <p className={styles.text}>
            Mantente conectado con las últimas actualizaciones y contenido exclusivo.
          </p>
          
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink}>
              <span className={styles.socialIcon}>🔗</span>
              LinkedIn
            </a>
            <a href="#" className={styles.socialLink}>
              <span className={styles.socialIcon}>🐙</span>
              GitHub
            </a>
            <a href="#" className={styles.socialLink}>
              <span className={styles.socialIcon}>🐦</span>
              Twitter
            </a>
            <a href="#" className={styles.socialLink}>
              <span className={styles.socialIcon}>📺</span>
              YouTube
            </a>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.subtitle}>Tiempo de Respuesta</h2>
          <p className={styles.text}>
            Nos comprometemos a responder todos los mensajes en un plazo de 24-48 horas 
            durante días laborables. Para consultas urgentes, por favor especifica 
            "URGENTE" en el asunto del email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
