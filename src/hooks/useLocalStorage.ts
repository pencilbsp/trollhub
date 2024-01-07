"use client"

import { useState, useEffect } from "react"

// ----------------------------------------------------------------------

const getValue = (key: string) => {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem(key) ?? null
  }

  return null
}

export default function useLocalStorage(key: string, defaultValue: any) {
  const [value, setValue] = useState(() => {
    const storedValue = getValue(key)
    return storedValue === null ? defaultValue : JSON.parse(storedValue)
  })

  const setValueInLocalStorage = (newValue: any) => {
    setValue((currentValue: any) => {
      const result = typeof newValue === "function" ? newValue(currentValue) : newValue
      localStorage.setItem(key, JSON.stringify(result))
      return result
    })
  }

  useEffect(() => {
    const listener = (e: StorageEvent) => {
      if (e.newValue && e.storageArea === localStorage && e.key === key) {
        setValue(JSON.parse(e.newValue))
      }
    }
    window.addEventListener("storage", listener)

    return () => {
      window.removeEventListener("storage", listener)
    }
  }, [key, defaultValue])

  return [value, setValueInLocalStorage]
}
