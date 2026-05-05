import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, CheckCircle2, RefreshCcw } from 'lucide-react-native';
import COLORS from '../constants/Colors';

type Tone = 'info' | 'success' | 'error' | 'loading';

type StatusBannerProps = {
  tone: Tone;
  title: string;
  detail?: string;
  onRetry?: () => void;
};

const TONE_STYLES: Record<Tone, { background: string; border: string; text: string }> = {
  info: {
    background: 'rgba(76, 101, 228, 0.10)',
    border: COLORS.accent,
    text: COLORS.text,
  },
  success: {
    background: 'rgba(76, 175, 80, 0.10)',
    border: COLORS.online,
    text: COLORS.text,
  },
  error: {
    background: 'rgba(243, 87, 87, 0.10)',
    border: COLORS.danger,
    text: COLORS.text,
  },
  loading: {
    background: COLORS.surface,
    border: COLORS.surfaceAlt,
    text: COLORS.text,
  },
};

export default function StatusBanner({ tone, title, detail, onRetry }: StatusBannerProps) {
  const palette = TONE_STYLES[tone];

  return (
    <View
      style={[styles.container, { backgroundColor: palette.background, borderColor: palette.border }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.iconWrap}>
        {tone === 'loading' ? (
          <ActivityIndicator color={COLORS.accent} size="small" />
        ) : tone === 'error' ? (
          <AlertTriangle color={COLORS.danger} size={18} />
        ) : (
          <CheckCircle2 color={tone === 'success' ? COLORS.online : COLORS.accent} size={18} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
          {title}
        </Text>
        {detail ? (
          <Text style={styles.detail} numberOfLines={2}>
            {detail}
          </Text>
        ) : null}
      </View>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry"
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <RefreshCcw color={COLORS.accent} size={16} />
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  detail: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceAlt,
  },
  retryLabel: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
