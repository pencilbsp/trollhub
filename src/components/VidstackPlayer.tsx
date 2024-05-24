import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import {
  MediaPlayer,
  MediaProvider,
  MediaPlayerProps,
  MediaPlayerInstance,
} from "@vidstack/react";
import { useRef } from "react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { PlayerError, PlayerSource } from "@/types/other";

interface Props extends Omit<MediaPlayerProps, "children"> {
  currentTime: number;
  thumbnails?: string;
  source?: PlayerSource | null;
  onTime?: (time: number) => void;
  onError?: (error: PlayerError) => void;
}

const VidstackPlayer = function ({
  onTime,
  source,
  onError,
  thumbnails,
  currentTime,
  ...props
}: Props) {
  const player = useRef<MediaPlayerInstance>(null);

  return (
    <MediaPlayer
      playsinline
      ref={player}
      keyTarget="player"
      aspectRatio="16/9"
      src={source as any}
      onTimeUpdate={(e) => {
        if (
          player.current &&
          !player.current.paused &&
          typeof onTime === "function"
        ) {
          onTime(e.currentTime);
        }
      }}
      onCanPlay={() => {
        if (player.current && currentTime > 0) {
          player.current.currentTime = currentTime;
        }
      }}
      onHlsError={(error) => {
        if (typeof onError === "function") {
          onError({ message: error.details });
        }
      }}
      keyShortcuts={{
        toggleMuted: "m",
        volumeUp: "ArrowUp",
        toggleCaptions: "c",
        toggleFullscreen: "f",
        volumeDown: "ArrowDown",
        togglePaused: "k Space",
        seekBackward: "ArrowLeft",
        seekForward: "ArrowRight",
        togglePictureInPicture: "i",
      }}
      {...props}
    >
      <MediaProvider />
      <DefaultVideoLayout
        noScrubGesture
        thumbnails={thumbnails}
        icons={defaultLayoutIcons}
      />
    </MediaPlayer>
  );
};

VidstackPlayer.displayName = "VidstackPlayer";

export default VidstackPlayer;
