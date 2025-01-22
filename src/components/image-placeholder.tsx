export default function ImagePlaceholder() {
    return (
        <div className="absolute inset-0 aspect-square overflow-hidden bg-curtain bg-1/3 bg-clip-border bg-center bg-no-repeat bg-origin-content">
            <div className="h-full w-full animate-shine bg-shine bg-400 opacity-80" />
        </div>
    );
}
