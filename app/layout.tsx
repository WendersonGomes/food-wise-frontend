import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "FoodWise",
  description: "Gestao inteligente de alimentos em casa.",
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("foodwise-theme");
    const theme = stored === "dark" || stored === "light"
      ? stored
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <AppProviders>
            {children}
            <Footer />
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
