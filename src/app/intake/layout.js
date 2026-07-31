import IntakeHeader from "@/components/intake/IntakeHeader";
import IntakeFooter from "@/components/intake/IntakeFooter";

export default function IntakeLayout({ children }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <IntakeHeader />
      <main className="flex-1">{children}</main>
      <IntakeFooter />
    </div>
  );
}
