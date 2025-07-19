'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './editProfile.module.css';

const EditProfile = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website: '',
    twitter: '',
    github: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user) {
      // Cargar datos actuales del usuario
      fetchUserData();
    }
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/profile/me');
      if (response.ok) {
        const userData = await response.json();
        setFormData({
          name: userData.name || '',
          bio: userData.bio || '',
          website: userData.website || '',
          twitter: userData.twitter || '',
          github: userData.github || ''
        });
        setImagePreview(userData.image || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const uploadImage = async () => {
    if (!file) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        throw new Error('Error uploading image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let imageUrl = null;
      
      // Subir imagen si hay una nueva
      if (file) {
        imageUrl = await uploadImage();
      }

      // Actualizar perfil
      const updateData = {
        ...formData,
        ...(imageUrl && { image: imageUrl })
      };

      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Actualizar la sesión con los nuevos datos
        await update({
          ...session,
          user: {
            ...session.user,
            name: updatedUser.name,
            image: updatedUser.image
          }
        });

        setSuccess('✅ Perfil actualizado exitosamente');
        
        // Redirigir al perfil después de 2 segundos
        setTimeout(() => {
          router.push(`/profile/${session.user.id || updatedUser.id}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error actualizando el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>✏️ Editar Perfil</h1>
          <p className={styles.subtitle}>
            Actualiza tu información personal y redes sociales
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.success}>
              {success}
            </div>
          )}

          {/* Avatar */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Avatar preview"
                  width={100}
                  height={100}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  👤
                </div>
              )}
            </div>
            <div className={styles.avatarControls}>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              <label htmlFor="avatar" className={styles.avatarBtn}>
                {uploading ? '📤 Subiendo...' : '📷 Cambiar Avatar'}
              </label>
            </div>
          </div>

          {/* Información básica */}
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre completo *
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
            <label htmlFor="bio" className={styles.label}>
              Biografía
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Cuéntanos sobre ti..."
              rows={4}
            />
          </div>

          {/* Enlaces sociales */}
          <div className={styles.socialSection}>
            <h3 className={styles.sectionTitle}>🔗 Enlaces Sociales</h3>
            
            <div className={styles.inputGroup}>
              <label htmlFor="website" className={styles.label}>
                🌐 Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={styles.input}
                placeholder="https://tu-website.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="twitter" className={styles.label}>
                🐦 Twitter (sin @)
              </label>
              <input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className={styles.input}
                placeholder="tu_usuario_twitter"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="github" className={styles.label}>
                🐙 GitHub
              </label>
              <input
                type="text"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className={styles.input}
                placeholder="tu-usuario-github"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Link href={`/profile/${session?.user?.id}`} className={styles.cancelBtn}>
              ← Cancelar
            </Link>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || uploading}
            >
              {loading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;