import React, { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import { colors, fonts } from '../constants/colors';
import { getMeetingState, getSastNow } from '../utils/meetingSchedule';

const ZOOM_LINK =
  'https://us04web.zoom.us/j/8057953224?pwd=VWlHUGRJWHQxckl6cGVSWDRtZFdiQT09&omn=71166272435';
const MEETING_ID = '805 795 3224';
const PASSCODE = 'YQ9vg5';

const formatCountdown = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  const remainingSeconds = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

const ZoomScreen = () => {
  const navigation = useNavigation();
  const [now, setNow] = useState(getSastNow());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getSastNow());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const meetingState = useMemo(() => getMeetingState(now), [now]);

  const handleJoin = async (link) => {
    if (!link) return;
    const supported = await Linking.canOpenURL(link);
    if (supported) {
      Linking.openURL(link);
    }
  };

  const statusText = meetingState.isMeetingWindow
    ? 'Meeting ready…'
    : meetingState.isMeetingDay
    ? 'Meeting today at 20:15 SAST.'
    : 'Next meeting is Tuesday and Wednesday at 20:15 SAST.';

  const showCountdown = meetingState.showCountdown;
  const showMeetingPanel = meetingState.isMeetingWindow;
  const showThumbnail = !meetingState.isMeetingWindow;
  const musicDisabled = meetingState.isMusicPaused;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Zoom</Text>
          <Text style={styles.statusTitle}>{statusText}</Text>
          <Text style={styles.statusMeta}>Tuesdays & Wednesdays • 20:15 SAST</Text>
        </View>

        {showCountdown ? (
          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>Meeting starts in</Text>
            <Text style={styles.countdownValue}>{formatCountdown(meetingState.secondsUntilStart)}</Text>
            <Text style={styles.countdownCopy}>Inline panel opens 5 minutes before.</Text>
          </View>
        ) : null}

        {showMeetingPanel ? (
          <View style={styles.liveCard}>
            <View style={styles.liveHeader}>
              <MaterialCommunityIcons name="video" size={24} color={colors.primary} />
              <Text style={styles.liveTitle}>Join the meeting now</Text>
            </View>
            <Text style={styles.liveMeta}>Meeting ID: {MEETING_ID}</Text>
            <Text style={styles.liveMeta}>Passcode: {PASSCODE}</Text>
            <CustomButton
              title="Join Zoom"
              onPress={() => handleJoin(ZOOM_LINK)}
              style={styles.joinButton}
              textStyle={{ color: colors.white }}
              variant="secondary"
            />
          </View>
        ) : null}

        {showThumbnail ? (
          <View style={styles.thumbnailCard}>
            <View style={styles.thumbnailTag}>
              <MaterialCommunityIcons name="calendar-clock" size={18} color={colors.white} />
              <Text style={styles.thumbnailTagText}>Weekly Zoom</Text>
            </View>
            <Text style={styles.thumbnailTitle}>Midweek Prayer & Teaching</Text>
            <Text style={styles.thumbnailCopy}>
              Join us live on Zoom every Tuesday and Wednesday at 20:15 SAST.
            </Text>
          </View>
        ) : null}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Zoom details</Text>
          <Text style={styles.infoCopy}>Meeting ID: {MEETING_ID}</Text>
          <Text style={styles.infoCopy}>Passcode: {PASSCODE}</Text>
          <Text style={styles.infoHint}>Use the Join button when the meeting is live.</Text>
        </View>

        <View style={styles.musicCard}>
          <Text style={styles.musicTitle}>Music</Text>
          <Text style={styles.musicCopy}>
            {musicDisabled
              ? 'Music is paused during the meeting. Please return after 22:00.'
              : 'Need worship music while you wait?'}
          </Text>
          <CustomButton
            title={musicDisabled ? 'Music Paused' : 'Go to Music'}
            onPress={() => navigation.navigate('Music')}
            style={styles.musicButton}
            textStyle={{ color: colors.white }}
            variant="secondary"
            disabled={musicDisabled}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statusLabel: {
    color: colors.primary,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusTitle: {
    fontSize: fonts.h2,
    fontWeight: '700',
    color: colors.navy,
  },
  statusMeta: {
    color: colors.gray,
    marginTop: 4,
  },
  countdownCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countdownLabel: {
    color: colors.gray,
    fontWeight: '700',
  },
  countdownValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: 6,
  },
  countdownCopy: {
    color: colors.gray,
  },
  liveCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  liveTitle: {
    fontSize: fonts.h2,
    fontWeight: '800',
    color: colors.navy,
  },
  liveMeta: {
    color: colors.gray,
    marginBottom: 4,
  },
  joinButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
  },
  thumbnailCard: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  thumbnailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  thumbnailTagText: {
    color: colors.white,
    fontWeight: '700',
  },
  thumbnailTitle: {
    fontSize: fonts.h2,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 6,
  },
  thumbnailCopy: {
    color: colors.white,
    opacity: 0.85,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: fonts.h2,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 6,
  },
  infoCopy: {
    color: colors.gray,
    marginBottom: 2,
  },
  infoHint: {
    color: colors.gray,
    marginTop: 6,
  },
  musicCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  musicTitle: {
    fontSize: fonts.h2,
    fontWeight: '700',
    color: colors.navy,
  },
  musicCopy: {
    color: colors.gray,
    marginVertical: 8,
  },
  musicButton: {
    backgroundColor: colors.primary,
  },
});

export default ZoomScreen;
