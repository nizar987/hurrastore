import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CART: 'cart',
  REVIEWS: 'reviews',
  CATEGORIES: 'categories',
} as const;

// Generic Firestore service
export class FirestoreService {
  // Get a single document
  static async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Get all documents from a collection
  static async getDocuments<T>(collectionName: string): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  // Add a new document
  static async addDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  // Update a document
  static async updateDocument<T>(collectionName: string, docId: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete a document
  static async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Query documents with filters
  static async queryDocuments<T>(
    collectionName: string,
    filters: Array<{ field: string; operator: any; value: any }>,
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ): Promise<T[]> {
    try {
      let q = query(collection(db, collectionName));

      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }
}

// Product-specific Firestore operations
export const productService = {
  // Get all products
  getProducts: async () => {
    return FirestoreService.getDocuments(COLLECTIONS.PRODUCTS);
  },

  // Get product by ID
  getProduct: async (id: string) => {
    return FirestoreService.getDocument(COLLECTIONS.PRODUCTS, id);
  },

  // Get products by category
  getProductsByCategory: async (category: string) => {
    return FirestoreService.queryDocuments(
      COLLECTIONS.PRODUCTS,
      [{ field: 'category', operator: '==', value: category }],
      'createdAt',
      'desc'
    );
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return FirestoreService.queryDocuments(
      COLLECTIONS.PRODUCTS,
      [{ field: 'isFeatured', operator: '==', value: true }],
      'createdAt',
      'desc',
      8
    );
  },

  // Get bestseller products
  getBestsellerProducts: async () => {
    return FirestoreService.queryDocuments(
      COLLECTIONS.PRODUCTS,
      [{ field: 'isBestSeller', operator: '==', value: true }],
      'createdAt',
      'desc',
      8
    );
  },

  // Search products
  searchProducts: async (searchTerm: string) => {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia or similar for production
    const allProducts = await FirestoreService.getDocuments(COLLECTIONS.PRODUCTS);
    return allProducts.filter((product: any) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  // Add product
  addProduct: async (productData: any) => {
    return FirestoreService.addDocument(COLLECTIONS.PRODUCTS, productData);
  },

  // Update product
  updateProduct: async (id: string, productData: any) => {
    return FirestoreService.updateDocument(COLLECTIONS.PRODUCTS, id, productData);
  },

  // Delete product
  deleteProduct: async (id: string) => {
    return FirestoreService.deleteDocument(COLLECTIONS.PRODUCTS, id);
  },
};

// User-specific Firestore operations
export const userService = {
  // Get user profile
  getUserProfile: async (uid: string) => {
    return FirestoreService.getDocument(COLLECTIONS.USERS, uid);
  },

  // Create user profile
  createUserProfile: async (uid: string, userData: any) => {
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(docRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // Update user profile
  updateUserProfile: async (uid: string, userData: any) => {
    return FirestoreService.updateDocument(COLLECTIONS.USERS, uid, userData);
  },
};

// Cart-specific Firestore operations
export const cartService = {
  // Get user's cart
  getUserCart: async (userId: string) => {
    return FirestoreService.queryDocuments(
      COLLECTIONS.CART,
      [{ field: 'userId', operator: '==', value: userId }]
    );
  },

  // Add item to cart
  addToCart: async (userId: string, productId: string, quantity: number) => {
    const cartItems = await cartService.getUserCart(userId);
    const existingItem = cartItems.find((item: any) => item.productId === productId);

    if (existingItem) {
      // Update quantity
      return FirestoreService.updateDocument(COLLECTIONS.CART, existingItem.id, {
        quantity: existingItem.quantity + quantity,
      });
    } else {
      // Add new item
      return FirestoreService.addDocument(COLLECTIONS.CART, {
        userId,
        productId,
        quantity,
      });
    }
  },

  // Update cart item quantity
  updateCartItemQuantity: async (itemId: string, quantity: number) => {
    return FirestoreService.updateDocument(COLLECTIONS.CART, itemId, { quantity });
  },

  // Remove item from cart
  removeFromCart: async (itemId: string) => {
    return FirestoreService.deleteDocument(COLLECTIONS.CART, itemId);
  },

  // Clear user's cart
  clearCart: async (userId: string) => {
    const cartItems = await cartService.getUserCart(userId);
    await Promise.all(
      cartItems.map((item: any) => FirestoreService.deleteDocument(COLLECTIONS.CART, item.id))
    );
  },
};

// Order-specific Firestore operations
export const orderService = {
  // Get user's orders
  getUserOrders: async (userId: string) => {
    return FirestoreService.queryDocuments(
      COLLECTIONS.ORDERS,
      [{ field: 'userId', operator: '==', value: userId }],
      'createdAt',
      'desc'
    );
  },

  // Get order by ID
  getOrder: async (orderId: string) => {
    return FirestoreService.getDocument(COLLECTIONS.ORDERS, orderId);
  },

  // Create order
  createOrder: async (orderData: any) => {
    return FirestoreService.addDocument(COLLECTIONS.ORDERS, orderData);
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    return FirestoreService.updateDocument(COLLECTIONS.ORDERS, orderId, { status });
  },
};

export default FirestoreService;
