"use client";

import { cn } from "@/lib/utils";

interface DeepLuxLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dl-g" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
        <linearGradient id="dl-g2" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="108" fill="url(#dl-g)" />
      <path
        d="M120 112h80c88 0 140 52 140 144s-52 144-140 144h-80V112zm56 48v192h24c60 0 96-36 96-96s-36-96-96-96h-24z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M296 112h56v232h80v56H296V112z"
        fill="white"
        opacity="0.85"
      />
      <circle cx="416" cy="136" r="20" fill="url(#dl-g2)" opacity="0.9" />
    </svg>
  );
}

const sizes = {
  sm: { icon: "h-6 w-6", text: "text-base" },
  md: { icon: "h-7 w-7", text: "text-xl" },
  lg: { icon: "h-10 w-10", text: "text-2xl" },
};

export default function DeepLuxLogo({
  size = "md",
  showText = true,
  className,
}: DeepLuxLogoProps) {
  const s = sizes[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoIcon className={cn(s.icon, "flex-shrink-0 rounded-md")} />
      {showText && (
        <span className={cn("font-headline font-bold tracking-tight", s.text)}>
          DeepLux
          <span className="text-sky-400">.org</span>
        </span>
      )}
    </span>
  );
}

export { LogoIcon };
