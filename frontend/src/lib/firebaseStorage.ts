import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata,
  updateMetadata,
  listAll,
  UploadResult,
} from 'firebase/storage';
import { storage } from './firebase';

// Storage paths
export const STORAGE_PATHS = {
  PRODUCTS: 'products',
  USERS: 'users',
  CATEGORIES: 'categories',
  BANNERS: 'banners',
} as const;

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  metadata?: {
    contentType?: string;
    customMetadata?: Record<string, string>;
  };
}

export class FirebaseStorageService {
  // Upload a file
  static async uploadFile(
    path: string,
    file: File,
    options?: UploadOptions
  ): Promise<{ url: string; path: string }> {
    try {
      const storageRef = ref(storage, path);
      
      // Upload file
      const uploadResult: UploadResult = await uploadBytes(storageRef, file, {
        customMetadata: options?.metadata?.customMetadata,
      });

      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);

      return {
        url: downloadURL,
        path: uploadResult.ref.fullPath,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(
    basePath: string,
    files: File[],
    options?: UploadOptions
  ): Promise<{ url: string; path: string }[]> {
    try {
      const uploadPromises = files.map((file, index) => {
        const fileName = `${Date.now()}_${index}_${file.name}`;
        const filePath = `${basePath}/${fileName}`;
        return this.uploadFile(filePath, file, options);
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  }

  // Get file download URL
  static async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }

  // Delete a file
  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Get file metadata
  static async getFileMetadata(path: string) {
    try {
      const storageRef = ref(storage, path);
      return await getMetadata(storageRef);
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  // Update file metadata
  static async updateFileMetadata(
    path: string,
    metadata: {
      contentType?: string;
      customMetadata?: Record<string, string>;
    }
  ): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await updateMetadata(storageRef, metadata);
    } catch (error) {
      console.error('Error updating file metadata:', error);
      throw error;
    }
  }

  // List files in a directory
  static async listFiles(path: string) {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      return {
        items: result.items.map(item => ({
          name: item.name,
          fullPath: item.fullPath,
        })),
        prefixes: result.prefixes.map(prefix => ({
          name: prefix.name,
          fullPath: prefix.fullPath,
        })),
      };
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }
}

// Product image service
export const productImageService = {
  // Upload product image
  uploadProductImage: async (productId: string, file: File, options?: UploadOptions) => {
    const fileName = `${Date.now()}_${file.name}`;
    const path = `${STORAGE_PATHS.PRODUCTS}/${productId}/${fileName}`;
    return FirebaseStorageService.uploadFile(path, file, options);
  },

  // Upload multiple product images
  uploadProductImages: async (productId: string, files: File[], options?: UploadOptions) => {
    const uploadPromises = files.map((file, index) => {
      const fileName = `${Date.now()}_${index}_${file.name}`;
      const path = `${STORAGE_PATHS.PRODUCTS}/${productId}/${fileName}`;
      return FirebaseStorageService.uploadFile(path, file, options);
    });

    return await Promise.all(uploadPromises);
  },

  // Delete product image
  deleteProductImage: async (productId: string, fileName: string) => {
    const path = `${STORAGE_PATHS.PRODUCTS}/${productId}/${fileName}`;
    return FirebaseStorageService.deleteFile(path);
  },

  // Delete all product images
  deleteAllProductImages: async (productId: string) => {
    const path = `${STORAGE_PATHS.PRODUCTS}/${productId}`;
    const files = await FirebaseStorageService.listFiles(path);
    
    const deletePromises = files.items.map(item => 
      FirebaseStorageService.deleteFile(item.fullPath)
    );

    return await Promise.all(deletePromises);
  },
};

// User avatar service
export const userAvatarService = {
  // Upload user avatar
  uploadUserAvatar: async (userId: string, file: File, options?: UploadOptions) => {
    const fileName = `avatar_${Date.now()}_${file.name}`;
    const path = `${STORAGE_PATHS.USERS}/${userId}/${fileName}`;
    return FirebaseStorageService.uploadFile(path, file, options);
  },

  // Delete user avatar
  deleteUserAvatar: async (userId: string, fileName: string) => {
    const path = `${STORAGE_PATHS.USERS}/${userId}/${fileName}`;
    return FirebaseStorageService.deleteFile(path);
  },
};

// Category image service
export const categoryImageService = {
  // Upload category image
  uploadCategoryImage: async (categoryId: string, file: File, options?: UploadOptions) => {
    const fileName = `${Date.now()}_${file.name}`;
    const path = `${STORAGE_PATHS.CATEGORIES}/${categoryId}/${fileName}`;
    return FirebaseStorageService.uploadFile(path, file, options);
  },

  // Delete category image
  deleteCategoryImage: async (categoryId: string, fileName: string) => {
    const path = `${STORAGE_PATHS.CATEGORIES}/${categoryId}/${fileName}`;
    return FirebaseStorageService.deleteFile(path);
  },
};

export default FirebaseStorageService;
