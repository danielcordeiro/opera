import "../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "LOCPEL MVP",
  description: "Sistema operacional LOCPEL"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
