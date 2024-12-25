"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

import Logo from "~/svg/Logo";
import { Button } from "../ui/button";

export default function Navbar() {
  return (
    <header className="bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-3">
        <Link href="/" className="font-bebas text-4xl font-bold text-primary">
          <div className="flex items-center gap-0">
            <Logo className="mt-2" size={48} />
            <h1 className="font-bebas text-4xl font-thin tracking-normal text-foreground">
              MED<span className="text-primary">LINK</span>
            </h1>
          </div>
        </Link>
        <div className="flex items-center">
          <Link href="/admin">
            <Button>
              Get Started <FiArrowUpRight className="ml-2 text-lg" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
