/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 2, 2026
 * @file src/utils/indexed-db-storage.ts
 * @desc Provides persistent storage for uploaded audio and image files using IndexedDB.
 *       This allows users to upload local files and access them across browser sessions
 *       without requiring a server.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API}
 */

/**
 * Represents a stored file in IndexedDB
 */
export interface StoredFile {
  /**
   * Unique identifier for the file
   */
  id: string;
  
  /**
   * The original filename
   */
  filename: string;
  
  /**
   * MIME type of the file (e.g., "audio/mp3", "image/jpeg")
   */
  mimeType: string;
  
  /**
   * The file data as a Blob
   */
  data: Blob;
  
  /**
   * Timestamp when the file was stored
   */
  timestamp: number;
}

/**
 * Manages persistent file storage using IndexedDB.
 * Provides methods to store, retrieve, and delete audio/image files.
 */
export class IndexedDBStorage {
  private static readonly DB_NAME = 'MusicWebPlayerDB';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'files';
  private static dbInstance: IDBDatabase | null = null;

  /**
   * Initializes the IndexedDB database.
   * @returns Promise that resolves to the database instance
   */
  private static async initDB(): Promise<IDBDatabase> {
    if (this.dbInstance) {
      return this.dbInstance;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.dbInstance = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const objectStore = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('filename', 'filename', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Stores a file in IndexedDB.
   * @param file - The File object to store
   * @param customId - Optional custom ID (if not provided, one will be generated)
   * @returns Promise that resolves to the stored file's ID
   */
  public static async storeFile(file: File, customId?: string): Promise<string> {
    const db = await this.initDB();
    const id = customId || `file-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const storedFile: StoredFile = {
      id,
      filename: file.name,
      mimeType: file.type,
      data: file,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(storedFile);

      request.onsuccess = () => {
        resolve(id);
      };

      request.onerror = () => {
        reject(new Error('Failed to store file'));
      };
    });
  }

  /**
   * Retrieves a file from IndexedDB by ID.
   * @param id - The ID of the file to retrieve
   * @returns Promise that resolves to the StoredFile or null if not found
   */
  public static async getFile(id: string): Promise<StoredFile | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve file'));
      };
    });
  }

  /**
   * Creates a blob URL for a stored file.
   * @param id - The ID of the file
   * @returns Promise that resolves to a blob URL or null if file not found
   */
  public static async getFileBlobURL(id: string): Promise<string | null> {
    const file = await this.getFile(id);
    if (!file) return null;
    
    return URL.createObjectURL(file.data);
  }

  /**
   * Deletes a file from IndexedDB.
   * @param id - The ID of the file to delete
   * @returns Promise that resolves when the file is deleted
   */
  public static async deleteFile(id: string): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete file'));
      };
    });
  }

  /**
   * Gets all stored files.
   * @returns Promise that resolves to an array of StoredFile objects
   */
  public static async getAllFiles(): Promise<StoredFile[]> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve files'));
      };
    });
  }

  /**
   * Clears all stored files from IndexedDB.
   * @returns Promise that resolves when all files are deleted
   */
  public static async clearAllFiles(): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear files'));
      };
    });
  }

  /**
   * Checks if a file exists in storage.
   * @param id - The ID of the file to check
   * @returns Promise that resolves to true if file exists, false otherwise
   */
  public static async fileExists(id: string): Promise<boolean> {
    const file = await this.getFile(id);
    return file !== null;
  }

  /**
   * Gets the total size of all stored files.
   * @returns Promise that resolves to the total size in bytes
   */
  public static async getTotalSize(): Promise<number> {
    const files = await this.getAllFiles();
    return files.reduce((total, file) => total + file.data.size, 0);
  }
}
