import React, { useEffect } from 'react';
import { usePlayback } from '../hooks/usePlayback';
import { useQueueController } from '../hooks/useQueueController';

export default function PlaybackQueueController() {
  const { nowPlaying, setPosition, setPlaying } = usePlayback();
  const { playNextOrStop } = useQueueController();

  useEffect(() => {
    if (!nowPlaying?.isPlaying) return;

    const timeout = setTimeout(() => {
      const nextPosition = Math.min(
        nowPlaying.positionSeconds + 1,
        nowPlaying.durationSeconds
      );

      if (nextPosition >= nowPlaying.durationSeconds) {
        setPosition(nowPlaying.durationSeconds);
        setPlaying(false);
        playNextOrStop().catch(() => {});
        return;
      }

      setPosition(nextPosition);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    nowPlaying?.durationSeconds,
    nowPlaying?.isPlaying,
    nowPlaying?.mediaId,
    nowPlaying?.positionSeconds,
    playNextOrStop,
    setPlaying,
    setPosition,
  ]);

  return null;
}
