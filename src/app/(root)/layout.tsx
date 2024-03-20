import Head from "next/head"
import Script from "next/script"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { getServerSession } from "next-auth/next"

import "@/globals.css"

import Header from "@/components/Header"
import SettingsProvider from "@/contexts/SettingsContext"
import SettingsDialog from "@/components/SettingsDialog"
import { ThemeProvider } from "@/components/ThemeProvider"
import { GA_MEASUREMENT_ID, METADATA_BASE, GOOGLE_ADSENSE_ID } from "@/config"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextAuthProvider } from "@/components/sections/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE),
  title: "Troll with Fuhu",
  description: "Generated by pendev.cc",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <Script async custom-element="amp-auto-ads" src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js" />
        {GOOGLE_ADSENSE_ID && (
          <Script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_ID}`}
          />
        )}
      </head>

      {GA_MEASUREMENT_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
          <Script id="google-analytics">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
          </Script>
        </>
      )}

      <body className={inter.className}>
        {GOOGLE_ADSENSE_ID && <amp-auto-ads type="adsense" data-ad-client={GOOGLE_ADSENSE_ID}></amp-auto-ads>}

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NextAuthProvider session={session}>
            <SettingsProvider>
              <SettingsDialog />
              <div className="relative flex flex-col">
                <Header />
                {children}
              </div>
            </SettingsProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
