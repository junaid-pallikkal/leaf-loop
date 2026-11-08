import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#166534',
};

export const metadata: Metadata = {
  title: 'LeafLoop – Every Good Habit Counts | Environmental Rewards',
  description:
    'Turn daily environmental stewardship into real rewards. Upload verified eco activities, earn Leaf Coins, and redeem for direct cash payouts or genuine shopping vouchers.',
  keywords: [
    'eco bonus',
    'environmental rewards',
    'leaf coins',
    'green habits',
    'carbon offset',
    'recycling rewards',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen bg-[#F7FAF7] text-[#0e2717] antialiased">
        <Toaster richColors position="top-right" closeButton />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
