/* ═══════════ OFFSHORE STUDIOS · CONFIG ═══════════
   To switch on REAL accounts:
   1. Create a free project at supabase.com (2 minutes)
   2. Project Settings → API → copy "Project URL" and "anon public" key below
   3. Redeploy. That's it — the app detects the keys and uses real auth.
   While these are empty, the app runs in LOCAL MODE with the demo identities below. */
window.OS_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  /* LOCAL MODE identities (demo only — replaced by real accounts once Supabase is on) */
  LOCAL_USERS: [
    { email: "riley@offshore",  pass: "OFFSHORE", role: "admin",   name: "Riley" },
    { email: "john@offshore",   pass: "OFFSHORE", role: "admin",   name: "Mr John" },
    { email: "trader@offshore", pass: "DEMO",     role: "trading", name: "Trading Client" },
    { email: "client@offshore", pass: "DEMO",     role: "agency",  name: "Agency Client" }
  ],

  /* Module registry — each module registers itself; roles control visibility.
     Add a module = add one file + one line here. Nothing else changes. */
  MODULES: [
    { id: "home",     label: "Command Center", icon: "◈", roles: ["admin"] },
    { id: "claude",   label: "Claude",         icon: "✦", roles: ["admin"] },
    { id: "livemind", label: "The Live Mind",  icon: "〰", roles: ["admin","trading"] },
    { id: "clients",  label: "Clients",        icon: "❖", roles: ["admin"] },
    { id: "agency",   label: "Studios Agency", icon: "◍", roles: ["admin","agency"] },
    { id: "agents",   label: "AI & Agents",    icon: "✳", roles: ["admin"] }
  ],

  LINKS: {
    livemindSite: "https://28payouts.github.io/livemind/",
    agencySite:   "https://offshorestudios.netlify.app/"
  }
};
