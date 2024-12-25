"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigation } from "~/components/sidebar/navigation";
import { Button } from "../ui/button";

const MobileHamburger = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const pathname = usePathname();
  const { navItems } = useNavigation();

  return (
    <div className="block md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setToggleMenu(!toggleMenu)}
        className="fixed right-4 top-4 z-50 border-none bg-transparent outline-none focus:outline-none"
      >
        <div className="space-y-1.5">
          <span
            className={`block h-0.5 w-6 bg-foreground transition-all ${
              toggleMenu ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-foreground transition-all ${
              toggleMenu ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-foreground transition-all ${
              toggleMenu ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </div>
      </Button>

      <div
        className={`fixed inset-0 z-40 transform bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
          toggleMenu ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex h-full flex-col items-center justify-center space-y-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-x-4 rounded-md p-2 text-lg font-medium transition-colors ${
                pathname === item.href
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => setToggleMenu(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileHamburger;
