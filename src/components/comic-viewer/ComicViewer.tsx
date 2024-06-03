import { Fragment } from "react";

import Image from "@/components/Image";
import ReloadButton from "./ReloadButton";
import RequestButton from "../RequestButton";
import { getImages } from "@/actions/imageActions";
import { type Chapter } from "@/actions/chapterActions";

type Props = {
  chapter: Chapter;
};

export default async function ComicViewer({ chapter }: Props) {
  const images = await getImages(chapter);

  return (
    <Fragment>
      {images.length === 0 ? (
        <div className="border border-dashed px-4 py-8 flex flex-col gap-4 items-center justify-center rounded-xl">
          <p className="text-lg font-semibold text-center">
            Nội dung không khả dụng ngay bây giờ, vui lòng quay lại sau. Xin cám
            ơn!
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <RequestButton chapterId={chapter.id} />
            <ReloadButton fid={chapter.fid} id={chapter.id} status={chapter.status} />
          </div>
        </div>
      ) : chapter.type === "comic" ? (
        <div className="-mx-4 sm:mx-auto max-w-3xl border rounded-xl overflow-hidden">
          {images.map((img, index) => {
            return (
              <Image
                alt=""
                src={img}
                effect="blur"
                tmpRatio="1/1"
                threshold={2400}
                key={chapter.id + index}
              />
            );
          })}
        </div>
      ) : (
        <div className="sm:mx-auto max-w-3xl font-semibold text-xl">
          <p className="select-none whitespace-pre-wrap text-stone-600 dark:text-stone-400">
            {images[0]}
          </p>
        </div>
      )}
    </Fragment>
  );
}
