import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";

/**
 * Shared floating back button — one pattern across detail + swipe pages.
 * Logical positioning (`start-6`) flips to the right in RTL automatically;
 * the arrow mirrors via `rtl:scale-x-[-1]`.
 */
export default function BackButton({
  href,
  label,
  belowNav = false,
}: {
  href: string;
  label: string;
  /** Push below a sticky navbar (e.g. detail pages that render one). */
  belowNav?: boolean;
}) {
  return (
    <div className={`fixed start-6 z-50 ${belowNav ? "top-20" : "top-6"}`}>
      <Link
        href={href}
        className="flex items-center justify-center w-11 h-11 rounded-full border border-border-strong text-fg transition-colors bg-[rgba(15,15,22,0.55)] backdrop-blur-[10px] hover:bg-[rgba(15,15,22,0.8)]"
      >
        <IoArrowBack size={20} aria-hidden="true" className="rtl:scale-x-[-1]" />
        <span className="sr-only">{label}</span>
      </Link>
    </div>
  );
}
