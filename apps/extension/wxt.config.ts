import { defineConfig } from "wxt";
import { SUPPORTED_SITE_MATCHES } from "./utils/supported-sites";

// Chrome-first. Firefox / Safari targets come later.
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "BYN → USD Converter",
    description: "Converts Belarusian ruble amounts to USD on web pages",
    version: "0.0.1",
    permissions: ["storage", "alarms"],
    host_permissions: [
      "https://api.nbrb.by/*",
      "https://api.exchangerate.host/*",
      ...SUPPORTED_SITE_MATCHES,
    ],
  },
  vite: () => ({
    optimizeDeps: {
      exclude: ["@byn/core", "@byn/dom-scanner", "@byn/ui-kit"],
    },
  }),
});
