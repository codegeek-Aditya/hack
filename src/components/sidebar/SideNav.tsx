"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useNavigation } from "~/components/sidebar/navigation";
import { ny } from "~/lib/utils";

import { useAtom } from "jotai";
import { sidebarExpandedAtom } from "~/store/atom";
import { usePathname } from "next/navigation";
import SideNavLoader from "./SideNavLoader";
import { Logo } from "~/svg/Logo";
import { Separator } from "../ui/separator";

export default function SideNav() {
  const pathname = usePathname();
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const [activePath, setActivePath] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const { navItems, topNavItems, bottomNavItems } = useNavigation();

  if (!isClient) {
    return <SideNavLoader />;
  }

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleNavItemClick = (path: string) => {
    setActivePath(path);
  };

  const isPathActive = (path: string) => {
    return activePath.startsWith(path);
  };

  return (
    <div className="">
      <div
        className={ny(
          isSidebarExpanded ? "w-[270px]" : "w-[78px]",
          "hidden h-[97vh] transform border-r bg-background transition-all duration-300 ease-in-out sm:flex",
        )}
      >
        <aside className="flex h-full w-full columns-1 flex-col overflow-x-hidden break-words px-4 md:px-0">
          <div className="relative mt-4 px-4 pb-2">
            <div className="my-4 mb-6 flex items-center justify-center">
              {isSidebarExpanded ? (
                <Link className="cursor-pointer" href="/">
                  <div className="flex items-center gap-0">
                    <Logo className="mt-2" size={48} />
                    <h1 className="font-bebas text-4xl font-thin tracking-normal text-foreground">
                      MED<span className="text-primary">LINK</span>
                    </h1>
                  </div>
                </Link>
              ) : (
                <Link className="cursor-pointer" href="/">
                  <Logo className="ml-1 cursor-pointer" size={40} />
                </Link>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              {topNavItems.map((item, idx) => {
                return (
                  <Fragment key={idx}>
                    <div className="text-text space-y-2">
                      <SideNavItem
                        label={item.name}
                        icon={item.icon}
                        path={item.href}
                        active={activePath === item.href}
                        isSidebarExpanded={isSidebarExpanded}
                        onClick={() => handleNavItemClick(item.href)}
                      />
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>

          <div className="sticky bottom-0 mb-4 mt-auto block whitespace-nowrap transition duration-200">
            {bottomNavItems.map((item, idx) => {
              return (
                <Fragment key={idx}>
                  <div className="space-y-1 px-4">
                    <SideNavItem
                      label={item.name}
                      icon={item.icon}
                      path={item.href}
                      active={activePath === item.href}
                      isSidebarExpanded={isSidebarExpanded}
                      onClick={() => handleNavItemClick(item.href)}
                      className="border bg-muted/50"
                    />
                  </div>
                </Fragment>
              );
            })}
          </div>
        </aside>
        <div className="relative mt-[calc(calc(90vh)-40px)]">
          <button
            type="button"
            className="absolute bottom-32 right-[-12px] flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
            onClick={toggleSidebar}
          >
            {isSidebarExpanded ? (
              <ChevronLeft size={16} className="stroke-foreground" />
            ) : (
              <ChevronRight size={16} className="stroke-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export const SideNavItem: React.FC<{
  label: string;
  icon: any;
  path: string;
  active: boolean;
  isSidebarExpanded: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ label, icon, path, active, isSidebarExpanded, onClick, className }) => {
  return (
    <>
      {isSidebarExpanded ? (
        <Link
          href={path}
          className={ny(
            "flex h-full items-center whitespace-nowrap rounded-md p-2 font-medium",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            active &&
              "bg-secondary font-semibold text-primary hover:text-primary",
            className,
          )}
          onClick={onClick}
        >
          <div className="text-md relative flex flex-row items-center space-x-2 rounded-md px-2 py-1.5 duration-100">
            <div className="mb-1">
              <span className="">{icon}</span>
            </div>
            <span className="">{label}</span>
          </div>
        </Link>
      ) : (
        <TooltipProvider delayDuration={70}>
          <Tooltip>
            <TooltipTrigger>
              <Link
                href={path}
                className={ny(
                  "relative mb-1 flex h-full items-center whitespace-nowrap rounded-md font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  active && "bg-secondary font-semibold text-primary",
                )}
                onClick={onClick}
              >
                <div
                  className={` ${isSidebarExpanded ? "" : "text-primary"}relative flex flex-row items-center space-x-2 rounded-md p-2 text-sm font-medium duration-100`}
                >
                  {icon}
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="px-3 py-1.5 text-xs"
              sideOffset={10}
              variant="outline"
            >
              <span>{label}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
};
