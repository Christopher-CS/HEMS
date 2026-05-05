import React, { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ChevronRight,
  Clapperboard,
  Mic2,
  Music,
  Play,
} from 'lucide-react-native';
import TopBar from '../../components/TopBar';
import StatusBanner from '../../components/StatusBanner';
import COLORS from '../../constants/Colors';
import { useDevices } from '../../hooks/useDevices';
import { useLibrary } from '../../hooks/useLibrary';
import { useTransport } from '../../hooks/useTransport';
import { buildLibraryCommand } from '../../utils/library-command-adapter';
import type { LibraryActionType, MediaCategory, MediaItem, RecentMediaRef } from '../../types/media';

type CategoryDef = {
  id: MediaCategory;
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  accent: string;
  tint: string;
  route: '/library/music' | '/library/movies' | '/library/podcasts';
};

export default function LibraryHub() {
  const router = useRouter();
  const { music, movies, podcasts, recents, loading, error, refresh } = useLibrary();
  const { primaryDeviceId } = useDevices();
  const { send } = useTransport();

  const dispatchLibrary = useCallback(
    (action: LibraryActionType, item: MediaItem | RecentMediaRef, durationSeconds?: number) => {
      const envelope = buildLibraryCommand(action, item, primaryDeviceId, durationSeconds);
      send(envelope).catch(() => {});
    },
    [primaryDeviceId, send]
  );

  const categories: CategoryDef[] = [
    {
      id: 'music',
      title: 'Music',
      description: 'Albums, tracks, and playlists',
      count: music.length,
      icon: <Music color={COLORS.text} size={24} />,
      accent: COLORS.accent,
      tint: COLORS.blueSoft,
      route: '/library/music',
    },
    {
      id: 'movies',
      title: 'Movies',
      description: 'Feature films ready to play',
      count: movies.length,
      icon: <Clapperboard color={COLORS.text} size={24} />,
      accent: COLORS.orange,
      tint: COLORS.orangeSoft,
      route: '/library/movies',
    },
    {
      id: 'podcasts',
      title: 'Podcasts',
      description: 'Episodes and shows',
      count: podcasts.length,
      icon: <Mic2 color={COLORS.text} size={24} />,
      accent: COLORS.purple,
      tint: COLORS.purpleSoft,
      route: '/library/podcasts',
    },
  ];

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introWrap}>
          <Text style={styles.introTitle}>Library</Text>
          <Text style={styles.introSubtitle}>
            Pick something to send to the theater room.
          </Text>
        </View>

        {loading && (
          <StatusBanner tone="loading" title="Loading library" detail="Fetching from backend" />
        )}
        {error && !loading && (
          <StatusBanner
            tone="error"
            title="Library failed to load"
            detail={`${error}. Showing seed content.`}
            onRetry={refresh}
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse</Text>
        </View>

        <View style={styles.categoryList}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${category.title}`}
              onPress={() => router.push(category.route)}
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.categoryIconWrap, { backgroundColor: category.tint }]}>
                {category.icon}
              </View>
              <View style={styles.categoryTextContent}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>{category.description}</Text>
              </View>
              <View style={styles.categoryMeta}>
                <Text style={[styles.categoryCount, { color: category.accent }]}>
                  {category.count}
                </Text>
                <ChevronRight color={COLORS.muted} size={20} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue</Text>
          <Text style={styles.sectionHint}>Recently played</Text>
        </View>

        {recents.length === 0 ? (
          <Text style={styles.emptyHint}>Nothing yet — play something to start your history.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentsScroll}
          >
            {recents.map((recent) => (
              <RecentCard
                key={recent.id}
                recent={recent}
                onPress={() => dispatchLibrary('PLAY', recent, recent.durationSeconds)}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
        </View>

        <View style={styles.quickActionList}>
          <QuickAction
            label="Shuffle all music"
            description="Pick a random track to start"
            accent={COLORS.accent}
            tint={COLORS.blueSoft}
            icon={<Music color={COLORS.accent} size={20} />}
            onPress={() => {
              if (music.length === 0) return;
              const pick = music[Math.floor(Math.random() * music.length)];
              dispatchLibrary('PLAY', pick, pick.durationSeconds);
            }}
          />
          <QuickAction
            label="Resume last movie"
            description="Jump back into your most recent film"
            accent={COLORS.orange}
            tint={COLORS.orangeSoft}
            icon={<Clapperboard color={COLORS.orange} size={20} />}
            onPress={() => {
              const firstMovieRecent = recents.find((media) => media.category === 'movies');
              if (firstMovieRecent) {
                dispatchLibrary('PLAY', firstMovieRecent, firstMovieRecent.durationSeconds);
              }
            }}
          />
          <QuickAction
            label="Queue latest episode"
            description="Most recently published podcast"
            accent={COLORS.purple}
            tint={COLORS.purpleSoft}
            icon={<Mic2 color={COLORS.purple} size={20} />}
            onPress={() => {
              const latest = podcasts[podcasts.length - 1];
              if (latest) dispatchLibrary('QUEUE', latest, latest.durationSeconds);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

type QuickActionProps = {
  label: string;
  description: string;
  accent: string;
  tint: string;
  icon: React.ReactNode;
  onPress: () => void;
};

function QuickAction({
  label,
  description,
  accent,
  tint,
  icon,
  onPress,
}: QuickActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.quickActionCard, pressed && styles.pressed]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: tint }]}>{icon}</View>
      <View style={styles.quickActionText}>
        <Text style={styles.quickActionLabel}>{label}</Text>
        <Text style={styles.quickActionDescription}>{description}</Text>
      </View>
      <View style={[styles.quickActionTrailing, { backgroundColor: accent }]}>
        <Play color={COLORS.text} size={14} strokeWidth={2.4} fill={COLORS.text} />
      </View>
    </Pressable>
  );
}

function RecentCard({ recent, onPress }: { recent: RecentMediaRef; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Resume ${recent.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.recentCard, pressed && styles.pressed]}
    >
      <View style={styles.recentArtworkWrap}>
        {recent.artworkUrl ? (
          <Image
            source={{ uri: recent.artworkUrl }}
            style={styles.recentArtwork}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.recentArtwork, styles.recentArtworkFallback]} />
        )}
        <View style={styles.recentOverlay} />
        <View style={styles.recentPlayBadge}>
          <Play color={COLORS.text} size={18} strokeWidth={2.4} fill={COLORS.text} />
        </View>
      </View>
      <View style={styles.recentText}>
        <Text numberOfLines={1} style={styles.recentTitle}>
          {recent.title}
        </Text>
        <Text numberOfLines={1} style={styles.recentSubtitle}>
          {recent.subtitle}
        </Text>
        {typeof recent.progress === 'number' && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(recent.progress * 100)}%` },
              ]}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  introWrap: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 4,
  },
  introTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  introSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHint: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyHint: {
    paddingHorizontal: 20,
    color: COLORS.muted,
    fontSize: 13,
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  categoryTextContent: {
    flex: 1,
  },
  categoryTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  categorySubtitle: {
    color: COLORS.muted,
    fontSize: 12,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryCount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  recentsScroll: {
    paddingHorizontal: 12,
    paddingRight: 20,
    gap: 12,
  },
  recentCard: {
    width: 180,
    marginHorizontal: 8,
  },
  recentArtworkWrap: {
    width: 180,
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.accentDeep,
  },
  recentArtwork: {
    width: '100%',
    height: '100%',
  },
  recentArtworkFallback: {
    backgroundColor: COLORS.accentDeep,
  },
  recentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlayDark,
  },
  recentPlayBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentText: {
    marginTop: 10,
  },
  recentTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  recentSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    marginTop: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  quickActionList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickActionDescription: {
    color: COLORS.muted,
    fontSize: 12,
  },
  quickActionTrailing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
