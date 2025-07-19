'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { formatDate } from '@/utils/dateFormatter';
import styles from '../admin.module.css';

const AdminComments = () => {
  const { isAdmin, isLoading } = useAdminStatus();
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchComments();
    }
  }, [isAdmin, isLoading, router]);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments');
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        
        // Calculate stats
        const newStats = {
          total: data.length,
          approved: data.filter(c => c.status === 'APPROVED').length,
          pending: data.filter(c => c.status === 'PENDING').length,
          rejected: data.filter(c => c.status === 'REJECTED').length
        };
        setStats(newStats);
      } else {
        console.error('Error fetching comments');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCommentStatus = async (commentId, newStatus) => {
    setUpdating(commentId);
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setComments(comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, status: newStatus }
            : comment
        ));
        
        // Update stats
        const updatedComments = comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, status: newStatus }
            : comment
        );
        const newStats = {
          total: updatedComments.length,
          approved: updatedComments.filter(c => c.status === 'APPROVED').length,
          pending: updatedComments.filter(c => c.status === 'PENDING').length,
          rejected: updatedComments.filter(c => c.status === 'REJECTED').length
        };
        setStats(newStats);
        
        alert('Estado del comentario actualizado exitosamente');
      } else {
        const error = await response.json();
        alert('Error actualizando comentario: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error actualizando comentario');
    } finally {
      setUpdating(null);
    }
  };

  const deleteComment = async (commentId, commentText) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar este comentario?\n\n"${commentText.substring(0, 100)}..."`)) {
      return;
    }

    setUpdating(commentId);
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId));
        alert('Comentario eliminado exitosamente');
      } else {
        const error = await response.json();
        alert('Error eliminando comentario: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error eliminando comentario');
    } finally {
      setUpdating(null);
    }
  };

  const filteredComments = comments.filter(comment => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      comment.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Filter by status
    if (filter === 'all') return true;
    return comment.status === filter;
  });

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
        <h1 className={styles.title}>Moderación de Comentarios</h1>
        <div className={styles.actions}>
          <Link href="/admin" className={styles.backBtn}>
            ← Volver al Dashboard
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Comentarios</h3>
          <p className={styles.statNumber}>{stats.total}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Aprobados</h3>
          <p className={styles.statNumber}>{stats.approved}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pendientes</h3>
          <p className={styles.statNumber}>{stats.pending}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Rechazados</h3>
          <p className={styles.statNumber}>{stats.rejected}</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por contenido, usuario o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px',
            border: '1px solid var(--softTextColor)',
            borderRadius: '6px',
            background: 'var(--softBg)',
            color: 'var(--textColor)',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({stats.total})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'APPROVED' ? styles.active : ''}`}
          onClick={() => setFilter('APPROVED')}
        >
          Aprobados ({stats.approved})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'PENDING' ? styles.active : ''}`}
          onClick={() => setFilter('PENDING')}
        >
          Pendientes ({stats.pending})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'REJECTED' ? styles.active : ''}`}
          onClick={() => setFilter('REJECTED')}
        >
          Rechazados ({stats.rejected})
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Comentario</th>
              <th>Post</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.map((comment) => (
              <tr key={comment.id}>
                <td>
                  <div className={styles.userInfo}>
                    {comment.user.image ? (
                      <Image
                        src={comment.user.image}
                        alt={comment.user.name || 'Usuario'}
                        width={32}
                        height={32}
                        style={{ borderRadius: '50%', marginRight: '10px' }}
                      />
                    ) : (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--softBg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '10px',
                        fontSize: '14px',
                        color: 'var(--softTextColor)'
                      }}>
                        👤
                      </div>
                    )}
                    <div>
                      <div className={styles.userName}>{comment.user.name || 'Sin nombre'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--softTextColor)' }}>
                        {comment.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ maxWidth: '300px' }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {comment.desc}
                    </p>
                    {comment.parentId && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: 'var(--softTextColor)',
                        fontStyle: 'italic'
                      }}>
                        (Respuesta)
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <Link 
                    href={`/posts/${comment.postSlug}`}
                    style={{ 
                      color: '#007acc', 
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    {comment.post?.title || comment.postSlug}
                  </Link>
                </td>
                <td>
                  <select 
                    value={comment.status}
                    onChange={(e) => updateCommentStatus(comment.id, e.target.value)}
                    disabled={updating === comment.id}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid var(--softTextColor)',
                      borderRadius: '4px',
                      background: 'var(--softBg)',
                      color: 'var(--textColor)',
                      fontSize: '12px'
                    }}
                  >
                    <option value="APPROVED">Aprobado</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="REJECTED">Rechazado</option>
                  </select>
                </td>
                <td style={{ fontSize: '12px' }}>
                  {formatDate(comment.createdAt)}
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <Link 
                      href={`/posts/${comment.postSlug}#comment-${comment.id}`} 
                      className={styles.viewBtn}
                      target="_blank"
                    >
                      👁️
                    </Link>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => deleteComment(comment.id, comment.desc)}
                      disabled={updating === comment.id}
                    >
                      {updating === comment.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredComments.length === 0 && (
          <div className={styles.emptyState}>
            <p>No hay comentarios que coincidan con el filtro seleccionado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComments;