import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { Bell, Clapperboard, Music, Tv, Lightbulb, Speaker, Volume1, Volume2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Slider from '@react-native-community/slider';

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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
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
            <Bell color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>

        {/* Scenes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scenes</Text>
          <TouchableOpacity>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenesScroll}>
          {/* Theater Scene */}
          <TouchableOpacity style={styles.sceneCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=400&auto=format&fit=crop' }}
              style={styles.sceneBgImage}
              contentFit="cover"
            />
            <View style={styles.sceneOverlay} />
            <View style={styles.sceneTopRight}>
              <View style={styles.sceneIconWrap}>
                <Clapperboard color="#FFFFFF" size={18} />
              </View>
            </View>
            <View style={styles.sceneBottom}>
              <Text style={styles.sceneName}>Theater</Text>
              <View style={styles.sceneStatus}>
                <View style={[styles.statusDot, { backgroundColor: '#4C65E4' }]} />
                <Text style={styles.sceneSubtext}>Active</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Party Scene */}
          <TouchableOpacity style={styles.sceneCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop' }}
              style={styles.sceneBgImage}
              contentFit="cover"
            />
            <View style={styles.sceneOverlayBlack} />
            <View style={styles.sceneTopRight}>
              <Music color="#FFFFFF" size={20} />
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
                <Tv color={tvEnabled ? "#6C82F7" : "#3e489dff"} size={24} />
              </View>
              <View style={styles.controlTextContent}>
                <Text style={styles.controlTitle}>Living Room TV</Text>
                <Text style={styles.controlSubtitle}>Samsung QLED</Text>
              </View>
              <Switch
                value={tvEnabled}
                onValueChange={setTvEnabled}
                trackColor={{ false: '#2D2E41', true: '#4C65E4' }}
                thumbColor="#FFFFFF"
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
                onValueChange={setVolume}
                minimumTrackTintColor={tvEnabled ? "#4C65E4" : "#2D2E41"}
                maximumTrackTintColor="#2D2E41"
                thumbTintColor="#FFFFFF"
                step={1}
              />
            </View>
          </View>

          {/* Ambiance */}
          <View style={styles.controlCard}>
            <View style={styles.controlCardMain}>
              <View style={styles.controlIconWrapOrange}>
                <Lightbulb color={ambianceEnabled ? "#EDA441" : "#754b11ff"} size={24} />
              </View>
              <View style={styles.controlTextContent}>
                <Text style={styles.controlTitle}>Ambiance</Text>
                <Text style={styles.controlSubtitle}>Philips Hue</Text>
              </View>
              <Switch
                value={ambianceEnabled}
                onValueChange={setAmbianceEnabled}
                trackColor={{ false: '#2D2E41', true: '#EDA441' }}
                thumbColor="#FFFFFF"
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
                onValueChange={setBrightness}
                minimumTrackTintColor={ambianceEnabled ? "#EDA441" : "#2D2E41"}
                maximumTrackTintColor="#2D2E41"
                thumbTintColor="#FFFFFF"
                step={1}
              />
            </View>
          </View>

          {/* Sound System */}
          <View style={styles.controlCard}>
            <View style={styles.controlCardMain}>
              <View style={styles.controlIconWrapPurple}>
                <Speaker color={soundEnabled ? "#BA82F7" : "#5b358cff"} size={24} />
              </View>
              <View style={styles.controlTextContent}>
                <Text style={styles.controlTitle}>Sound System</Text>
                <Text style={styles.controlSubtitle}>Sonos Arc + Sub</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#2D2E41', true: '#8E52D5' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Volume</Text>
                <Text style={styles.sliderValue}>{soundVolume}%</Text>
              </View>
              <View style={[styles.sliderSection, styles.sliderSectionWithIcons]}>
                <Volume1 color="#62667E" size={20} />
                <Slider
                  style={{ height: 40, flex: 1, marginHorizontal: 8 }}
                  minimumValue={0}
                  maximumValue={100}
                  value={soundVolume}
                  onValueChange={setSoundVolume}
                  minimumTrackTintColor={soundEnabled ? "#8E52D5" : "#2D2E41"}
                  maximumTrackTintColor="#2D2E41"
                  thumbTintColor="#FFFFFF"
                  step={1}
                />
                <Volume2 color="#62667E" size={20} />
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
    backgroundColor: '#12131D',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 32,
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
    backgroundColor: '#374187',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4C65E4',
  },
  avatarHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#56609C',
    position: 'absolute',
    top: 8,
  },
  avatarBody: {
    width: 44,
    height: 22,
    backgroundColor: '#56609C',
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
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#12131D',
  },
  welcomeText: {
    color: '#62667E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: {
    color: '#FFFFFF',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  editButton: {
    color: '#4C65E4',
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
    backgroundColor: 'rgba(23, 30, 71, 0.5)',
  },
  sceneOverlayBlack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sceneBottom: {
    position: 'absolute',
    bottom: 20,
    left: 16,
  },
  sceneName: {
    color: '#FFFFFF',
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
    color: '#BAC4F9',
    fontSize: 13,
    fontWeight: '500',
  },
  sceneSubtextPlain: {
    color: '#9E9EA5',
    fontSize: 13,
    fontWeight: '500',
  },
  controlsList: {
    paddingHorizontal: 20,
  },
  controlCard: {
    backgroundColor: '#1E1F2E',
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
    backgroundColor: 'rgba(76, 101, 228, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  controlIconWrapOrange: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(237, 164, 65, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  controlIconWrapPurple: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(142, 82, 213, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  controlTextContent: {
    flex: 1,
  },
  controlTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  controlSubtitle: {
    color: '#62667E',
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
    color: '#62667E',
    fontSize: 13,
    fontWeight: '500',
  },
  sliderValue: {
    color: '#62667E',
    fontSize: 13,
    fontWeight: '500',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#2D2E41',
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
