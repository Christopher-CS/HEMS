import Slider from '@react-native-community/slider';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Home, Pause, Power, Radio, } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, } from 'react-native';
import TopBar from '../../components/TopBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../constants/Colors';

const PLAYER_DURATION = 192;
const INITIAL_POSITION = 65;

type RemoteCommandPayload = {
  type: 'ConsoleCommand';
  deviceId: 'living-room-tv';
  command: string;
  value?: number;
};

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function Remote() {
  const [playbackPosition, setPlaybackPosition] = useState(INITIAL_POSITION);

  const emitRemoteCommand = (command: string, value?: number) => {
    const payload: RemoteCommandPayload = {
      type: 'ConsoleCommand',
      deviceId: 'living-room-tv',
      command,
      value,
    };

    // Keep the remote actions decoupled from execution details until the socket transport is wired in.
    console.log('remote-command', JSON.stringify(payload));
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <TopBar />

        {/* Remote Body Content */}
        <View style={styles.remoteContent}>

          {/* Button Group 1 */}
          <View style={styles.buttonGroup1}>
            <View style={styles.cornerButtonTopLeft}>
              <RoundButton
                accessibilityLabel="Back"
                onPress={() => emitRemoteCommand('NAVIGATE_BACK')}
              >
                <ArrowLeft color={COLORS.text} size={24} strokeWidth={2.2} />
              </RoundButton>
            </View>
            <View style={styles.cornerButtonTopRight}>
              <RoundButton
                variant="danger"
                accessibilityLabel="Power"
                onPress={() => emitRemoteCommand('POWER_TOGGLE')}
              >
                <Power color={COLORS.danger} size={25} strokeWidth={2.2} />
              </RoundButton>
            </View>
            <View style={styles.cornerButtonBottomLeft}>
              <RoundButton
                accessibilityLabel="Number pad"
                onPress={() => emitRemoteCommand('OPEN_NUMBER_PAD')}
              >
                <Text style={styles.numberPadText}>123</Text>
              </RoundButton>
            </View>
            <View style={styles.cornerButtonBottomRight}>
              <RoundButton
                accessibilityLabel="Pause playback"
                onPress={() => emitRemoteCommand('PAUSE')}
              >
                <Pause color={COLORS.text} size={26} strokeWidth={2.4} />
              </RoundButton>
            </View>

            <View style={styles.dpadCenterContainer}>
              <DirectionalPad
                onDirectionPress={(direction) => emitRemoteCommand(`DPAD_${direction}`)}
                onCenterPress={() => emitRemoteCommand('DPAD_SELECT')}
              />
            </View>
          </View>

          {/* Button Group 2 */}
          <View style={styles.buttonGroup2}>
            <VerticalStepControl
              topLabel="˄"
              bottomLabel="˅"
              onTopPress={() => emitRemoteCommand('CHANNEL_UP')}
              onBottomPress={() => emitRemoteCommand('CHANNEL_DOWN')}
            />

            <View style={styles.centerUtilityStack}>
              <PillButton
                accessibilityLabel="Home"
                onPress={() => emitRemoteCommand('GO_HOME')}
              >
                <Home color={COLORS.text} size={19} strokeWidth={2} />
              </PillButton>
              <PillButton
                accessibilityLabel="Live guide"
                onPress={() => emitRemoteCommand('OPEN_LIVE_GUIDE')}
              >
                <Radio color={COLORS.text} size={19} strokeWidth={2} />
              </PillButton>
            </View>

            <VerticalStepControl
              topLabel="+"
              bottomLabel="−"
              onTopPress={() => emitRemoteCommand('VOLUME_UP')}
              onBottomPress={() => emitRemoteCommand('VOLUME_DOWN')}
            />
          </View>

          {/* Now Playing */}
          <View style={styles.nowPlayingCard}>
            <View style={styles.nowPlayingHeader}>
              <View style={styles.artwork} />
              <View style={styles.trackTextWrap}>
                <Text numberOfLines={1} style={styles.trackTitle}>
                  Song Name
                </Text>
                <Text numberOfLines={1} style={styles.trackArtist}>
                  Artist
                </Text>
              </View>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={PLAYER_DURATION}
              value={playbackPosition}
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.track}
              thumbTintColor={COLORS.accent}
              onValueChange={setPlaybackPosition}
              onSlidingComplete={(value) => emitRemoteCommand('SEEK_TO', Math.round(value))}
            />

            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>{formatTime(playbackPosition)}</Text>
              <Text style={styles.timeLabel}>{formatTime(PLAYER_DURATION)}</Text>
            </View>

            <Pressable
              style={styles.playerPauseButton}
              onPress={() => emitRemoteCommand('PAUSE')}
            >
              <Pause color={COLORS.accent} size={28} strokeWidth={2.7} />
            </Pressable>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

type RoundButtonProps = {
  accessibilityLabel: string;
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'danger';
};

function RoundButton({
  accessibilityLabel,
  children,
  onPress,
  variant = 'default',
}: RoundButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.roundButton,
        variant === 'danger' && styles.roundButtonDanger,
        pressed && styles.buttonPressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

type PillButtonProps = {
  accessibilityLabel: string;
  children: React.ReactNode;
  onPress: () => void;
};

function PillButton({ accessibilityLabel, children, onPress }: PillButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.pillButton, pressed && styles.buttonPressed]}
    >
      {children}
    </Pressable>
  );
}

