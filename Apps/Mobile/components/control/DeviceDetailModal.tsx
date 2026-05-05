import React, { useCallback, useMemo } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import {
  Lightbulb,
  Power,
  Speaker,
  Trash2,
  Tv,
  X,
} from 'lucide-react-native';
import COLORS from '../../constants/Colors';
import type { ColorMode, DeviceSnapshot } from '../../state/devices/store';
import { hslToHex, kelvinToHex } from '../../utils/color';
import ColorPicker from './ColorPicker';

type Props = {
  visible: boolean;
  device: DeviceSnapshot | null;
  onClose: () => void;
  onToggle: (deviceId: string, enabled: boolean) => void;
  onLevelChange: (deviceId: string, level: number) => void;
  onLevelCommit: (deviceId: string, level: number) => void;
  onColorModeChange: (deviceId: string, mode: ColorMode) => void;
  onTemperatureChange: (deviceId: string, kelvin: number) => void;
  onTemperatureCommit: (deviceId: string, kelvin: number) => void;
  onColorChange: (deviceId: string, hue: number, saturation: number) => void;
  onColorCommit: (deviceId: string, hue: number, saturation: number) => void;
  onSourceChange: (deviceId: string, source: string) => void;
  onRemove?: (deviceId: string) => void;
};

const KIND_META: Record<DeviceSnapshot['kind'], { iconColor: string; bg: string; levelLabel: string }> = {
  tv: { iconColor: COLORS.tv, bg: COLORS.blueSoft, levelLabel: 'Volume' },
  light: { iconColor: COLORS.light, bg: COLORS.orangeSoft, levelLabel: 'Brightness' },
  speaker: { iconColor: COLORS.speaker, bg: COLORS.purpleSoft, levelLabel: 'Volume' },
  generic: { iconColor: COLORS.accent, bg: 'rgba(76, 101, 228, 0.15)', levelLabel: 'Level' },
};

function KindIcon({ kind, color }: { kind: DeviceSnapshot['kind']; color: string }) {
  const props = { color, size: 26 };
  switch (kind) {
    case 'tv':
      return <Tv {...props} />;
    case 'light':
      return <Lightbulb {...props} />;
    case 'speaker':
      return <Speaker {...props} />;
    default:
      return <Power {...props} />;
  }
}

