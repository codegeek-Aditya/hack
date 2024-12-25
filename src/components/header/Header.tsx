"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import UserButton from "./UserButton";
import { useAtom } from "jotai";
import { getTierName, userDataAtom, userTierAtom } from "~/store/atom";
import MobileHamburger from "./Hamburger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { UserTier } from "../sidebar/navigation";
import { useUser } from "~/hooks/useUser";
import { useApi } from "~/hooks/useApi";

const Header = () => {
  const path = usePathname();
  const router = useRouter();
  const [userData] = useAtom(userDataAtom);
  const [userTier, setUserTier] = useAtom(userTierAtom);
  const [selectedHospital, setSelectedHospital] = useState<string>(
    userData?.hospitals?.[0]?.id || "",
  );
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const currentHour = new Date().getHours();
    setGreeting(
      currentHour >= 12 && currentHour < 18
        ? "Good afternoon"
        : currentHour >= 18
          ? "Good evening"
          : "Good morning",
    );
  }, []);

  useEffect(() => {
    if (path.startsWith("/admin")) {
      setUserTier(4);
    } else if (path.startsWith("/hospital/")) {
      setUserTier(3);
    } else if (path.startsWith("/doctor/")) {
      setUserTier(1);
    } else if (path.startsWith("/user/")) {
      setUserTier(0);
    }
  }, [path, setUserTier]);

  useEffect(() => {
    if (
      userTier === 1 &&
      userData?.hospitals &&
      userData.hospitals.length > 0
    ) {
      setSelectedHospital(userData.hospitals[0].id);
    }
  }, [userTier, userData]);

  const handleHospitalChange = (hospitalId: string) => {
    setSelectedHospital(hospitalId);
  };

  const showHospitalSelector =
    userTier === 1 &&
    userData?.hospitals &&
    Array.isArray(userData.hospitals) &&
    userData.hospitals.length > 0;

  const userRoleButtons = [
    { id: 0, label: "Patient", tier: 0 },
    { id: 1, label: "Doctor", tier: 1 },
    { id: 3, label: "Hospital", tier: 3 },
    { id: 4, label: "Admin", tier: 4 },
  ].filter((button) => button.tier === userTier);

  const handleRoleChange = (tier: number) => {
    setUserTier(tier as UserTier);
    switch (tier) {
      case 0:
        router.push("/user/appointments");
        break;
      case 1:
        router.push("/doctor/:hospitalId");
        break;
      case 3:
        router.push(`/hospital/:id`);
        break;
      case 4:
        router.push("/admin");
        break;
    }
  };

  const { user } = useUser();

  const firstName = user?.name.split(" ")[0];

  return (
    <div className="border-b border-border bg-background">
      <div className="mb-2 flex w-full items-center justify-between rounded-xl px-4 py-2">
        <div className="flex font-sans text-xl font-normal tracking-tighter sm:text-3xl">
          {greeting} <span className="text-primary">&nbsp;{firstName}</span>
        </div>

        <div className="hidden items-center gap-x-4 md:flex">
          <div className="flex gap-x-2">
            {userRoleButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => handleRoleChange(button.tier)}
                className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors"
              >
                {button.label}
              </button>
            ))}
          </div>

          <div className="w-[200px]">
            <UserButton />
          </div>
        </div>
        <MobileHamburger />
      </div>
    </div>
  );
};

export default Header;
