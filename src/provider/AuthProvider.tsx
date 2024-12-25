"use client";

import { useUser } from "~/hooks/useUser";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === undefined) return;

    if (user === null) {
      router.push("/auth/login");
      return;
    }

    const segments = pathname.split("/");
    const isInCorrectSection = segments[1] === getCorrectSection(user.tier);

    if (!isInCorrectSection) {
      const redirectPath = getTierRedirectPath(user);
      router.push(redirectPath);
    }
  }, [user, pathname, router]);

  return <>{children}</>;
}

function getTierRedirectPath(user: any) {
  switch (user.tier) {
    case 0:
      return "/user/appointments";
    case 1:
      return `/doctor/${user.hospitalId}`;
    case 2:
    case 3:
      return `/hospital/${user._id}`;
    case 4:
      return "/admin";
    default:
      return "/auth/login";
  }
}

function getCorrectSection(tier: number) {
  switch (tier) {
    case 0:
      return "user";
    case 1:
      return "doctor";
    case 2:
    case 3:
      return "hospital";
    case 4:
      return "admin";
    default:
      return "";
  }
}
