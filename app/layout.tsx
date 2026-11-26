import type { Metadata } from "next";
import localFont from "next/font/local";
import { tablesDB } from "@/lib/appwrite-server";
import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "../public/fonts/inter/Inter-VariableFont_opsz,wght.ttf",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../public/fonts/inter/Inter-Italic-VariableFont_opsz,wght.ttf",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

const playfair = localFont({
  src: [
    {
      path: "../public/fonts/playfair-display/PlayfairDisplay-VariableFont_wght.ttf",
      style: "normal",
      weight: "400 900",
    },
    {
      path: "../public/fonts/playfair-display/PlayfairDisplay-Italic-VariableFont_wght.ttf",
      style: "italic",
      weight: "400 900",
    },
  ],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://joshua-kimia-portfolio.vercel.app";

const databaseId = process.env.APPWRITE_DATABASE_ID!;

type Settings = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  faviconUrl?: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  let settings: Settings | null = null;

  try {
    const row = await tablesDB.getRow({
      databaseId,
      tableId: "settings",
      rowId: "singleton",
    });

    settings = row as unknown as Settings;
  } catch (error) {
    const isNotFound =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 404;

    if (!isNotFound) {
      console.warn(
        "Unable to fetch portfolio metadata from Appwrite. Using fallback metadata.",
        error,
      );
    }
  }

  const title =
    settings?.seoTitle ||
    "Joshua Kimia — Software Engineering Student & Developer";

  const description =
    settings?.seoDescription ||
    "Portfolio of Joshua Kimia, a software engineering student and developer based in Abuja, Nigeria. Explore projects, skills, experience and certifications.";

  const ogImage = settings?.ogImageUrl || undefined;

  return {
    metadataBase: new URL(siteUrl),

    title: {
      absolute: title,
    },

    description,

    applicationName: "Joshua Kimia Portfolio",

    alternates: {
      canonical: "/",
    },

    openGraph: {
      type: "website",
      locale: "en_NG",
      url: siteUrl,
      siteName: "Joshua Kimia Portfolio",
      title,
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: "Joshua Kimia — Software Engineering Student and Developer",
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    icons: settings?.faviconUrl
      ? {
          icon: settings.faviconUrl,
        }
      : undefined,
  };
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Joshua Kimia",
      url: siteUrl,
      jobTitle: "Software Engineering Student & Developer",
      description:
        "Software engineering student and developer based in Abuja, Nigeria, building useful digital experiences.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Abuja",
        addressCountry: "NG",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Joshua Kimia Portfolio",
      description:
        "Official portfolio of Joshua Kimia, Software Engineering Student and Developer.",
      publisher: {
        "@id": `${siteUrl}/#person`,
      },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("portfolio-theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}`,
          }}
        />
      </head>

      <body className={`${inter.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}
