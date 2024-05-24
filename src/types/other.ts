export type PlayerInterface = "jwplayer" | "vidstack";

export type PlayerSource = {
  src: string;
  key: string;
  type: string;
  label: string;
};

export type PlayerError = {
  code?: number;
  message: string;
};
