"use client";

import React, { useState } from "react";
import { IoMdNotifications } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex h-12 w-12 items-center justify-center rounded-full border bg-secondary px-2 text-3xl outline-none transition-all duration-200 ${
              isOpen ? "border-primary/20 bg-primary/20" : "hover:bg-primary/20"
            }`}
          >
            <IoMdNotifications className="text-primary/80" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>4+ new messages</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => console.log("hello")}>
            Pranali just uploaded assignment
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => console.log("hello")}>
            Shailey just uploaded material
          </DropdownMenuItem>
        </DropdownMenuContent>
      </>
    </DropdownMenu>
  );
};

export default Notification;
