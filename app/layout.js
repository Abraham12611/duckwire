import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { getConfig } from "../lib/wagmi/config";
import { Providers } from "./providers";

export const metadata = {
  title: "DuckWire — See every side of every story",
  description: "AI-curated, bias-aware news comparison feed",
};

export default function RootLayout({ children }) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get("cookie")
  );
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen flex flex-col text-gray-900">
        <Providers initialState={initialState}>
          <Header />
          <main className="flex-1 container-max py-6" id="main">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
