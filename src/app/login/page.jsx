"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./loginPage.module.css";

const LoginPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [searchParams]);

  if (status === "loading") {
    return <div className={styles.loading}>Cargando...</div>;
  }

  if (status === "authenticated") {
    router.push("/");
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email.trim() || !formData.password) {
      setError('Email y contraseña son requeridos');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/');
      } else {
        setError('Email o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>🔐 Iniciar Sesión</h1>
          <p className={styles.subtitle}>
            Accede a tu cuenta de Circuit-Blog
          </p>
        </div>

        {message && (
          <div className={styles.success}>
            ✅ {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              ⚠️ {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? '⏳ Iniciando sesión...' : '🚀 Iniciar Sesión'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>o continúa con</span>
        </div>

        <div className={styles.socialButtons}>
          <button
            onClick={() => signIn('google')}
            className={styles.socialBtn}
          >
            <span>🔍</span>
            Google
          </button>
          <button
            onClick={() => signIn('github')}
            className={styles.socialBtn}
          >
            <span>🐙</span>
            GitHub
          </button>
        </div>

        <div className={styles.footer}>
          <p>
            ¿No tienes cuenta?{' '}
            <Link href="/register" className={styles.link}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
