"use client"

import { Toaster } from "sonner"
import { useEffect } from "react"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => console.log("scope is: ", registration.scope))
    }
  }, [])

  return (
    <>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
      <Toaster closeButton richColors />
    </>
  )
}
