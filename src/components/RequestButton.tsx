"use client";

import { toast } from "sonner";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  Dialog,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import LoadingButton from "@/components/LoadingButton";
import { checkRequestStatus, requestChapter } from "@/actions/chapterActions";

type Props = {
  chapterId: string;
  contentTitle?: string;
  chapterTitle?: string;
};

export default function RequestButton({
  chapterId,
  contentTitle,
  chapterTitle,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [show, setShow] = useState(false);
  const [requested, setRequested] = useState(false);
  const [pending, startTransition] = useTransition();
  const [totalRequest, setTotalRequest] = useState(-1);

  const handleRequest = () =>
    startTransition(async () => {
      try {
        const message = inputRef.current?.value;
        const result = await requestChapter(chapterId, message);
        if (result.error) throw new Error(result.error.message);

        setShow(false);
        setRequested(result.status);
        setTotalRequest(result.totalRequest);
        toast.success(result.message);

        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    });

  useEffect(() => {
    (async () => {
      try {
        const result = await checkRequestStatus(chapterId);
        setRequested(!!result.requested);
        setTotalRequest(result.totalRequest || 0);

        if (result.error) throw new Error(result.error.message);
      } catch (error: any) {
        toast.success(error.message);
      }
    })();
  }, [chapterId]);

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={requested || totalRequest < 0}>
          {requested
            ? totalRequest > 1
              ? `Bạn và ${totalRequest - 1} người khác đã gửi yêu cầu`
              : `Bạn đã gửi yêu cầu`
            : `Gửi yêu cầu`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yêu cầu cập nhật nội dung</DialogTitle>
          <DialogDescription>
            Chúng tôi sẽ nỗ lực cập nhật sớm nhất nội dung mà bạn yêu cầu. Bạn
            có thể để lại lời nhắn cho chúng tôi nếu cần.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Textarea
            ref={inputRef}
            maxLength={500}
            disabled={pending}
            placeholder="Lời nhắn của bạn... (tối đa 500 kí tự)"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={pending} type="button" variant="destructive">
              Huỷ
            </Button>
          </DialogClose>

          <LoadingButton
            variant="outline"
            disabled={pending}
            isLoading={pending}
            onClick={handleRequest}
            loadingText="Đang yêu cầu"
          >
            Gửi yêu cầu
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
