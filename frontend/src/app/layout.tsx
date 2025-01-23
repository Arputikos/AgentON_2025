import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentON Agent",
  description: "Best team on the market :)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
