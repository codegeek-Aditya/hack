import { Metadata } from "next";
import Logo from "~/svg/Logo";
export const metadata: Metadata = {
  title: {
    template: "%s | ACADEMIA",
    default: "Auth",
  },
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
