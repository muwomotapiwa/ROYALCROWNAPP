import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import Card from '../components/Card';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, fonts } from '../constants/colors';
import useAudioPlayer from '../hooks/useAudioPlayer';
import { fetchData } from '../services/api';
import { getMeetingState, getSastNow } from '../utils/meetingSchedule';

const placeholderImage = 'https://via.placeholder.com/240x240.png?text=Music';

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

const hashString = (value) =>
  value.split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) >>> 0, 0).toString(16);

const getCachePath = (url) => {
  const cleanUrl = url.split('?')[0];
  const ext = cleanUrl.includes('.') ? cleanUrl.split('.').pop() : 'mp3';
  return `${FileSystem.cacheDirectory}audio_${hashString(url)}.${ext || 'mp3'}`;
};

const formatTime = (millis = 0) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const MusicScreen = () => {
  const navigation = useNavigation();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [linkError, setLinkError] = useState(null);
  const [now, setNow] = useState(getSastNow());
  const { play, stop, setLooping, currentUri, isPlaying, status } = useAudioPlayer();
  const [audioCache, setAudioCache] = useState({});
  const prefetchRef = useRef({});
  const finishRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchData('music');
        setTracks(data);
      } catch (e) {
        setError('Could not load music');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getSastNow());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const meetingState = useMemo(() => getMeetingState(now), [now]);
  const musicDisabled = meetingState.isMusicPaused;
  const showMeetingBanner = meetingState.isMeetingWindow;

  useEffect(() => {
    if (musicDisabled && isPlaying) {
      stop();
    }
  }, [musicDisabled, isPlaying, stop]);

  const heroTrack = tracks[activeIndex] || tracks[0];
  const listData = tracks;
  const heroResolvedUrl = heroTrack ? resolveAudioUrl(heroTrack.AudioURL) : null;
  const getCachedUri = (url) => (url ? audioCache[url] : null);
  const isTrackCurrent = (resolvedUrl) =>
    resolvedUrl && (currentUri === resolvedUrl || currentUri === getCachedUri(resolvedUrl));
  const playingHero = heroTrack && isTrackCurrent(heroResolvedUrl) && isPlaying;
  const heroActive = heroTrack && isTrackCurrent(heroResolvedUrl);
  const showProgress = status?.isLoaded && heroActive;
  const positionMillis = showProgress ? status.positionMillis || 0 : 0;
  const durationMillis = showProgress ? status.durationMillis || 0 : 0;
  const progressRatio = durationMillis > 0 ? positionMillis / durationMillis : 0;
  const progressPercent = `${Math.min(100, Math.max(0, progressRatio * 100))}%`;

  const cacheAudio = async (url) => {
    if (!url) return null;
    const fileUri = getCachePath(url);
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) return fileUri;
    try {
      await FileSystem.downloadAsync(url, fileUri);
      return fileUri;
    } catch {
      return null;
    }
  };

  const prefetchAudio = async (url) => {
    if (!url || prefetchRef.current[url]) return;
    prefetchRef.current[url] = true;
    const cached = await cacheAudio(url);
    if (cached) {
      setAudioCache((prev) => ({ ...prev, [url]: cached }));
    }
    prefetchRef.current[url] = false;
  };

  const handlePlayTrack = async (track, index) => {
    if (!track) return;
    setActiveIndex(index);
    if (musicDisabled) return;
    const resolved = resolveAudioUrl(track.AudioURL);
    if (!resolved) {
      setLinkError({
        id: track.ID || track.AudioURL || index,
        message: 'Invalid audio link. Use a file link, not a folder.',
      });
      return;
    }
    setLinkError(null);
    const cached = getCachedUri(resolved);
    await play(cached || resolved);
    setLooping(repeatEnabled);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const nextIndex = shuffleEnabled
      ? (() => {
          if (tracks.length === 1) return activeIndex;
          let next = Math.floor(Math.random() * tracks.length);
          while (next === activeIndex) {
            next = Math.floor(Math.random() * tracks.length);
          }
          return next;
        })()
      : (activeIndex + 1) % tracks.length;
    handlePlayTrack(tracks[nextIndex], nextIndex);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    const prevIndex = (activeIndex - 1 + tracks.length) % tracks.length;
    handlePlayTrack(tracks[prevIndex], prevIndex);
  };

  const handleTogglePlay = () => {
    if (!heroTrack?.AudioURL || musicDisabled) return;
    handlePlayTrack(heroTrack, activeIndex);
  };

  useEffect(() => {
    setLooping(repeatEnabled);
  }, [repeatEnabled, setLooping]);

  useEffect(() => {
    if (!status?.didJustFinish || repeatEnabled || musicDisabled) return;
    if (finishRef.current === currentUri) return;
    finishRef.current = currentUri;
    handleNext();
  }, [status, repeatEnabled, musicDisabled, currentUri]);

  useEffect(() => {
    finishRef.current = null;
  }, [currentUri]);

  useEffect(() => {
    if (!tracks.length) return;
    const resolvedUrls = tracks
      .map((track) => resolveAudioUrl(track.AudioURL))
      .filter(Boolean)
      .slice(0, 3);
    resolvedUrls.forEach((url) => prefetchAudio(url));
  }, [tracks]);

  useEffect(() => {
    if (!tracks.length) return;
    const nextIndex = (activeIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];
    const nextUrl = resolveAudioUrl(nextTrack?.AudioURL);
    if (nextUrl) {
      prefetchAudio(nextUrl);
    }
  }, [activeIndex, tracks]);

  if (loading) return <LoadingSpinner label="Loading music" />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!heroTrack) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No tracks yet</Text>
          <Text style={styles.emptyCopy}>Add worship music in the sheet to see it here.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={listData}
        keyExtractor={(item, index) => `${item.ID || item.AudioURL || index}`}
        ListHeaderComponent={
          <>
            {showMeetingBanner ? (
              <Card style={styles.meetingBanner}>
                <Text style={styles.meetingTitle}>Meeting ready…</Text>
                <Text style={styles.meetingCopy}>
                  The Zoom meeting has started. Please return to Zoom to join.
                </Text>
                <CustomButton
                  title="Go to Zoom"
                  onPress={() => navigation.navigate('Zoom')}
                  style={styles.meetingButton}
                  textStyle={{ color: colors.white }}
                  variant="secondary"
                />
              </Card>
            ) : null}
            <Card style={styles.heroCard}>
              <ImageBackground
                source={{ uri: heroTrack.ThumbnailURL || placeholderImage }}
                style={styles.heroImage}
                imageStyle={styles.heroImageInner}
              >
                <View style={styles.heroOverlay} />
                <View style={styles.heroTopRow}>
                  <Text style={styles.heroHint}>Based on your worship</Text>
                  <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.white} />
                </View>
                <Text style={styles.heroSecondary}>{heroTrack.Artist}</Text>
                <Text style={styles.heroTitle}>{heroTrack.Title}</Text>
                {heroActive ? (
                  <Text style={styles.heroStatus}>{playingHero ? 'Playing now' : 'Paused'}</Text>
                ) : null}
              </ImageBackground>

              <View style={styles.progressRow}>
                <Text style={styles.progressTime}>{formatTime(positionMillis)}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: progressPercent }]} />
                </View>
                <Text style={styles.progressTime}>{formatTime(durationMillis)}</Text>
              </View>

              <View style={styles.controlsRow}>
                <Pressable
                  style={[
                    styles.iconButton,
                    shuffleEnabled && styles.controlActive,
                    musicDisabled && styles.controlDisabled,
                  ]}
                  onPress={() => setShuffleEnabled((prev) => !prev)}
                  disabled={musicDisabled}
                >
                  <MaterialCommunityIcons
                    name="shuffle-variant"
                    size={24}
                    color={shuffleEnabled ? colors.primary : colors.navy}
                  />
                </Pressable>
                <Pressable style={[styles.iconButton, musicDisabled && styles.controlDisabled]} onPress={handlePrev} disabled={musicDisabled}>
                  <MaterialCommunityIcons name="skip-previous" size={30} color={colors.navy} />
                </Pressable>
                <Pressable
                  style={[styles.playButton, musicDisabled && styles.controlDisabled]}
                  onPress={handleTogglePlay}
                  disabled={musicDisabled}
                >
                  <MaterialCommunityIcons
                    name={playingHero ? 'pause' : 'play'}
                    size={28}
                    color={colors.primary}
                  />
                </Pressable>
                <Pressable
                  style={[styles.stopButton, musicDisabled && styles.controlDisabled]}
                  onPress={stop}
                  disabled={musicDisabled}
                >
                  <MaterialCommunityIcons name="stop" size={22} color={colors.primary} />
                </Pressable>
                <Pressable style={[styles.iconButton, musicDisabled && styles.controlDisabled]} onPress={handleNext} disabled={musicDisabled}>
                  <MaterialCommunityIcons name="skip-next" size={30} color={colors.navy} />
                </Pressable>
                <Pressable
                  style={[
                    styles.iconButton,
                    repeatEnabled && styles.controlActive,
                    musicDisabled && styles.controlDisabled,
                  ]}
                  onPress={() => setRepeatEnabled((prev) => !prev)}
                  disabled={musicDisabled}
                >
                  <MaterialCommunityIcons
                    name="repeat"
                    size={24}
                    color={repeatEnabled ? colors.primary : colors.navy}
                  />
                </Pressable>
              </View>
              {linkError ? <Text style={styles.linkError}>{linkError.message}</Text> : null}
            </Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>More Songs</Text>
              <Text style={styles.sectionCopy}>Tap a song to play it on the main player above.</Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          const resolved = resolveAudioUrl(item.AudioURL);
          const isCurrent = isTrackCurrent(resolved) && isPlaying;
          const isSelected = isTrackCurrent(resolved) && !isPlaying;
          const showLinkError = linkError?.id === (item.ID || item.AudioURL || index);
          return (
            <View style={styles.listItemWrap}>
              <Pressable
                style={[styles.queueRow, musicDisabled && styles.controlDisabled]}
                onPress={() => handlePlayTrack(item, index)}
                disabled={musicDisabled}
              >
                <Image source={{ uri: item.ThumbnailURL || placeholderImage }} style={styles.queueArt} />
                <View style={styles.queueMeta}>
                  <Text style={styles.queueTitle}>{item.Title}</Text>
                  <Text style={styles.queueArtist}>{item.Artist}</Text>
                </View>
                {isCurrent ? <Text style={styles.nowPlaying}>Playing</Text> : null}
                {isSelected ? <Text style={styles.nowPlaying}>Paused</Text> : null}
              </Pressable>
              {index < listData.length - 1 ? <View style={styles.listDivider} /> : null}
              {showLinkError ? <Text style={styles.linkError}>{linkError.message}</Text> : null}
            </View>
          );
        }}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  list: {
    paddingVertical: 16,
  },
  heroCard: {
    padding: 0,
    width: '100%',
    maxWidth: 900,
    overflow: 'hidden',
    marginBottom: 16,
    borderRadius: 0,
    alignSelf: 'center',
  },
  meetingBanner: {
    width: '100%',
    maxWidth: 900,
    marginBottom: 12,
    alignSelf: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: fonts.h2,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  sectionCopy: {
    color: colors.gray,
  },
  meetingTitle: {
    fontSize: fonts.h2,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 6,
  },
  meetingCopy: {
    color: colors.gray,
    marginBottom: 10,
  },
  meetingButton: {
    backgroundColor: colors.primary,
  },
  heroImage: {
    width: '100%',
    minHeight: 320,
    padding: 16,
    justifyContent: 'flex-end',
  },
  heroImageInner: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(94, 12, 74, 0.55)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroHint: {
    color: colors.white,
    opacity: 0.85,
    fontSize: fonts.small,
    fontWeight: '700',
  },
  heroSecondary: {
    color: colors.white,
    opacity: 0.9,
    marginTop: 8,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  heroStatus: {
    color: colors.gold,
    fontWeight: '700',
    marginTop: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 999,
  },
  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  progressTime: {
    fontSize: fonts.small,
    color: colors.gray,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  iconButton: {
    padding: 8,
  },
  controlActive: {
    backgroundColor: 'rgba(94, 12, 74, 0.12)',
    borderRadius: 999,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  stopButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  controlDisabled: {
    opacity: 0.5,
  },
  queueCard: {
    width: '100%',
    marginBottom: 12,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  queueArt: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: colors.cream,
  },
  listItemWrap: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
  },
  listDivider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  queueMeta: {
    flex: 1,
  },
  nowPlaying: {
    color: colors.primary,
    fontWeight: '700',
  },
  linkError: {
    color: colors.hotPink,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  queueTitle: {
    fontSize: fonts.h2,
    fontWeight: '700',
    color: colors.navy,
  },
  queueArtist: {
    color: colors.gray,
  },
  error: {
    margin: 16,
    color: colors.hotPink,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginTop: 24,
  },
  emptyTitle: {
    fontSize: fonts.h2,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 6,
  },
  emptyCopy: {
    color: colors.gray,
  },
});

export default MusicScreen;
