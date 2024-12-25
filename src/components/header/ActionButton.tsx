import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import React from "react";
import Link from "next/link";

const ActionButton = ({ text, link }: { text: string; link: string }) => {
  return (
    <div>
      <Link href={link}>
        <Button
          className={`flex items-center gap-x-2 rounded-full border bg-secondary py-6 text-lg text-secondary-foreground/80 outline-none transition-all duration-200 hover:border-primary/40 hover:bg-primary/20`}
        >
          <span className="text-md mt-1">{text}</span>
          <Plus className="" size={20} />
        </Button>
      </Link>
    </div>
  );
};

export default ActionButton;
