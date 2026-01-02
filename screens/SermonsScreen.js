import React, { useEffect, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, fonts } from '../constants/colors';
import { fetchData } from '../services/api';
import useAudioPlayer from '../hooks/useAudioPlayer';

const sanitizeFilename = (name) => String(name || '').replace(/[^a-zA-Z0-9-_]+/g, '_');

const formatTime = (millis = 0) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const extractDriveId = (url) => {
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch?.[1]) return fileMatch[1];
  const openMatch = url.match(/[?&]id=([^&]+)/);
  if (openMatch?.[1]) return openMatch[1];
  return null;
};

const resolveAudioUrl = (url) => {
  if (!url) return null;
  if (url.includes('drive.google.com')) {
    if (url.includes('/drive/folders/') || url.includes('/folders/')) {
      return null;
    }
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/uc?export=download&id=${id}` : null;
  }
  return url;
};

const SermonsScreen = () => {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const { play, stop, isPlaying, currentUri, status, isLoading, error: audioError } = useAudioPlayer();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchData('sermons');
        setSermons(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Could not load sermons');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePlay = async (item) => {
    const resolved = resolveAudioUrl(item.AudioURL);
    if (!resolved) {
      setLinkError({ id: item.ID || item.Title, message: 'Invalid audio link. Use a file link, not a folder.' });
      return;
    }
    setLinkError(null);
    await play(resolved);
  };

  const handleStop = async () => {
    await stop();
  };

  const handleDownload = async (item) => {
    const resolved = resolveAudioUrl(item.AudioURL);
    if (!resolved) {
      setLinkError({ id: item.ID || item.Title, message: 'Invalid audio link. Use a file link, not a folder.' });
      return;
    }
    const id = item.ID || item.Title;
    const baseName = sanitizeFilename(item.Title || 'sermon');
    const cleanUrl = resolved.split('?')[0];
    const extension = cleanUrl.includes('.') ? cleanUrl.split('.').pop() : 'mp3';
    const filename = `${baseName}.${extension || 'mp3'}`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    setDownloadStatus({ id, message: 'Downloading...' });
    try {
      const result = await FileSystem.downloadAsync(resolved, fileUri);
      setDownloadStatus({ id, message: 'Saved. Choose where to keep it.' });
      await Share.share({ url: result.uri, message: 'Sermon downloaded.' });
      setTimeout(() => setDownloadStatus(null), 4000);
    } catch (downloadError) {
      setDownloadStatus({ id, message: 'Download failed. Try again.' });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.contentInner}>
        <Card style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Sermons</Text>
          <Text style={styles.heroTitle}>Fresh messages every week</Text>
          <Text style={styles.heroCopy}>
            Stream the latest teaching straight from church. Tap play to listen and stop when you are done.
          </Text>
        </Card>

        {loading && <LoadingSpinner label="Loading sermons..." />}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && sermons.length === 0 && (
          <Text style={styles.empty}>No sermons available yet. Check back soon.</Text>
        )}

        {sermons.map((item) => {
          const id = item.ID || item.Title;
          const resolvedUrl = resolveAudioUrl(item.AudioURL);
          const isActive = currentUri === resolvedUrl;
          const isItemPlaying = isActive && isPlaying;
          const hasUrl = !!resolvedUrl;
          const thumb = item.ImageURL || item.ThumbnailURL;
          const showError = audioError?.uri === resolvedUrl;
          const showLinkError = linkError?.id === id;

          return (
            <Card key={id} style={styles.sermonCard}>
              {thumb ? (
                <ImageBackground source={{ uri: thumb }} style={styles.cover} imageStyle={styles.coverImg}>
                  <View style={styles.coverOverlay} />
                  <View style={styles.coverText}>
                    <Text style={styles.sermonTitle}>{item.Title || 'Sermon'}</Text>
                    <Text style={styles.sermonMeta}>
                      {item.Speaker ? `${item.Speaker}` : 'Guest Speaker'}{' '}
                      {item.Date ? `• ${item.Date}` : ''}
                    </Text>
                    <View style={styles.buttonRow}>
                      <Pressable
                        style={[
                          styles.playButton,
                          (!hasUrl || (isLoading && isActive)) && styles.playButtonDisabled,
                        ]}
                        onPress={() => handlePlay(item)}
                        disabled={!hasUrl || (isLoading && isActive)}
                      >
                        <MaterialCommunityIcons
                          name={isItemPlaying ? 'pause-circle' : isLoading && isActive ? 'progress-clock' : 'play-circle'}
                          size={22}
                          color={colors.white}
                        />
                        <Text style={styles.playLabel}>
                          {hasUrl ? (isItemPlaying ? 'Pause' : isLoading && isActive ? 'Loading...' : 'Play') : 'No audio'}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.stopButton, !isActive && styles.stopButtonDisabled]}
                        onPress={handleStop}
                      >
                        <MaterialCommunityIcons name="stop-circle" size={22} color={colors.white} />
                        <Text style={styles.playLabel}>Stop</Text>
                      </Pressable>
                      <Pressable style={styles.downloadButton} onPress={() => handleDownload(item)}>
                        <MaterialCommunityIcons name="download" size={18} color={colors.white} />
                        <Text style={styles.playLabel}>Download</Text>
                      </Pressable>
                    </View>
                  </View>
                </ImageBackground>
              ) : (
                <View style={styles.fallbackHeader}>
                  <Text style={[styles.sermonTitle, styles.sermonTitleDark]}>{item.Title || 'Sermon'}</Text>
                  <Text style={[styles.sermonMeta, styles.sermonMetaDark]}>
                    {item.Speaker ? `${item.Speaker}` : 'Guest Speaker'} {item.Date ? `• ${item.Date}` : ''}
                  </Text>
                  <View style={styles.buttonRow}>
                    <Pressable
                      style={[
                        styles.playButton,
                        (!hasUrl || (isLoading && isActive)) && styles.playButtonDisabled,
                      ]}
                      onPress={() => handlePlay(item)}
                      disabled={!hasUrl || (isLoading && isActive)}
                    >
                      <MaterialCommunityIcons
                        name={isItemPlaying ? 'pause-circle' : isLoading && isActive ? 'progress-clock' : 'play-circle'}
                        size={22}
                        color={colors.white}
                      />
                      <Text style={styles.playLabel}>
                        {hasUrl ? (isItemPlaying ? 'Pause' : isLoading && isActive ? 'Loading...' : 'Play') : 'No audio'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.stopButton, !isActive && styles.stopButtonDisabled]}
                      onPress={handleStop}
                    >
                      <MaterialCommunityIcons name="stop-circle" size={22} color={colors.white} />
                      <Text style={styles.playLabel}>Stop</Text>
                    </Pressable>
                    <Pressable style={styles.downloadButton} onPress={() => handleDownload(item)}>
                      <MaterialCommunityIcons name="download" size={18} color={colors.white} />
                      <Text style={styles.playLabel}>Download</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {isActive && status ? (
                <View style={styles.progressRow}>
                  <Text style={styles.progressText}>
                    {formatTime(status.positionMillis)} / {formatTime(status.durationMillis || 0)}
                  </Text>
                </View>
              ) : null}

              {showError ? <Text style={styles.errorText}>Audio failed to load. Check the link.</Text> : null}
              {showLinkError ? <Text style={styles.errorText}>{linkError.message}</Text> : null}

              {downloadStatus?.id === id ? (
                <Text style={styles.downloadStatus}>{downloadStatus.message}</Text>
              ) : null}

              {item.Description ? <Text style={styles.desc}>{item.Description}</Text> : null}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  contentInner: {
    width: '100%',
    maxWidth: 1100,
    gap: 10,
  },
  heroCard: {
    marginTop: 8,
    marginBottom: 8,
  },
  heroEyebrow: {
    color: colors.primary,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 6,
  },
  heroCopy: {
    color: colors.gray,
    fontSize: fonts.body,
  },
  sermonCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    minHeight: 200,
    justifyContent: 'flex-end',
  },
  coverImg: {
    resizeMode: 'cover',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  coverText: {
    padding: 16,
    gap: 6,
  },
  fallbackHeader: {
    padding: 16,
    gap: 8,
  },
  sermonTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  sermonTitleDark: {
    color: colors.navy,
  },
  sermonMeta: {
    color: colors.gold,
    fontWeight: '600',
  },
  sermonMetaDark: {
    color: colors.gray,
  },
  playButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  playButtonDisabled: {
    backgroundColor: colors.gray,
  },
  playLabel: {
    color: colors.white,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stopButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  stopButtonDisabled: {
    backgroundColor: colors.gray,
  },
  downloadButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  progressRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  progressText: {
    color: colors.navy,
    fontWeight: '700',
  },
  downloadStatus: {
    paddingHorizontal: 16,
    paddingTop: 8,
    color: colors.primary,
    fontWeight: '700',
  },
  errorText: {
    paddingHorizontal: 16,
    paddingTop: 8,
    color: colors.hotPink,
    fontWeight: '700',
  },
  desc: {
    padding: 16,
    color: colors.navy,
    fontSize: fonts.body,
  },
  error: {
    color: colors.hotPink,
    marginVertical: 8,
  },
  empty: {
    color: colors.gray,
    marginVertical: 8,
  },
});

export default SermonsScreen;
