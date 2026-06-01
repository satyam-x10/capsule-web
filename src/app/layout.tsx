import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Capsule - Learn Daily',
  description: 'Your daily bite-sized learning capsules on AI, Software Engineering, Wealth, Product, and Philosophy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}
