/**
 * Utilities for handling metadata in various formats
 */
import { MetadataCache, MetadataCacheEntry } from '../types/tribe';

/**
 * Parse stringified BigInt values in an object
 * @param value String or numeric value
 * @returns Parsed BigInt value
 */
export const parseStringifiedBigInt = (value: string | number): bigint => {
  if (typeof value === 'number') {
    return BigInt(value);
  }
  // Handle stringified BigInt format (e.g. "123n")
  if (typeof value === 'string' && value.endsWith('n')) {
    return BigInt(value.slice(0, -1));
  }
  return BigInt(value);
};

/**
 * Replace BigInt values with strings in an object for JSON serialization
 * @param key Object key
 * @param value Object value
 * @returns Value with BigInt converted to string
 */
export const replaceBigIntWithString = (key: string, value: any): any => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

/**
 * Parse JSON metadata safely
 * @param metadata JSON string metadata
 * @param defaultValue Default value if parsing fails
 * @returns Parsed metadata object
 */
export const parseMetadata = <T>(metadata: string, defaultValue: T): T => {
  try {
    if (!metadata || metadata === '{}') {
      return defaultValue;
    }
    return JSON.parse(metadata) as T;
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return defaultValue;
  }
};

/**
 * Stringify metadata object safely
 * @param metadata Metadata object
 * @returns JSON string
 */
export const stringifyMetadata = (metadata: any): string => {
  try {
    return JSON.stringify(metadata, replaceBigIntWithString);
  } catch (error) {
    console.error('Error stringifying metadata:', error);
    return '{}';
  }
};

/**
 * In-memory metadata cache
 */
const metadataCache: MetadataCache = {};

/**
 * Cache timeout in milliseconds (5 minutes)
 */
const CACHE_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Get metadata from cache
 * @param key Cache key
 * @returns Cached metadata or undefined if not found/expired
 */
export const getMetadataFromCache = (key: string): MetadataCacheEntry | undefined => {
  const cachedData = metadataCache[key];
  if (!cachedData) {
    return undefined;
  }

  // Check if cache is expired
  if (Date.now() - cachedData.timestamp > CACHE_TIMEOUT_MS) {
    delete metadataCache[key];
    return undefined;
  }

  return cachedData;
};

/**
 * Store metadata in cache
 * @param key Cache key
 * @param data Data to cache
 * @param metadata Original metadata string
 */
export const storeMetadataInCache = (
  key: string,
  data: any,
  metadata?: string
): void => {
  metadataCache[key] = {
    data,
    metadata,
    timestamp: Date.now()
  };
};

/**
 * Clear metadata cache
 * @param key Optional specific key to clear, clears all if not provided
 */
export const clearMetadataCache = (key?: string): void => {
  if (key) {
    delete metadataCache[key];
  } else {
    Object.keys(metadataCache).forEach(k => delete metadataCache[k]);
  }
}; 