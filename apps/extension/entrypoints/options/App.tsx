import { useEffect, useState } from "react";
import { Button } from "@byn/ui-kit";

const ENABLED_KEY = "settings:enabled";

export function App() {
  const [enabled, setEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void browser.storage.local.get(ENABLED_KEY).then((data) => {
      if (typeof data[ENABLED_KEY] === "boolean") {
        setEnabled(data[ENABLED_KEY] as boolean);
      }
    });
  }, []);

  async function save() {
    await browser.storage.local.set({ [ENABLED_KEY]: enabled });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: 24,
        fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
        color: "#0f2e24",
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Settings</h1>
      <p style={{ color: "#5a6b64", marginBottom: 20 }}>
        Control how BYN amounts are converted on pages.
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Show USD equivalents next to BYN amounts
      </label>
      <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center" }}>
        <Button onClick={() => void save()}>Save</Button>
        {saved ? <span style={{ fontSize: 13, color: "#1a5f4a" }}>Saved</span> : null}
      </div>
    </main>
  );
}
