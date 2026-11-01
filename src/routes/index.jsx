import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import Hero from "@/components/landing/Hero";
import IntroOverlay from "@/components/landing/IntroOverlay";
import SceneSpark from "@/components/landing/SceneSpark";
import SceneFade from "@/components/landing/SceneFade";
import SceneCliff from "@/components/landing/SceneCliff";
import SceneTurn from "@/components/landing/SceneTurn";
import ScenePhone from "@/components/landing/ScenePhone";
import ScenePersonas from "@/components/landing/ScenePersonas";
import ScenePrivacy from "@/components/landing/ScenePrivacy";
import SceneProof from "@/components/landing/SceneProof";
import SceneFinale from "@/components/landing/SceneFinale";
import { usePrefs } from "@/lib/PrefsContext";
import { setGuest } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bounce — every setback is a signal, not a failure" },
      {
        name: "description",
        content:
          "An adaptive healthy-behaviour coach for Abu Dhabi and beyond: small feasible actions, a plan that learns what works for you, and no-blame recovery that never resets progress.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { lang, setLang } = usePrefs();
  const navigate = useNavigate();

  const onSignIn = useCallback(() => {
    setGuest(false);
    navigate({ to: "/login", search: { returnTo: "/today" } });
  }, [navigate]);

  const onGuest = useCallback(() => {
    setGuest(true);
    navigate({ to: "/today" });
  }, [navigate]);

  const onLang = useCallback(() => setLang(lang === "ar" ? "en" : "ar"), [lang, setLang]);

  return (
    <div className="relative bg-background">
      <a
        href="#problem"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-sand focus:px-4 focus:py-2 focus:text-sm focus:text-[#06161c]"
      >
        {lang === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
      </a>
      <IntroOverlay lang={lang} />
      <div id="top" />
      <Hero lang={lang} onSignIn={onSignIn} onGuest={onGuest} onImpact={() => navigate({ to: "/impact" })} onLang={onLang} />
      <SceneSpark lang={lang} />
      <SceneFade lang={lang} />
      <SceneCliff lang={lang} />
      <SceneTurn lang={lang} />
      <ScenePhone lang={lang} onSignIn={onSignIn} />
      <ScenePersonas lang={lang} onLang={onLang} />
      <ScenePrivacy lang={lang} />
      <SceneProof lang={lang} />
      <SceneFinale
        lang={lang}
        onSignIn={onSignIn}
        onGuest={onGuest}
        onImpact={() => navigate({ to: "/impact" })}
        onLang={onLang}
      />
    </div>
  );
}