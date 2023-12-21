import { Button } from "./ui/Button"
import SpinerIcon from "./icons/SpinerIcon"

type Props = {
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
  [key: string]: any
}

export default function LoadingButton({ isLoading, loadingText, children, ...others }: Props) {
  return (
    <Button {...others}>
      {isLoading && <SpinerIcon className="mr-1.5" />}
      {isLoading ? loadingText ?? children : children}
    </Button>
  )
}
