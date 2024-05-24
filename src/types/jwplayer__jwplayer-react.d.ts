declare module "@jwplayer/jwplayer-react" {
  export interface JWPlayerProps {
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

    onAbsolutePositionReady?: (
      event: jwplayer.AbsolutePositionReadyParam
    ) => void;
    onAdClick?: (event: jwplayer.AdProgressParam) => void;
    onAdCompanions?: (event: jwplayer.AdCompanionsParam) => void;
    onAdComplete?: (event: jwplayer.AdProgressParam) => void;
    onAdSkipped?: (event: jwplayer.AdProgressParam) => void;
    onAdError?: (event: jwplayer.AdErrorParam) => void;
    onAdRequest?: (event: jwplayer.AdRequestParam) => void;
    onAdSchedule?: (event: jwplayer.AdScheduleParam) => void;
    onAdStarted?: (event: jwplayer.AdStartedParam) => void;
    onAdImpression?: (event: jwplayer.AdImpressionParam) => void;
    onAdPlay?: (event: jwplayer.AdPlayParam) => void;
    onAdPause?: (event: jwplayer.AdPlayParam) => void;
    onAdTime?: (event: jwplayer.AdTimeParam) => void;
    onAutostartNotAllowed?: (event: jwplayer.AutostartNotAllowedParam) => void;
    onCast?: (event: jwplayer.CastParam) => void;
    onComplete?: (event: jwplayer.CompleteParam) => void;
    onMeta?: (event: jwplayer.MetadataParam) => void;
    onMetadataCueParsed?: (event: jwplayer.MetadataCueParsedParam) => void;
    onAudioTracks?: (event: jwplayer.AudioTracksParam) => void;
    onAudioTrackChanged?: (event: jwplayer.AudioTrackChangedParam) => void;
    onFirstFrame?: (event: jwplayer.FirstFrameParam) => void;
    onBuffer?: (event: jwplayer.BufferParam) => void;
    onBufferChange?: (event: jwplayer.BufferChangeParam) => void;
    onCaptionsChanged?: (event: jwplayer.CaptionsChangedParam) => void;
    onCaptionsList?: (event: jwplayer.CaptionsListParam) => void;
    onControls?: (event: jwplayer.ControlsParam) => void;
    onError?: (event: jwplayer.ErrorParam) => void;
    onFloat?: (event: jwplayer.FloatParam) => void;
    onFullscreen?: (event: jwplayer.FullscreenParam) => void;
    onIdle?: (event: jwplayer.IdleParam) => void;
    onLevelsChanged?: (event: jwplayer.LevelsChangedParam) => void;
    onMute?: (event: jwplayer.MuteParam) => void;
    onVolume?: (event: jwplayer.VolumeParam) => void;
    onPause?: (event: jwplayer.PauseParam) => void;
    onPlay?: (event: jwplayer.PlayParam) => void;
    onPlaylist?: (event: jwplayer.PlaylistParam) => void;
    onPlaylistItem?: (event: jwplayer.PlaylistItemParam) => void;
    onReady?: (event: jwplayer.ReadyParam) => void;
    onResize?: (event: jwplayer.ResizeParam) => void;
    onVisualQuality?: (event: jwplayer.VisualQualityParam) => void;
    onPlaybackRateChanged?: (event: jwplayer.PlaybackRateChangedParam) => void;
    onLevels?: (event: jwplayer.LevelsParam) => void;
    onSeek?: (event: jwplayer.SeekParam) => void;
    onSetupError?: (event: jwplayer.ErrorParam) => void;
    onTime?: (event: jwplayer.TimeParam) => void;
    onWarning?: (event: jwplayer.WarningParam) => void;
  }
  const JWPlayer: React.FunctionComponent<JWPlayerProps>;
  export default JWPlayer;
}
