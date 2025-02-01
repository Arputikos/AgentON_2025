import type { Metadata } from "next";
import "./globals.css";
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { Toaster } from 'react-hot-toast';

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
      <body>
        <WebSocketProvider>
          <main>
            {children}
            <Toaster />
          </main>
        </WebSocketProvider>
      </body>
    </html>
  );
}
