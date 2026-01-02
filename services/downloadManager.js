import * as FileSystem from 'expo-file-system';

const sanitize = (value) => value.replace(/[^a-z0-9]/gi, '_').toLowerCase();

const filenameFromUrl = (url, fallback = 'audio') => {
  try {
    const lastSegment = url.split('/').filter(Boolean).pop();
    const base = lastSegment?.split('?')[0] || fallback;
    return sanitize(base);
  } catch (e) {
    return sanitize(fallback);
  }
};

export const getLocalPath = (url, fallback = 'audio') => {
  const name = filenameFromUrl(url, fallback);
  return `${FileSystem.documentDirectory}${name}`;
};

export const ensureDownloaded = async (url, fallback) => {
  if (!url) throw new Error('Download URL is missing');

  const fileUri = getLocalPath(url, fallback);
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    await FileSystem.downloadAsync(url, fileUri);
  }

  return fileUri;
};
