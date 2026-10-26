// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://thediningco.com"),
  title: "The Dining Co. | Premium Digital Dining & Kitchen Operating System",
  description:
    "Elevate your restaurant with luxury contactless QR menus, instant direct UPI payments, promotional deal engines, and real-time live kitchen display systems.",
  keywords: [
    "restaurant QR menu",
    "digital dining",
    "contactless ordering",
    "kitchen display system",
    "direct UPI billing",
    "restaurant POS",
    "The Dining Co",
  ],
  authors: [{ name: "The Dining Co." }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "The Dining Co. | Premium Digital Dining Platform",
    description:
      "Transform dining operations with interactive digital menus, instant UPI settlement, live kitchen tickets, and smart promotions.",
    url: "https://thediningco.com",
    siteName: "The Dining Co.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "The Dining Co. Golden Crown Emblem",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}