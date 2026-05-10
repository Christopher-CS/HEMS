import { Audio } from 'expo-av';
import React, { useEffect, useRef } from 'react';
import { useDebugStore } from '../state/debug/store';
import { useRepositories } from '../state/repositories/RepositoriesProvider';
import { usePlaybackStore } from '../state/playback/store';
import { resolveMediaUrl } from '../utils/resolve-media-url';

/**
 * Plays library music locally only in mock mode. In live mode Unity/back-end own
 * playback, so the phone acts as a controller and stays silent.
 * Must render under PlaybackProvider + RepositoriesProvider + DebugProvider.
 */
export default function LibraryAudioPlayer() {
  const { state, setPosition, setPlaying } = usePlaybackStore();
  const debug = useDebugStore();
  const { config } = useRepositories();
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadedKeyRef = useRef<string | null>(null);
  const lastReportedPositionRef = useRef<number>(0);

  useEffect(() => {
    const current = state.current;
    let cancelled = false;
    const allowLocalPlayback = debug.state.mode !== 'live';

    const run = async () => {
      if (!allowLocalPlayback || !current?.audioUrl) {
        if (soundRef.current) {
          try {
            await soundRef.current.unloadAsync();
          } catch {
            /* ignore */
          }
          soundRef.current = null;
        }
        loadedKeyRef.current = null;
        return;
      }

      const uri = resolveMediaUrl(config.backendUrl, current.audioUrl);
      const key = `${current.mediaId}|${current.audioUrl}`;

      if (soundRef.current && loadedKeyRef.current === key) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            if (current.isPlaying) await soundRef.current.playAsync();
            else await soundRef.current.pauseAsync();
          }
        } catch (err) {
          console.warn('[LibraryAudioPlayer] play/pause', err);
        }
        return;
      }

      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {
          /* ignore */
        }
        soundRef.current = null;
      }

      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          { uri }, 
          { shouldPlay: current.isPlaying },
          (status) => {
            if (status.isLoaded) {
              const seconds = Math.floor(status.positionMillis / 1000);
              
              if (lastReportedPositionRef.current !== seconds) {
                lastReportedPositionRef.current = seconds;
                setPosition(seconds);
              }
              
              if (status.didJustFinish) {
                setPlaying(false);
              }
            }
          }
        );
        
        if (cancelled) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
        loadedKeyRef.current = key;
      } catch (err) {
        console.warn('[LibraryAudioPlayer] load failed', uri, err);
        loadedKeyRef.current = null;
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [debug.state.mode, state.current?.mediaId, state.current?.audioUrl, state.current?.isPlaying, config.backendUrl]);

  useEffect(() => {
    const targetSeconds = state.current?.positionSeconds ?? 0;
    if (soundRef.current && Math.abs(targetSeconds - lastReportedPositionRef.current) >= 2) {
      soundRef.current.setPositionAsync(targetSeconds * 1000).catch(() => {});
      lastReportedPositionRef.current = targetSeconds;
    }
  }, [state.current?.positionSeconds]);

  useEffect(
    () => () => {
      void soundRef.current?.unloadAsync();
      soundRef.current = null;
      loadedKeyRef.current = null;
    },
    []
  );

  return null;
}
