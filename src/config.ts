export const INIT_CHAPTER = 8;
export const INIT_TAKE_CONTENT = 8;

const devMode = process.env.NODE_ENV !== "production";

export const SITE_NAME = "Trollhub";
export const SITE_URL = new URL(process.env.NEXTAUTH_URL!);

// export const USER_CONTENTS_HOST = devMode
//   ? process.env.NEXT_PUBLIC_USER_CONTENTS_HOST
//   : `https://usercontents.${SITE_URL.hostname}`;
export const USER_CONTENTS_HOST = process.env.NEXT_PUBLIC_USER_CONTENTS_HOST!

export const STATIC_HOST = process.env.NEXT_PUBLIC_STATIC_HOST;

export const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME!;

export const METADATA_BASE = process.env.NEXTAUTH_URL!;
export const NEXT_AUTH_SECRET = process.env.NEXT_AUTH_SECRET!;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID!;
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET!;

export const GOOGLE_ADSENSE_ID = process.env.GOOGLE_ADSENSE_ID;
export const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID;

export const REDIS_URL = process.env.REDIS_URL;
export const REDIS_PASS = process.env.REDIS_PASS;
export const REDIS_USER = process.env.REDIS_USER || "default";
export const REDIS_NAMESPACE = process.env.REDIS_NAMESPACE || "";

export const METADATA_EX_TIME = 24 * 60 * 60; // 1 Ngày
export const EPISODE_EX_TIME = METADATA_EX_TIME * 2; // 2 ngày

export const STREAME_DASH_API = process.env.STREAME_DASH_API!;

export const ADULT_CATEGORY_ID = "653b8758642648daa52ea9a9";

export const PTO_ADS_ID = process.env.PTO_ADS_ID;
export const NATIVE_ADS_ID = process.env.NATIVE_ADS_ID;
export const FLYICON_ADS_ID = process.env.FLYICON_ADS_ID;

export const GALAKSION_ADS_SRC = process.env.GALAKSION_ADS_SRC;

export const filterable = [
  {
    label: "Cũ nhất",
    key: "createdAt_asc",
    disabled: (type: string) => false,
  },
  {
    label: "Mới nhất",
    key: "createdAt_desc",
    disabled: (type: string) => false,
  },
  {
    label: "Yêu cầu ít nhất",
    key: "chapterId_asc",
    disabled: (type: string) => type === "own",
  },
  {
    label: "Yêu cầu nhiều nhất",
    key: "chapterId_desc",
    disabled: (type: string) => type === "own",
  },
];
