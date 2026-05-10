import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Clapperboard, Gamepad2, Tv } from 'lucide-react-native';
import CategoryHeader from '../../components/library/category-header';
import StatusBanner from '../../components/StatusBanner';
import COLORS from '../../constants/Colors';
import { useDevices } from '../../hooks/useDevices';
import { useTransport } from '../../hooks/useTransport';
import type { ConsoleCommandEnvelope } from '../../services/transport/types';

type SmartMenuKind = 'streaming' | 'gaming';

type SmartMenuItem = {
  id: string;
  label: string;
  kind: SmartMenuKind;
  tint: string;
  accent: string;
};

const APP_META: Record<string, Omit<SmartMenuItem, 'id' | 'label'>> = {
  Netflix: { kind: 'streaming', tint: 'rgba(229, 9, 20, 0.18)', accent: '#E50914' },
  'Prime Video': { kind: 'streaming', tint: 'rgba(0, 168, 225, 0.18)', accent: '#00A8E1' },
  Peacock: { kind: 'streaming', tint: 'rgba(245, 196, 0, 0.18)', accent: '#F5C400' },
  Disney: { kind: 'streaming', tint: 'rgba(17, 96, 251, 0.18)', accent: '#1160FB' },
  Xbox: { kind: 'gaming', tint: 'rgba(16, 124, 16, 0.18)', accent: '#107C10' },
  PlayStation: { kind: 'gaming', tint: 'rgba(0, 55, 145, 0.18)', accent: '#003791' },
  Switch: { kind: 'gaming', tint: 'rgba(230, 0, 18, 0.18)', accent: '#E60012' },
};

const FALLBACK_APPS = [
  'Netflix',
  'Prime Video',
  'Peacock',
  'Disney',
  'Xbox',
  'PlayStation',
  'Switch',
];

function buildSmartMenuItem(id: string): SmartMenuItem {
  const meta = APP_META[id] ?? {
    kind: 'streaming' as const,
    tint: COLORS.blueSoft,
    accent: COLORS.accent,
  };

  return {
    id,
    label: id,
    ...meta,
  };
}

function iconFor(kind: SmartMenuKind, accent: string) {
  if (kind === 'gaming') return <Gamepad2 color={accent} size={22} />;
  if (accent === '#E50914') return <Tv color={accent} size={22} />;
  return <Clapperboard color={accent} size={22} />;
}

export default function SmartMenuPage() {
  const { devices, primaryDeviceId } = useDevices();
  const { send } = useTransport();
  const tv = devices[primaryDeviceId] ?? devices['living-room-tv'];
  const tvDeviceId = tv?.id ?? primaryDeviceId;
  const availableApps = tv?.availableApps?.length ? tv.availableApps : FALLBACK_APPS;
  const smartMenuItems = useMemo(
    () => availableApps.map(buildSmartMenuItem),
    [availableApps]
  );

  const launchApp = async (item: SmartMenuItem) => {
    const envelopes: ConsoleCommandEnvelope[] = [];

    if (!tv?.enabled) {
      envelopes.push({
        type: 'ConsoleCommand',
        deviceId: tvDeviceId,
        command: 'POWER_TOGGLE',
        value: 1,
      });
    }

    envelopes.push({
      type: 'ConsoleCommand',
      deviceId: tvDeviceId,
      command: 'SET_INPUT_SOURCE',
      metadata: {
        title: 'System mode',
        subtitle: item.kind === 'gaming' ? 'Gaming' : 'TV',
      },
    });

    envelopes.push({
      type: 'ConsoleCommand',
      deviceId: tvDeviceId,
      command: 'LAUNCH_APP',
      metadata: {
        title: item.id,
        subtitle: item.label,
      },
    });

    for (const envelope of envelopes) {
      const result = await send(envelope);
      if (!result.ok) break;
    }
  };

  return (
    <View style={styles.container}>
      <CategoryHeader
        title="Smart Menu"
        subtitle={`${smartMenuItems.length} Unity destinations ready for the TV`}
        accentColor={COLORS.orange}
      />

      {!tv ? (
        <View style={styles.statusWrap}>
          <StatusBanner
            tone="error"
            title="TV not available"
            detail="The smart menu needs the living-room TV device."
          />
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Tv color={COLORS.orange} size={22} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Unity Smart Menu</Text>
            <Text style={styles.heroBody}>
              Pick a service or console and the Unity TV will switch to its matching clip.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {smartMenuItems.map((item) => {
            const active = tv?.currentApp === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.label}`}
                onPress={() => {
                  launchApp(item).catch(() => {});
                }}
                style={({ pressed }) => [
                  styles.card,
                  { borderColor: active ? item.accent : COLORS.surfaceAlt },
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.cardIconWrap, { backgroundColor: item.tint }]}>
                  {iconFor(item.kind, item.accent)}
                </View>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.kind === 'gaming' ? 'Gaming mode' : 'TV mode'}
                </Text>
                {active ? (
                  <View style={[styles.activeBadge, { backgroundColor: item.accent }]}>
                    <Text style={styles.activeBadgeLabel}>Active</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusWrap: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroBody: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  activeBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
  },
});
