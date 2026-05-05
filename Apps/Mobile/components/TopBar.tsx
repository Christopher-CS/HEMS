import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bell, Check, ChevronDown } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import COLORS from '../constants/Colors';
import type { Profile, ProfileId } from '../state/devices/store';
import { useDebugStoreSafe } from './use-debug-store-safe';
import { useDevicesStoreSafe } from './use-devices-store-safe';

function orderedProfiles(account: {
  mainProfileId: ProfileId;
  guestProfileIds: ProfileId[];
  profiles: Record<ProfileId, Profile>;
}): Profile[] {
  const ids: ProfileId[] = [account.mainProfileId, ...account.guestProfileIds];
  return ids.map((id) => account.profiles[id]).filter(Boolean);
}

export default function TopBar() {
  const insets = useSafeAreaInsets();
  const debug = useDebugStoreSafe();
  const showBadge = debug && debug.state.mode !== 'live';
  const devices = useDevicesStoreSafe();
  const activeProfile = devices?.state.account.profiles[devices.state.activeProfileId];
  const [menuOpen, setMenuOpen] = useState(false);

  const profiles = devices ? orderedProfiles(devices.state.account) : [];

  const openMenu = () => {
    if (devices) setMenuOpen(true);
  };

  const closeMenu = () => setMenuOpen(false);

  const selectProfile = (id: ProfileId) => {
    devices?.setActiveProfile(id);
    closeMenu();
  };

  const window = Dimensions.get('window');
  const dropdownTop = insets.top + 56;
  const dropdownLeft = Math.max(16, insets.left + 4);
  const dropdownMaxWidth = Math.min(320, window.width - dropdownLeft - Math.max(16, insets.right + 4));
  const dropdownMaxHeight = window.height - dropdownTop - Math.max(12, insets.bottom + 8);

  return (
    <SafeAreaView edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose profile"
            accessibilityHint="Opens a menu to pick the active household profile"
            onPress={openMenu}
            disabled={!devices}
            style={({ pressed }) => [styles.accountTrigger, pressed && styles.accountTriggerPressed]}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <View style={styles.avatarHead} />
                <View style={styles.avatarBody} />
              </View>
              <View style={styles.onlineDot} />
            </View>
            <ChevronDown color={COLORS.muted} size={18} strokeWidth={2.2} />
          </Pressable>
          <View>
            <Text style={styles.welcomeText}>WELCOME BACK</Text>
            <Text style={styles.userName}>{activeProfile?.name ?? 'Dad'}</Text>
          </View>
        </View>
        <View style={styles.trailing}>
          {activeProfile?.role === 'guest' && (
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeLabel}>GUEST</Text>
            </View>
          )}
          {showBadge && (
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeLabel}>MOCK</Text>
            </View>
          )}
          <TouchableOpacity style={styles.bellButton}>
            <Bell color={COLORS.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
        statusBarTranslucent
      >
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable
            style={styles.modalBackdrop}
            accessibilityLabel="Close profile menu"
            onPress={closeMenu}
          />
          <View
            style={[
              styles.dropdown,
              {
                top: dropdownTop,
                left: dropdownLeft,
                maxWidth: dropdownMaxWidth,
                maxHeight: dropdownMaxHeight,
              },
            ]}
            accessibilityViewIsModal
          >
            <Text style={styles.dropdownTitle}>Switch profile</Text>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={profiles.length > 4}
              style={{ maxHeight: Math.max(120, dropdownMaxHeight - 52) }}
            >
              {profiles.map((profile) => {
                const active = profile.id === devices?.state.activeProfileId;
                return (
                  <Pressable
                    key={profile.id}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: active }}
                    onPress={() => selectProfile(profile.id)}
                    style={({ pressed }) => [
                      styles.menuRow,
                      active && styles.menuRowActive,
                      pressed && styles.menuRowPressed,
                    ]}
                  >
                    <View style={styles.menuRowText}>
                      <Text style={styles.menuRowName}>{profile.name}</Text>
                      <Text style={styles.menuRowMeta}>
                        {profile.role === 'main' ? 'Main account' : 'Guest profile'}
                      </Text>
                    </View>
                    {active ? <Check color={COLORS.accent} size={20} strokeWidth={2.4} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
    paddingBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
    borderRadius: 28,
    paddingRight: 4,
  },
  accountTriggerPressed: {
    opacity: 0.85,
  },
  avatarContainer: {
    marginRight: 4,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accentDeep,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  avatarHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accentMuted,
    position: 'absolute',
    top: 8,
  },
  avatarBody: {
    width: 44,
    height: 22,
    backgroundColor: COLORS.accentMuted,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    position: 'absolute',
    bottom: -5,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  welcomeText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeBadge: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  modeBadgeLabel: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  guestBadge: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  guestBadgeLabel: {
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dropdown: {
    position: 'absolute',
    minWidth: 260,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownTitle: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 14,
    paddingBottom: 8,
    paddingTop: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  menuRowActive: {
    backgroundColor: 'rgba(76, 101, 228, 0.12)',
  },
  menuRowPressed: {
    opacity: 0.9,
  },
  menuRowText: {
    flex: 1,
  },
  menuRowName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  menuRowMeta: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
