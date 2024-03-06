import '@/app/ui/global.css'
import { inter, lusitana } from "@/app/ui/fonts";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: 'next.js demo project'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lusitana.variable}`}>
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
