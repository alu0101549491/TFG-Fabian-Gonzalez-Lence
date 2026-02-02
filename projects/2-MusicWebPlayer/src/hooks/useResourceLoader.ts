/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 2, 2026
 * @file src/hooks/useResourceLoader.ts
 * @desc Custom hook for loading resources from various sources including IndexedDB.
 *       Converts indexed-db:// URLs to blob URLs that can be used by HTML elements.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://react.dev/reference/react}
 */

import { useState, useEffect } from 'react';
import { IndexedDBStorage } from '@utils/indexed-db-storage';

/**
 * Converts a resource URL to a usable URL for HTML elements.
 * If the URL uses the indexed-db:// protocol, retrieves the file from IndexedDB
 * and creates a blob URL. Otherwise, returns the URL as-is.
 * 
 * @param url - The resource URL (can be HTTP, relative path, or indexed-db://)
 * @returns Object with the resolved URL and loading state
 * 
 * @example
 * const { url: audioUrl, isLoading } = useResourceLoader('indexed-db://audio-123');
 * const { url: imageUrl } = useResourceLoader('https://example.com/image.jpg');
 */
export function useResourceLoader(url: string | undefined) {
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>(url);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Clean up previous blob URL
    if (resolvedUrl && resolvedUrl.startsWith('blob:')) {
      return () => URL.revokeObjectURL(resolvedUrl);
    }
  }, [resolvedUrl]);

  useEffect(() => {
    if (!url) {
      setResolvedUrl(undefined);
      return;
    }

    // If not an IndexedDB URL, use it directly
    if (!url.startsWith('indexed-db://')) {
      setResolvedUrl(url);
      return;
    }

    // Extract the file ID from the URL
    const fileId = url.replace('indexed-db://', '');
    
    setIsLoading(true);
    setError(null);

    // Load the file from IndexedDB
    IndexedDBStorage.getFile(fileId)
      .then(file => {
        if (file) {
          const blobUrl = URL.createObjectURL(file.data);
          setResolvedUrl(blobUrl);
        } else {
          setError(new Error(`File not found: ${fileId}`));
          setResolvedUrl(undefined);
        }
      })
      .catch(err => {
        console.error('Failed to load resource from IndexedDB:', err);
        setError(err);
        setResolvedUrl(undefined);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Cleanup function
    return () => {
      if (resolvedUrl && resolvedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resolvedUrl);
      }
    };
  }, [url]);

  return { url: resolvedUrl, isLoading, error };
}
