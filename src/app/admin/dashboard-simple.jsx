'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

const SimpleDashboard = () => {
  const { isAdmin, isLoading } = useAdminStatus();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, isLoading, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener estadísticas básicas
      const [postsRes, usersRes, commentsRes] = await Promise.all([
        fetch('/api/posts?page=1'),
        fetch('/api/debug/users'),
        fetch('/api/admin/comments')
      ]);

      const postsData = postsRes.ok ? await postsRes.json() : { count: 0, posts: [] };
      const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
      const commentsData = commentsRes.ok ? await commentsRes.json() : [];

      setStats({
        totalPosts: postsData.count || 0,
        totalUsers: usersData.users?.length || 0,
        totalComments: commentsData.length || 0,
        pendingComments: commentsData.filter(c => c.status === 'PENDING').length || 0,
        recentPosts: postsData.posts?.slice(0, 5) || []
      });

    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando dashboard...</div>
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
          <h1>Error en el Dashboard</h1>
          <p>{error}</p>
          <button onClick={fetchStats} style={{ marginTop: '10px', padding: '10px 20px' }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Panel de Administración</h1>
        <p className={styles.subtitle}>Bienvenido, Administrador</p>
      </div>

      {/* Estadísticas principales */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Posts Totales</h3>
          <p className={styles.statNumber}>{stats?.totalPosts || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Usuarios</h3>
          <p className={styles.statNumber}>{stats?.totalUsers || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Comentarios</h3>
          <p className={styles.statNumber}>{stats?.totalComments || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pendientes</h3>
          <p className={styles.statNumber}>{stats?.pendingComments || 0}</p>
        </div>
      </div>

      {/* Enlaces de navegación */}
      <div className={styles.navigationGrid}>
        <Link href="/admin/posts" className={styles.navCard}>
          <h3>📝 Gestionar Posts</h3>
          <p>Ver, editar y eliminar posts</p>
        </Link>
        <Link href="/admin/users" className={styles.navCard}>
          <h3>👥 Gestionar Usuarios</h3>
          <p>Ver, editar y roles de usuarios</p>
        </Link>
        <Link href="/admin/comments" className={styles.navCard}>
          <h3>💬 Moderar Comentarios</h3>
          <p>Aprobar, rechazar y gestionar comentarios</p>
        </Link>
        <Link href="/write" className={styles.navCard}>
          <h3>✍️ Escribir Post</h3>
          <p>Crear un nuevo post</p>
        </Link>
        <Link href="/setup-admin" className={styles.navCard}>
          <h3>⚙️ Configuración</h3>
          <p>Configurar permisos y roles</p>
        </Link>
        <Link href="/" className={styles.navCard}>
          <h3>🏠 Ir al Blog</h3>
          <p>Ver el sitio web público</p>
        </Link>
      </div>

      {/* Posts recientes */}
      {stats?.recentPosts && stats.recentPosts.length > 0 && (
        <div className={styles.recentSection}>
          <h2>Posts Recientes</h2>
          <div className={styles.postsList}>
            {stats.recentPosts.map((post) => (
              <div key={post.id} className={styles.postItem}>
                <div className={styles.postInfo}>
                  <h4>{post.title || 'Sin título'}</h4>
                  <p>Por {post.userEmail} en {post.catSlug || 'Sin categoría'}</p>
                  <span className={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.postStats}>
                  <span>{post.views || 0} views</span>
                  <span>{post.status || 'PUBLISHED'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDashboard;
