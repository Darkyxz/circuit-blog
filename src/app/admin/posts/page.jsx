'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import styles from '../admin.module.css';

const AdminPosts = () => {
  const { isAdmin, isLoading } = useAdminStatus();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin, isLoading, router]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        console.error('Error fetching posts');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId, postTitle) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${postTitle}"?`)) {
      return;
    }

    setDeleting(postId);
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
        alert('Post eliminado exitosamente');
      } else {
        const error = await response.json();
        alert('Error eliminando post: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error eliminando post');
    } finally {
      setDeleting(null);
    }
  };

  const toggleStatus = async (postId, currentStatus) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, status: newStatus }
            : post
        ));
      } else {
        alert('Error actualizando estado del post');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error actualizando post');
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Posts</h1>
        <div className={styles.actions}>
          <Link href="/admin" className={styles.backBtn}>
            ← Volver al Dashboard
          </Link>
          <Link href="/write" className={styles.createBtn}>
            + Crear Post
          </Link>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Vistas</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  {post.img ? (
                    <Image 
                      src={post.img} 
                      alt={post.title}
                      width={50}
                      height={50}
                      className={styles.postImage}
                    />
                  ) : (
                    <div className={styles.noImage}>Sin imagen</div>
                  )}
                </td>
                <td>
                  <Link href={`/posts/${post.slug}`} className={styles.postTitle}>
                    {post.title || 'Sin título'}
                  </Link>
                </td>
                <td>{post.user?.name || post.userEmail}</td>
                <td>{post.cat?.title || post.catSlug}</td>
                <td>
                  <button 
                    className={`${styles.statusBtn} ${styles[post.status.toLowerCase()]}`}
                    onClick={() => toggleStatus(post.id, post.status)}
                  >
                    {post.status}
                  </button>
                </td>
                <td>{post.views}</td>
                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actionBtns}>
                    <Link href={`/posts/${post.slug}`} className={styles.viewBtn}>
                      👁️
                    </Link>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deleting === post.id}
                    >
                      {deleting === post.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {posts.length === 0 && (
          <div className={styles.emptyState}>
            <p>No hay posts disponibles</p>
            <Link href="/write" className={styles.createBtn}>
              Crear el primer post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPosts;
