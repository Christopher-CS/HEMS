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
import { MOVIES, formatDuration } from '../../data/media-library';
import { emitLibraryCommand } from '../../utils/library-command-adapter';
import type { Movie } from '../../types/media';

const ACCENT = COLORS.orange;

export default function MoviesPage() {
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string>('All');

  const genres = useMemo(() => {
    const set = new Set<string>();
    MOVIES.forEach((movie) => {
      if (movie.genre) set.add(movie.genre);
    });
    return ['All', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOVIES.filter((movie) => {
      const matchesGenre = activeGenre === 'All' || movie.genre === activeGenre;
      if (!matchesGenre) return false;
      if (!q) return true;
      return (
        movie.title.toLowerCase().includes(q) ||
        movie.director.toLowerCase().includes(q) ||
        String(movie.year).includes(q)
      );
    });
  }, [query, activeGenre]);

  const renderItem = ({ item }: { item: Movie }) => (
    <MediaCard
      item={item}
      accentColor={ACCENT}
      metaLines={[
        `${item.year} · ${item.director}`,
        `${formatDuration(item.durationSeconds)}${item.rating ? ` · ${item.rating}` : ''}`,
      ]}
      onAction={(action) => emitLibraryCommand(action, item, item.durationSeconds)}
    />
  );

  return (
    <View style={styles.container}>
      <CategoryHeader
        title="Movies"
        subtitle={`${MOVIES.length} films available for the projector`}
        accentColor={ACCENT}
      />

      <View style={styles.searchRow}>
        <Search color={COLORS.muted} size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search titles, directors, years"
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
        data={genres}
        keyExtractor={(g) => g}
        renderItem={({ item: genre }) => {
          const active = genre === activeGenre;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${genre}`}
              onPress={() => setActiveGenre(genre)}
              style={({ pressed }) => [
                styles.chip,
                active && { backgroundColor: ACCENT, borderColor: ACCENT },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {genre}
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
            <Text style={styles.emptyTitle}>No films match</Text>
            <Text style={styles.emptyBody}>
              Try a different search term or genre filter.
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
