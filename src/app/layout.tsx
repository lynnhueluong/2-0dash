// app/layout.tsx
import Providers from './providers';
import './globals.css';

export const metadata = {
  title: '2.0 Dash',
  description: 'Login',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
