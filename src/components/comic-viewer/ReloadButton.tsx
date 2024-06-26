"use client";

import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChapterStatus } from "@prisma/client";

import LoadingButton from "@/components/LoadingButton";
import { resetChapterStatus } from "@/actions/chapterActions";

type Props = {
    id: string;
    fid: string;
    mutate?: any;
    status?: ChapterStatus;
};

export default function ReloadButton({ id, fid, mutate }: Props) {
    const { refresh } = useRouter();
    const [pending, startTransition] = useTransition();

    const onClick = () =>
        startTransition(async () => {
            const result = await resetChapterStatus(id, fid);
            if (result.error) {
                toast.error(result.error.message);
            } else {
                toast.success(result.message);
                if (typeof mutate === "function") {
                    mutate();
                } else {
                    refresh();
                }
            }
        });

    return (
        <LoadingButton variant="outline" isLoading={pending} onClick={onClick}>
            Thử lại ngay
        </LoadingButton>
    );
}
