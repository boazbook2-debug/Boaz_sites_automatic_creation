import { HeroDemo } from "@/components/ui/animated-hero-demo";
import { HeroScrollDemo } from "@/components/ui/container-scroll-demo";

export const metadata = { robots: { index: false, follow: false } };

export default function UiDemoPage() {
  return (
    <div dir="ltr" className="bg-white text-black">
      <HeroDemo />
      <HeroScrollDemo />
    </div>
  );
}
