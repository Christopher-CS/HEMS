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
import StatusBanner from '../../components/StatusBanner';
import COLORS from '../../constants/Colors';
import { formatDuration } from '../../data/media-library';
import { useDevices } from '../../hooks/useDevices';
import { useLibrary } from '../../hooks/useLibrary';
import { useTransport } from '../../hooks/useTransport';
import { buildLibraryCommand } from '../../utils/library-command-adapter';
import type { Movie } from '../../types/media';

const ACCENT = COLORS.orange;

export default function MoviesPage() {
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const { movies, loading, error, refresh } = useLibrary();
  const { primaryDeviceId } = useDevices();
  const { send } = useTransport();

  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((movie) => {
      if (movie.genre) set.add(movie.genre);
    });
    return ['All', ...Array.from(set)];
  }, [movies]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies.filter((movie) => {
      const matchesGenre = activeGenre === 'All' || movie.genre === activeGenre;
      if (!matchesGenre) return false;
      if (!q) return true;
      return (
        movie.title.toLowerCase().includes(q) ||
        movie.director.toLowerCase().includes(q) ||
        String(movie.year).includes(q)
      );
    });
  }, [query, activeGenre, movies]);

  const renderItem = ({ item }: { item: Movie }) => (
    <MediaCard
      item={item}
      accentColor={ACCENT}
      metaLines={[
        `${item.year} · ${item.director}`,
        `${formatDuration(item.durationSeconds)}${item.rating ? ` · ${item.rating}` : ''}`,
      ]}
      onAction={(action) => {
        const envelope = buildLibraryCommand(action, item, primaryDeviceId, item.durationSeconds);
        send(envelope).catch(() => {});
      }}
    />
  );

  return (
    <View style={styles.container}>
      <CategoryHeader
        title="Movies"
        subtitle={`${movies.length} films available for the projector`}
        accentColor={ACCENT}
      />

      {loading && <StatusBanner tone="loading" title="Loading movies" />}
      {error && !loading && (
        <StatusBanner
          tone="error"
          title="Couldn't load movies"
          detail={error}
          onRetry={refresh}
        />
      )}

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