export default function DeviceDetailModal(props: Props) {
  const { visible, device, onClose } = props;
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;

  const meta = device ? KIND_META[device.kind] : KIND_META.generic;

  const previewColor = useMemo(() => {
    if (!device || device.kind !== 'light') return null;
    if (device.colorMode === 'color') {
      return hslToHex(device.hue ?? 0, device.saturation ?? 80);
    }
    return kelvinToHex(device.colorTemperatureK ?? 4000);
  }, [device]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!device) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.root} />
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} accessibilityLabel="Close device details" onPress={handleClose} />
        <View
          style={[
            styles.sheet,
            {
              paddingLeft: Math.max(20, insets.left),
              paddingRight: Math.max(20, insets.right),
              paddingBottom: 16 + insets.bottom,
              maxHeight: windowHeight * 0.9,
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
              <KindIcon kind={device.kind} color={device.enabled ? meta.iconColor : COLORS.muted} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{device.name}</Text>
              <Text style={styles.subtitle}>{device.subtitle}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={handleClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <X color={COLORS.muted} size={20} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.row}>
              <View style={styles.rowLabel}>
                <Power color={device.enabled ? meta.iconColor : COLORS.muted} size={18} />
                <Text style={styles.rowText}>Power</Text>
              </View>
              <Switch
                value={device.enabled}
                onValueChange={(val) => props.onToggle(device.id, val)}
                trackColor={{ false: COLORS.surfaceAlt, true: meta.iconColor }}
                thumbColor={COLORS.text}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{meta.levelLabel}</Text>
                <Text style={styles.sectionValue}>{device.level}%</Text>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={device.level}
                onValueChange={(val) => props.onLevelChange(device.id, val)}
                onSlidingComplete={(val) => props.onLevelCommit(device.id, val)}
                minimumTrackTintColor={device.enabled ? meta.iconColor : COLORS.surfaceAlt}
                maximumTrackTintColor={COLORS.surfaceAlt}
                thumbTintColor={COLORS.text}
              />
            </View>

            {device.kind === 'light' && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Light Mode</Text>
                  {previewColor ? (
                    <View style={[styles.previewSwatch, { backgroundColor: previewColor }]} />
                  ) : null}
                </View>

                <View style={styles.segmented}>
                  {(['white', 'color'] as ColorMode[]).map((mode) => {
                    const active = (device.colorMode ?? 'white') === mode;
                    return (
                      <Pressable
                        key={mode}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => props.onColorModeChange(device.id, mode)}
                        style={({ pressed }) => [
                          styles.segment,
                          active && styles.segmentActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                          {mode === 'white' ? 'White' : 'Color'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {(device.colorMode ?? 'white') === 'white' ? (
                  <View style={styles.subSection}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionSubtitle}>Color Balance</Text>
                      <Text style={styles.sectionValue}>{device.colorTemperatureK ?? 4000}K</Text>
                    </View>
                    <View style={styles.tempStrip}>
                      <View style={[styles.tempSwatch, { backgroundColor: kelvinToHex(2700) }]} />
                      <View style={[styles.tempSwatch, { backgroundColor: kelvinToHex(3500) }]} />
                      <View style={[styles.tempSwatch, { backgroundColor: kelvinToHex(4500) }]} />
                      <View style={[styles.tempSwatch, { backgroundColor: kelvinToHex(5500) }]} />
                      <View style={[styles.tempSwatch, { backgroundColor: kelvinToHex(6500) }]} />
                    </View>
                    <Slider
                      style={{ width: '100%', height: 40 }}
                      minimumValue={2700}
                      maximumValue={6500}
                      step={100}
                      value={device.colorTemperatureK ?? 4000}
                      onValueChange={(val) => props.onTemperatureChange(device.id, val)}
                      onSlidingComplete={(val) => props.onTemperatureCommit(device.id, val)}
                      minimumTrackTintColor={kelvinToHex(2700)}
                      maximumTrackTintColor={kelvinToHex(6500)}
                      thumbTintColor={COLORS.text}
                    />
                    <View style={styles.tempLabelRow}>
                      <Text style={styles.tempLabel}>Warm</Text>
                      <Text style={styles.tempLabel}>Cool</Text>
                    </View>
                  </View>
                ) : (
                  <ColorPicker
                    hue={device.hue ?? 0}
                    saturation={device.saturation ?? 80}
                    onChange={(hue, saturation) => props.onColorChange(device.id, hue, saturation)}
                    onCommit={(hue, saturation) => props.onColorCommit(device.id, hue, saturation)}
                  />
                )}
              </View>
            )}

            {device.availableSources && device.availableSources.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Input Source</Text>
                  {device.inputSource ? (
                    <Text style={styles.sectionValue}>{device.inputSource}</Text>
                  ) : null}
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sourcesRow}
                >
                  {device.availableSources.map((source) => {
                    const active = device.inputSource === source;
                    return (
                      <Pressable
                        key={source}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => props.onSourceChange(device.id, source)}
                        style={({ pressed }) => [
                          styles.sourceChip,
                          active && styles.sourceChipActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.sourceChipLabel, active && styles.sourceChipLabelActive]}>
                          {source}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {props.onRemove && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Disconnect ${device.name}`}
                onPress={() => {
                  props.onRemove?.(device.id);
                  handleClose();
                }}
                style={({ pressed }) => [styles.removeRow, pressed && styles.pressed]}
              >
                <Trash2 color={COLORS.danger} size={18} />
                <Text style={styles.removeLabel}>Disconnect device</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceAlt,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sectionValue: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentActive: {
    backgroundColor: COLORS.surfaceAlt,
  },
  segmentLabel: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  segmentLabelActive: {
    color: COLORS.text,
  },
  subSection: {
    marginTop: 8,
  },
  tempStrip: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  tempSwatch: {
    flex: 1,
  },
  tempLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tempLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  previewSwatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  sourcesRow: {
    gap: 8,
    paddingVertical: 4,
  },
  sourceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  sourceChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  sourceChipLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  sourceChipLabelActive: {
    color: COLORS.text,
  },
  removeRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(243, 87, 87, 0.4)',
  },
  removeLabel: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
