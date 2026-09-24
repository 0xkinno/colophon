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
  ANDURIL: { bg: "#0f172a", fg: "#38bdf8", label: "Anduril PreStock" },
  FIGUREAI: { bg: "#0f172a", fg: "#a855f7", label: "Figure AI PreStock" },
  KALSHI: { bg: "#022c22", fg: "#10b981", label: "Kalshi PreStock" },
  NEURALINK: { bg: "#18181b", fg: "#f43f5e", label: "Neuralink PreStock" },
  POLYMARKET: { bg: "#1e1b4b", fg: "#6366f1", label: "Polymarket PreStock" },
};

// Canonical image map pointing to files in /logos/tokens/
const TOKEN_IMAGE_REGISTRY: Record<string, string> = {
  // PreStocks (from user's SVG ICONS folder):
  OPENAI: "/logos/tokens/OpenAI.png",
  SPACEX: "/logos/tokens/SPACEX.png",
  ANDURIL: "/logos/tokens/Anduril.png",
  ANTHROPIC: "/logos/tokens/anthropic.png",
  FIGUREAI: "/logos/tokens/FIGUREAI.png",
  KALSHI: "/logos/tokens/kalshi.png",
  NEURALINK: "/logos/tokens/Neuralink.png",
  POLYMARKET: "/logos/tokens/Polymarket.png",

  // xStocks & ETFs (public equities):
  AAPL: "/logos/tokens/AAPLx.png",
  AAPLX: "/logos/tokens/AAPLx.png",
  TSLA: "/logos/tokens/TSLAx.png",
  TSLAX: "/logos/tokens/TSLAx.png",
  NVDA: "/logos/tokens/NVDAx.png",
  NVDAX: "/logos/tokens/NVDAx.png",
  SPY: "/logos/tokens/SPYx.jpeg",
  SPYX: "/logos/tokens/SPYx.jpeg",
  MSFT: "/logos/tokens/MSFTx.png",
  MSFTX: "/logos/tokens/MSFTx.png",
  AMZN: "/logos/tokens/AMZNx.png",
  AMZNX: "/logos/tokens/AMZNx.png",
  GOOGL: "/logos/tokens/GOOGLx.png",
  GOOGLX: "/logos/tokens/GOOGLx.png",
  META: "/logos/tokens/METAx.png",
  METAX: "/logos/tokens/METAx.png",
  COIN: "/logos/tokens/COINx.png",
  COINX: "/logos/tokens/COINx.png",
  PLTR: "/logos/tokens/PLTRx.png",
  PLTRX: "/logos/tokens/PLTRx.png",
  HOOD: "/logos/tokens/HOODx.png",
  HOODX: "/logos/tokens/HOODx.png",
  QQQ: "/logos/tokens/QQQx.png",
  QQQX: "/logos/tokens/QQQx.png",
};

export function StockLogo({ symbol, size = 36, className = "", alt }: StockLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const clean = (symbol || "").trim();
  const upper = clean.toUpperCase();
  const isXStock = upper.endsWith("X") || ["AAPL", "TSLA", "NVDA", "SPY", "MSFT", "AMZN", "GOOGL", "META", "COIN", "PLTR", "HOOD", "QQQ"].includes(upper);
  const normXSymbol = isXStock ? (upper.endsWith("X") ? upper : `${upper}x`) : upper;

  // Resolve image source
  const localImageSrc = TOKEN_IMAGE_REGISTRY[upper] || (isXStock ? `/logos/tokens/${normXSymbol}.png` : null);
  const cdnFallbackSrc = isXStock ? `https://xstocks-metadata.backed.fi/logos/tokens/${normXSymbol}.png` : null;

  const prestockTheme = PRESTOCK_BRAND_THEMES[upper];
  const borderRadius = Math.max(7, Math.round(size * 0.28));
  const padding = Math.max(2, Math.round(size * 0.08));

  const containerStyle: React.CSSProperties = {
    width: size,
    minWidth: size,
    maxWidth: size,
    height: size,
    minHeight: size,
    maxHeight: size,
    borderRadius,
    backgroundColor: isXStock ? "#ffffff" : (prestockTheme?.bg || "#0f172a"),
    border: isXStock ? "1px solid rgba(22, 19, 33, 0.12)" : "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: isXStock ? "0 2px 8px rgba(15, 7, 34, 0.08)" : "0 2px 8px rgba(0, 0, 0, 0.25)",
    padding,
  };

  if (localImageSrc && !imgFailed) {
    return (
      <span
        className={`inline-flex items-center justify-center relative overflow-hidden flex-shrink-0 select-none ${className}`}
        style={containerStyle}
        role="img"
        aria-label={alt || `${clean} logo`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={localImageSrc}
          alt={alt || clean}
          width={size}
          height={size}
          onError={(e) => {
            if (cdnFallbackSrc && e.currentTarget.src !== cdnFallbackSrc) {
              e.currentTarget.src = cdnFallbackSrc;
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
      </span>
    );
  }

  // Fallback lettermark badge
  const fallbackFg = isXStock ? "#111827" : (prestockTheme?.fg || "#ffffff");

  return (
    <span
      className={`inline-flex items-center justify-center relative overflow-hidden flex-shrink-0 select-none ${className}`}
      style={containerStyle}
      role="img"
      aria-label={alt || `${clean} logo`}
    >
      <span
        className="font-mono font-bold"
        style={{
          fontSize: Math.max(9, Math.floor(size * 0.32)),
          color: fallbackFg,
          letterSpacing: "-0.02em",
        }}
      >
        {clean.replace(/x$/i, "").slice(0, 4)}
      </span>
    </span>
  );
}
