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
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path
        d="M23.2 27c-1.2 1.6-2.5 1.5-3.7 1-.8-.3-1.6-.3-2.5 0-1.1.5-1.7.4-2.5-.2C10.3 23 9.7 14.7 14.3 12.5c1-.4 2-.1 2.8.2.6.2 1.2.2 1.8 0 .9-.4 1.8-.7 2.8-.3 1.3.5 2.1 1.4 2.5 2.7-2.3 1.3-1.8 4.5.4 5.5-.5 1.4-1 2.5-1.6 3.3l.2 1.1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M20 5c.1 2.2-1.7 4.2-3.8 4-0.2-2 1.7-4 3.8-4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
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
