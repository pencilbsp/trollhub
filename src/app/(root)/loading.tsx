import SpinerIcon from "@/components/icons/SpinerIcon";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="fixed inset-0 z-[99] bg-background flex items-center justify-center">
      <SpinerIcon />
      <span className="ml-2">Đang tải trang...</span>
    </div>
  );
}
