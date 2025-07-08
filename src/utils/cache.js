// Simple in-memory cache for static data
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
  }

  set(key, value, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    // Clear existing timeout
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Set value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Set expiration timeout
    const timeout = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timeouts.set(key, timeout);
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
    this.cache.delete(key);
  }

  clear() {
    // Clear all timeouts
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout);
    }
    this.timeouts.clear();
    this.cache.clear();
  }

  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }

  size() {
    return this.cache.size;
  }
}

// Global cache instance
const cache = new MemoryCache();

// Cache helpers for common operations
export const cacheHelpers = {
  // Categories cache
  async getCategories() {
    const key = 'categories';
    let categories = cache.get(key);
    
    if (!categories) {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories`);
      if (response.ok) {
        categories = await response.json();
        cache.set(key, categories, 10 * 60 * 1000); // 10 minutes
      }
    }
    
    return categories || [];
  },

  // Posts cache with parameters
  async getPosts(page = 1, cat = null) {
    const key = `posts_${page}_${cat || 'all'}`;
    let posts = cache.get(key);
    
    if (!posts) {
      const url = new URL(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/posts`);
      url.searchParams.set('page', page.toString());
      if (cat) url.searchParams.set('cat', cat);
      
      const response = await fetch(url.toString());
      if (response.ok) {
        posts = await response.json();
        cache.set(key, posts, 2 * 60 * 1000); // 2 minutes for posts
      }
    }
    
    return posts || { posts: [], count: 0 };
  },

  // Clear specific cache keys
  clearPostsCache() {
    // Clear all posts-related cache entries
    for (const [key] of cache.cache) {
      if (key.startsWith('posts_')) {
        cache.delete(key);
      }
    }
  },

  clearCategoriesCache() {
    cache.delete('categories');
  }
};

export default cache;
