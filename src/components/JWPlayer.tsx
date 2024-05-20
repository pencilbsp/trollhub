import JWP from "@jwplayer/jwplayer-react";

type JWPayerProps = {
  config?: jwplayer.PlayerConfig;
  src?: string | jwplayer.Source;
  playlist?: jwplayer.PlaylistItem[];
};

export default function JWPlayer({ src, config }: JWPayerProps) {
  return (
    <JWP
      file={src}
      config={config || {}}
      library="/js/jwplayer/library/8.21.2.js"
    />
  );
}
