import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, fonts } from '../constants/colors';
import { fetchData, submitPrayerRequest } from '../services/api';

const HomeScreen = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrayer, setShowPrayer] = useState(false);
  const [prayerSent, setPrayerSent] = useState(false);
  const [prayerError, setPrayerError] = useState(null);
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [prayerLocked, setPrayerLocked] = useState(false);
  const [prayerForm, setPrayerForm] = useState({
    name: '',
    email: '',
    phone: '',
    request: '',
  });
  const prayerTimeoutRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await fetchData('announcements');
        setAnnouncements(data);
      } catch (e) {
        setError('Could not load announcements');
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const showEmpty = !loading && !error && announcements.length === 0;
  const quickLinks = [
    { label: 'Devotional', icon: 'book-open-variant', target: 'Devotional' },
    { label: 'Announcements', icon: 'bullhorn', target: 'Announcements' },
    { label: 'Sermons', icon: 'microphone', target: 'Sermons' },
    { label: 'Zoom', icon: 'video', target: 'Zoom' },
    { label: 'Music', icon: 'music', target: 'Music' },
    { label: 'Prayer', icon: 'hand-heart', action: 'prayer' },
  ];

  const openPrayer = () => {
    setPrayerSent(false);
    setPrayerError(null);
    setPrayerLocked(false);
    setShowPrayer(true);
  };

  const closePrayer = () => {
    if (prayerTimeoutRef.current) {
      clearTimeout(prayerTimeoutRef.current);
      prayerTimeoutRef.current = null;
    }
    setShowPrayer(false);
  };

  const updatePrayer = (field, value) => {
    setPrayerForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitPrayer = async () => {
    if (!prayerForm.name.trim() || !prayerForm.request.trim()) {
      setPrayerError('Please add your name and prayer request.');
      return;
    }

    try {
      setPrayerLoading(true);
      setPrayerError(null);
      await submitPrayerRequest({
        name: prayerForm.name.trim(),
        email: prayerForm.email.trim(),
        phone: prayerForm.phone.trim(),
        request: prayerForm.request.trim(),
        dateTime: new Date().toISOString(),
      });
      setPrayerSent(true);
      setPrayerLocked(true);
      setPrayerForm({ name: '', email: '', phone: '', request: '' });
      prayerTimeoutRef.current = setTimeout(() => {
        setShowPrayer(false);
      }, 1200);
    } catch (submitError) {
      setPrayerError('Unable to submit right now. Please try again.');
    } finally {
      setPrayerLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.contentInner}>
        <Card style={styles.heroCard}>
          <ImageBackground
            source={{ uri: 'https://af6815798a.imgdist.com/pub/bfra/knkjywkm/cw4/e44/hpa/BackgroundTablet.jpeg' }}
            style={styles.heroImage}
            imageStyle={styles.heroImageInner}
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroText}>
              <Text style={styles.heroLabel}>Royal Crown Ministries</Text>
              <Text style={styles.welcome}>Welcome home</Text>
              <Text style={styles.subtitle}>Worship. Word. Community. You belong here.</Text>
              <View style={styles.heroPill}>
                <MaterialCommunityIcons name="clock" color={colors.primary} size={18} />
                <Text style={styles.heroPillText}>Sunday Service • 9:00 AM</Text>
              </View>
            </View>
          </ImageBackground>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Message of the Year!!!</Text>
        </View>
        <Card style={styles.messageCard}>
          <Image
            source={{
              uri: 'https://af6815798a.imgdist.com/pub/bfra/knkjywkm/gib/quh/hp7/Transforning%20Grace.jpeg',
            }}
            style={styles.messageImage}
            resizeMode="cover"
          />
          <Text style={styles.messageRef}>Hebrews 4v16</Text>
          <Text style={styles.messageVerse}>
            Let us therefore come boldly to the throne of grace, that we may obtain mercy and find grace to help
            in time of need. (nkjv)
          </Text>
          <Text style={styles.messageBody}>
            2026 is our year of Transforming Grace. Grace that changes minds, elevates lives, opens doors, and
            produces lasting fruit. We step into a season of divine acceleration, growth, and undeniable
            testimonies. I declare that limitations are broken, doors are opening, destinies are aligned, and the
            grace of God is actively transforming every area of our lives, in Jesus' name. Receive It
          </Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
        </View>
        <View style={styles.quickRow}>
          {quickLinks.map((item) => (
            <Pressable
              key={item.label}
              style={styles.quickCard}
              onPress={() => (item.action === 'prayer' ? openPrayer() : navigation.navigate(item.target))}
            >
              <View style={styles.quickIcon}>
                <MaterialCommunityIcons name={item.icon} size={26} color={colors.primary} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Verse of the Week</Text>
        </View>
        <Card style={styles.verseCard}>
          <Text style={styles.verseRef}>2 Corinthians 5:7</Text>
          <Text style={styles.verseText}>“For we walk by faith, not by sight.”</Text>
        </Card>

        <Text style={styles.sectionTitle}>Latest Announcements</Text>
        {loading && <LoadingSpinner />}
        {error && <Text style={styles.error}>{error}</Text>}
        {showEmpty && <Text style={styles.empty}>No announcements yet. Check back soon.</Text>}

        {!showEmpty && (
          <View style={styles.announcementsList}>
            {announcements.map((item, index) => {
              const isFeatured = index === 0;
              return (
                <Pressable
                  key={item.ID || item.Title}
                  onPress={() => navigation.navigate('Announcements')}
                  style={isFeatured ? styles.featuredWrap : styles.tileWrap}
                >
                  <Card style={[styles.announcementCard, isFeatured && styles.featuredCard]}>
                    {item.ImageURL ? (
                      <ImageBackground
                        source={{ uri: item.ImageURL }}
                        style={[styles.announcementImage, isFeatured && styles.featuredImage]}
                        imageStyle={styles.announcementImageInner}
                      >
                        <View style={styles.announcementOverlay} />
                        <View style={styles.announcementTextWrap}>
                          <Text style={[styles.announcementTitle, styles.announcementTitleOnImage]}>
                            {item.Title}
                          </Text>
                          <Text style={[styles.announcementDate, styles.announcementDateOnImage]}>
                            {item.Date}
                          </Text>
                        </View>
                      </ImageBackground>
                    ) : (
                      <>
                        <Text style={styles.announcementTitle}>{item.Title}</Text>
                        <Text style={styles.announcementDate}>{item.Date}</Text>
                      </>
                    )}
                    {!isFeatured && (
                      <Text style={styles.announcementDetails} numberOfLines={2}>
                        {item.Details}
                      </Text>
                    )}
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gather With Us</Text>
        </View>
        <View style={styles.infoGrid}>
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Sunday Worship</Text>
            <Text style={styles.infoCopy}>9:00 AM • Main Sanctuary</Text>
            <Text style={styles.infoCopy}>Come early for coffee and prayer.</Text>
          </Card>
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Midweek Prayer</Text>
            <Text style={styles.infoCopy}>Wednesdays • 7:00 PM • Online & In-person</Text>
            <Text style={styles.infoCopy}>Standing in faith together for our city.</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Week at Church</Text>
        </View>
        <View style={styles.infoGrid}>
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Join a Life Group</Text>
            <Text style={styles.infoCopy}>Find community during the week. Connect with a leader to get started.</Text>
          </Card>
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Serve with Us</Text>
            <Text style={styles.infoCopy}>Use your gifts in worship, tech, kids, hospitality and more.</Text>
          </Card>
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Give Online</Text>
            <Text style={styles.infoCopy}>Partner with us to reach more people. Secure giving available.</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Sermon</Text>
        </View>
        <Card style={styles.sermonCard}>
          <Text style={styles.sermonTitle}>Walking by Faith</Text>
          <Text style={styles.sermonMeta}>Pastor Jacob • Jan 5</Text>
          <Pressable style={styles.sermonButton} onPress={() => navigation.navigate('Sermons')}>
            <MaterialCommunityIcons name="play" size={18} color={colors.white} />
            <Text style={styles.sermonButtonText}>Watch / Listen</Text>
          </Pressable>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stay Connected</Text>
        </View>
        <Card style={styles.connectCard}>
          <Text style={styles.connectCopy}>
            Follow us on social for updates, encouragement, and stories of what God is doing.
          </Text>
          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton}>
              <MaterialCommunityIcons name="facebook" size={20} color={colors.navy} />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <MaterialCommunityIcons name="instagram" size={20} color={colors.navy} />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <MaterialCommunityIcons name="youtube" size={20} color={colors.navy} />
            </Pressable>
          </View>
        </Card>
      </View>
      <Modal visible={showPrayer} transparent animationType="slide" onRequestClose={closePrayer}>
        <KeyboardAvoidingView
          style={styles.prayerOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.prayerCard}>
            <View style={styles.prayerHeader}>
              <Text style={styles.prayerTitle}>Send a Prayer Request</Text>
              <Pressable onPress={closePrayer} style={styles.prayerClose}>
                <MaterialCommunityIcons name="close" size={20} color={colors.navy} />
              </Pressable>
            </View>
            <Text style={styles.prayerSubtitle}>
              We would love to pray with you. Share your request below.
            </Text>
            <TextInput
              style={styles.prayerInput}
              placeholder="Full name"
              placeholderTextColor={colors.gray}
              value={prayerForm.name}
              onChangeText={(value) => updatePrayer('name', value)}
            />
            <TextInput
              style={styles.prayerInput}
              placeholder="Email address"
              placeholderTextColor={colors.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              value={prayerForm.email}
              onChangeText={(value) => updatePrayer('email', value)}
            />
            <TextInput
              style={styles.prayerInput}
              placeholder="Phone number"
              placeholderTextColor={colors.gray}
              keyboardType="phone-pad"
              value={prayerForm.phone}
              onChangeText={(value) => updatePrayer('phone', value)}
            />
            <TextInput
              style={[styles.prayerInput, styles.prayerInputMulti]}
              placeholder="Prayer request"
              placeholderTextColor={colors.gray}
              multiline
              value={prayerForm.request}
              onChangeText={(value) => updatePrayer('request', value)}
            />
            {prayerSent ? <Text style={styles.prayerSuccess}>Thank you. We will be praying.</Text> : null}
            {prayerError ? <Text style={styles.prayerError}>{prayerError}</Text> : null}
            <View style={styles.prayerActions}>
              <Pressable
                style={styles.prayerButton}
                onPress={submitPrayer}
                disabled={prayerLoading || prayerLocked}
              >
                <Text style={styles.prayerButtonText}>
                  {prayerLoading ? 'Submitting...' : 'Submit Request'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  },
  heroCard: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    minHeight: 220,
    justifyContent: 'flex-end',
  },
  heroImageInner: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 33, 50, 0.35)',
  },
  heroText: {
    padding: 18,
  },
  heroLabel: {
    color: colors.white,
    fontWeight: '700',
  },
  welcome: {
    fontSize: fonts.h1,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fonts.body,
    color: colors.white,
    opacity: 0.92,
    marginBottom: 16,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  heroPillText: {
    marginLeft: 6,
    color: colors.navy,
    fontWeight: '700',
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: fonts.h2,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 8,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickCard: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    width: '48%',
    minHeight: 110,
  },
  quickIcon: {
    backgroundColor: colors.gold,
    padding: 10,
    borderRadius: 12,
  },
  quickLabel: {
    color: colors.navy,
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
    flexShrink: 1,
  },
  verseCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  verseRef: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  verseText: {
    color: colors.navy,
  },
  messageCard: {
    marginBottom: 16,
  },
  messageImage: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginBottom: 12,
  },
  messageRef: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 6,
  },
  messageVerse: {
    color: colors.navy,
    marginBottom: 10,
  },
  messageBody: {
    color: colors.gray,
  },
  announcementsList: {
    gap: 12,
  },
  announcementCard: {
    width: '100%',
    padding: 14,
  },
  announcementImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  announcementTitle: {
    fontSize: fonts.h2,
    fontWeight: '700',
    color: colors.navy,
  },
  announcementDate: {
    fontSize: fonts.small,
    color: colors.gray,
    marginVertical: 4,
  },
  announcementDetails: {
    fontSize: fonts.body,
    color: colors.primary,
  },
  error: {
    color: colors.hotPink,
    marginBottom: 8,
  },
  empty: {
    color: colors.gray,
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    minWidth: 220,
  },
  infoTitle: {
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 6,
  },
  infoCopy: {
    color: colors.gray,
  },
  sermonCard: {
    padding: 16,
    borderRadius: 12,
  },
  sermonTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: colors.navy,
    marginBottom: 4,
  },
  sermonMeta: {
    color: colors.gray,
    marginBottom: 10,
  },
  sermonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    alignSelf: 'flex-start',
  },
  sermonButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  connectCard: {
    padding: 16,
    borderRadius: 12,
  },
  connectCopy: {
    color: colors.navy,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    backgroundColor: colors.gold,
    padding: 10,
    borderRadius: 10,
  },
  prayerOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  prayerCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayerTitle: {
    fontSize: fonts.h2,
    fontWeight: '800',
    color: colors.navy,
  },
  prayerClose: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  prayerSubtitle: {
    color: colors.gray,
    marginTop: 6,
    marginBottom: 12,
  },
  prayerInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.navy,
    backgroundColor: colors.cream,
    marginBottom: 10,
  },
  prayerInputMulti: {
    height: 120,
    textAlignVertical: 'top',
  },
  prayerActions: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  prayerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  prayerButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  prayerSuccess: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  prayerError: {
    color: colors.hotPink,
    fontWeight: '700',
    marginBottom: 8,
  },
});

export default HomeScreen;
