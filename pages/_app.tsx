import "./../polyfills.js";
import { AppProps } from "next/app";
import "@styles/globals.css";
import "@styles/calendar-override.css";
import { Analytics } from "@vercel/analytics/react";
import NextNProgress from "nextjs-progressbar";
import { ToastBar, Toaster } from "react-hot-toast";

import { Layout } from "@src/components/Layouts/Layout";
import { ThemeProvider } from "@src/context/ThemeContext";
import { brandFont } from "@src/fonts/fonts";
import { useRouter } from "next/router.js";
import { Web3Provider } from "@src/components/Web3Provider/Web3Provider";

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  const router = useRouter();

  const isPostRoute = router.pathname.startsWith("/post");

  const AppLayout = isPostRoute ? Layout : Layout;

  if (typeof window !== "undefined") {
    window.addEventListener(
      "resize",
      function () {
        document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
      },
      false,
    );
  }

  return (
    <>
      <Web3Provider>
        <ThemeProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                backgroundColor: "#1A1B1F", // rainbowTheme.colors.modalBackground,
                color: "white",
                fontFamily: brandFont.style.fontFamily,
                zIndex: 1001,
              },
            }}
          >
            {(t) => (
              <ToastBar toast={t}>
                {({ icon, message }) => (
                  <>
                    {icon}
                    {message}
                  </>
                )}
              </ToastBar>
            )}
          </Toaster>
          <NextNProgress color="#4D7F79" height={2} />
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
          <Analytics />
        </ThemeProvider>
      </Web3Provider>
    </>
  );
}
