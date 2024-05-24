import { Fragment } from "react";

import { PlayerSource } from "@/types/other";
import { USER_CONTENTS_HOST } from "@/config";

import RequestButton from "./RequestButton";
import VideoPlayer, { VideoPlayerError } from "./VideoPlayer";

type Props = {
  vid: string;
  fid: string;
  contentId: string;
};

async function getHlsAvailable({
  fid,
  vid,
}: Props): Promise<{ providers: PlayerSource[]; default: string }> {
  try {
    const q = new URLSearchParams({ fid, id: vid });
    const apiUrl = `${USER_CONTENTS_HOST}/api/get-m3u8-available?${q.toString()}`;
    const response = await fetch(apiUrl, { cache: "no-cache" });
    const data = await response.json();
    return data;
  } catch (error) {
    return { providers: [] } as any;
  }
}

export default async function VideoView(prop: Props) {
  const sources = await getHlsAvailable(prop);

  return (
    <Fragment>
      {sources.providers.length ? (
        <div className="-mx-4 sm:mx-0 sm:w-full overflow-hidden">
          <VideoPlayer
            vid={prop.vid}
            contentId={prop.contentId}
            playerInterface="jwplayer"
            sources={sources.providers}
            defaultSource={sources.default}
          />
        </div>
      ) : (
        <VideoPlayerError message="Video này hiện chưa được xử lý, vui lòng thử lại sau.">
          <RequestButton chapterId={prop.vid} />
        </VideoPlayerError>
      )}
    </Fragment>
  );
}
