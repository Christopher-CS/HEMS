import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lightbulb, Power, Speaker, Tv, X } from 'lucide-react-native';
import COLORS from '../../constants/Colors';
import type { DeviceKind, DeviceSnapshot } from '../../state/devices/store';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConnect: (device: DeviceSnapshot) => void;
};

const KIND_OPTIONS: Array<{ id: DeviceKind; label: string; icon: React.ReactNode; defaultSubtitle: string }> = [
  { id: 'tv', label: 'TV', icon: <Tv color={COLORS.tv} size={20} />, defaultSubtitle: 'HDMI display' },
  { id: 'light', label: 'Light', icon: <Lightbulb color={COLORS.light} size={20} />, defaultSubtitle: 'Smart bulb' },
  { id: 'speaker', label: 'Speaker', icon: <Speaker color={COLORS.speaker} size={20} />, defaultSubtitle: 'Audio output' },
  { id: 'generic', label: 'Other', icon: <Power color={COLORS.accent} size={20} />, defaultSubtitle: 'Smart device' },
];

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 32);

function buildDevice(name: string, subtitle: string, kind: DeviceKind): DeviceSnapshot {
  const trimmedName = name.trim() || 'New Device';
  const baseId = slug(trimmedName) || `device-${Date.now().toString(36)}`;
  const id = `${kind}-${baseId}-${Date.now().toString(36).slice(-4)}`;
  const base: DeviceSnapshot = {
    id,
    name: trimmedName,
    subtitle: subtitle.trim() || KIND_OPTIONS.find((opt) => opt.id === kind)?.defaultSubtitle || 'Smart device',
    kind,
    enabled: false,
    level: 50,
    userAdded: true,
  };
  switch (kind) {
    case 'tv':
      return {
        ...base,
        inputSource: 'HDMI 1',
        availableSources: ['HDMI 1', 'HDMI 2', 'HDMI 3', 'Streaming'],
      };
    case 'light':
      return {
        ...base,
        colorMode: 'white',
        colorTemperatureK: 4000,
        hue: 30,
        saturation: 80,
      };
    case 'speaker':
      return {
        ...base,
        inputSource: 'Bluetooth',
        availableSources: ['Bluetooth', 'AUX', 'Optical', 'HDMI ARC'],
      };
    default:
      return base;
  }
}

export default function AddDeviceModal({ visible, onClose, onConnect }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [kind, setKind] = useState<DeviceKind>('light');

  const reset = () => {
    setName('');
    setSubtitle('');
    setKind('light');
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleConnect = () => {
    if (!name.trim()) return;
    onConnect(buildDevice(name, subtitle, kind));
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.root,
          {
            paddingTop: 12 + insets.top,
            paddingBottom: 12 + insets.bottom,
            paddingLeft: Math.max(20, insets.left),
            paddingRight: Math.max(20, insets.right),
          },
        ]}
      >
        <Pressable style={styles.backdrop} accessibilityLabel="Close add device" onPress={handleClose} />

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Connect Device</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={handleClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <X color={COLORS.muted} size={18} />
            </Pressable>
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Office Lamp"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={styles.label}>Model / Subtitle (optional)</Text>
          <TextInput
            value={subtitle}
            onChangeText={setSubtitle}
            placeholder="LIFX Mini"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.kindGrid}>
            {KIND_OPTIONS.map((opt) => {
              const active = kind === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setKind(opt.id)}
                  style={({ pressed }) => [
                    styles.kindOption,
                    active && styles.kindOptionActive,
                    pressed && styles.pressed,
                  ]}
                >
                  {opt.icon}
                  <Text style={[styles.kindLabel, active && styles.kindLabelActive]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              onPress={handleClose}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !name.trim() }}
              onPress={handleConnect}
              disabled={!name.trim()}
              style={({ pressed }) => [
                styles.primaryButton,
                !name.trim() && styles.primaryButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryLabel}>Connect</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
    fontSize: 15,
  },
  kindGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kindOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  kindOptionActive: {
    backgroundColor: 'rgba(76, 101, 228, 0.15)',
    borderColor: COLORS.accent,
  },
  kindLabel: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  kindLabelActive: {
    color: COLORS.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.accentDeep,
    opacity: 0.6,
  },
  primaryLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  secondaryLabel: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
