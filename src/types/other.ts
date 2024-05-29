import { ContentType } from "@prisma/client";

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

export type ContentRank = {
  id: string;
  fid: string;
  view: number;
  akaTitle: string[];
  type: ContentType;
  title: string;
  thumbUrl: string;
  updatedAt: Date;
  creator: {
    name: string;
    avatar: string;
    userName: string;
  };
};
