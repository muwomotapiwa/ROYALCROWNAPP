import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, fonts } from '../constants/colors';
import { fetchData } from '../services/api';

const DevotionalScreen = () => {
  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchData('devotionals');
        setDevotionals(data);
      } catch (e) {
        setError('Could not load devotionals');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const featured = useMemo(() => devotionals[0], [devotionals]);
  const others = useMemo(() => devotionals.slice(1), [devotionals]);

  if (loading) return <LoadingSpinner label="Loading devotionals" />;
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
            <Card style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <Text style={styles.sectionLabel}>Weekly Devotionals</Text>
                <View style={styles.memoryRow}>
                  <MaterialCommunityIcons name="book-open-variant" size={16} color={colors.primary} />
                  <Text style={styles.memoryLabel}>Memory Verse:</Text>
                  <Text style={styles.memoryVerse}>{featured.Verse}</Text>
                </View>
                <Text style={styles.weekText}>Week: {featured.Date}</Text>
              </View>
              <View style={styles.heroBody}>
                <Text style={styles.heroTitle}>{featured.Title}</Text>
                <View style={styles.heroVerseBox}>
                  <Text style={styles.heroVerse}>{featured.Verse}</Text>
                </View>
                <Text style={styles.heroContent}>{featured.Content}</Text>
              </View>
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable style={styles.tileWrap} onPress={() => setSelected(item)}>
            <Card style={styles.card}>
              <View style={styles.tileDate}>
                <Text style={styles.tileMonth}>Week</Text>
                <Text style={styles.tileDay}>{item.Date}</Text>
              </View>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.Title}</Text>
              </View>
              <Text style={styles.cardDate} numberOfLines={1}>{item.Verse}</Text>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No devotionals yet.</Text>
          </View>
        }
      />

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalContainer}>
          <ImageBackground
            source={{ uri: 'https://af6815798a.imgdist.com/pub/bfra/knkjywkm/k05/6jc/1hl/banner%20Image.png' }}
            style={styles.modalBanner}
            imageStyle={styles.modalBannerImage}
          />
          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>{selected?.Title}</Text>
            <Text style={styles.modalDate}>{selected?.Date}</Text>
            <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 80 }}>
              <View style={styles.modalVerseBox}>
                <Text style={styles.modalVerse}>{selected?.Verse}</Text>
              </View>
              <Text style={styles.modalContent}>{selected?.Content}</Text>
            </ScrollView>
          </View>
          <Pressable style={styles.modalCloseFab} onPress={() => setSelected(null)}>
            <MaterialCommunityIcons name="close" size={22} color={colors.white} />
            <Text style={styles.modalCloseText}>Close</Text>
          </Pressable>
        </View>
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
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  heroCard: {
    width: '100%',
    maxWidth: 650,
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  heroHeader: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: fonts.h2,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 6,
  },
  memoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  memoryLabel: {
    fontWeight: '700',
    color: colors.hotPink,
  },
  memoryVerse: {
    color: colors.navy,
    fontWeight: '600',
  },
  weekText: {
    color: colors.gray,
    marginTop: 4,
  },
  heroBody: {
    marginTop: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 8,
  },
  heroVerseBox: {
    backgroundColor: '#fdf3db',
    borderColor: colors.gold,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  heroVerse: {
    color: colors.primary,
    fontWeight: '700',
  },
  heroContent: {
    color: colors.navy,
    fontSize: fonts.body,
    lineHeight: 20,
  },
  tileWrap: {
    flex: 1,
  },
  card: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 14,
    minHeight: 140,
    justifyContent: 'space-between',
    padding: 12,
  },
  tileDate: {
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  tileMonth: {
    color: colors.navy,
    fontWeight: '700',
    fontSize: 10,
  },
  tileDay: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  cardHeader: {
    marginBottom: 4,
  },
  cardTitle: {
    color: colors.white,
    fontWeight: '800',
    flex: 1,
  },
  cardDate: {
    color: colors.white,
    opacity: 0.85,
    fontSize: 12,
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
  emptyText: {
    color: colors.gray,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingTop: 0,
  },
  modalBanner: {
    height: 180,
    backgroundColor: colors.primary,
  },
  modalBannerImage: {
    resizeMode: 'cover',
  },
  modalInner: {
    flex: 1,
    padding: 16,
    marginTop: -30,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  modalDate: {
    color: colors.gray,
    marginBottom: 12,
  },
  modalBody: {
    flex: 1,
  },
  modalVerseBox: {
    backgroundColor: '#fdf3db',
    borderColor: colors.gold,
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  modalVerse: {
    color: colors.primary,
    fontWeight: '700',
  },
  modalContent: {
    color: colors.navy,
    fontSize: 15,
    lineHeight: 22,
  },
  modalCloseFab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  modalCloseText: {
    color: colors.white,
    fontWeight: '700',
  },
});

export default DevotionalScreen;
