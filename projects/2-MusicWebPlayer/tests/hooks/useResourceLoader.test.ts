/**
 * Tests for useResourceLoader hook
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { useResourceLoader } from '@/hooks/useResourceLoader';
import { IndexedDBStorage } from '@/utils/indexed-db-storage';

// Mock IndexedDBStorage
jest.mock('@/utils/indexed-db-storage');

// Mock URL.createObjectURL and revokeObjectURL
const mockBlobUrls: Set<string> = new Set();
let blobUrlCounter = 0;

global.URL.createObjectURL = jest.fn(() => {
  const url = `blob:mock-url-${++blobUrlCounter}`;
  mockBlobUrls.add(url);
  return url;
});

global.URL.revokeObjectURL = jest.fn((url: string) => {
  mockBlobUrls.delete(url);
});

describe('useResourceLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBlobUrls.clear();
    blobUrlCounter = 0;
  });

  describe('Regular URLs', () => {
    it('should return regular HTTP URL unchanged', () => {
      const httpUrl = 'https://example.com/image.jpg';
      const { result } = renderHook(() => useResourceLoader(httpUrl));

      expect(result.current.url).toBe(httpUrl);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return relative path unchanged', () => {
      const relativePath = '/covers/image.jpg';
      const { result } = renderHook(() => useResourceLoader(relativePath));

      expect(result.current.url).toBe(relativePath);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle undefined URL', () => {
      const { result } = renderHook(() => useResourceLoader(undefined));

      expect(result.current.url).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('IndexedDB URLs', () => {
    it('should load file from IndexedDB and create blob URL', async () => {
      const fileId = 'audio-123';
      const indexedDbUrl = `indexed-db://${fileId}`;
      const mockFile = new File(['test'], 'test.mp3', { type: 'audio/mp3' });
      const mockStoredFile = {
        id: fileId,
        filename: 'test.mp3',
        mimeType: 'audio/mp3',
        data: mockFile,
        timestamp: Date.now()
      };

      (IndexedDBStorage.getFile as jest.Mock).mockResolvedValue(mockStoredFile);

      const { result } = renderHook(() => useResourceLoader(indexedDbUrl));

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 1000 });

      expect(result.current.url).toBe('blob:mock-url-1');
      expect(result.current.error).toBeNull();
      expect(IndexedDBStorage.getFile).toHaveBeenCalledWith(fileId);
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it('should handle file not found in IndexedDB', async () => {
      const fileId = 'non-existent';
      const indexedDbUrl = `indexed-db://${fileId}`;

      (IndexedDBStorage.getFile as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useResourceLoader(indexedDbUrl));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.url).toBeUndefined();
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain('File not found');
    });

    it('should handle IndexedDB error', async () => {
      const fileId = 'error-file';
      const indexedDbUrl = `indexed-db://${fileId}`;
      const mockError = new Error('IndexedDB error');

      (IndexedDBStorage.getFile as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useResourceLoader(indexedDbUrl));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.url).toBeUndefined();
      expect(result.current.error).toBe(mockError);
    });

    it('should extract file ID correctly from indexed-db URL', async () => {
      const fileId = 'cover-456-xyz';
      const indexedDbUrl = `indexed-db://${fileId}`;
      const mockFile = new File(['test'], 'cover.jpg', { type: 'image/jpeg' });

      (IndexedDBStorage.getFile as jest.Mock).mockResolvedValue({
        id: fileId,
        filename: 'cover.jpg',
        mimeType: 'image/jpeg',
        data: mockFile,
        timestamp: Date.now()
      });

      const { result } = renderHook(() => useResourceLoader(indexedDbUrl));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(IndexedDBStorage.getFile).toHaveBeenCalledWith(fileId);
    });
  });

  describe('URL Changes', () => {
    it('should update when URL changes', async () => {
      const initialUrl = 'https://example.com/image1.jpg';
      const { result, rerender } = renderHook(
        ({ url }) => useResourceLoader(url),
        { initialProps: { url: initialUrl } }
      );

      expect(result.current.url).toBe(initialUrl);

      // Change to new URL
      const newUrl = 'https://example.com/image2.jpg';
      rerender({ url: newUrl });

      expect(result.current.url).toBe(newUrl);
    });

    it('should handle change from regular URL to IndexedDB URL', async () => {
      const regularUrl = '/covers/image.jpg';
      const { result, rerender } = renderHook(
        ({ url }) => useResourceLoader(url),
        { initialProps: { url: regularUrl } }
      );

      expect(result.current.url).toBe(regularUrl);

      // Change to IndexedDB URL
      const fileId = 'new-file';
      const indexedDbUrl = `indexed-db://${fileId}`;
      const mockFile = new File(['test'], 'test.mp3', { type: 'audio/mp3' });

      (IndexedDBStorage.getFile as jest.Mock).mockResolvedValue({
        id: fileId,
        filename: 'test.mp3',
        mimeType: 'audio/mp3',
        data: mockFile,
        timestamp: Date.now()
      });

      rerender({ url: indexedDbUrl });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.url).toBe('blob:mock-url-1');
    });

    it('should handle change from undefined to URL', () => {
      const { result, rerender } = renderHook(
        ({ url }) => useResourceLoader(url),
        { initialProps: { url: undefined } }
      );

      expect(result.current.url).toBeUndefined();

      // Change to URL
      const newUrl = 'https://example.com/image.jpg';
      rerender({ url: newUrl });

      expect(result.current.url).toBe(newUrl);
    });

    it('should handle change to undefined', () => {
      const initialUrl = 'https://example.com/image.jpg';
      const { result, rerender } = renderHook(
        ({ url }) => useResourceLoader(url),
        { initialProps: { url: initialUrl } }
      );

      expect(result.current.url).toBe(initialUrl);

      // Change to undefined
      rerender({ url: undefined });

      expect(result.current.url).toBeUndefined();
    });
  });

  describe('Cleanup', () => {
    it('should revoke blob URL on unmount', async () => {
      const fileId = 'cleanup-test';
      const indexedDbUrl = `indexed-db://${fileId}`;
      const mockFile = new File(['test'], 'test.mp3', { type: 'audio/mp3' });

      (IndexedDBStorage.getFile as jest.Mock).mockResolvedValue({
        id: fileId,
        filename: 'test.mp3',
        mimeType: 'audio/mp3',
        data: mockFile,
        timestamp: Date.now()
      });

      const { result, unmount } = renderHook(() => useResourceLoader(indexedDbUrl));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const blobUrl = result.current.url!;
      expect(blobUrl).toBe('blob:mock-url-1');
      expect(mockBlobUrls.has(blobUrl)).toBe(true);

      // Unmount should trigger cleanup
      unmount();

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(blobUrl);
    });

    it('should revoke old blob URL when URL changes', async () => {
      const fileId1 = 'file-1';
      const indexedDbUrl1 = `indexed-db://${fileId1}`;
      const mockFile1 = new File(['test1'], 'test1.mp3', { type: 'audio/mp3' });

      (IndexedDBStorage.getFile as jest.Mock).mockResolvedValue({
        id: fileId1,
        filename: 'test1.mp3',
        mimeType: 'audio/mp3',
        data: mockFile1,
        timestamp: Date.now()
      });

      const { result, rerender } = renderHook(
        ({ url }) => useResourceLoader(url),
        { initialProps: { url: indexedDbUrl1 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstBlobUrl = result.current.url!;
      expect(firstBlobUrl).toBe('blob:mock-url-1');

      // Change to new IndexedDB URL
      const fileId2 = 'file-2';
      const indexedDbUrl2 = `indexed-db://${fileId2}`;
      const mockFile2 = new File(['test2'], 'test2.mp3', { type: 'audio/mp3' });

      (IndexedDBStorage.getFile as jest.Mock).mockResolvedValue({
        id: fileId2,
        filename: 'test2.mp3',
        mimeType: 'audio/mp3',
        data: mockFile2,
        timestamp: Date.now()
      });

      rerender({ url: indexedDbUrl2 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Old blob URL should be revoked
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(firstBlobUrl);
    });

    it('should not revoke non-blob URLs', () => {
      const regularUrl = '/covers/image.jpg';
      const { unmount } = renderHook(() => useResourceLoader(regularUrl));

      unmount();

      // Should not attempt to revoke regular URL
      expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('Error States', () => {
    it('should reset error when URL changes', async () => {
      const fileId = 'error-file';
      const indexedDbUrl = `indexed-db://${fileId}`;

      (IndexedDBStorage.getFile as jest.Mock).mockRejectedValue(new Error('Error'));

      const { result, rerender } = renderHook(
        ({ url }) => useResourceLoader(url),
        { initialProps: { url: indexedDbUrl } }
      );

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      }, { timeout: 1000 });

      // Clear mock and change to valid URL
      jest.clearAllMocks();
      const validUrl = 'https://example.com/image.jpg';
      rerender({ url: validUrl });

      // Error should be cleared for non-IndexedDB URL
      await waitFor(() => {
        expect(result.current.url).toBe(validUrl);
      });
    });

    it('should handle multiple rapid URL changes', async () => {
      const { result, rerender } = renderHook(
        ({ url }) => useResourceLoader(url),
        { initialProps: { url: 'url1' } }
      );

      rerender({ url: 'url2' });
      rerender({ url: 'url3' });
      rerender({ url: 'url4' });

      expect(result.current.url).toBe('url4');
    });
  });
});
