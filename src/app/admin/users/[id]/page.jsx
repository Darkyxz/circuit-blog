'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { formatDate } from '@/utils/dateFormatter';
import styles from '../../admin.module.css';

const UserDetail = () => {
  const { isAdmin, isLoading } = useAdminStatus();
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin && params.id) {
      fetchUser();
    }
  }, [isAdmin, isLoading, router, params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setError('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error cargando usuario');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
        alert('Usuario actualizado exitosamente');
      } else {
        const error = await response.json();
        alert('Error actualizando usuario: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error actualizando usuario');
    } finally {
      setUpdating(false);
    }
  };

  const handleRoleChange = (newRole) => {
    if (confirm(`¿Cambiar el rol de ${user.name} a ${newRole}?`)) {
      updateUser({ role: newRole });
    }
  };

  const toggleUserStatus = () => {
    const newStatus = !user.isActive;
    if (confirm(`¿${newStatus ? 'Activar' : 'Desactivar'} a ${user.name}?`)) {
      updateUser({ isActive: newStatus });
    }
  };

  if (isLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <Link href="/admin/users" className={styles.backBtn}>
            ← Volver a Usuarios
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Usuario no encontrado</h2>
          <Link href="/admin/users" className={styles.backBtn}>
            ← Volver a Usuarios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Detalle de Usuario</h1>
        <div className={styles.actions}>
          <Link href="/admin/users" className={styles.backBtn}>
            ← Volver a Usuarios
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Información del Usuario */}
        <div className={styles.tableContainer}>
          <h3 style={{ marginBottom: '20px', color: 'var(--textColor)' }}>Información Personal</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'Usuario'}
                width={80}
                height={80}
                style={{ borderRadius: '50%', marginRight: '15px' }}
              />
            ) : (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--softBg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px',
                fontSize: '2rem',
                color: 'var(--softTextColor)'
              }}>
                👤
              </div>
            )}
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: 'var(--textColor)' }}>
                {user.name || 'Sin nombre'}
              </h2>
              <p style={{ margin: '0', color: 'var(--softTextColor)' }}>
                {user.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <strong style={{ color: 'var(--textColor)' }}>Rol:</strong>
              <select 
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={updating}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  border: '1px solid var(--softTextColor)',
                  borderRadius: '4px',
                  background: 'var(--softBg)',
                  color: 'var(--textColor)'
                }}
              >
                <option value="USER">Usuario</option>
                <option value="AUTHOR">Autor</option>
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <strong style={{ color: 'var(--textColor)' }}>Estado:</strong>
              <button 
                className={`${styles.statusBtn} ${user.isActive ? styles.active : styles.inactive}`}
                onClick={toggleUserStatus}
                disabled={updating}
                style={{ marginLeft: '10px' }}
              >
                {user.isActive ? 'Activo' : 'Inactivo'}
              </button>
            </div>

            <div>
              <strong style={{ color: 'var(--textColor)' }}>Fecha de Registro:</strong>
              <span style={{ marginLeft: '10px', color: 'var(--softTextColor)' }}>
                {formatDate(user.createdAt)}
              </span>
            </div>

            {user.bio && (
              <div>
                <strong style={{ color: 'var(--textColor)' }}>Bio:</strong>
                <p style={{ marginTop: '5px', color: 'var(--softTextColor)' }}>
                  {user.bio}
                </p>
              </div>
            )}

            {user.website && (
              <div>
                <strong style={{ color: 'var(--textColor)' }}>Website:</strong>
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: '10px', color: '#007acc' }}
                >
                  {user.website}
                </a>
              </div>
            )}

            {user.twitter && (
              <div>
                <strong style={{ color: 'var(--textColor)' }}>Twitter:</strong>
                <a 
                  href={`https://twitter.com/${user.twitter}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: '10px', color: '#007acc' }}
                >
                  @{user.twitter}
                </a>
              </div>
            )}

            {user.github && (
              <div>
                <strong style={{ color: 'var(--textColor)' }}>GitHub:</strong>
                <a 
                  href={`https://github.com/${user.github}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: '10px', color: '#007acc' }}
                >
                  {user.github}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas de Actividad */}
        <div className={styles.tableContainer}>
          <h3 style={{ marginBottom: '20px', color: 'var(--textColor)' }}>Estadísticas de Actividad</h3>
          
          <div className={styles.statsGrid} style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
            <div className={styles.statCard}>
              <h3>Posts Publicados</h3>
              <p className={styles.statNumber}>{user._count?.Post || 0}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Comentarios</h3>
              <p className={styles.statNumber}>{user._count?.Comment || 0}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Likes Dados</h3>
              <p className={styles.statNumber}>{user._count?.likes || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Adicionales */}
      <div className={styles.tableContainer}>
        <h3 style={{ marginBottom: '20px', color: 'var(--textColor)' }}>Acciones</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Link 
            href={`/admin/posts?author=${user.email}`}
            className={styles.createBtn}
            style={{ textDecoration: 'none' }}
          >
            Ver Posts del Usuario
          </Link>
          
          {user.role !== 'ADMIN' && (
            <button 
              className={styles.deleteBtn}
              onClick={toggleUserStatus}
              disabled={updating}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {updating ? 'Actualizando...' : (user.isActive ? 'Desactivar Usuario' : 'Activar Usuario')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;