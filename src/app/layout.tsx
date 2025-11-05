import "~/styles/globals.css";
import { Providers } from "~/components/providers";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { ThemeProvider } from "~/components/theme-provider";
import { Nav } from "~/components/layout/nav";

export const metadata = {
  title: "Band Song Manager",
  description: "Manage your band's songs and setlists",
  icons: [
    { rel: "icon", url: "/Zalet.png", type: "image/png" },
    { rel: "apple-touch-icon", url: "/Zalet.png" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/Zalet.png" />
        <link rel="apple-touch-icon" href="/Zalet.png" />
      </head>
      <body>
        <ClerkProvider>
          <ThemeProvider defaultTheme="light">
            <Providers>
              <SignedIn>
                <div className="flex min-h-screen flex-col">
                  <Nav />
                  <main className="flex-1">{children}</main>
                </div>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </Providers>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

