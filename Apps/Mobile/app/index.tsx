import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Clapperboard,
  Lightbulb,
  Music,
  Plus,
  Power,
  Speaker,
  Tv,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Slider from '@react-native-community/slider';
import TopBar from '../components/TopBar';
import StatusBanner from '../components/StatusBanner';
import AddDeviceModal from '../components/control/AddDeviceModal';
import DeviceDetailModal from '../components/control/DeviceDetailModal';
import COLORS from '../constants/Colors';
import { useDevices } from '../hooks/useDevices';
import { useLatestCommand } from '../hooks/useLatestCommand';
import { useTransport } from '../hooks/useTransport';
import type { ConsoleCommandEnvelope, ConsoleCommandToken } from '../services/transport/types';
import type { ColorMode, DeviceId, DeviceKind, DeviceSnapshot } from '../state/devices/store';

const { width } = Dimensions.get('window');

const KIND_META: Record<
  DeviceKind,
  { iconColor: string; mutedColor: string; iconBg: string; trackColor: string; levelLabel: string }
> = {
  tv: {
    iconColor: COLORS.tv,
    mutedColor: COLORS.tvMuted,
    iconBg: COLORS.blueSoft,
    trackColor: COLORS.accent,
    levelLabel: 'Volume',
  },
  light: {
    iconColor: COLORS.light,
    mutedColor: COLORS.lightMuted,
    iconBg: COLORS.orangeSoft,
    trackColor: COLORS.orange,
    levelLabel: 'Brightness',
  },
  speaker: {
    iconColor: COLORS.speaker,
    mutedColor: COLORS.speakerMuted,
    iconBg: COLORS.purpleSoft,
    trackColor: COLORS.accentSoft,
    levelLabel: 'Volume',
  },
  generic: {
    iconColor: COLORS.accent,
    mutedColor: COLORS.accentMuted,
    iconBg: 'rgba(76, 101, 228, 0.15)',
    trackColor: COLORS.accent,
    levelLabel: 'Level',
  },
};

