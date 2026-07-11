import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google"; // Playfair removed
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-poppins",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-montserrat",
});

export const metadata: Metadata = {
    title: "LuxeLoom - Luxury Meets Affordability",
    description: "Exquisite, handcrafted jewelry that celebrates elegance and individuality.",
};


import AppLayout from "@/components/AppLayout";
import SmoothScroll from "@/components/SmoothScroll";

import { ReduxProvider } from "@/providers/ReduxProvider";
import SessionProvider from "@/components/SessionProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${poppins.variable} ${montserrat.variable} font-sans`}>
                <ReduxProvider>
                    <SessionProvider />
                    <SmoothScroll>
                        <AppLayout>
                            {children}
                        </AppLayout>
                    </SmoothScroll>
                    <Toaster position="bottom-center" closeButton richColors />
                </ReduxProvider>

            </body>
        </html>
    );
}
