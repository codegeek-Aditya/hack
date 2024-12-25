import {
  MdOutlineDashboard,
  MdOutlineLocalHospital,
  MdOutlinePeople,
  MdOutlineAccountBalance,
  MdSettings,
  MdInventory2,
  MdOutlineDescription,
  MdEventNote,
  MdOutlinePayment,
  MdOutlineMedicalServices,
  MdOutlineFolderShared,
  MdOutlineApartment,
} from "react-icons/md";

export const iconMap = {
  MdOutlineDashboard: <MdOutlineDashboard size={20} />,
  MdOutlineLocalHospital: <MdOutlineLocalHospital size={20} />,
  MdOutlinePeople: <MdOutlinePeople size={20} />,
  MdOutlineAccountBalance: <MdOutlineAccountBalance size={20} />,
  MdSettings: <MdSettings size={20} />,
  MdInventory2: <MdInventory2 size={20} />,
  MdOutlineDescription: <MdOutlineDescription size={20} />,
  MdEventNote: <MdEventNote size={20} />,
  MdOutlinePayment: <MdOutlinePayment size={20} />,
  MdOutlineMedicalServices: <MdOutlineMedicalServices size={20} />,
  MdOutlineFolderShared: <MdOutlineFolderShared size={20} />,
  MdOutlineApartment: <MdOutlineApartment size={20} />,
} as const;

export type UserTier = 0 | 1 | 2 | 3 | 4;

export const navigationConfig = {
  0: [
    {
      name: "Appointments",
      href: "/user/appointments",
      icon: "MdEventNote",
      position: "top",
    },
    {
      name: "Cases",
      href: "/user/cases",
      icon: "MdOutlineFolderShared",
      position: "top",
    },
    {
      name: "Transactions",
      href: "/user/transactions",
      icon: "MdOutlinePayment",
      position: "top",
    },
    {
      name: "Settings",
      href: "/user/settings",
      icon: "MdSettings",
      position: "bottom",
    },
  ],
  1: [
    {
      name: "Appointments",
      href: "/doctor/:hospitalId",
      icon: "MdEventNote",
      position: "top",
    },
    {
      name: "Cases",
      href: "/doctor/:hospitalId/cases",
      icon: "MdOutlineFolderShared",
      position: "top",
    },

    {
      name: "Settings",
      href: "/doctor/settings",
      icon: "MdSettings",
      position: "bottom",
    },
  ],
  2: [
    {
      name: "Dashboard",
      href: "/hospital/:id",
      icon: "MdOutlineDashboard",
      position: "top",
    },
    {
      name: "Consultations",
      href: "/hospital/:id/consultations",
      icon: "MdOutlineMedicalServices",
      position: "top",
    },
    {
      name: "Patients",
      href: "/hospital/:id/patients",
      icon: "MdOutlinePeople",
      position: "top",
    },
    {
      name: "Inventory",
      href: "/hospital/:id/inventory",
      icon: "MdInventory2",
      position: "top",
    },
    {
      name: "Departments",
      href: "/hospital/:id/departments",
      icon: "MdOutlineDepartment",
      position: "top",
    },
    {
      name: "Transactions",
      href: "/hospital/:id/transactions",
      icon: "MdOutlinePayment",
      position: "top",
    },
    {
      name: "Settings",
      href: "/hospital/:id/settings",
      icon: "MdSettings",
      position: "bottom",
    },
  ],
  3: [
    {
      name: "Dashboard",
      href: "/hospital/:id",
      icon: "MdOutlineDashboard",
      position: "top",
    },
    {
      name: "Consultations",
      href: "/hospital/:id/consultations",
      icon: "MdOutlineMedicalServices",
      position: "top",
    },
    {
      name: "Users",
      href: "/hospital/:id/users",
      icon: "MdOutlinePeople",
      position: "top",
    },
    {
      name: "Inventory",
      href: "/hospital/:id/inventory",
      icon: "MdInventory2",
      position: "top",
    },
    {
      name: "Departments",
      href: "/hospital/:id/departments",
      icon: "MdOutlineDepartment",
      position: "top",
    },
    {
      name: "Transactions",
      href: "/hospital/:id/transactions",
      icon: "MdOutlinePayment",
      position: "top",
    },
    {
      name: "Settings",
      href: "/hospital/:id/settings",
      icon: "MdSettings",
      position: "bottom",
    },
  ],
  4: [
    {
      name: "Dashboard",
      href: "/admin",
      icon: "MdOutlineDashboard",
      position: "top",
    },
    {
      name: "Hospitals",
      href: "/admin/hospitals",
      icon: "MdOutlineLocalHospital",
      position: "top",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: "MdOutlinePeople",
      position: "top",
    },
    {
      name: "Transactions",
      href: "/admin/transactions",
      icon: "MdOutlineAccountBalance",
      position: "top",
    },

    {
      name: "Settings",
      href: "/admin/settings",
      icon: "MdSettings",
      position: "bottom",
    },
  ],
} as const;

import { usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { userTierAtom } from "~/store/atom";

export const useNavigation = () => {
  const pathname = usePathname();
  const [userTier] = useAtom(userTierAtom);

  function isNavItemActive(nav: string) {
    return pathname === nav || pathname.startsWith(nav);
  }

  const validTier = Math.min(Math.max(userTier, 0), 4) as UserTier;
  const roleNavItems = navigationConfig[validTier] || navigationConfig[0];

  const navItems = roleNavItems.map((item) => ({
    name: item.name,
    href: item.href,
    icon: iconMap[item.icon as keyof typeof iconMap] || (
      <MdSettings size={20} />
    ),
    active: isNavItemActive(item.href),
    position: item.position,
  }));

  return {
    navItems,
    topNavItems: navItems.filter((item) => item.position === "top"),
    bottomNavItems: navItems.filter((item) => item.position === "bottom"),
  };
};

export type NavItem = {
  name: string;
  href: string;
  icon: JSX.Element;
  active: boolean;
  position: "top" | "bottom";
};

export type NavConfigItem = {
  name: string;
  href: string;
  icon: keyof typeof iconMap;
  position: "top" | "bottom";
};
