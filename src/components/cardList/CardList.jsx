'use client';

import React, { useState, useEffect } from "react";
import styles from "./cardList.module.css";
import Pagination from "../pagination/Pagination";
import Card from "../card/Card";
import LoadingBoundary from "../ui/LoadingBoundary";
import Loading from "../loading/Loading";

const CardList = ({ page = 1, cat }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Direct API call for simplicity and reliability
        const res = await fetch(
          `/api/posts?page=${page}&cat=${cat || ""}`,
          { 
            cache: "no-store",
            headers: {
              'Cache-Control': 'max-age=60' // Cache for 1 minute
            }
          }
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Process posts on main thread for now (simpler and more reliable)
        const processedPosts = data.posts.map(post => {
          // Add reading time calculation
          const wordsPerMinute = 200;
          const textLength = post.desc?.replace(/<[^>]*>/g, '').length || 0;
          const readingTime = Math.ceil(textLength / wordsPerMinute) || 1;
          
          // Extract excerpt
          const excerpt = post.desc
            ?.replace(/<[^>]*>/g, '')
            ?.substring(0, 150) + '...' || '';
          
          return {
            ...post,
            readingTime,
            excerpt
          };
        });
        
        setPosts(processedPosts);
        setCount(data.count);
        setTotalPages(data.totalPages || Math.ceil(data.count / 6));
        setLoading(false);
        
      } catch (err) {
        console.error('Error loading posts:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadPosts();
  }, [page, cat]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error cargando posts: {error}</p>
          <button onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {cat ? `Posts en ${cat}` : 'Posts Recientes'}
      </h1>
      
      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay posts disponibles</p>
        </div>
      ) : (
        <>
          <div className={styles.posts}>
            {posts.map((item, index) => (
              <LoadingBoundary key={item.id}>
                <Card item={item} priority={index < 2} />
              </LoadingBoundary>
            ))}
          </div>
          
          <Pagination 
            page={page} 
            hasPrev={hasPrev} 
            hasNext={hasNext}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
};

export default CardList;
