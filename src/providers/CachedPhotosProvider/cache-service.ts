import AsyncStorage from "@react-native-async-storage/async-storage";
import { MediaLibraryPhoto } from "../MediaLibraryPhotosProvider/useMediaLibraryPhotos";
import { Platform } from "react-native";

export type CachedPhotoType = {
  originalPhotoUri: string;
  mipmapWidth: number;
  cachedPhotoUri: string;
};

type CacheKey = {
  originalPhotoUri: string;
  mipmapWidth: number;
};

const STORAGE_PREFIX = "@photos-cache:";

/**
 * Queries the cache for a photo.
 */
export const getPhotoFromCache = async (
  photoKey: CacheKey,
): Promise<CachedPhotoType | undefined> => {
  if (!(await existsInCache(photoKey))) {
    return;
  }

  const cachedPhotoUri = await AsyncStorage.getItem(
    STORAGE_PREFIX + cacheKeyToString(photoKey),
  );
  if (!cachedPhotoUri) {
    return;
  }

  // Since expo-file-system does not support web, we need to omit this step in case of web build
  if (Platform.OS !== "web") {
    // Dynamic import
    const { File } = await import("expo-file-system/next");

    const fileInfo = new File(cachedPhotoUri);
    if (!fileInfo.exists) {
      return;
    }
  }

  return {
    cachedPhotoUri: cachedPhotoUri,
    originalPhotoUri: photoKey.originalPhotoUri,
    mipmapWidth: photoKey.mipmapWidth,
  };
};

/**
 * Clears the cache effectively wiping out all stored photos.
 */
export const clearCache = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
  await AsyncStorage.multiRemove(cacheKeys);
};

/**
 * Loads all photos from the cache that match the {@link mipmapWidth} and {@link mediaLibraryPhotos} unless there's no match even for a single photo.
 * @returns photos that match the {@link mipmapWidth}
 */
export const loadAllPhotosFromCache = async (
  mediaLibraryPhotos: MediaLibraryPhoto[],
  mipmapWidth: number,
): Promise<CachedPhotoType[]> => {
  const allKeys = await AsyncStorage.getAllKeys();
  const cacheKeys = allKeys.filter((key) => key.startsWith(STORAGE_PREFIX));
  const pairs = await AsyncStorage.multiGet(cacheKeys);

  const sizeMatchingPhotos = pairs
    .map((pair) => {
      if (!pair[0] || !pair[1]) {
        return;
      }

      const keyWithoutPrefix = pair[0].replace(STORAGE_PREFIX, "");
      const { originalPhotoUri, mipmapWidth } =
        cacheKeyFromString(keyWithoutPrefix);

      return {
        originalPhotoUri,
        mipmapWidth,
        cachedPhotoUri: pair[1],
      };
    })
    .filter((photo): photo is NonNullable<typeof photo> => photo !== undefined)
    .filter((photo) => photo.mipmapWidth === Number(mipmapWidth.toFixed(2)))
    .reduce(
      (acc, el) => {
        acc[el.originalPhotoUri] = el;
        return acc;
      },
      {} as Record<string, CachedPhotoType>,
    );

  const matchingPhotos = mediaLibraryPhotos
    .map((photo) => {
      const cachedPhoto = sizeMatchingPhotos[photo.uri];
      if (!cachedPhoto) {
        return;
      }

      return cachedPhoto;
    })
    .filter((photo): photo is NonNullable<typeof photo> => photo !== undefined);

  return matchingPhotos.length === mediaLibraryPhotos.length
    ? matchingPhotos
    : [];
};

/**
 * Checks if a photo is in the cache.
 */
const existsInCache = async (cacheKey: CacheKey) => {
  const value = await AsyncStorage.getItem(
    STORAGE_PREFIX + cacheKeyToString(cacheKey),
  );
  return Boolean(value);
};

const cacheKeyToString = (cacheKey: CacheKey): string => {
  return `${cacheKey.originalPhotoUri}--${cacheKey.mipmapWidth.toFixed(2)}`;
};

const cacheKeyFromString = (photoKeyString: string): CacheKey => {
  const [originalPhotoUri, mipmapWidth] = photoKeyString.split("--");
  return {
    originalPhotoUri,
    mipmapWidth: Number(parseFloat(mipmapWidth).toFixed(2)),
  };
};

/**
 * Stores a photo in the cache.
 */
export const setPhotoInCache = async (
  cacheKey: CacheKey,
  cachedPhotoUri: string,
): Promise<CachedPhotoType> => {
  await AsyncStorage.setItem(
    STORAGE_PREFIX + cacheKeyToString(cacheKey),
    cachedPhotoUri,
  );

  return {
    originalPhotoUri: cacheKey.originalPhotoUri,
    mipmapWidth: cacheKey.mipmapWidth,
    cachedPhotoUri: cachedPhotoUri,
  };
};
