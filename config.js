/* ═══════════ OFFSHORE STUDIOS · CONFIG ═══════════
   To switch on REAL accounts:
   1. Create a free project at supabase.com (2 minutes)
   2. Project Settings → API → copy "Project URL" and "anon public" key below
   3. Redeploy. That's it — the app detects the keys and uses real auth.
   While these are empty, the app runs in LOCAL MODE with the demo identities below. */
window.OS_CONFIG = {
  SUPABASE_URL: "https://jbqxbpletvoocxiizwdy.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_JLAY2oACx0ZqUHcrFTVjKg_iAZ6xlzH",

  /* LOCAL MODE identities (demo only — replaced by real accounts once Supabase is on)
     gals: which universes an account can enter. Mr John is Harmonic-only —
     Offshore Studios (agency, clients, web work) is Riley's personal world. */
  LOCAL_USERS: [
    { email: "riley@offshore",  pass: "OFFSHORE", role: "admin",   name: "Riley",  gals: ["harmonic", "offshore"] },
    { email: "john@offshore",   pass: "OFFSHORE", role: "admin",   name: "Mr John", gals: ["harmonic"] },
    { email: "trader@offshore", pass: "DEMO",     role: "trading", name: "Trading Client" },
    { email: "client@offshore", pass: "DEMO",     role: "agency",  name: "Agency Client" }
  ],

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
