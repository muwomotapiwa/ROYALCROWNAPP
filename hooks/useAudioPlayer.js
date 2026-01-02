import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

const useAudioPlayer = () => {
  const soundRef = useRef(null);
  const pendingRef = useRef(false);
  const [currentUri, setCurrentUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const play = async (uri) => {
    if (!uri) return;
    if (pendingRef.current) return;

    try {
      setError(null);
      pendingRef.current = true;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // load new track when uri changes
      if (currentUri !== uri) {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        setIsLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          (playbackStatus) => {
            setStatus(playbackStatus);
            if (!playbackStatus.isLoaded) {
              if (playbackStatus.error) {
                setError({ uri, message: playbackStatus.error });
                setIsLoading(false);
              }
              return;
            }
            setIsPlaying(playbackStatus.isPlaying);
            setIsLoading(playbackStatus.isBuffering);
          }
        );
        soundRef.current = sound;
        setCurrentUri(uri);
        setIsPlaying(true);
        pendingRef.current = false;
        return;
      }

      // toggle on same track
      const statusAsync = await soundRef.current?.getStatusAsync();
      if (!statusAsync) {
        pendingRef.current = false;
        return;
      }
      setIsLoading(false);
      if (statusAsync.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
      pendingRef.current = false;
    } catch (error) {
      console.warn('Audio play error:', error.message);
      setError({ uri, message: error.message });
      setIsLoading(false);
      pendingRef.current = false;
    }
  };

  const stop = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
      setIsLoading(false);
      pendingRef.current = false;
    }
  };

  const setLooping = async (enabled) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setIsLoopingAsync(Boolean(enabled));
      }
    } catch (loopError) {
      console.warn('Audio loop error:', loopError.message);
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return { play, stop, setLooping, isPlaying, currentUri, status, isLoading, error };
};

export default useAudioPlayer;
