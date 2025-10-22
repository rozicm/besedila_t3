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
  pageProps,
}) => {
  const { session, ...restPageProps } = pageProps as { session?: any; [key: string]: any };
  return (
    <SessionProvider session={session}>
      <div className={geist.className}>
        <Layout>
          <Component {...restPageProps} />
        </Layout>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
