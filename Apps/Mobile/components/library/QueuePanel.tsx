import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp, ListMusic, Play, X } from 'lucide-react-native';
import COLORS from '../../constants/Colors';
import type { QueuedMedia } from '../../state/playback/store';
import { formatDuration } from '../../data/media-library';

type QueuePanelProps = {
  currentItem?: QueuedMedia | null;
  queue: QueuedMedia[];
  onPlay: (index: number) => void;
  onRemove: (index: number) => void;
  onRemoveCurrent?: () => void;
  onClear: () => void;
  title?: string;
  emptyLabel?: string;
};

export default function QueuePanel({
  currentItem = null,
  queue,
  onPlay,
  onRemove,
  onRemoveCurrent,
  onClear,
  title = 'Queue',
  emptyLabel = 'Queue songs to line them up here.',
}: QueuePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const totalItems = queue.length + (currentItem ? 1 : 0);
  const previewItem = currentItem ?? queue[0] ?? null;
  const subtitle = useMemo(() => {
    if (totalItems === 0) return 'No queued items';
    if (currentItem) return `${totalItems} in line`;
    return `${queue.length} queued`;
  }, [currentItem, queue.length, totalItems]);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? `Collapse ${title}` : `Expand ${title}`}
        onPress={() => setExpanded((value) => !value)}
        style={({ pressed }) => [styles.headerPressable, pressed && styles.pressed]}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <View style={styles.headerIconWrap}>
              <ListMusic color={COLORS.accent} size={18} />
            </View>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {queue.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear queue"
                onPress={onClear}
                style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
              >
                <Text style={styles.clearLabel}>Clear</Text>
              </Pressable>
            ) : null}
            {expanded ? (
              <ChevronUp color={COLORS.muted} size={18} />
            ) : (
              <ChevronDown color={COLORS.muted} size={18} />
            )}
          </View>
        </View>
      </Pressable>

      {!expanded ? (
        <View style={styles.collapsedPreview}>
          <Text numberOfLines={1} style={styles.previewTitle}>
            {previewItem?.title ?? title}
          </Text>
          <Text numberOfLines={1} style={styles.previewSubtitle}>
            {previewItem
              ? currentItem
                ? `Now playing · ${previewItem.subtitle ?? formatDuration(previewItem.durationSeconds)}`
                : `Next up · ${previewItem.subtitle ?? formatDuration(previewItem.durationSeconds)}`
              : emptyLabel}
          </Text>
        </View>
      ) : totalItems === 0 ? (
        <Text style={styles.emptyLabel}>{emptyLabel}</Text>
      ) : (
        <ScrollView style={styles.scrollArea} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          <View style={styles.list}>
            {currentItem ? (
              <View style={[styles.row, styles.currentRow]}>
                <View style={[styles.orderBadge, styles.currentBadge]}>
                  <Text style={styles.orderText}>Now</Text>
                </View>

                <View style={styles.textWrap}>
                  <Text numberOfLines={1} style={styles.itemTitle}>
                    {currentItem.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.itemSubtitle}>
                    {currentItem.subtitle ?? formatDuration(currentItem.durationSeconds)}
                  </Text>
                </View>

                <Text style={styles.duration}>{formatDuration(currentItem.durationSeconds)}</Text>

                {onRemoveCurrent ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${currentItem.title}`}
                    onPress={onRemoveCurrent}
                    style={({ pressed }) => [styles.iconButton, styles.removeButton, pressed && styles.pressed]}
                  >
                    <X color={COLORS.textMutedLight} size={15} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {queue.map((item, index) => (
              <View key={`${item.mediaId}-${index}`} style={styles.row}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderText}>{index + 1}</Text>
                </View>

                <View style={styles.textWrap}>
                  <Text numberOfLines={1} style={styles.itemTitle}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.itemSubtitle}>
                    {item.subtitle ?? formatDuration(item.durationSeconds)}
                  </Text>
                </View>

                <Text style={styles.duration}>{formatDuration(item.durationSeconds)}</Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Play ${item.title}`}
                  onPress={() => onPlay(index)}
                  style={({ pressed }) => [styles.iconButton, styles.playButton, pressed && styles.pressed]}
                >
                  <Play color={COLORS.text} size={14} fill={COLORS.text} />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.title} from queue`}
                  onPress={() => onRemove(index)}
                  style={({ pressed }) => [styles.iconButton, styles.removeButton, pressed && styles.pressed]}
                >
                  <X color={COLORS.textMutedLight} size={15} />
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
  },
  headerPressable: {
    borderRadius: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 1,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearLabel: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  collapsedPreview: {
    marginTop: 10,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  previewTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  previewSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  emptyLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 10,
  },
  scrollArea: {
    maxHeight: 260,
    marginTop: 10,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  currentRow: {
    borderWidth: 1,
    borderColor: COLORS.accentDeep,
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accentDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  currentBadge: {
    width: 40,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
  },
  orderText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  itemSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  duration: {
    color: COLORS.textMutedLight,
    fontSize: 11,
    marginRight: 8,
    fontVariant: ['tabular-nums'],
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  playButton: {
    backgroundColor: COLORS.accent,
  },
  removeButton: {
    backgroundColor: COLORS.background,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
