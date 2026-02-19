import type { Metadata } from "next";
import { ppMori } from "./fonts";
import { BRAND } from "./constants/brand";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} | ${BRAND.title}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: BRAND.keywords,
  authors: [{ name: BRAND.name, url: BRAND.url }],
  creator: BRAND.name,
  metadataBase: new URL(BRAND.url),
  icons: {
    icon: BRAND.icons.icon,
    apple: BRAND.icons.apple,
  },
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
    creator: BRAND.socials.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
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
        {children}
      </body>
    </html>
  );
}



