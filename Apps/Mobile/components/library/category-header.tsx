import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../constants/Colors';

type CategoryHeaderProps = {
  title: string;
  subtitle?: string;
  accentColor?: string;
};

export default function CategoryHeader({
  title,
  subtitle,
  accentColor = COLORS.accent,
}: CategoryHeaderProps) {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to library"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ChevronLeft color={COLORS.text} size={24} />
        </Pressable>

        <View style={styles.titleWrap}>
          <Text style={styles.subtitle}>LIBRARY</Text>
          <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        </View>

        <View style={styles.spacer} />
      </View>

      {subtitle ? <Text style={styles.description}>{subtitle}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  spacer: {
    width: 40,
    height: 40,
  },
  description: {
    color: COLORS.textMutedLight,
    fontSize: 13,
    paddingHorizontal: 20,
    paddingBottom: 14,
    textAlign: 'center',
  },
});
