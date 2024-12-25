"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Check, LogOutIcon, Monitor, Moon, Sun, UserIcon } from "lucide-react";
import Link from "next/link";
import { useAtom } from "jotai";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Image from "next/image";
import { useUser } from "~/hooks/useUser";
import { useRouter } from "next/navigation";

interface UserButtonProps {
  className?: string;
}

const UserButton: React.FC<UserButtonProps> = ({ className }) => {
  const { user } = useUser();

  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <button
          className={`group flex h-12 w-full max-w-sm items-center justify-between rounded-full border border-primary/30 bg-secondary text-lg outline-none ${
            isOpen ? "border-primary/50 bg-accent" : ""
          }`}
        >
          <Image
            src={
              "https://res.cloudinary.com/dkd5jblv5/image/upload/v1675976806/Default_ProfilePicture_gjngnb.png"
            }
            alt="User avatar"
            width={40}
            height={40}
            className={`ml-1 rounded-full border border-primary/30 ${
              isOpen ? "border-primary/50" : ""
            }`}
          />
          <div className="ml-2 mr-4 flex flex-col justify-center text-start text-sm">
            <span className="mb-[-1px] text-secondary-foreground">
              {user?.name}
            </span>
            <span className="text-xs text-secondary-foreground/50">
              {user?.email && user.email.length > 20
                ? user.email.slice(0, 20) + "..."
                : user?.email}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Logged in as @{user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/settings`}>
          <DropdownMenuItem>
            <UserIcon className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="mr-2 size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 size-4" />
                Light
                {theme === "light" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 size-4" />
                Dark
                {theme === "dark" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
