import type { Metadata } from "next";
import { ppMori } from "./fonts";
import { BRAND } from "./constants";
import JsonLd from "@/components/JsonLd";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingProvider } from "@/components/providers/LoadingContext";
import AppLayout from "@/components/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} | ${BRAND.title}`,
    template: `${BRAND.name} | %s`,
  },
  description: BRAND.description,
  keywords: BRAND.keywords,
  authors: [{ name: BRAND.name, url: BRAND.url }],
  creator: BRAND.name,
  metadataBase: new URL(BRAND.url),
  icons: [
    {
      rel: "icon",
      url: BRAND.icons.icon,
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      url: BRAND.icons.iconDark,
      media: "(prefers-color-scheme: dark)",
    },
    {
      rel: "apple-touch-icon",
      url: BRAND.icons.apple,
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "apple-touch-icon",
      url: BRAND.icons.appleDark,
      media: "(prefers-color-scheme: dark)",
    },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BRAND.url,
    title: BRAND.name,
    description: BRAND.description,
    siteName: BRAND.name,
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `${BRAND.name} - ${BRAND.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: BRAND.description,
    images: [BRAND.ogImage],
    creator: BRAND.socials.twitter.username || `@${BRAND.name}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ppMori.variable}`}>
      <head>
        <JsonLd />
      </head>
      <body
        className={`${ppMori.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <TooltipProvider>
          <LoadingProvider>
            <AppLayout>{children}</AppLayout>
          </LoadingProvider>
          <Toaster richColors position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
