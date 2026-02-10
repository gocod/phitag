import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from '@/components/AuthProvider';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "PHItag | HIPAA Compliance & Azure Tag Governance",
  description: "Zero-data liability governance for health-tech infrastructure.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-milk-white flex flex-col h-screen overflow-hidden text-clinical-grey font-sans">
        <AuthProvider>
          <Nav />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-12">
              {children}
            </div>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}