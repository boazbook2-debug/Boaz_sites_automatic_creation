import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import ShowcasePopup from "@/components/ShowcasePopup";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import MouseGradient from "@/components/MouseGradient";
import PageTransition from "@/components/PageTransition";

export default function SiteLayout({ children }) {
  return (
    <>
      <ScrollProgressBar />
      <MouseGradient />
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <WhatsAppFloatingButton />
      <ShowcasePopup />
    </>
  );
}
