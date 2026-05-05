import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import COLORS from '../../constants/Colors';
import { hslToHex, HUE_STRIP_SEGMENTS, HUE_SWATCHES } from '../../utils/color';

type Props = {
  hue: number;
  saturation: number;
  onChange: (hue: number, saturation: number) => void;
  onCommit: (hue: number, saturation: number) => void;
};

export default function ColorPicker({ hue, saturation, onChange, onCommit }: Props) {
  const currentHex = hslToHex(hue, saturation);

  return (
    <View style={styles.root}>
      <View style={styles.previewRow}>
        <View style={[styles.previewBig, { backgroundColor: currentHex }]} />
        <View>
          <Text style={styles.hexLabel}>HEX</Text>
          <Text style={styles.hexValue}>{currentHex.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.label}>HUE</Text>
      <View style={styles.hueStrip}>
        {HUE_STRIP_SEGMENTS.map((color, i) => (
          <View key={`${color}-${i}`} style={[styles.hueSegment, { backgroundColor: color }]} />
        ))}
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={359}
        step={1}
        value={hue}
        onValueChange={(val) => onChange(val, saturation)}
        onSlidingComplete={(val) => onCommit(val, saturation)}
        minimumTrackTintColor={hslToHex(hue, 90, 55)}
        maximumTrackTintColor={COLORS.surfaceAlt}
        thumbTintColor={COLORS.text}
      />

      <Text style={styles.label}>SATURATION</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={saturation}
        onValueChange={(val) => onChange(hue, val)}
        onSlidingComplete={(val) => onCommit(hue, val)}
        minimumTrackTintColor={hslToHex(hue, saturation, 55)}
        maximumTrackTintColor={COLORS.surfaceAlt}
        thumbTintColor={COLORS.text}
      />

      <Text style={styles.label}>QUICK PICK</Text>
      <View style={styles.swatchRow}>
        {HUE_SWATCHES.map((swatchHue) => {
          const hex = hslToHex(swatchHue, 90, 55);
          const active = swatchHue === Math.round(hue);
          return (
            <Pressable
              key={swatchHue}
              accessibilityRole="button"
              accessibilityLabel={`Set color hue ${swatchHue}`}
              onPress={() => onCommit(swatchHue, Math.max(60, saturation))}
              style={({ pressed }) => [
                styles.swatch,
                { backgroundColor: hex, borderColor: active ? COLORS.text : 'transparent' },
                pressed && styles.pressed,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 8,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  previewBig: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.surfaceAlt,
  },
  hexLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  hexValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 6,
  },
  hueStrip: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hueSegment: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 32,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
