import React, { useRef, forwardRef, useImperativeHandle } from "react";

export type AudioPlayerHandle = {
  play: () => void;
  pause: () => void;
};

const AudioPlayer = forwardRef<AudioPlayerHandle, { base64: string }>(
  ({ base64 }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useImperativeHandle(ref, () => ({
      play: () => {
        audioRef.current?.play();
      },
      pause: () => {
        audioRef.current?.pause();
      },
    }));

    return (
      <audio hidden ref={audioRef} src={`data:audio/mp3;base64,${base64}`} />
    );
  }
);

export default AudioPlayer;
