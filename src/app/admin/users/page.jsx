'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { formatDate } from '@/utils/dateFormatter';
import styles from '../admin.module.css';

const AdminUsers = () => {
  const { isAdmin, isLoading } = useAdminStatus();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    editors: 0,
    authors: 0,
    users: 0
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, isLoading, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        
        // Calculate stats
        const newStats = {
          total: data.length,
          active: data.filter(u => u.isActive).length,
          inactive: data.filter(u => !u.isActive).length,
          admins: data.filter(u => u.role === 'ADMIN').length,
          editors: data.filter(u => u.role === 'EDITOR').length,
          authors: data.filter(u => u.role === 'AUTHOR').length,
          users: data.filter(u => u.role === 'USER').length
        };
        setStats(newStats);
      } else {
        console.error('Error fetching users');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        ));
        alert('Role actualizado exitosamente');
      } else {
        const error = await response.json();
        alert('Error actualizando role: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error actualizando role');
    } finally {
      setUpdating(null);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    setUpdating(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, isActive: !currentStatus }
            : user
        ));
        alert(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      } else {
        const error = await response.json();
        alert('Error actualizando estado: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error actualizando estado');
    } finally {
      setUpdating(null);
    }
  };

  const deactivateUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de que quieres desactivar a "${userName}"?`)) {
      return;
    }

    setUpdating(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, isActive: false }
            : user
        ));
        alert('Usuario desactivado exitosamente');
      } else {
        const error = await response.json();
        alert('Error desactivando usuario: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error desactivando usuario');
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Filter by status/role
    if (filter === 'all') return true;
    if (filter === 'active') return user.isActive;
    if (filter === 'inactive') return !user.isActive;
    return user.role === filter;
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
        <h1 className={styles.title}>Gestión de Usuarios</h1>
        <div className={styles.actions}>
          <Link href="/admin" className={styles.backBtn}>
            ← Volver al Dashboard
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Usuarios</h3>
          <p className={styles.statNumber}>{stats.total}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Usuarios Activos</h3>
          <p className={styles.statNumber}>{stats.active}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Administradores</h3>
          <p className={styles.statNumber}>{stats.admins}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Editores</h3>
          <p className={styles.statNumber}>{stats.editors}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Autores</h3>
          <p className={styles.statNumber}>{stats.authors}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Usuarios Básicos</h3>
          <p className={styles.statNumber}>{stats.users}</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
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
          Todos ({users.length})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'active' ? styles.active : ''}`}
          onClick={() => setFilter('active')}
        >
          Activos ({users.filter(u => u.isActive).length})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'inactive' ? styles.active : ''}`}
          onClick={() => setFilter('inactive')}
        >
          Inactivos ({users.filter(u => !u.isActive).length})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'ADMIN' ? styles.active : ''}`}
          onClick={() => setFilter('ADMIN')}
        >
          Admins ({users.filter(u => u.role === 'ADMIN').length})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'EDITOR' ? styles.active : ''}`}
          onClick={() => setFilter('EDITOR')}
        >
          Editores ({users.filter(u => u.role === 'EDITOR').length})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'AUTHOR' ? styles.active : ''}`}
          onClick={() => setFilter('AUTHOR')}
        >
          Autores ({users.filter(u => u.role === 'AUTHOR').length})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'USER' ? styles.active : ''}`}
          onClick={() => setFilter('USER')}
        >
          Usuarios ({users.filter(u => u.role === 'USER').length})
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userInfo}>
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || 'Usuario'}
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
                    <span className={styles.userName}>{user.name || 'Sin nombre'}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select 
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className={`${styles.roleSelect} ${styles[user.role.toLowerCase()]}`}
                  >
                    <option value="USER">Usuario</option>
                    <option value="AUTHOR">Autor</option>
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td>
                  <button 
                    className={`${styles.statusBtn} ${user.isActive ? styles.active : styles.inactive}`}
                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                    disabled={updating === user.id}
                  >
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className={styles.actionBtns}>
                    <Link href={`/admin/users/${user.id}`} className={styles.viewBtn}>
                      👁️ Ver
                    </Link>
                    {user.role !== 'ADMIN' && (
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => deactivateUser(user.id, user.name)}
                        disabled={updating === user.id}
                      >
                        {updating === user.id ? '⏳' : '🚫'} Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className={styles.emptyState}>
            <p>No hay usuarios que coincidan con el filtro seleccionado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
