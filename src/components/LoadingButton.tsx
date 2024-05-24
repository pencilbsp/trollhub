import SpinerIcon from "./icons/SpinerIcon";
import { Button, ButtonProps } from "./ui/Button";

interface Props extends ButtonProps {
  className?: string;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export default function LoadingButton({
  children,
  isLoading,
  className,
  loadingText,
  ...others
}: Props) {
  return (
    <Button {...others} disabled={isLoading} className={className}>
      {isLoading && <SpinerIcon className="mr-1.5" />}
      {isLoading ? loadingText ?? children : children}
    </Button>
  );
}
