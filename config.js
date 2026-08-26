/* ═══════════ OFFSHORE STUDIOS · CONFIG ═══════════
   To switch on REAL accounts:
   1. Create a free project at supabase.com (2 minutes)
   2. Project Settings → API → copy "Project URL" and "anon public" key below
   3. Redeploy. That's it — the app detects the keys and uses real auth.
   While these are empty, the app runs in LOCAL MODE with the demo identities below. */
window.OS_CONFIG = {
  SUPABASE_URL: "https://jbqxbpletvoocxiizwdy.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_JLAY2oACx0ZqUHcrFTVjKg_iAZ6xlzH",

  /* Secure Claude relay (Deno Deploy). The API key lives ONLY on the relay
     server — never here. Set to "https://<name>.deno.dev/claude" once deployed
     and every signed-in role gets real Claude with zero keys in the browser. */
  RELAY_URL: "",

  /* FAILSAFE: these emails are ALWAYS admins with both universes,
     even if their Supabase metadata is missing or wrong. */
  ADMIN_EMAILS: ["rileylagan@gmail.com"],

  /* Demo identities RETIRED 25 Aug 2026 — real Supabase accounts confirmed working.
     The only doors in: Supabase Auth (admins + future client accounts) and
     locally-onboarded client records from ❖ Clients. */
  LOCAL_USERS: [],

  /* Module registry — each module registers itself; roles control visibility.
     galaxy: which work-life a module lives in — "harmonic", "offshore" or "both". */
  MODULES: [
    { id: "home",     label: "The Universe",     icon: "◈", roles: ["admin"], galaxy: "both" },
    { id: "claude",   label: "Claude",           icon: "✦", roles: ["admin","trading","agency"], galaxy: "both" },
    { id: "table",    label: "Round Table",      icon: "⬡", roles: ["admin"], galaxy: "offshore" },
    { id: "livemind", label: "The Live Mind",    icon: "〰", roles: ["admin","trading"], galaxy: "harmonic" },
    { id: "botlab",   label: "The Bot Lab",      icon: "⚗", roles: ["admin"], galaxy: "harmonic" },
    { id: "academy",  label: "Harmonic Projects", icon: "✺", roles: ["admin"], galaxy: "harmonic" },
    { id: "clients",  label: "Clients",          icon: "❖", roles: ["admin"], galaxy: "offshore" },
    { id: "agency",   label: "Studios Agency",   icon: "◍", roles: ["admin","agency"], galaxy: "offshore" },
    { id: "showcase", label: "What We Offer",    icon: "✧", roles: ["guest","admin"], galaxy: "offshore" },
    { id: "agents",   label: "AI & Agents",      icon: "✳", roles: ["admin"], galaxy: "harmonic" }
  ],

  /* The two work-lives. Shown as universe cards after sign-in (admins only). */
  GALAXIES: {
    harmonic: {
      name: "HARMONIC", sub: "trading · academy · agents", accent: "#00e8d0",
      art: "https://d8j0ntlcm91z4.cloudfront.net/user_3H4SzmK3yfFv5j6nbvNOM3d88rq/hf_20260821_175515_f25e921c-0e59-4a4b-b82c-95be8cdeaa03.png"
    },
    offshore: {
      name: "OFFSHORE STUDIOS", sub: "agency · clients · council", accent: "#a98bff",
      art: "https://d8j0ntlcm91z4.cloudfront.net/user_3H4SzmK3yfFv5j6nbvNOM3d88rq/hf_20260821_175515_0e57f17a-e1ff-4552-9a88-79c5bb294254.png"
    }
  },

  LINKS: {
    livemindSite: "https://28payouts.github.io/livemind/",
    agencySite:   "https://offshorestudios.netlify.app/"
  }
};
