// Web Worker for processing heavy data operations
self.onmessage = function(e) {
  const { type, data } = e.data;

  switch (type) {
    case 'PROCESS_POSTS':
      processPosts(data);
      break;
    
    case 'SEARCH_POSTS':
      searchPosts(data);
      break;
    
    case 'OPTIMIZE_IMAGES':
      optimizeImageData(data);
      break;
    
    default:
      self.postMessage({ error: 'Unknown operation type' });
  }
};

function processPosts(posts) {
  try {
    // Simulate heavy processing - sort, filter, enhance data
    const processedPosts = posts.map(post => {
      // Add reading time calculation
      const wordsPerMinute = 200;
      const textLength = post.desc.replace(/<[^>]*>/g, '').length;
      const readingTime = Math.ceil(textLength / wordsPerMinute);
      
      // Extract first paragraph for excerpt
      const excerpt = post.desc
        .replace(/<[^>]*>/g, '')
        .substring(0, 150) + '...';
      
      // Process date
      const createdAt = new Date(post.createdAt);
      const formattedDate = createdAt.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return {
        ...post,
        readingTime,
        excerpt,
        formattedDate,
        isRecent: Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days
      };
    });

    // Sort by creation date (most recent first)
    processedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    self.postMessage({
      type: 'POSTS_PROCESSED',
      data: processedPosts
    });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message
    });
  }
}

function searchPosts(searchData) {
  try {
    const { posts, query } = searchData;
    const lowercaseQuery = query.toLowerCase();
    
    // Multi-threaded search simulation
    const results = posts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(lowercaseQuery);
      const descMatch = post.desc.toLowerCase().includes(lowercaseQuery);
      const categoryMatch = post.catSlug.toLowerCase().includes(lowercaseQuery);
      
      return titleMatch || descMatch || categoryMatch;
    });

    // Score results by relevance
    const scoredResults = results.map(post => {
      let score = 0;
      const title = post.title.toLowerCase();
      const desc = post.desc.toLowerCase();
      
      // Title matches get higher score
      if (title.includes(lowercaseQuery)) score += 10;
      if (title.startsWith(lowercaseQuery)) score += 5;
      
      // Description matches
      if (desc.includes(lowercaseQuery)) score += 3;
      
      // Category match
      if (post.catSlug.toLowerCase().includes(lowercaseQuery)) score += 5;
      
      return { ...post, relevanceScore: score };
    });

    // Sort by relevance score
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    self.postMessage({
      type: 'SEARCH_COMPLETED',
      data: scoredResults
    });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message
    });
  }
}

function optimizeImageData(imageData) {
  try {
    // Process image metadata for optimization
    const optimizedData = imageData.map(img => {
      const aspectRatio = img.width / img.height;
      const isLandscape = aspectRatio > 1;
      const isPortrait = aspectRatio < 1;
      const isSquare = Math.abs(aspectRatio - 1) < 0.1;
      
      // Suggest optimal sizes based on aspect ratio
      let suggestedSizes = '(max-width: 768px) 100vw, 50vw';
      
      if (isLandscape) {
        suggestedSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw';
      } else if (isPortrait) {
        suggestedSizes = '(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 25vw';
      }
      
      return {
        ...img,
        aspectRatio,
        isLandscape,
        isPortrait,
        isSquare,
        suggestedSizes,
        priority: img.index < 3 // First 3 images get priority
      };
    });

    self.postMessage({
      type: 'IMAGES_OPTIMIZED',
      data: optimizedData
    });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message
    });
  }
}
