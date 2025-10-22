import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";
import { Layout } from "~/components/layout/layout";

import "~/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={geist.className}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
