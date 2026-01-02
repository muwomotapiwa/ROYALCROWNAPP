import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../constants/colors';
import useAudioPlayer from '../hooks/useAudioPlayer';

const AudioPlayer = ({ uri, title = 'Audio' }) => {
  const { play, isPlaying, currentUri } = useAudioPlayer();
  const active = currentUri === uri && isPlaying;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={() => play(uri)} style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}> 
        <Text style={styles.buttonText}>{active ? 'Pause' : 'Play'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fonts.body,
    color: colors.navy,
    flex: 1,
    marginRight: 8,
  },
  button: {
    backgroundColor: colors.gold,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.navy,
    fontWeight: '600',
  },
});

export default AudioPlayer;
