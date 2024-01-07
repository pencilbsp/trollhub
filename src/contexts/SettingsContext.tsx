"use client"

import { ReactNode, createContext, useState } from "react"

import useLocalStorage from "@/hooks/useLocalStorage"

const defaultSettings = {
  open: false,
  showAdultContent: false,
}

const initialState = {
  ...defaultSettings,
  toggleOpenSetting: () => {},
  toggleShowAdultContent: () => {},
}

export const SettingsContext = createContext(initialState)

type Props = {
  children: ReactNode
}

export default function SettingsProvider({ children }: Props) {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useLocalStorage("settings", {
    showAdultContent: initialState.showAdultContent,
  })

  const toggleShowAdultContent = (show: boolean) => {
    setSettings({
      ...settings,
      showAdultContent: show,
    })
  }

  const toggleOpenSetting = () => setOpen(!open)

  return (
    <SettingsContext.Provider value={{ ...settings, open, toggleOpenSetting, toggleShowAdultContent }}>
      {children}
    </SettingsContext.Provider>
  )
}
