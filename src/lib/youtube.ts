// === Polyfills for YouTube.js ===
import 'event-target-polyfill';
import 'web-streams-polyfill';
import 'text-encoding-polyfill';
import 'react-native-url-polyfill/auto';
import { decode, encode } from 'base-64';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// AsyncStorage for caching
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore
global.mmkvStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log('Storage error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.log('Storage error:', error);
    }
  },
  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.log('Storage error:', error);
    }
  },
};

// CustomEvent polyfill
class CustomEvent extends Event {
  #detail: any;

  constructor(type: string, options?: CustomEventInit<any>) {
    super(type, options);
    this.#detail = options?.detail ?? null;
  }

  get detail() {
    return this.#detail;
  }
}

// @ts-ignore
global.CustomEvent = CustomEvent;

// Import React Native build
import Innertube from 'youtubei.js/react-native';

let innertubeInstance: any = null;
let initializationPromise: Promise<any> | null = null;

export async function getInnertube() {
  if (innertubeInstance) {
    return innertubeInstance;
  }

  // If already initializing, wait for that
  if (initializationPromise) {
    console.log('⏳ Already initializing, waiting...');
    return initializationPromise;
  }

  console.log('🎬 Initializing YouTube.js (React Native)...');
  
  initializationPromise = (async () => {
    try {
      // Create with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Initialization timeout after 60s')), 60000)
      );

      const createPromise = Innertube.create({
        cache: {
          get: async (key: string) => {
            try {
              const value = await AsyncStorage.getItem(key);
              return value ? JSON.parse(value) : undefined;
            } catch {
              return undefined;
            }
          },
          set: async (key: string, value: any) => {
            try {
              await AsyncStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
              console.log('Cache set error:', e);
            }
          },
          remove: async (key: string) => {
            try {
              await AsyncStorage.removeItem(key);
            } catch (e) {
              console.log('Cache remove error:', e);
            }
          },
        },
        generate_session_locally: true,
      });

      innertubeInstance = await Promise.race([createPromise, timeoutPromise]);
      
      console.log('✅ YouTube.js ready!');
      return innertubeInstance;
      
    } catch (error: any) {
      console.error('❌ Init failed:', error.message);
      initializationPromise = null; // Reset so we can retry
      throw error;
    }
  })();

  return initializationPromise;
}

export default getInnertube;