type VerticalStepControlProps = {
  topLabel: string;
  bottomLabel: string;
  onTopPress: () => void;
  onBottomPress: () => void;
};

function VerticalStepControl({
  topLabel,
  bottomLabel,
  onTopPress,
  onBottomPress,
}: VerticalStepControlProps) {
  return (
    <View style={styles.verticalControl}>
      <Pressable
        accessibilityRole="button"
        onPress={onTopPress}
        style={({ pressed }) => [
          styles.verticalControlHalf,
          styles.verticalControlHalfTop,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.verticalControlLabel}>{topLabel}</Text>
      </Pressable>

      <View style={styles.verticalControlDivider} />

      <Pressable
        accessibilityRole="button"
        onPress={onBottomPress}
        style={({ pressed }) => [
          styles.verticalControlHalf,
          styles.verticalControlHalfBottom,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.verticalControlLabel}>{bottomLabel}</Text>
      </Pressable>
    </View>
  );
}

type DirectionalPadProps = {
  onCenterPress: () => void;
  onDirectionPress: (direction: 'UP' | 'LEFT' | 'RIGHT' | 'DOWN') => void;
};

function DirectionalPad({
  onCenterPress,
  onDirectionPress,
}: DirectionalPadProps) {
  return (
    <View style={styles.dpadWrap}>
      <View style={styles.dpadVerticalBase} />
      <View style={styles.dpadHorizontalBase} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Up"
        onPress={() => onDirectionPress('UP')}
        style={({ pressed }) => [styles.dpadUp, pressed && styles.buttonPressed]}
      >
        <ChevronUp color={COLORS.text} size={30} strokeWidth={2.2} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Left"
        onPress={() => onDirectionPress('LEFT')}
        style={({ pressed }) => [styles.dpadLeft, pressed && styles.buttonPressed]}
      >
        <ChevronLeft color={COLORS.text} size={30} strokeWidth={2.2} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Right"
        onPress={() => onDirectionPress('RIGHT')}
        style={({ pressed }) => [styles.dpadRight, pressed && styles.buttonPressed]}
      >
        <ChevronRight color={COLORS.text} size={30} strokeWidth={2.2} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Down"
        onPress={() => onDirectionPress('DOWN')}
        style={({ pressed }) => [styles.dpadDown, pressed && styles.buttonPressed]}
      >
        <ChevronDown color={COLORS.text} size={30} strokeWidth={2.2} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select"
        onPress={onCenterPress}
        style={({ pressed }) => [styles.dpadCenter, pressed && styles.buttonPressed]}
      >
        <View style={styles.dpadCenterDot} />
      </Pressable>
    </View>
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
  remoteContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  buttonGroup1: {
    width: 360,
    height: 320,
    alignSelf: 'center',
    marginTop: 20,
  },
  cornerButtonTopLeft: { position: 'absolute', top: 0, left: 0, zIndex: 1 },
  cornerButtonTopRight: { position: 'absolute', top: 0, right: 0, zIndex: 1 },
  cornerButtonBottomLeft: { position: 'absolute', bottom: 0, left: 0, zIndex: 1 },
  cornerButtonBottomRight: { position: 'absolute', bottom: 0, right: 0, zIndex: 1 },
  dpadCenterContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  buttonGroup2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 10,
  },
  roundButton: {
    width: 77,
    height: 77,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  roundButtonDanger: {
    marginTop: 1,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  dpadWrap: {
    width: 256,
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  dpadVerticalBase: {
    position: 'absolute',
    width: 100,
    height: 256,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
  },
  dpadHorizontalBase: {
    position: 'absolute',
    width: 256,
    height: 100,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
  },
  dpadUp: {
    position: 'absolute',
    top: 8,
    width: 88,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadDown: {
    position: 'absolute',
    bottom: 8,
    width: 88,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadLeft: {
    position: 'absolute',
    left: 8,
    width: 62,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadRight: {
    position: 'absolute',
    right: 8,
    width: 62,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadCenter: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 10,
  },
  dpadCenterDot: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: COLORS.centerDot,
  },
  numberPadText: {
    color: COLORS.muted,
    fontSize: 27,
    fontWeight: '500',
    letterSpacing: -1,
  },
  verticalControl: {
    width: 70,
    height: 132,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  verticalControlHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  verticalControlHalfTop: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  verticalControlHalfBottom: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  verticalControlDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  verticalControlLabel: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '300',
    lineHeight: 28,
  },
  centerUtilityStack: {
    justifyContent: 'space-between',
    height: 132,
  },
  pillButton: {
    width: 68,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 6,
  },
  nowPlayingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  nowPlayingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  artwork: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.accentDeep,
    marginRight: 12,
  },
  trackTextWrap: {
    flex: 1,
  },
  trackTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 1,
  },
  trackArtist: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 30,
    marginHorizontal: -4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -2,
    marginBottom: 4,
  },
  timeLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  playerPauseButton: {
    alignSelf: 'center',
    width: 42,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
