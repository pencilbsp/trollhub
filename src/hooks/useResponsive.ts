import useMediaQuery from "./useMediaQuery"
import tailwindConfig from "../../tailwind.config.js"
import resolveConfig from "tailwindcss/resolveConfig"
import { ScreensConfig } from "tailwindcss/types/config"

const fullConfig = resolveConfig(tailwindConfig)
const breakpoints = { xs: "0px", ...fullConfig?.theme?.screens } as ScreensConfig

// ----------------------------------------------------------------------

type ReturnType = boolean

type Query = "up" | "down" | "between" | "only"

type Value = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

const getBreakpointValue = (breakpoint: Value) => {
  const str = breakpoints?.[breakpoint as keyof ScreensConfig] as string
  return str ? Number(str.replace(/(?:px|rem|em)/, "")) : Infinity
}

const breakpoint = {
  up: (breakpoint: Value) => `(min-width:${getBreakpointValue(breakpoint)}px)`,
  down: (breakpoint: Value) => `(max-width:${getBreakpointValue(breakpoint) - 0.05}px)`,
  between: (start: Value, end: Value) =>
    `(min-width:${getBreakpointValue(start)}px) and (max-width:${getBreakpointValue(end) - 0.05}px)`,
  only: (start: Value) => {
    const index = Object.keys(breakpoints).findIndex((key) => key === start)
    const end = Object.keys(breakpoints)[index + 1] as Value
    if (!end) return `(min-width:${getBreakpointValue(start)}px)`
    return `(min-width:${getBreakpointValue(start)}px) and (max-width:${getBreakpointValue(end) - 0.05}px)`
  },
}

export default function useResponsive(query: Query, start: Value, end?: Value): ReturnType {
  const mediaUp = useMediaQuery(breakpoint.up(start))

  const mediaDown = useMediaQuery(breakpoint.down(start))

  const mediaBetween = useMediaQuery(breakpoint.between(start, end!))

  const mediaOnly = useMediaQuery(breakpoint.only(start))

  if (query === "up") {
    return mediaUp
  }

  if (query === "down") {
    return mediaDown
  }

  if (query === "between") {
    return mediaBetween
  }

  return mediaOnly
}
