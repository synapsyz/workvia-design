import "./globals.css";
import { Lexend } from "next/font/google";

const lexend = Lexend({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata = {
  title: "Instruckt • Workvia",
  description: "AI-powered workflow, training, and task automation platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lexend.className} bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
