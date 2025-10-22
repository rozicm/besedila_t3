import { useRouter } from "next/router";
import Head from "next/head";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Layout } from "~/components/layout/layout";

const errors = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
};

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;
  const errorMessage = error && typeof error === "string" ? errors[error as keyof typeof errors] : errors.Default;

  return (
    <Layout>
      <Head>
        <title>Authentication Error - Besedila</title>
        <meta name="description" content="Authentication error occurred" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-danger rounded-full flex items-center justify-center mb-6 shadow-modern-lg">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gradient mb-2">Authentication Error</h2>
            <p className="text-lg text-muted-foreground">Something went wrong during sign in</p>
          </div>

          {/* Error Card */}
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800 border-0 shadow-modern-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Error Details</CardTitle>
              <CardDescription className="text-lg text-red-600/70 dark:text-red-400/70">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm font-mono text-red-800 dark:text-red-200">
                    Error Code: {error}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={() => router.push("/auth/signin")}
                  className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-modern-lg py-6 text-lg font-semibold"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline" 
                  asChild 
                  className="w-full hover:scale-105 transition-transform duration-200"
                >
                  <Link href="/" className="flex items-center justify-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  If this problem persists, please{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
