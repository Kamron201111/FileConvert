import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "FileConvert.uz — Fayllarni Konvertatsiya Qiling",
  description: "Har qanday faylni istagan formatga aylantiring. PDF, Word, Excel, rasm, audio, video va boshqalar. O'zbekistonning eng yaxshi fayl konvertori.",
  keywords: "fayl konvertatsiya, pdf word, o'zbekiston, fileconvert",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1629',
              color: '#f0f4ff',
              border: '1px solid #1c2840',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#0f1629' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0f1629' },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