function KindIcon({ kind, color, size = 24 }: { kind: DeviceKind; color: string; size?: number }) {
  const props = { color, size };
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

export default function Home() {
  const insets = useSafeAreaInsets();
  const {
    orderedDevices,
    activeScene,
    profileScenes,
    setEnabled,
    setLevel,
    setColorMode,
    setColorTemperature,
    setColor,
    setInputSource,
    addDevice,
    removeDevice,
    applyScene,
    activeProfile,
  } = useDevices();
  const { send } = useTransport();
  const latest = useLatestCommand();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<DeviceId | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const dispatchCommand = useCallback(
    (
      deviceId: DeviceId,
      command: ConsoleCommandToken,
      value?: number,
      metadata?: ConsoleCommandEnvelope['metadata']
    ) => {
      const envelope: ConsoleCommandEnvelope = {
        type: 'ConsoleCommand',
        deviceId,
        command,
        value,
        metadata,
      };
      send(envelope).catch(() => {});
    },
    [send]
  );

  const handleToggle = (deviceId: DeviceId, next: boolean) => {
    setEnabled(deviceId, next);
    dispatchCommand(deviceId, 'POWER_TOGGLE', next ? 1 : 0);
  };

  const handleLevelChange = (deviceId: DeviceId, next: number) => {
    setLevel(deviceId, next);
  };

  const handleLevelCommit = (deviceId: DeviceId, next: number) => {
    setLevel(deviceId, next);
    dispatchCommand(deviceId, 'SEEK_TO', Math.round(next));
  };

  const handleColorModeChange = (deviceId: DeviceId, mode: ColorMode) => {
    setColorMode(deviceId, mode);
    dispatchCommand(deviceId, 'SET_COLOR_MODE', mode === 'color' ? 1 : 0);
  };

  const handleTemperatureChange = (deviceId: DeviceId, kelvin: number) => {
    setColorTemperature(deviceId, kelvin);
  };

  const handleTemperatureCommit = (deviceId: DeviceId, kelvin: number) => {
    setColorTemperature(deviceId, kelvin);
    dispatchCommand(deviceId, 'SET_COLOR_TEMPERATURE', Math.round(kelvin));
  };

  const handleColorChange = (deviceId: DeviceId, hue: number, saturation: number) => {
    setColor(deviceId, hue, saturation);
  };

  const handleColorCommit = (deviceId: DeviceId, hue: number, saturation: number) => {
    setColor(deviceId, hue, saturation);
    dispatchCommand(deviceId, 'SET_HUE', Math.round(hue));
    dispatchCommand(deviceId, 'SET_SATURATION', Math.round(saturation));
  };

  const handleSourceChange = (deviceId: DeviceId, source: string) => {
    setInputSource(deviceId, source);
    dispatchCommand(deviceId, 'SET_INPUT_SOURCE', undefined, {
      title: 'Input source',
      subtitle: source,
    });
  };

  const handleAddDevice = (device: DeviceSnapshot) => {
    addDevice(device);
    dispatchCommand(device.id, 'CONNECT_DEVICE', undefined, {
      title: device.name,
      subtitle: device.kind,
    });
  };

  const handleRemoveDevice = (deviceId: DeviceId) => {
    const device = orderedDevices.find((d) => d.id === deviceId);
    removeDevice(deviceId);
    dispatchCommand(deviceId, 'DISCONNECT_DEVICE', undefined, {
      title: device?.name ?? deviceId,
      subtitle: device?.kind ?? 'generic',
    });
  };

  const openDetail = (id: DeviceId) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
  };

  const detailDevice = detailId ? orderedDevices.find((d) => d.id === detailId) ?? null : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {latest && !latest.result.ok && (
          <StatusBanner
            tone="error"
            title={`Last command failed: ${latest.envelope.command}`}
            detail={latest.result.error}
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scenes</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.editButton}>{activeProfile.name}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scenesScroll}
        >
          {profileScenes.map((scene) => (
            <SceneCard
              key={scene.id}
              label={scene.label}
              active={activeScene === scene.id}
              background={scene.backgroundUrl}
              overlayDark={scene.overlayDark}
              icon={
                scene.id.includes('party') || scene.id.includes('game') ? (
                  <Music color={COLORS.text} size={20} />
                ) : (
                  <Clapperboard color={COLORS.text} size={18} />
                )
              }
              iconStyle={styles.sceneIconWrap}
              onPress={() => applyScene(activeProfile.id, scene.id)}
            />
          ))}
        </ScrollView>

        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Control Room</Text>
          <Text style={styles.controlHint}>Tap a device for more controls</Text>
        </View>

        <View style={styles.controlsList}>
          {orderedDevices.map((device) => (
            <ControlCard
              key={device.id}
              device={device}
              onPressDetail={() => openDetail(device.id)}
              onToggle={(val) => handleToggle(device.id, val)}
              onLevelChange={(val) => handleLevelChange(device.id, val)}
              onLevelCommit={(val) => handleLevelCommit(device.id, val)}
            />
          ))}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Connect a new device"
            onPress={() => setAddOpen(true)}
            style={({ pressed }) => [styles.addCard, pressed && styles.pressed]}
          >
            <View style={styles.addIconWrap}>
              <Plus color={COLORS.accent} size={22} />
            </View>
            <View style={styles.controlTextContent}>
              <Text style={styles.controlTitle}>Connect a device</Text>
              <Text style={styles.controlSubtitle}>Add a TV, light, speaker, or other</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <DeviceDetailModal
        visible={detailOpen}
        device={detailDevice}
        onClose={closeDetail}
        onToggle={handleToggle}
        onLevelChange={handleLevelChange}
        onLevelCommit={handleLevelCommit}
        onColorModeChange={handleColorModeChange}
        onTemperatureChange={handleTemperatureChange}
        onTemperatureCommit={handleTemperatureCommit}
        onColorChange={handleColorChange}
        onColorCommit={handleColorCommit}
        onSourceChange={handleSourceChange}
        onRemove={detailDevice?.userAdded ? handleRemoveDevice : undefined}
      />

      <AddDeviceModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onConnect={handleAddDevice}
      />
    </View>
  );
}

