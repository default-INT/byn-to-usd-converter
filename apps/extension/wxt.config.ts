import { defineConfig } from "wxt";
import { SUPPORTED_SITE_MATCHES } from "./utils/supported-sites";

// Chrome-first. Firefox / Safari targets come later.
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "BYN Конвертер realt.by / re.kufar.by",
    description: "Показывает суммы в USD на страницах realt.by, re.kufar.by и av.by по официальному курсу НБ РБ",
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
      exclude: ["@byn/adapters", "@byn/core", "@byn/dom-scanner", "@byn/ui-kit"],
    },
  }),
});
