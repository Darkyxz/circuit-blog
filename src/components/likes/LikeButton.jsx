'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLikes } from '@/hooks/useLikes'
import styles from './LikeButton.module.css'

const LikeButton = ({ postSlug, size = 'medium', showCount = true, className = '' }) => {
  const { data: session } = useSession()
  const { liked, totalLikes, canLike, isLiking, handleLike } = useLikes(postSlug)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = async () => {
    if (!canLike || isLiking) return

    setIsAnimating(true)
    await handleLike()
    
    // Reset animation after a short delay
    setTimeout(() => {
      setIsAnimating(false)
    }, 600)
  }

  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }[size]

  return (
    <div className={`${styles.likeButton} ${sizeClass} ${className}`}>
      <button
        onClick={handleClick}
        disabled={!canLike || isLiking}
        className={`${styles.button} ${liked ? styles.liked : ''} ${isAnimating ? styles.animating : ''}`}
        title={session ? (liked ? 'Quitar like' : 'Dar like') : 'Inicia sesión para dar like'}
      >
        {/* Heart icon */}
        <svg
          viewBox="0 0 24 24"
          className={`${styles.icon} ${liked ? styles.iconLiked : ''}`}
          fill={liked ? '#ff6b6b' : 'none'}
          stroke={liked ? '#ff6b6b' : 'currentColor'}
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        
        {/* Loading spinner */}
        {isLiking && (
          <div className={styles.spinner}>
            <div className={styles.spinnerInner}></div>
          </div>
        )}
      </button>
      
      {showCount && (
        <span className={`${styles.count} ${totalLikes > 0 ? styles.countVisible : ''}`}>
          {totalLikes > 0 ? totalLikes : ''}
        </span>
      )}
    </div>
  )
}

export default LikeButton
