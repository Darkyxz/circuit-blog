'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/utils/dateFormatter';
import styles from './profile.module.css';

const UserProfile = () => {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const [userResponse, postsResponse] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          fetch(`/api/users/${params.id}/posts`)
        ]);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        } else {
          setError('Usuario no encontrado');
        }

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error cargando el perfil');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUserProfile();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando perfil...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>😔 {error || 'Usuario no encontrado'}</h2>
          <Link href="/" className={styles.backBtn}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const badges = {
      'ADMIN': { text: 'Admin', color: '#ef4444', emoji: '👑' },
      'EDITOR': { text: 'Editor', color: '#3b82f6', emoji: '✏️' },
      'AUTHOR': { text: 'Autor', color: '#10b981', emoji: '📝' },
      'USER': { text: 'Usuario', color: '#6b7280', emoji: '👤' }
    };
    return badges[role] || badges['USER'];
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className={styles.container}>
      {/* Header del perfil */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'Usuario'}
              width={120}
              height={120}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <span>👤</span>
            </div>
          )}
        </div>

        <div className={styles.userInfo}>
          <div className={styles.nameSection}>
            <h1 className={styles.userName}>{user.name || 'Usuario sin nombre'}</h1>
            <span 
              className={styles.roleBadge}
              style={{ backgroundColor: roleBadge.color }}
            >
              {roleBadge.emoji} {roleBadge.text}
            </span>
          </div>

          <p className={styles.userEmail}>{user.email}</p>

          {user.bio && (
            <p className={styles.userBio}>{user.bio}</p>
          )}

          <div className={styles.userMeta}>
            <span className={styles.joinDate}>
              📅 Miembro desde {formatDate(user.createdAt)}
            </span>
          </div>

          {/* Enlaces sociales */}
          {(user.website || user.twitter || user.github) && (
            <div className={styles.socialLinks}>
              {user.website && (
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  🌐 Website
                </a>
              )}
              {user.twitter && (
                <a 
                  href={`https://twitter.com/${user.twitter}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  🐦 Twitter
                </a>
              )}
              {user.github && (
                <a 
                  href={`https://github.com/${user.github}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  🐙 GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className={styles.statsSection}>
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

      {/* Posts del usuario */}
      <div className={styles.postsSection}>
        <h2 className={styles.sectionTitle}>
          📝 Posts de {user.name} ({posts.length})
        </h2>

        {posts.length > 0 ? (
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <div key={post.id} className={styles.postCard}>
                {post.img && (
                  <div className={styles.postImage}>
                    <Image
                      src={post.img}
                      alt={post.title}
                      width={300}
                      height={200}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className={styles.postContent}>
                  <h3 className={styles.postTitle}>
                    <Link href={`/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className={styles.postDesc}>
                    {post.desc.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                  <div className={styles.postMeta}>
                    <span className={styles.postDate}>
                      {formatDate(post.createdAt)}
                    </span>
                    <span className={styles.postCategory}>
                      {post.cat?.title || post.catSlug}
                    </span>
                    <span className={styles.postViews}>
                      👁️ {post.views} vistas
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noPosts}>
            <p>🤷‍♂️ {user.name} aún no ha publicado ningún post</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;