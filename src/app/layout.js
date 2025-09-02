import localFont from "next/font/local";
import { AuthProvider } from "../components/AuthContext";
import GlobalAuthModal from "../components/GlobalAuthModal";
import ConditionalLayout from "../components/ConditionalLayout";
import "./globals.css";

const lato = localFont({
  src: [
    {
      path: "../../public/fonts/Lato/Lato-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato/Lato-ThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../../public/fonts/Lato/Lato-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato/Lato-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/Lato/Lato-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato/Lato-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Lato/Lato-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato/Lato-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/Lato/Lato-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato/Lato-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  display: "block",
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Open Sans",
    "Helvetica Neue",
    "sans-serif",
  ],
  variable: "--font-lato",
});

export const metadata = {
  title: "Apoyo al Empleo",
  description:
    "Professional employment support platform built with Next.js and Cloudflare",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={lato.variable}>
      <head></head>
      <body className={lato.className}>
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
          <GlobalAuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
