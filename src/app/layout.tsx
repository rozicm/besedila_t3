import "~/styles/globals.css";
import { Providers } from "~/components/providers";
import { ThemeProvider } from "~/components/theme-provider";
import { Nav } from "~/components/layout/nav";

export const metadata = {
  title: "Band Song Manager",
  description: "Manage your band's songs and setlists",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light">
          <Providers>
            <div className="flex min-h-screen flex-col">
              <Nav />
              <main className="flex-1">{children}</main>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

