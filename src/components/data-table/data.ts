import {
  ArrowDownIcon,
  ArrowRightIcon,
  CircleIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons"

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
  {
    value: "contentTitle",
    label: "Tên nội dung",
  },
]

export const statuses = [
  {
    value: "pending",
    label: "Pending",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "ready",
    label: "Ready",
    icon: CircleIcon,
  },
  {
    value: "error",
    label: "Error",
    icon: StopwatchIcon,
  },
]

export const priorities = [
  {
    label: "Chỉ app",
    value: "true",
    icon: ArrowDownIcon,
  },
  {
    label: "Cả app và web",
    value: "false",
    icon: ArrowRightIcon,
  },
]
