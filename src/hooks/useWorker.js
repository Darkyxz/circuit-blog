'use client';

import { useRef, useEffect, useCallback } from 'react';

export const useWorker = (workerPath) => {
  const workerRef = useRef(null);
  const callbacksRef = useRef(new Map());

  useEffect(() => {
    // Create worker instance
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker(workerPath);
      
      // Handle messages from worker
      workerRef.current.onmessage = (e) => {
        const { type, data, error } = e.data;
        
        // Handle different response types for different operations
        let callbackKey = null;
        if (type === 'POSTS_PROCESSED') {
          callbackKey = 'PROCESS_POSTS';
        } else if (type === 'SEARCH_COMPLETED') {
          callbackKey = 'SEARCH_POSTS';
        } else if (type === 'IMAGES_OPTIMIZED') {
          callbackKey = 'OPTIMIZE_IMAGES';
        } else if (type === 'ERROR') {
          // For errors, try to find any pending callback
          const callbacks = Array.from(callbacksRef.current.values());
          if (callbacks.length > 0) {
            callbacks[0](null, error);
            callbacksRef.current.clear();
          }
          return;
        }
        
        const callback = callbacksRef.current.get(callbackKey);
        if (callback) {
          if (error) {
            callback(null, error);
          } else {
            callback(data, null);
          }
          // Clean up callback after use
          callbacksRef.current.delete(callbackKey);
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [workerPath]);

  const postMessage = useCallback((type, data, callback) => {
    if (workerRef.current) {
      // Store callback for this operation type
      if (callback) {
callbacksRef.current.set(type, callback);
      }
      
      workerRef.current.postMessage({ type, data });
    } else {
      // Fallback for environments without Web Worker support
      if (callback) {
        callback(null, 'Web Workers not supported');
      }
    }
  }, []);

  return { postMessage };
};

// Specialized hooks for common operations
export const useDataProcessor = () => {
  const { postMessage } = useWorker('/workers/dataProcessor.js');

  const processPosts = useCallback((posts, callback) => {
    postMessage('PROCESS_POSTS', posts, callback);
  }, [postMessage]);

  const searchPosts = useCallback((posts, query, callback) => {
    postMessage('SEARCH_POSTS', { posts, query }, callback);
  }, [postMessage]);

  const optimizeImages = useCallback((imageData, callback) => {
    postMessage('OPTIMIZE_IMAGES', imageData, callback);
  }, [postMessage]);

  return {
    processPosts,
    searchPosts,
    optimizeImages
  };
};
