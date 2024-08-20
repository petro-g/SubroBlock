import "@/components/shared/TableCardList/table-card-list.styles.css";
import "@/pages/globals.css";
import { SessionProvider } from "next-auth/react";
import { ReactElement, ReactNode } from "react"
import ConfirmationDialog from "@/components/shared/confirmation-dialog";
import PageLayout from "@/components/shared/PageLayout/PageLayout";
import { Toaster } from "@/components/ui/toaster";
import type { NextPage } from "next"
import type { AppProps } from "next/app"

export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function defaultLayout(page: ReactElement) {
  return <PageLayout>{page}</PageLayout>
}

// wraps the page with a layout component
// get layout from component OR use default
// to disable or custom layout define in component's file following line:
// "Component.getLayout = (page: any) => page;"
export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? defaultLayout;
  const layout = getLayout(<Component {...pageProps} />)

  return (
    <SessionProvider>
      {layout}
      <Toaster />
      <ConfirmationDialog/>
    </SessionProvider>
  )
}
