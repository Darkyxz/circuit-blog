'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

const fetcher = async (url) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch')
  }
  return res.json()
}

export const useLikes = (postSlug) => {
  const { data: session } = useSession()
  const [isLiking, setIsLiking] = useState(false)
  const [optimisticLikes, setOptimisticLikes] = useState(null)
  const [optimisticLiked, setOptimisticLiked] = useState(null)

  // Fetch like status if user is authenticated
  const { data: likeStatus, error: likeError, mutate: mutateLikeStatus } = useSWR(
    session && postSlug ? `/api/likes/check/simple?postSlug=${postSlug}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  // Fetch likes list (optional - can be used for displaying who liked)
  const { data: likesData, error: likesError, mutate: mutateLikes } = useSWR(
    postSlug ? `/api/likes/simple?postSlug=${postSlug}&limit=10` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  // Reset optimistic updates when data changes
  useEffect(() => {
    if (likeStatus && optimisticLikes === null) {
      setOptimisticLikes(likeStatus.totalLikes)
      setOptimisticLiked(likeStatus.liked)
    }
  }, [likeStatus, optimisticLikes])

  const handleLike = useCallback(async () => {
    if (!session || isLiking) return

    const currentLiked = optimisticLiked ?? likeStatus?.liked ?? false
    const currentLikes = optimisticLikes ?? likeStatus?.totalLikes ?? 0
    const action = currentLiked ? 'unlike' : 'like'

    setIsLiking(true)

    // Optimistic update
    setOptimisticLiked(!currentLiked)
    setOptimisticLikes(currentLiked ? currentLikes - 1 : currentLikes + 1)

    try {
      const response = await fetch('/api/likes/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postSlug,
          action
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update like')
      }

      const result = await response.json()
      
      // Update with real data
      setOptimisticLiked(result.liked)
      setOptimisticLikes(result.totalLikes)

      // Revalidate cache
      mutateLikeStatus()
      mutateLikes()
      
    } catch (error) {
      console.error('Error updating like:', error)
      
      // Revert optimistic update on error
      setOptimisticLiked(currentLiked)
      setOptimisticLikes(currentLikes)
      
      // You might want to show an error toast here
    } finally {
      setIsLiking(false)
    }
  }, [session, isLiking, optimisticLiked, optimisticLikes, likeStatus, postSlug, mutateLikeStatus, mutateLikes])

  return {
    // State
    liked: optimisticLiked ?? likeStatus?.liked ?? false,
    totalLikes: optimisticLikes ?? likeStatus?.totalLikes ?? 0,
    canLike: session && (likeStatus?.canLike ?? true),
    isLiking,
    
    // Data
    likesData: likesData?.likes || [],
    likesCount: likesData?.count || 0,
    
    // Loading states
    isLoadingLikeStatus: !likeStatus && !likeError && !!session,
    isLoadingLikes: !likesData && !likesError,
    
    // Error states
    likeError,
    likesError,
    
    // Actions
    handleLike,
    
    // Utilities
    refreshLikeStatus: mutateLikeStatus,
    refreshLikes: mutateLikes
  }
}

// Hook para obtener posts más gustados
export const useTrendingPosts = (limit = 10) => {
  const { data, error, mutate } = useSWR(
    `/api/posts?limit=${limit}&sort=likes`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000 // 5 minutes
    }
  )

  return {
    posts: data?.posts || [],
    isLoading: !data && !error,
    error,
    refresh: mutate
  }
}

// Hook para obtener posts que le gustaron a un usuario
export const useUserLikedPosts = (userEmail, limit = 20) => {
  const { data, error, mutate } = useSWR(
    userEmail ? `/api/likes/user?userEmail=${userEmail}&limit=${limit}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  return {
    posts: data?.posts || [],
    count: data?.count || 0,
    isLoading: !data && !error,
    error,
    refresh: mutate
  }
}
