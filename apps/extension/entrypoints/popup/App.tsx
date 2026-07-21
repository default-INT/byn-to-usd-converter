import { useEffect, useState } from "react";
import { Button, RateBadge } from "@byn/ui-kit";
import type { RateResult } from "@byn/core";

interface RateResponse {
  ok: boolean;
  rate?: RateResult;
  error?: string;
}

export function App() {
  const [rate, setRate] = useState<RateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadRate() {
    setLoading(true);
    setError(null);
    try {
      const response = (await browser.runtime.sendMessage({
        type: "GET_RATE",
      })) as RateResponse;
      if (response?.ok && response.rate) {
        setRate(response.rate);
      } else {
        setError(response?.error ?? "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRate();
  }, []);

  const display =
    rate != null
      ? `1 USD = ${(1 / rate.rate).toFixed(4)} BYN`
      : loading
        ? "Loading…"
        : "—";

  return (
    <div
      style={{
        width: 280,
        padding: 16,
        fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
        background: "linear-gradient(160deg, #eef6f2 0%, #d5e8df 100%)",
        color: "#0f2e24",
      }}
    >
      <h1 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>
        USD → BYN
      </h1>
      <RateBadge label="Official rate (НБ РБ)" value={display} />
      {error ? (
        <p style={{ color: "#8b2e2e", fontSize: 12, marginTop: 10 }}>{error}</p>
      ) : null}
      {rate ? (
        <p style={{ fontSize: 11, color: "#5a6b64", marginTop: 8 }}>
          via {rate.provider} · {new Date(rate.asOf).toLocaleString()}
        </p>
      ) : null}
      <div style={{ marginTop: 14 }}>
        <Button onClick={() => void loadRate()} disabled={loading}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
