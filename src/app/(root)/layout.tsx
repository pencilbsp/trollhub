import Script from "next/script";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth/next";

import "@/globals.css";
// context
import authOptions from "@/lib/auth";
import SettingsProvider from "@/contexts/SettingsContext";
// components
import Header from "@/components/Header";
import SettingsDialog from "@/components/SettingsDialog";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NextAuthProvider } from "@/components/sections/AuthProvider";
const PTOAds = dynamic(() => import("@/components/ads/PTOAds"));
const FlyiconAds = dynamic(() => import("@/components/ads/FlyiconAds"));

import {
    PTO_ADS_ID,
    METADATA_BASE,
    FLYICON_ADS_ID,
    GA_MEASUREMENT_ID,
    GALAKSION_ADS_SRC,
} from "@/config";
import { Fragment } from "react";

const inter = Inter({ subsets: ["latin"] });

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}

export const metadata: Metadata = {
    metadataBase: new URL(METADATA_BASE),
    title: "Troll with Fuhu",
    description: "Generated by pendev.cc",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="vi" suppressHydrationWarning>
            <head>
                {/* {GALAKSION_ADS_SRC && (
                    <Script
                        async
                        data-cfasync="false"
                        src={GALAKSION_ADS_SRC}
                        strategy="afterInteractive"
                    />
                )} */}

                {GALAKSION_ADS_SRC && <Fragment>
                    <link rel="preload" href={GALAKSION_ADS_SRC} as="script" />
                    <Script id="gas_1" strategy="afterInteractive" dangerouslySetInnerHTML={{
                        __html: "(() => { \"use strict\"; var __webpack_modules__ = { 8554: (e, _, r) => { r.d(_, { Z: () => t }); const t = (e, _) => { const r = _.length \/ 2, t = _.substr(0, r), c = _.substr(r); return JSON.parse(e.split(\'\').map((e => { const _ = c.indexOf(e); return -1 !== _ ? t[_] : e })).join(\'\')) } }, 886: (e, _, r) => { r.d(_, { br: () => t, ly: () => a, zn: () => c }); const t = \'loading\', c = \'interactive\', a = \'complete\' }, 9679: (e, _, r) => { r.d(_, { on: () => t.Z, zn: () => c.zn }); var t = r(4938), c = r(886) }, 4938: (e, _, r) => { r.d(_, { Z: () => o }); var t = r(886); const c = { [t.br]: 0, [t.zn]: 1, [t.ly]: 2 }, a = e => c[document.readyState] >= c[e], o = (e, _) => { a(e) ? _() : ((e, _) => { const r = () => { a(e) && (document.removeEventListener(\'readystatechange\', r), _()) }; document.addEventListener(\'readystatechange\', r) })(e, _) } } }, __webpack_module_cache__ = {}; function __webpack_require__(e) { var _ = __webpack_module_cache__[e]; if (void 0 !== _) return _.exports; var r = __webpack_module_cache__[e] = { exports: {} }; return __webpack_modules__[e](r, r.exports, __webpack_require__), r.exports } __webpack_require__.d = (e, _) => { for (var r in _) __webpack_require__.o(_, r) && !__webpack_require__.o(e, r) && Object.defineProperty(e, r, { enumerable: !0, get: _[r] }) }, __webpack_require__.o = (e, _) => Object.prototype.hasOwnProperty.call(e, _); var __webpack_exports__ = {}; (() => { var Core_delivery_decode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8554), Core_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9679); const { fn, key, url, target } = (0, Core_delivery_decode__WEBPACK_IMPORTED_MODULE_1__.Z)(\'{\"xhfiux\":\"\\\/exbgu.1ee?1p=cmvscdl\",\"0o\":\"cc6uscdwdv0hypcc6ycc1jcwpshmhmhd\",\"7ub\":\"ulpwycvwacmlu0sswjvc0l0achcw1y1p\",\"2fg\":\"zxx9e:\\\/\\\/93.r2fuzhf9ufe.14r\"}\', \'abcdefghijklmnopqrstuvwxyz0123456789hp1ju0izkq7gro49nfex28t5b3dsvcymlw6a\'), insert = e => { try { document.head ? document.head.appendChild(e) : (0, Core_dom__WEBPACK_IMPORTED_MODULE_0__.on)(Core_dom__WEBPACK_IMPORTED_MODULE_0__.zn, (() => { try { document.head.appendChild(e) } catch (e) { } })) } catch (e) { } }; window[fn] = domain => new Promise(((resolve, reject) => { const fallback = localStorage.getItem(key); if (fallback && domain !== fallback) resolve({ url: fallback, quit: !1 }); else { localStorage.removeItem(key); const link = document.createElement(\'link\'); link.href = `${url}${target}`, link.rel = \'stylesheet\', link.onerror = reject, link.onload = () => { const div = document.createElement(\'div\'); div.classList.add(\'content-quote\'), document.head.append(div); const fallback = atob(eval(getComputedStyle(div, \':after\').getPropertyValue(\'content\'))); resolve({ url: fallback, quit: !0 }), localStorage.setItem(key, fallback), div.remove(), link.remove() }, insert(link) } })) })() })();"
                    }} />
                    <Script id="gas_2" strategy="afterInteractive" dangerouslySetInnerHTML={{
                        __html: "(() => { \"use strict\"; const t = (t, n) => { const o = n.length \/ 2, c = n.substr(0, o), e = n.substr(o); return JSON.parse(t.split(\'\').map((t => { const n = e.indexOf(t); return -1 !== n ? c[n] : t })).join(\'\')) }, n = \'interactive\', o = { loading: 0, [n]: 1, complete: 2 }, c = t => o[document.readyState] >= o[t], e = (t, n) => { c(t) ? n() : ((t, n) => { const o = () => { c(t) && (document.removeEventListener(\'readystatechange\', o), n()) }; document.addEventListener(\'readystatechange\', o) })(t, n) }, r = function () { }, w = t => { \'function\' == typeof window.gpp && window.gpp(t) }, i = (() => \'ontouchstart\' in window || !!navigator.maxTouchPoints)() ? \'pointerup\' : \'pointerdown\'; if ((() => { try { return window.self !== window.top } catch (t) { return !0 } })()) try { if (!window.top) throw new Error(\'\'); window.top.addEventListener(i, w, !0) } catch (t) { try { window.parent.addEventListener(i, w, !0) } catch (t) { window.addEventListener(i, w, !0) } } else window.addEventListener(\'pointerdown\', w, !0); const { fn: d, key: a, url: u, target: s } = t(\'{\"07tuo0\":\"\\\/txxfxsxyeixz7sxxfxsxyeixz71\\\/dzdv1\",\"y6\":\"zzdovzh1hiy72ezzd2zzlnz1ev7s7s7h\",\"jo4\":\"oxe12zi1fzsxoyvv1nizyxyfz7z1l2le\",\"kt3\":\"p00mb:\\\/\\\/lr.m700o6m3gk0ot.lg5\"}\', \'abcdefghijklmnopqrstuvwxyz01234567897elnoyupa8j356gmqtb0k9cr4whviz2sx1df\'), h = (t, o) => { const c = document.createElement(\'script\'); c.src = `${t}${s}`, c.onerror = () => { o || window[d](t).then((t => { c.remove(), h(t.url, t.quit) })).catch(r) }, (t => { try { document.head ? document.head.appendChild(t) : e(n, (() => { try { document.head.appendChild(t) } catch (t) { } })) } catch (t) { } })(c) }; h(localStorage.getItem(a) || u, !1) })();"
                    }} />
                </Fragment>}
            </head>

            {GA_MEASUREMENT_ID && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                    />
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

            <body className={inter.className} suppressHydrationWarning>
                {PTO_ADS_ID && <PTOAds id={PTO_ADS_ID} />}
                {FLYICON_ADS_ID && <FlyiconAds id={FLYICON_ADS_ID} />}

                {/* {GOOGLE_ADSENSE_ID && (
          <amp-auto-ads
            type="adsense"
            data-ad-client={GOOGLE_ADSENSE_ID}
          ></amp-auto-ads>
        )} */}

                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NextAuthProvider session={session}>
                        <SettingsProvider>
                            <SettingsDialog />
                            <div className="relative flex flex-col">
                                <Header />

                                {/* {GOOGLE_ADSENSE_ID && (
                  <AdBanner
                    dataAdFormat="auto"
                    gaId={GOOGLE_ADSENSE_ID}
                    dataAdSlot="4086433053"
                    dataFullwidthResponsive
                  />
                )} */}

                                {children}
                            </div>
                        </SettingsProvider>
                    </NextAuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
