import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function defaults(props: IconProps, size = 32) {
  const s = props.size ?? size;
  return { width: s, height: s, ...props, size: undefined } as Omit<IconProps, "size">;
}

/** iPhone / iPad */
export function IosIcon(props: IconProps) {
  const p = defaults(props);
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <rect x="8" y="2" width="16" height="28" rx="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 26h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Android robot */
export function AndroidIcon(props: IconProps) {
  const p = defaults(props);
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <rect x="7" y="14" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 26v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 26v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 16v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M27 16v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 14V11a6 6 0 0 1 12 0v3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="13" cy="9" r="1" fill="currentColor" />
      <circle cx="19" cy="9" r="1" fill="currentColor" />
      <path d="M11 5 9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 5l2-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Desktop / Windows */
export function WindowsIcon(props: IconProps) {
  const p = defaults(props);
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <rect x="3" y="4" width="26" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 22v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 22v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 26h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Apple / macOS */
export function MacosIcon(props: IconProps) {
  const p = defaults(props);
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
    </svg>
  );
}

/** Download arrow */
export function DownloadIcon(props: IconProps) {
  const p = defaults(props);
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M16 4v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 16l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 26h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Plus / Add */
export function PlusIcon(props: IconProps) {
  const p = defaults(props);
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 10v12M10 16h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Map device type to icon component */
export const DEVICE_ICON_MAP = {
  ios: IosIcon,
  android: AndroidIcon,
  windows: WindowsIcon,
  macos: MacosIcon,
  unknown: IosIcon,
} as const;
