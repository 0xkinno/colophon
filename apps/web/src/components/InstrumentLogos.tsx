import React from "react";

export function OpenAILogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 3.8 2.8l.2 1 .9-.4a4 4 0 0 1 5.2 2.2 4 4 0 0 1-.7 4.5l-.7.7.4 1a4 4 0 0 1-1.3 4.8 4 4 0 0 1-4.8-.4l-.8-.6-.8.8a4 4 0 0 1-4.8 1 4 4 0 0 1-2.4-4.2l.2-1-1 .2a4 4 0 0 1-4.5-2.6 4 4 0 0 1 1.7-4.7l.9-.5-.3-1a4 4 0 0 1 2.5-4.7A4 4 0 0 1 12 2z" />
      <path d="M12 8.5v7" />
      <path d="m9 10.2 6 3.6" />
      <path d="m15 10.2-6 3.6" />
    </svg>
  );
}

export function SpaceXLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5 18 4.5" />
      <path d="M6 4.5l8 9 6 6" />
      <path d="M14 4.5c4 2 6 6.5 5 11" strokeWidth="1.6" strokeDasharray="2 2" />
    </svg>
  );
}

export function AndurilLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 19 8v8l-7 5.5L5 16V8l7-5.5z" />
      <path d="M12 6.5v11" />
      <path d="m9 10 3-3 3 3" />
    </svg>
  );
}

export function AnthropicLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="m4.5 7.5 15 9" />
      <path d="m19.5 7.5-15 9" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function FigureAILogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 7.5v8" />
      <path d="M8 10.5h8" />
      <path d="m9 20.5 3-5 3 5" />
    </svg>
  );
}

export function KalshiLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4v16" />
      <path d="m18 5-9 7 9 7" />
      <circle cx="18" cy="5" r="1.5" fill="currentColor" />
      <circle cx="18" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function NeuralinkLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
    </svg>
  );
}

export function PolymarketLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 21 8.5v7L12 21.5 3 15.5v-7L12 2.5z" />
      <path d="m12 2.5 9 13H3l9-13z" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function SPYxLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20.5h18" />
      <path d="m4.5 15.5 5-5 4 4 6-7.5" />
      <path d="M15 7h4.5v4.5" />
    </svg>
  );
}

export function AAPLxLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.93-.93.04-2.02.63-2.67 1.4-.58.67-1.09 1.76-.95 2.82 1.04.08 2.06-.52 2.68-1.29z" />
    </svg>
  );
}

export function TSLAxLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7.2c2.5 0 5-.4 6.7-1.2l.5 1.5c-2.1 1-5 1.4-7.2 1.4s-5.1-.4-7.2-1.4l.5-1.5c1.7.8 4.2 1.2 6.7 1.2zm0-3c2.7 0 5.4-.5 7.4-1.5l.6 1.3C17.6 5.2 14.8 5.7 12 5.7S6.4 5.2 4 4l.6-1.3C6.6 3.7 9.3 4.2 12 4.2zm-1.1 5.3h2.2v12.3h-2.2V9.5z" />
    </svg>
  );
}

export function NVDAxLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.2 8.7c0-1.8 1.4-3.2 3.8-3.2 2.3 0 4.1 1.2 5 2.5.7-.7 1.5-1.3 2.3-1.8-1.7-2-4.4-3.2-7.3-3.2-5 0-8.8 3.5-8.8 8 0 4.6 4 8 9 8 3.2 0 6-1.4 7.6-3.8.3-.5.4-1.1.4-1.7 0-1.1-.9-2-2-2-1 0-1.7.6-2.1 1.4-.9 1.3-2.3 2.1-4 2.1-2.5 0-4.6-2.2-4.6-5 0-1.2.3-2.3.7-3.3zm3.8 1.3c1.3 0 2.4.9 2.4 2s-1.1 2-2.4 2-2.4-.9-2.4-2 1.1-2 2.4-2z" />
    </svg>
  );
}