type ControlCardProps = {
  device: DeviceSnapshot;
  onPressDetail: () => void;
  onToggle: (val: boolean) => void;
  onLevelChange: (val: number) => void;
  onLevelCommit: (val: number) => void;
};

function ControlCard({ device, onPressDetail, onToggle, onLevelChange, onLevelCommit }: ControlCardProps) {
  const meta = KIND_META[device.kind];
  const iconColor = device.enabled ? meta.iconColor : meta.mutedColor;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${device.name} controls`}
      onPress={onPressDetail}
      style={({ pressed }) => [styles.controlCard, pressed && styles.pressed]}
    >
      <View style={styles.controlCardMain}>
        <View style={[styles.controlIconWrap, { backgroundColor: meta.iconBg }]}>
          <KindIcon kind={device.kind} color={iconColor} />
        </View>
        <View style={styles.controlTextContent}>
          <Text style={styles.controlTitle}>{device.name}</Text>
          <Text style={styles.controlSubtitle}>{device.subtitle}</Text>
        </View>
        <Switch
          value={device.enabled}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.surfaceAlt, true: meta.trackColor }}
          thumbColor={COLORS.text}
        />
      </View>
      <View style={styles.sliderSection}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>{meta.levelLabel}</Text>
          <Text style={styles.sliderValue}>{device.level}%</Text>
        </View>
        <Slider
          style={{ height: 40, width: '100%' }}
          minimumValue={0}
          maximumValue={100}
          value={device.level}
          onValueChange={onLevelChange}
          onSlidingComplete={onLevelCommit}
          minimumTrackTintColor={device.enabled ? meta.trackColor : COLORS.surfaceAlt}
          maximumTrackTintColor={COLORS.surfaceAlt}
          thumbTintColor={COLORS.text}
          step={1}
        />
      </View>
    </Pressable>
  );
}

type SceneCardProps = {
  label: string;
  active: boolean;
  background: string;
  icon: React.ReactNode;
  iconStyle?: object;
  overlayDark?: boolean;
  onPress: () => void;
};

function SceneCard({ label, active, background, icon, iconStyle, overlayDark, onPress }: SceneCardProps) {
  return (
    <TouchableOpacity style={styles.sceneCard} onPress={onPress}>
      <Image source={{ uri: background }} style={styles.sceneBgImage} contentFit="cover" />
      <View style={overlayDark ? styles.sceneOverlayBlack : styles.sceneOverlay} />
      <View style={styles.sceneTopRight}>{iconStyle ? <View style={iconStyle}>{icon}</View> : icon}</View>
      <View style={styles.sceneBottom}>
        <Text style={styles.sceneName}>{label}</Text>
        {active ? (
          <View style={styles.sceneStatus}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.accent }]} />
            <Text style={styles.sceneSubtext}>Active</Text>
          </View>
        ) : (
          <Text style={styles.sceneSubtextPlain}>Tap to apply</Text>
        )}
      </View>
    </TouchableOpacity>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  controlHint: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  scenesScroll: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  sceneCard: {
    width: width * 0.45,
    height: 210,
    borderRadius: 20,
    marginHorizontal: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  sceneBgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  sceneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  sceneOverlayBlack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlayDark,
  },
  sceneTopRight: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  sceneIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.whiteSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sceneBottom: {
    position: 'absolute',
    bottom: 20,
    left: 16,
  },
  sceneName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sceneStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  sceneSubtext: {
    color: COLORS.textBlue,
    fontSize: 13,
    fontWeight: '500',
  },
  sceneSubtextPlain: {
    color: COLORS.textMutedLight,
    fontSize: 13,
    fontWeight: '500',
  },
  controlsList: {
    paddingHorizontal: 20,
  },
  controlCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  controlCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  controlTextContent: {
    flex: 1,
  },
  controlTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  controlSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
  },
  sliderSection: {
    width: '100%',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  sliderValue: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.surfaceAlt,
  },
  addIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(76, 101, 228, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pressed: {
    opacity: 0.92,
  },
});
