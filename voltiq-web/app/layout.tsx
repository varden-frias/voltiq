import "./globals.css";

export const metadata = {
  title: "VoltIQ",
  description: "AI electronics assistant for modern product discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}