"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDataProcessor } from "@/hooks/useWorker";
import styles from "./SearchComponent.module.css";
import Card from "../card/Card";
import LoadingBoundary from "../ui/LoadingBoundary";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { searchPosts } = useDataProcessor();

  // Load all posts on component mount
  useEffect(() => {
    const loadAllPosts = async () => {
      try {
        setLoading(true);
        // Fetch all posts without pagination for search
        const res = await fetch('/api/posts?all=true', {
          cache: "no-store",
          headers: {
            'Cache-Control': 'max-age=300' // Cache for 5 minutes
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setAllPosts(data.posts || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading posts:', error);
        setLoading(false);
      }
    };

    loadAllPosts();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      searchPosts(allPosts, searchQuery, (results, error) => {
        if (error) {
          console.error('Search error:', error);
          // Fallback to main thread search
          const fallbackResults = allPosts.filter(post => 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.catSlug.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(fallbackResults);
        } else {
          setSearchResults(results || []);
        }
        setSearching(false);
      });
    }, 300),
    [allPosts, searchPosts]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setSearching(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando posts...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Buscar posts..."
          value={query}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        {query && (
          <button 
            onClick={clearSearch}
            className={styles.clearButton}
            aria-label="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </div>

      {searching && (
        <div className={styles.searchingIndicator}>
          Buscando...
        </div>
      )}

      {query && !searching && (
        <div className={styles.resultsHeader}>
          {searchResults.length > 0 
            ? `${searchResults.length} resultado${searchResults.length !== 1 ? 's' : ''} encontrado${searchResults.length !== 1 ? 's' : ''}`
            : "No se encontraron resultados"
          }
        </div>
      )}

      {searchResults.length > 0 && (
        <div className={styles.results}>
          {searchResults.map((post, index) => (
            <LoadingBoundary key={post.id}>
              <Card 
                item={post} 
                priority={index < 3}
                showRelevanceScore={true}
              />
            </LoadingBoundary>
          ))}
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchComponent;
