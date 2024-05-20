declare module "@jwplayer/jwplayer-react" {
  const JWPlayer: React.FunctionComponent<{
    library: string;
    ref?: React.Ref;
    config: jwplayer.SetupConfig;
    file?: string | jwplayer.Source;
    playlist?: jwplayer.PlaylistItem[];
    advertising?: jwplayer.AdvertisingConfig;
    didMountCallback?: (props: {
      player: jwplayer.PlayerAPI;
      id: string;
    }) => void;
    willUnmountCallback?: (props: {
      player: jwplayer.PlayerAPI;
      id: string;
    }) => void;
  }>;
  export default JWPlayer;
}
