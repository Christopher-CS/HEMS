import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search } from 'lucide-react-native';
import CategoryHeader from '../../components/library/category-header';
import MediaCard from '../../components/library/media-card';
import COLORS from '../../constants/Colors';
import { PODCAST_EPISODES, formatDuration } from '../../data/media-library';
import { emitLibraryCommand } from '../../utils/library-command-adapter';
import type { PodcastEpisode } from '../../types/media';

const ACCENT = COLORS.purple;

export default function PodcastsPage() {
  const [query, setQuery] = useState('');
  const [activeShow, setActiveShow] = useState<string>('All');

  const shows = useMemo(() => {
    const set = new Set<string>();
    PODCAST_EPISODES.forEach((episode) => set.add(episode.showName));
    return ['All', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PODCAST_EPISODES.filter((episode) => {
      const matchesShow = activeShow === 'All' || episode.showName === activeShow;
      if (!matchesShow) return false;
      if (!q) return true;
      return (
        episode.title.toLowerCase().includes(q) ||
        episode.showName.toLowerCase().includes(q)
      );
    });
  }, [query, activeShow]);

  const renderItem = ({ item }: { item: PodcastEpisode }) => (
    <MediaCard
      item={item}
      accentColor={ACCENT}
      metaLines={[
        item.episodeNumber
          ? `${item.showName} · Ep ${item.episodeNumber}`
          : item.showName,
        `${formatDuration(item.durationSeconds)}${item.publishedOn ? ` · ${item.publishedOn}` : ''}`,
      ]}
      onAction={(action) => emitLibraryCommand(action, item, item.durationSeconds)}
    />
  );

  return (
    <View style={styles.container}>
      <CategoryHeader
        title="Podcasts"
        subtitle={`${PODCAST_EPISODES.length} episodes ready for the room`}
        accentColor={ACCENT}
      />

      <View style={styles.searchRow}>
        <Search color={COLORS.muted} size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search episodes or shows"
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsList}
        contentContainerStyle={styles.chipsRow}
        data={shows}
        keyExtractor={(s) => s}
        renderItem={({ item: show }) => {
          const active = show === activeShow;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${show}`}
              onPress={() => setActiveShow(show)}
              style={({ pressed }) => [
                styles.chip,
                active && { backgroundColor: ACCENT, borderColor: ACCENT },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {show}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No episodes match</Text>
            <Text style={styles.emptyBody}>
              Try a different search or pick another show.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  chipsList: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipsRow: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
    backgroundColor: COLORS.surface,
  },
  chipLabel: {
    color: COLORS.textMutedLight,
    fontSize: 13,
    fontWeight: '500',
  },
  chipLabelActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyBody: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
