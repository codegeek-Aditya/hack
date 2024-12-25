import { atom } from "jotai";
import tempData from "../app/tempData.json";
import type { UserTier } from "~/components/sidebar/navigation";
import { Patient } from "~/lib/types";

type Hospital = {
  id: string;
  name: string;
  address: string;
};

type User = {
  id: string;
  tier: UserTier;
  name: string;
  email: string;
  hospitals?: Hospital[];
};

const getInitialState = (): boolean => {
  try {
    const saved = localStorage.getItem("sidebarExpanded");
    return saved !== null ? JSON.parse(saved) : true;
  } catch {
    return true;
  }
};

const baseAtom = atom(getInitialState());

export const patientAtom = atom<Patient | null>(null);

export const sidebarExpandedAtom = atom(
  (get) => get(baseAtom),
  (get, set, newValue: boolean) => {
    set(baseAtom, newValue);
    try {
      localStorage.setItem("sidebarExpanded", JSON.stringify(newValue));
    } catch {}
  },
);

export const userTierAtom = atom<UserTier>(0);
export const userDataAtom = atom((get) => {
  const tier = get(userTierAtom);
  return tempData.users.find((user) => {
    switch (tier) {
      case 0:
        return user.id.startsWith("P");
      case 1:
        return user.id.startsWith("D");
      case 2:
        return user.id.startsWith("HS");
      case 3:
        return user.id.startsWith("HA");
      case 4:
        return user.id.startsWith("SA");
      default:
        return user.id.startsWith("P");
    }
  });
});

export const sourceAtom = atom<{
  lat: number;
  lng: number;
  shouldFly?: boolean;
  address?: string;
}>({
  lat: 28.7041,
  lng: 77.1025,
  shouldFly: false,
  address: "",
});

export const destinationAtom = atom<{ lat: number | null; lng: number | null }>(
  {
    lat: null,
    lng: null,
  },
);

export const directionAtom = atom<number[][]>([]);

export const getTierName = (tier: UserTier): string => {
  switch (tier) {
    case 0:
      return "Patient";
    case 1:
      return "Doctor";
    case 2:
      return "Hospital Staff";
    case 3:
      return "Hospital Admin";
    case 4:
      return "System Admin";
    default:
      return "Patient";
  }
};
