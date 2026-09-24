"use client";

import React, { useState } from "react";

export type StockLogoProps = {
  symbol: string;
  size?: number;
  className?: string;
  alt?: string;
};

// Canonical brand accent backgrounds for fallback & PreStock squircle cards
const PRESTOCK_BRAND_THEMES: Record<string, { bg: string; fg: string; label: string }> = {
  OPENAI: { bg: "#000000", fg: "#ffffff", label: "OpenAI PreStock" },
  SPACEX: { bg: "#07080a", fg: "#ffffff", label: "SpaceX PreStock" },
  ANTHROPIC: { bg: "#cc9977", fg: "#1c1917", label: "Anthropic PreStock" },
  ANDURIL: { bg: "#1e293b", fg: "#38bdf8", label: "Anduril PreStock" },
  FIGUREAI: { bg: "#0f172a", fg: "#a855f7", label: "Figure AI PreStock" },
  KALSHI: { bg: "#022c22", fg: "#10b981", label: "Kalshi PreStock" },
  NEURALINK: { bg: "#18181b", fg: "#f43f5e", label: "Neuralink PreStock" },
  POLYMARKET: { bg: "#1e1b4b", fg: "#6366f1", label: "Polymarket PreStock" },
};

export function StockLogo({ symbol, size = 36, className = "", alt }: StockLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const clean = (symbol || "").trim();
  const upper = clean.toUpperCase();
  const isXStock = upper.endsWith("X") || ["AAPL", "TSLA", "NVDA", "SPY", "MSFT", "AMZN", "GOOGL", "META", "COIN", "PLTR", "HOOD", "QQQ"].includes(upper);
  const normXSymbol = isXStock ? (upper.endsWith("X") ? upper : `${upper}x`) : upper;

  // 1. xStocks path: load authentic Backed.fi token image (first local /logos/tokens/, then CDN)
  if (isXStock) {
    const localSrc = `/logos/tokens/${normXSymbol}.png`;
    const cdnSrc = `https://xstocks-metadata.backed.fi/logos/tokens/${normXSymbol}.png`;

    return (
      <span
        className={`inline-flex items-center justify-center relative overflow-hidden flex-shrink-0 select-none ${className}`}
        style={{
          width: size,
          minWidth: size,
          maxWidth: size,
          height: size,
          minHeight: size,
          maxHeight: size,
          borderRadius: Math.max(7, Math.round(size * 0.28)),
          backgroundColor: "#ffffff",
          border: "1px solid rgba(22, 19, 33, 0.12)",
          boxShadow: "0 2px 8px rgba(15, 7, 34, 0.08)",
        }}
        role="img"
        aria-label={alt || `${normXSymbol} stock logo`}
      >
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={localSrc}
            alt={alt || normXSymbol}
            width={size}
            height={size}
            onError={(e) => {
              // Try CDN fallback on error
              const target = e.currentTarget;
              if (target.src !== cdnSrc) {
                target.src = cdnSrc;
              } else {
                setImgFailed(true);
              }
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
            loading="lazy"
          />
        ) : (
          <span
            className="font-mono font-bold"
            style={{
              fontSize: Math.max(9, Math.floor(size * 0.32)),
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            {normXSymbol.replace(/x$/i, "").slice(0, 4)}
          </span>
        )}
      </span>
    );
  }

  // 2. PreStocks path: Authentic branded squircle card
  const theme = PRESTOCK_BRAND_THEMES[upper] || { bg: "#0f172a", fg: "#ffffff", label: clean };

  return (
    <span
      className={`inline-flex items-center justify-center relative overflow-hidden flex-shrink-0 select-none ${className}`}
      style={{
        width: size,
        minWidth: size,
        maxWidth: size,
        height: size,
        minHeight: size,
        maxHeight: size,
        borderRadius: Math.max(7, Math.round(size * 0.28)),
        backgroundColor: theme.bg,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
      }}
      role="img"
      aria-label={alt || theme.label}
    >
      {upper === "OPENAI" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: "62%", height: "62%", color: theme.fg }}>
          <path d="M12 2a4 4 0 0 1 3.8 2.8l.2 1 .9-.4a4 4 0 0 1 5.2 2.2 4 4 0 0 1-.7 4.5l-.7.7.4 1a4 4 0 0 1-1.3 4.8 4 4 0 0 1-4.8-.4l-.8-.6-.8.8a4 4 0 0 1-4.8 1 4 4 0 0 1-2.4-4.2l.2-1-1 .2a4 4 0 0 1-4.5-2.6 4 4 0 0 1 1.7-4.7l.9-.5-.3-1a4 4 0 0 1 2.5-4.7A4 4 0 0 1 12 2z" />
          <path d="M12 8.5v7" />
          <path d="m9 10.2 6 3.6" />
          <path d="m15 10.2-6 3.6" />
        </svg>
      )}

      {upper === "SPACEX" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "65%", height: "65%", color: theme.fg }}>
          <path d="M4 19.5 18 4.5" />
          <path d="M6 4.5l8 9 6 6" />
          <path d="M13 5.5c4 2 6 6.5 5 10.5" strokeWidth="1.6" strokeDasharray="2 2" />
        </svg>
      )}

      {upper === "ANTHROPIC" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "60%", height: "60%", color: theme.fg }}>
          <path d="M12 3v18" />
          <path d="m4.5 7.5 15 9" />
          <path d="m19.5 7.5-15 9" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        </svg>
      )}

      {upper === "ANDURIL" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "62%", height: "62%", color: theme.fg }}>
          <path d="M12 2.5 19 8v8l-7 5.5L5 16V8l7-5.5z" />
          <path d="M12 6.5v11" />
          <path d="m9 10 3-3 3 3" />
        </svg>
      )}

      {upper === "FIGUREAI" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "62%", height: "62%", color: theme.fg }}>
          <circle cx="12" cy="5" r="2.5" />
          <path d="M12 7.5v8" />
          <path d="M8 10.5h8" />
          <path d="m9 20.5 3-5 3 5" />
        </svg>
      )}

      {upper === "KALSHI" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "62%", height: "62%", color: theme.fg }}>
          <path d="M6 4v16" />
          <path d="m17 5-8 7 8 7" />
          <circle cx="17" cy="5" r="1.5" fill="currentColor" />
          <circle cx="17" cy="19" r="1.5" fill="currentColor" />
        </svg>
      )}

      {upper === "NEURALINK" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "62%", height: "62%", color: theme.fg }}>
          <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
        </svg>
      )}

      {upper === "POLYMARKET" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "62%", height: "62%", color: theme.fg }}>
          <path d="M12 2.5 21 8.5v7L12 21.5 3 15.5v-7L12 2.5z" />
          <path d="m12 2.5 9 13H3l9-13z" fill="currentColor" fillOpacity="0.2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      )}

      {!["OPENAI", "SPACEX", "ANTHROPIC", "ANDURIL", "FIGUREAI", "KALSHI", "NEURALINK", "POLYMARKET"].includes(upper) && (
        <span
          className="font-mono font-bold"
          style={{
            fontSize: Math.max(9, Math.floor(size * 0.32)),
            color: theme.fg,
            letterSpacing: "-0.02em",
          }}
        >
          {clean.slice(0, 4)}
        </span>
      )}
    </span>
  );
}
