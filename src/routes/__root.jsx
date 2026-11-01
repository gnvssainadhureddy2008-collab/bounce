import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import { PrefsProvider } from "@/lib/PrefsContext";
import { Base44Scripts } from "base44:document";
import appCss from "@/index.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Bounce — every setback is a signal, not a failure" },
      {
        name: "description",
        content:
          "Bounce is an adaptive healthy-behaviour coach for movement, nutrition, sleep and quitting smoking. Small feasible actions, no-blame recovery, and progress that never resets to zero.",
      },
      { name: "theme-color", content: "#06161c" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Bounce" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "format-detection", content: "telephone=no" },
      { property: "og:title", content: "Bounce — adaptive healthy-behaviour coach" },
      {
        property: "og:description",
        content: "Small feasible actions. Recovery without blame. Sustained change, measured.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Noto+Kufi+Arabic:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  return (
    <PrefsProvider>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </PrefsProvider>
  );
}

// The document. There is no index.html: the server renders <html> from here.
function RootDocument({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Language, reading direction, theme and calm mode are device-level choices.
            They are read before the first paint so an Arabic reader never sees the
            page arrive left-to-right and then flip. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var r=document.documentElement;var p=JSON.parse(localStorage.getItem('bounce.prefs')||'null');if(!p){var l=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||''];p={lang:l.some(function(v){return String(v).toLowerCase().indexOf('ar')===0;})?'ar':'en',theme:'dark'};}var ar=p.lang==='ar';r.lang=ar?'ar':'en';r.dir=ar?'rtl':'ltr';r.classList.add(p.theme==='light'?'light':'dark');if(p.calm)r.classList.add('calm');}catch(e){}})();",
          }}
        />
      </head>
      {/* data-react-root: the builder's preview bridge looks for #root and falls back to this. */}
      <body data-react-root="true" className="film grain">
        {children}
        <Base44Scripts />
        <Scripts />
      </body>
    </html>
  );
}