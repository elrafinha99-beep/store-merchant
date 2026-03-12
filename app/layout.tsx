import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"
const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="top-right" duration={3000}/></body>
    </html>
  );
}
