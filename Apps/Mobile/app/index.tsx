import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { Clapperboard, Music, Tv, Lightbulb, Speaker, Volume1, Volume2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Slider from '@react-native-community/slider';
import TopBar from '../components/TopBar';
import COLORS from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function Home() {
  const insets = useSafeAreaInsets();
  const [tvEnabled, setTvEnabled] = useState(true);
  const [ambianceEnabled, setAmbianceEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(42);
  const [brightness, setBrightness] = useState(10);
  const [soundVolume, setSoundVolume] = useState(30);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <TopBar />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Scenes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scenes</Text>
          <TouchableOpacity onPress={() => console.log('Edit Scenes pressed')}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenesScroll}>
          {/* Theater Preset*/}
          <TouchableOpacity style={styles.sceneCard} onPress={() => console.log('Theater Scene pressed')}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=400&auto=format&fit=crop' }}
              style={styles.sceneBgImage}
              contentFit="cover"
            />
            <View style={styles.sceneOverlay} />
            <View style={styles.sceneTopRight}>
              <View style={styles.sceneIconWrap}>
                <Clapperboard color={COLORS.text} size={18} />
              </View>
            </View>
            <View style={styles.sceneBottom}>
              <Text style={styles.sceneName}>Theater</Text>
              <View style={styles.sceneStatus}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.accent }]} />
                <Text style={styles.sceneSubtext}>Active</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Party Preset */}
          <TouchableOpacity style={styles.sceneCard} onPress={() => console.log('Party Scene pressed')}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop' }}
              style={styles.sceneBgImage}
              contentFit="cover"
            />
            <View style={styles.sceneOverlayBlack} />
            <View style={styles.sceneTopRight}>
              <Music color={COLORS.text} size={20} />
            </View>
            <View style={styles.sceneBottom}>
              <Text style={styles.sceneName}>Party</Text>
              <Text style={styles.sceneSubtextPlain}>12 Devices</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Control Room Section */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Control Room</Text>
        </View>

        <View style={styles.controlsList}>
          {/* Living Room TV */}
          <View style={styles.controlCard}>
            <View style={styles.controlCardMain}>
              <View style={styles.controlIconWrapBlue}>
                <Tv color={tvEnabled ? COLORS.tv : COLORS.tvMuted} size={24} />
              </View>
              <View style={styles.controlTextContent}>
                <Text style={styles.controlTitle}>Living Room TV</Text>
                <Text style={styles.controlSubtitle}>Samsung QLED</Text>
              </View>
              <Switch
                value={tvEnabled}
                onValueChange={(val) => {
                  console.log(`Living Room TV toggle: ${val}`);
                  setTvEnabled(val);
                }}
                trackColor={{ false: COLORS.surfaceAlt, true: COLORS.accent }}
                thumbColor={COLORS.text}
              />
            </View>
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Volume</Text>
                <Text style={styles.sliderValue}>{volume}%</Text>
              </View>
              <Slider
                style={{ height: 40, width: '100%' }}
                minimumValue={0}
                maximumValue={100}
                value={volume}
                onValueChange={(val) => {
                  console.log(`Living Room TV volume changed: ${val}%`);
                  setVolume(val);
                }}
                minimumTrackTintColor={tvEnabled ? COLORS.accent : COLORS.surfaceAlt}
                maximumTrackTintColor={COLORS.surfaceAlt}
                thumbTintColor={COLORS.text}
                step={1}
              />
            </View>
          </View>

          {/* Ambiance */}
          <View style={styles.controlCard}>
            <View style={styles.controlCardMain}>
              <View style={styles.controlIconWrapOrange}>
                <Lightbulb color={ambianceEnabled ? COLORS.light : COLORS.lightMuted} size={24} />
              </View>
              <View style={styles.controlTextContent}>
                <Text style={styles.controlTitle}>Ambiance</Text>
                <Text style={styles.controlSubtitle}>Philips Hue</Text>
              </View>
              <Switch
                value={ambianceEnabled}
                onValueChange={(val) => {
                  console.log(`Ambiance toggle: ${val}`);
                  setAmbianceEnabled(val);
                }}
                trackColor={{ false: COLORS.surfaceAlt, true: COLORS.orange }}
                thumbColor={COLORS.text}
              />
            </View>
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Brightness</Text>
                <Text style={styles.sliderValue}>{brightness}%</Text>
              </View>
              <Slider
                style={{ height: 40, width: '100%' }}
                minimumValue={0}
                maximumValue={100}
                value={brightness}
                onValueChange={(val) => {
                  console.log(`Ambiance brightness changed: ${val}%`);
                  setBrightness(val);
                }}
                minimumTrackTintColor={ambianceEnabled ? COLORS.orange : COLORS.surfaceAlt}
                maximumTrackTintColor={COLORS.surfaceAlt}
                thumbTintColor={COLORS.text}
                step={1}
              />
            </View>
          </View>

          {/* Sound System */}
          <View style={styles.controlCard}>
            <View style={styles.controlCardMain}>
              <View style={styles.controlIconWrapPurple}>
                <Speaker color={soundEnabled ? COLORS.speaker : COLORS.speakerMuted} size={24} />
              </View>
              <View style={styles.controlTextContent}>
                <Text style={styles.controlTitle}>Sound System</Text>
                <Text style={styles.controlSubtitle}>Sonos Arc + Sub</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={(val) => {
                  console.log(`Sound System toggle: ${val}`);
                  setSoundEnabled(val);
                }}
                trackColor={{ false: COLORS.surfaceAlt, true: COLORS.accentSoft }}
                thumbColor={COLORS.text}
              />
            </View>
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Volume</Text>
                <Text style={styles.sliderValue}>{soundVolume}%</Text>
              </View>
              <View style={[styles.sliderSection, styles.sliderSectionWithIcons]}>
                <Volume1 color={COLORS.muted} size={20} />
                <Slider
                  style={{ height: 40, flex: 1, marginHorizontal: 8 }}
                  minimumValue={0}
                  maximumValue={100}
                  value={soundVolume}
                  onValueChange={(val) => {
                    console.log(`Sound System volume changed: ${val}%`);
                    setSoundVolume(val);
                  }}
                  minimumTrackTintColor={soundEnabled ? COLORS.accentSoft : COLORS.surfaceAlt}
                  maximumTrackTintColor={COLORS.surfaceAlt}
                  thumbTintColor={COLORS.text}
                  step={1}
                />
                <Volume2 color={COLORS.muted} size={20} />
              </View>
            </View>
          </View>
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
  controlIconWrapBlue: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.blueSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  controlIconWrapOrange: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.orangeSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  controlIconWrapPurple: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.purpleSoft,
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
  sliderTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  flexSliderTrack: {
    flex: 1,
    marginHorizontal: 16,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  sliderSectionWithIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
