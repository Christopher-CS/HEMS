import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ListPlus, Play, Volume2 } from 'lucide-react-native';
import COLORS from '../../constants/Colors';
import { formatDuration } from '../../data/media-library';
import type { LibraryActionType, MediaItem } from '../../types/media';

type MediaCardProps = {
  item: MediaItem;
  accentColor?: string;
  metaLines?: string[];
  onAction: (action: LibraryActionType) => void;
};

export default function MediaCard({
  item,
  accentColor = COLORS.accent,
  metaLines,
  onAction,
}: MediaCardProps) {
  const meta = metaLines ?? [item.subtitle, formatDuration(item.durationSeconds)];

  return (
    <View style={styles.card}>
      <View style={styles.main}>
        <View style={styles.artworkWrap}>
          {item.artworkUrl ? (
            <Image
              source={{ uri: item.artworkUrl }}
              style={styles.artwork}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.artwork, styles.artworkFallback]} />
          )}
        </View>

        <View style={styles.textContent}>
          <Text numberOfLines={1} style={styles.title} selectable>
            {item.title}
          </Text>
          {meta
            .filter((line): line is string => Boolean(line))
            .map((line, idx) => (
              <Text
                key={`${item.id}-meta-${idx}`}
                numberOfLines={1}
                style={[
                  styles.metaLine,
                  idx === 0 && styles.metaLinePrimary,
                ]}
              >
                {line}
              </Text>
            ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Play ${item.title}`}
          onPress={() => onAction('PLAY')}
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: accentColor },
            pressed && styles.pressed,
          ]}
        >
          <Play color={COLORS.text} size={18} strokeWidth={2.4} fill={COLORS.text} />
        </Pressable>
      </View>

      <View style={styles.secondaryRow}>
        <SecondaryAction
          label="Queue"
          icon={<ListPlus color={COLORS.textMutedLight} size={16} />}
          onPress={() => onAction('QUEUE')}
        />
        <SecondaryAction
          label="Preview"
          icon={<Volume2 color={COLORS.textMutedLight} size={16} />}
          onPress={() => onAction('PREVIEW')}
        />
      </View>
    </View>
  );
}

type SecondaryActionProps = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

function SecondaryAction({ label, icon, onPress }: SecondaryActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
    >
      {icon}
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artworkWrap: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 14,
    backgroundColor: COLORS.accentDeep,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  artworkFallback: {
    backgroundColor: COLORS.accentDeep,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaLine: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 1,
  },
  metaLinePrimary: {
    color: COLORS.textMutedLight,
    fontWeight: '500',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  secondaryRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    gap: 6,
  },
  secondaryLabel: {
    color: COLORS.textMutedLight,
    fontSize: 12,
    fontWeight: '600',
  },
});
