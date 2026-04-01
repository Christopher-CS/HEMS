import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../constants/Colors';

export default function TopBar() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <View style={styles.avatarHead} />
              <View style={styles.avatarBody} />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.welcomeText}>WELCOME BACK</Text>
            <Text style={styles.userName}>Dad</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Bell color={COLORS.text} size={24} />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 10
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
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
});
