import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Binge",
  description: "Discover what to watch next",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={`${poppins.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Sync data-cv-mode on <html> from localStorage before paint
            so the saved palette applies without flicker. Lives in the
            root layout so it only renders into the initial HTML stream
            once (root layouts don't re-render on client navigation). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=localStorage.getItem('BINGE_CV_MODE');if(m&&m!=='normal'){document.documentElement.setAttribute('data-cv-mode',m);}}catch(e){}})();",
          }}
        />
        {/* lang and dir are set dynamically by [lang]/layout.tsx via HtmlAttributes */}
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--color-surface-card)",
              color: "var(--color-fg)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-inter)",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "var(--color-success)", secondary: "var(--color-surface)" } },
            error: { iconTheme: { primary: "var(--color-danger)", secondary: "var(--color-fg)" } },
          }}
        />
      </body>
    </html>
  );
}
