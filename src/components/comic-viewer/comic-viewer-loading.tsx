import ImagePlaceholder from '../image-placeholder';

export default function ComicViewerLoading() {
    return (
        <div className="relative -mx-4 flex aspect-square max-w-3xl justify-center overflow-hidden rounded-xl border p-16 sm:mx-auto">
            <ImagePlaceholder />

            <p>Đang xử lý dữ liệu...</p>
        </div>
    );
}
