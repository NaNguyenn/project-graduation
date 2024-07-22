import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ReactQueryClientProvider, SelectLocalization } from "../components";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Register Platform",
  description: "HUST Register Platform",
};
type Props = {
  children: React.ReactNode;
  params: { locale: string };
};
export default async function RootLayout({
  children,
  params: { locale },
}: Props) {
  const messages = await getMessages();

  return (
    <ReactQueryClientProvider>
      <html lang={locale}>
        <body className={inter.className}>
          <NextIntlClientProvider messages={messages}>
            <SelectLocalization />
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
