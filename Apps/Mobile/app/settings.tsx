import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, RefreshCcw, XCircle } from 'lucide-react-native';
import COLORS from '../constants/Colors';
import TopBar from '../components/TopBar';
import { useDebugSettings } from '../hooks/useDebugSettings';
import { useDevices } from '../hooks/useDevices';
import { useLibrary } from '../hooks/useLibrary';
import { usePlayback } from '../hooks/usePlayback';
import { useRepositories } from '../state/repositories/RepositoriesProvider';

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

export default function SettingsScreen() {
  const {
    mode,
    latencyMs,
    failRate,
    log,
    hydrated,
    setMode,
    setLatency,
    setFailRate,
    clearLog,
  } = useDebugSettings();
  const devices = useDevices();
  const library = useLibrary();
  const playback = usePlayback();
  const { config } = useRepositories();

  const failPercent = Math.round(failRate * 100);
  const liveAvailable = config.transportMode === 'socket';

  const resetAll = () => {
    devices.reset();
    library.reset();
    playback.reset();
    clearLog();
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <TopBar />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              Local debug controls. {hydrated ? 'Settings persist between launches.' : 'Loading saved settings…'}
            </Text>
          </View>

          <Section title="Transport">
            <View style={styles.modeRow}>
              <ModeChip
                label="Mock"
                description="Local mock transport"
                active={mode === 'mock'}
                onPress={() => setMode('mock')}
              />
              <ModeChip
                label="Live"
                description={liveAvailable ? `Socket → ${config.backendUrl}` : 'Disabled at build time'}
                active={mode === 'live'}
                disabled={!liveAvailable}
                onPress={() => setMode('live')}
              />
            </View>
            <Text style={styles.helperText}>
              {liveAvailable
                ? 'Switch to Live to send commands to the configured backend over the socket.'
                : 'Set EXPO_PUBLIC_TRANSPORT_MODE=socket (or app.json extra) to enable Live mode.'}
            </Text>
          </Section>

          <Section title="Profiles">
            <View style={styles.profileChipRow}>
              {Object.values(devices.account.profiles).map((profile) => (
                <ModeChip
                  key={profile.id}
                  label={profile.name}
                  description={
                    profile.role === 'main'
                      ? 'Main account profile'
                      : `Guest under ${devices.account.profiles[devices.account.mainProfileId].name}`
                  }
                  active={devices.activeProfileId === profile.id}
                  onPress={() => devices.setActiveProfile(profile.id)}
                  layout="natural"
                />
              ))}
            </View>
            <Text style={styles.helperText}>
              Guest profiles sit under the main household account (Netflix-style), with their own scene presets.
            </Text>
          </Section>

          <Section title="Simulated latency">
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>{latencyMs} ms</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={2000}
              step={50}
              value={latencyMs}
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.surfaceAlt}
              thumbTintColor={COLORS.text}
              onValueChange={setLatency}
            />
            <Text style={styles.helperText}>
              Adds an artificial delay before mock commands resolve.
            </Text>
          </Section>

          <Section title="Failure rate">
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>{failPercent}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.05}
              value={failRate}
              minimumTrackTintColor={COLORS.danger}
              maximumTrackTintColor={COLORS.surfaceAlt}
              thumbTintColor={COLORS.text}
              onValueChange={setFailRate}
            />
            <Text style={styles.helperText}>
              Random commands return a failure result so you can build error states.
            </Text>
          </Section>

          <Section
            title="Command log"
            trailing={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear command log"
                onPress={clearLog}
                style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
              >
                <Text style={styles.linkButtonLabel}>Clear</Text>
              </Pressable>
            }
          >
            {log.length === 0 ? (
              <Text style={styles.helperText}>
                No commands yet. Send something from Home, Remote, or Library.
              </Text>
            ) : (
              <View style={styles.logList}>
                {log.map((entry) => (
                  <View key={entry.id} style={styles.logRow}>
                    <View style={styles.logIcon}>
                      {entry.result.ok ? (
                        <CheckCircle2 color={COLORS.online} size={16} />
                      ) : (
                        <XCircle color={COLORS.danger} size={16} />
                      )}
                    </View>
                    <View style={styles.logBody}>
                      <Text style={styles.logCommand} numberOfLines={1}>
                        {entry.envelope.command}
                        {entry.envelope.value !== undefined ? ` · ${entry.envelope.value}` : ''}
                      </Text>
                      <Text style={styles.logMeta} numberOfLines={1}>
                        {formatTime(entry.timestamp)} · {entry.envelope.deviceId} · {entry.result.latencyMs}ms
                      </Text>
                      {!entry.result.ok && (
                        <Text style={styles.logError} numberOfLines={1}>
                          {entry.result.error}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Section>

          <Section title="Maintenance">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset mock domain"
              onPress={resetAll}
              style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
            >
              <RefreshCcw color={COLORS.text} size={18} />
              <Text style={styles.resetButtonLabel}>Reset mock domain</Text>
            </Pressable>
            <Text style={styles.helperText}>
              Restores devices, library, playback, and clears the command log.
            </Text>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type SectionProps = {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
};

function Section({ title, trailing, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {trailing}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

type ModeChipProps = {
  label: string;
  description: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
  layout?: 'equal' | 'natural';
};

function ModeChip({ label, description, active, disabled, onPress, layout = 'equal' }: ModeChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.modeChip,
        layout === 'natural' && styles.modeChipNatural,
        active && styles.modeChipActive,
        disabled && styles.modeChipDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.modeChipLabel, active && styles.modeChipLabelActive]}>{label}</Text>
      <Text style={styles.modeChipDescription}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionBody: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  profileChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modeChipNatural: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 140,
  },
  modeChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(76, 101, 228, 0.12)',
  },
  modeChipDisabled: {
    opacity: 0.5,
  },
  modeChipLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modeChipLabelActive: {
    color: COLORS.text,
  },
  modeChipDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  helperText: {
    marginTop: 10,
    color: COLORS.muted,
    fontSize: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sliderLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  slider: {
    width: '100%',
    height: 36,
  },
  linkButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  linkButtonLabel: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  logList: {
    gap: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  logIcon: {
    width: 22,
    alignItems: 'center',
    paddingTop: 2,
  },
  logBody: {
    flex: 1,
  },
  logCommand: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  logMeta: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  logError: {
    color: COLORS.danger,
    fontSize: 11,
    marginTop: 2,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  resetButtonLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
