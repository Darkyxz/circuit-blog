'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import styles from './register.module.css';

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    // Validaciones básicas
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      // Crear usuario
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registro exitoso, ahora hacer login automático
        const result = await signIn('credentials', {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/');
        } else {
          // Si el login automático falla, redirigir a login manual
          router.push('/login?message=Registro exitoso, por favor inicia sesión');
        }
      } else {
        setError(data.message || 'Error al crear la cuenta');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>🚀 Únete a Circuit-Blog</h1>
          <p className={styles.subtitle}>
            Crea tu cuenta y comparte tus conocimientos tech
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              ⚠️ {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="Tu nombre completo"
              required
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? '⏳ Creando cuenta...' : '✨ Crear cuenta'}
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
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className={styles.link}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;