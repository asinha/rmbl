import { AuthFooter } from "@/components/AuthFooter";
import { Header } from "@/components/AuthHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <AuthFooter />
    </>
  );
}
