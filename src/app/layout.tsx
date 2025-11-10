import "~/styles/globals.css";
import { Providers } from "~/components/providers";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
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
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    process.env.CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      "Missing Clerk publishable key. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_PUBLISHABLE_KEY."
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/Zalet.png" />
        <link rel="apple-touch-icon" href="/Zalet.png" />
      </head>
      <body>
        <ThemeProvider defaultTheme="light">
          <Providers clerkPublishableKey={publishableKey}>
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
      </body>
    </html>
  );
}

