import type { Metadata } from "next";
import "./globals.css";
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "AgentON Agent",
  description: "Best team on the market :)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <WebSocketProvider>
          <main className="flex-1">
            {children}
          </main>
        </WebSocketProvider>
        <Footer />
      </body>
    </html>
  );
}
