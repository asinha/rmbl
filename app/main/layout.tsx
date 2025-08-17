import { AuthFooter } from "@/components/AuthFooter";
import { AuthHeader } from "@/components/AuthHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <AuthHeader /> */}
      <main className="flex-1">{children}</main>
      {/* <AuthFooter /> */}
    </>
  );
}
