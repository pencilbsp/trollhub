import ImagePlaceholder from '../image-placeholder';

export default function ComicViewerLoading() {
    return (
        <div className="relative flex justify-center overflow-hidden -mx-4 sm:mx-auto max-w-3xl aspect-square border rounded-xl p-16">
            <ImagePlaceholder />

            <p>Đang xử lý dữ liệu...</p>
        </div>
    );
}
