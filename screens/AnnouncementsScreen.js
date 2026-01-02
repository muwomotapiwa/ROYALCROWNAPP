import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View, ImageBackground, ScrollView } from 'react-native';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, fonts } from '../constants/colors';
import { fetchData } from '../services/api';

const AnnouncementsScreen = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchData('announcements');
        setAnnouncements(data);
      } catch (e) {
        setError('Could not load announcements');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const empty = announcements.length === 0;
  const featured = useMemo(() => announcements[0], [announcements]);
  const others = useMemo(() => announcements.slice(1), [announcements]);

  if (loading) return <LoadingSpinner label="Loading announcements" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={others}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        keyExtractor={(item, index) => `${item.ID || index}`}
        ListHeaderComponent={
          featured ? (
            <Pressable onPress={() => setSelected(featured)} style={styles.featuredWrap}>
              <Card style={styles.featuredCard}>
                <ImageBackground
                  source={{ uri: featured.ImageURL }}
                  style={styles.featuredImage}
                  imageStyle={styles.featuredImageInner}
                >
                  <View style={styles.overlay} />
                  <View style={styles.featuredText}>
                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {featured.Title}
                    </Text>
                    <Text style={styles.featuredDate}>{featured.Date}</Text>
                  </View>
                </ImageBackground>
              </Card>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)} style={styles.tileWrap}>
            <Card style={styles.card}>
              <ImageBackground
                source={{ uri: item.ImageURL }}
                style={styles.tileImage}
                imageStyle={styles.tileImageInner}
              >
                <View style={styles.overlay} />
                <View style={styles.tileText}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.Title}
                  </Text>
                  <Text style={styles.date}>{item.Date}</Text>
                </View>
              </ImageBackground>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No announcements yet.</Text>}
      />

      <Modal transparent visible={!!selected} animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selected?.Title}</Text>
            <Text style={styles.modalDate}>{selected?.Date}</Text>
            <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={styles.modalBody}>{selected?.Details}</Text>
            </ScrollView>
            <Pressable style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  columnWrapper: {
    gap: 12,
  },
  featuredWrap: {
    marginBottom: 12,
  },
  featuredCard: {
    padding: 0,
    overflow: 'hidden',
  },
  featuredImage: {
    height: 200,
    width: '100%',
    justifyContent: 'flex-end',
  },
  featuredImageInner: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 33, 50, 0.35)',
  },
  featuredText: {
    padding: 14,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  featuredDate: {
    color: colors.white,
    opacity: 0.85,
  },
  tileWrap: {
    flex: 1,
  },
  card: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  tileImage: {
    height: 150,
    width: '100%',
    justifyContent: 'flex-end',
  },
  tileImageInner: {
    resizeMode: 'cover',
  },
  tileText: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  date: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: fonts.h2,
    fontWeight: '700',
    color: colors.navy,
  },
  modalDate: {
    color: colors.gray,
    marginVertical: 6,
  },
  modalScroll: {
    marginTop: 8,
    marginBottom: 12,
  },
  modalBody: {
    color: colors.navy,
    fontSize: fonts.body,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: {
    color: colors.white,
    fontWeight: '700',
  },
  error: {
    margin: 16,
    color: colors.hotPink,
  },
  empty: {
    color: colors.gray,
    marginTop: 16,
  },
});

export default AnnouncementsScreen;
