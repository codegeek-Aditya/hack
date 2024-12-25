"use client";

import Link from "next/link";
import React from "react";
import { ny } from "~/lib/utils";
import { Logo } from "~/svg/Logo";

const SideNavLoader = () => {
  return (
    <div>
      <div
        className={ny(
          "w-[270px]",
          "hidden h-[97vh] transform rounded-lg border bg-background transition-all duration-300 ease-in-out sm:flex",
        )}
      >
        <aside className="flex h-full w-full columns-1 flex-col overflow-x-hidden break-words px-4">
          <div className="relative mt-4 px-4 pb-2">
            <div className="my-4 mb-6 flex items-center justify-center">
              <Link className="cursor-pointer" href="/">
                <div className="flex items-center gap-0">
                  <Logo className="mt-2" size={48} />
                  <h1 className="font-bebas text-4xl font-thin tracking-normal text-foreground">
                    MED<span className="text-primary">LINK</span>
                  </h1>
                </div>
              </Link>
            </div>
            <div className="flex flex-col gap-y-4">
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted"></div>
              <div className="h-8 w-full animate-pulse rounded-lg bg-muted"></div>
              <div className="h-12 w-full animate-pulse rounded-lg bg-muted"></div>
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted"></div>
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted"></div>
              <div className="h-7 w-full animate-pulse rounded-lg bg-muted"></div>
              <div className="h-11 w-full animate-pulse rounded-lg bg-muted"></div>
              <div className="h-8 w-full animate-pulse rounded-lg bg-muted"></div>
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted"></div>
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted"></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SideNavLoader;
