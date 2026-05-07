import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlignJustify,
  Camera,
  Lightbulb,
  Monitor,
  Snowflake,
  Speaker,
  Thermometer,
  Tv,
  Wind,
  X,
} from 'lucide-react-native';
import COLORS from '../../constants/Colors';

export type BackendDeviceType =
  | 'tv' | 'light' | 'speaker' | 'fan' | 'thermostat'
  | 'blind' | 'projector' | 'camera' | 'aircon';

export type Capabilities = {
  powerable: boolean;
  levelAdjustable: boolean;
  modeSelectable: boolean;
  moveable: boolean;
  consoleControllable: boolean;
  playbackControllable: boolean;
  navigatable: boolean;
  colorControllable: boolean;
};

export type NewDeviceInput = {
  name: string;
  subtitle: string;
  type: BackendDeviceType;
  capabilities: Capabilities;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onConnect: (input: NewDeviceInput) => void;
};

const DEFAULT_CAPS: Record<BackendDeviceType, Capabilities> = {
  tv:        { powerable: true,  levelAdjustable: true,  modeSelectable: true,  moveable: false, consoleControllable: false, playbackControllable: true,  navigatable: true,  colorControllable: false },
  light:     { powerable: true,  levelAdjustable: true,  modeSelectable: false, moveable: false, consoleControllable: false, playbackControllable: false, navigatable: false, colorControllable: true  },
  speaker:   { powerable: true,  levelAdjustable: true,  modeSelectable: false, moveable: false, consoleControllable: false, playbackControllable: true,  navigatable: false, colorControllable: false },
  fan:       { powerable: true,  levelAdjustable: true,  modeSelectable: false, moveable: false, consoleControllable: false, playbackControllable: false, navigatable: false, colorControllable: false },
  thermostat:{ powerable: true,  levelAdjustable: false, modeSelectable: true,  moveable: false, consoleControllable: false, playbackControllable: false, navigatable: false, colorControllable: false },
  blind:     { powerable: true,  levelAdjustable: true,  modeSelectable: false, moveable: true,  consoleControllable: false, playbackControllable: false, navigatable: false, colorControllable: false },
  projector: { powerable: true,  levelAdjustable: true,  modeSelectable: true,  moveable: false, consoleControllable: false, playbackControllable: true,  navigatable: false, colorControllable: false },
  camera:    { powerable: true,  levelAdjustable: false, modeSelectable: false, moveable: false, consoleControllable: false, playbackControllable: false, navigatable: false, colorControllable: false },
  aircon:    { powerable: true,  levelAdjustable: true,  modeSelectable: true,  moveable: false, consoleControllable: false, playbackControllable: false, navigatable: false, colorControllable: false },
};

type TypeOption = { id: BackendDeviceType; label: string; icon: (color: string) => React.ReactNode };

const TYPE_OPTIONS: TypeOption[] = [
  { id: 'tv',        label: 'TV',        icon: (c) => <Tv color={c} size={18} /> },
  { id: 'light',     label: 'Light',     icon: (c) => <Lightbulb color={c} size={18} /> },
  { id: 'speaker',   label: 'Speaker',   icon: (c) => <Speaker color={c} size={18} /> },
  { id: 'fan',       label: 'Fan',       icon: (c) => <Wind color={c} size={18} /> },
  { id: 'thermostat',label: 'Thermostat',icon: (c) => <Thermometer color={c} size={18} /> },
  { id: 'blind',     label: 'Blind',     icon: (c) => <AlignJustify color={c} size={18} /> },
  { id: 'projector', label: 'Projector', icon: (c) => <Monitor color={c} size={18} /> },
  { id: 'camera',    label: 'Camera',    icon: (c) => <Camera color={c} size={18} /> },
  { id: 'aircon',    label: 'A/C',       icon: (c) => <Snowflake color={c} size={18} /> },
];

export default function AddDeviceModal({ visible, onClose, onConnect }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [type, setType] = useState<BackendDeviceType>('light');

  const reset = () => {
    setName('');
    setSubtitle('');
    setType('light');
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleConnect = () => {
    if (!name.trim()) return;
    onConnect({ name: name.trim(), subtitle: subtitle.trim(), type, capabilities: DEFAULT_CAPS[type] });
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

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
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
            <View style={styles.typeGrid}>
              {TYPE_OPTIONS.map((opt) => {
                const active = type === opt.id;
                const iconColor = active ? COLORS.accent : COLORS.muted;
                return (
                  <Pressable
                    key={opt.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setType(opt.id)}
                    style={({ pressed }) => [
                      styles.typeOption,
                      active && styles.typeOptionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    {opt.icon(iconColor)}
                    <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>

          </ScrollView>

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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 0,
    width: '100%',
    maxWidth: 420,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  scrollContent: {
    paddingBottom: 8,
  },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 16,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    width: '30%',
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  typeOptionActive: {
    backgroundColor: 'rgba(76, 101, 228, 0.15)',
    borderColor: COLORS.accent,
  },
  typeLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  typeLabelActive: {
    color: COLORS.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 20,
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
