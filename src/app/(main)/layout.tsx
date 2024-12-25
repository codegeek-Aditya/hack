import { Metadata } from "next";
import Header from "~/components/header/Header";

import SideNav from "~/components/sidebar/SideNav";
import AuthWrapper from "~/provider/AuthProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | MEDLINK",
    default: "HOME",
  },
};

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
      <div className="bg-bground1 bg-bgImage text-text relative flex h-screen w-full overflow-y-hidden bg-cover bg-center bg-no-repeat font-khula">
        <div className="sticky top-0 hidden h-screen md:block">
          <SideNav />
        </div>
        <div className="flex w-full flex-col">
          <div className="sticky top-0 z-10">
            <div className="">
              <Header />
            </div>
          </div>
          <div className="scrollbar h-full flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
