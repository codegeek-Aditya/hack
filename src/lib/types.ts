export interface Location {
  type: string;
  coordinates: [number, number];
}

export interface Department {
  _id?: string;
  name: string;
  location?: string;
  hod: string;
  beds: number[];
  doctors: string[];
}
export interface Stock {
  _id: any;
  name: string;
  supplier: string;
  quantity: number;
  consumption: string[];
  price: number;
  tag: string;
  hospitalId?: string;
  imgUrl?: string;
}

export interface Hospital {
  _id?: string;
  name: string;
  address: string;
  location: Location;
  director: string;
  email: string;
  phone: string;
  cases: string[];
  departments: Department[];
  inventory: string[];
  equipments: string[];
}

export interface Staff {
  _id?: string;
  tier: number;
  name: string;
  address: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  hospitalId: string;
}

export interface Consumable {
  _id?: string;
  name: string;
  supplier: string;
  quantity: number;
  consumption: string[];
  price: number;
  hospitalId?: string;
}

export interface Consumption {
  id?: string;
  monthYear: string;
  quantity: number;
  consumableId?: string;
}

export interface Slot {
  notified: boolean;
  elapsed: boolean;
  users: { userId: string; priority: number }[];
  onlineCount: number;
  startTime: Date;
  endTime: Date;
}

export interface Consultation {
  hospitalId: string;
  doctorId: string;
  specialty: string;
  dateTime: Date;
  recurring: boolean;
  recurringConfig: {
    paused: boolean;
    frequency: string;
    nextDateTime: Date;
  };
  slots: Slot[];
  slotDuration: number;
}

export interface Case {
  patientId: string;
  hospitalId: string;
  departmentId: string;
  doctorId: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  additionalInfo?: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export interface UserType {
  _id: string;
  tier: number;
  name: string;
  address: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  udid?: string;
  email: string;
  phone: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  allergies: string[];
  password?: string;
  qualification?: string;
  admitted?: boolean;
  consultations?: string[];
  cases?: string[];
  transactions?: string[];
  slotId?: string | null;
  slotPriority?: number | null;
  bedPriority?: number | null;
  departments?: string[];
  hospitals?: string[];
  hospitalId?: string;
}

export interface UserState {
  currentUser: UserType | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse {
  val: boolean;
  acknowledged?: boolean;
  insertedId?: string;
  message?: string;
  errors?: any[];
}

// remove later

import { ColumnDef } from "@tanstack/react-table";

export type ActionType = {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  show?: (row: any) => boolean;
};

export type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  actions?: ActionType[];
  searchKey?: string;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  onRowSelectionChange?: (rows: TData[]) => void;
  filterableColumns?: {
    id: string;
    title: string;
    options: { label: string; value: string | number }[];
  }[];
  toolbarActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }[];
  sortSelect?: React.ReactNode;
};

export interface Hospital {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  availableBeds: number;
  totalBeds: number;
  occupancy: string;
  specialties: string[];
  contact: string;
  director: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  medicalHistory: {
    allergies: string[];
    currentMedications: string[];
    chronicConditions: string[];
  };
  currentConsultation: {
    symptoms: string[];
    description: string;
    vitals: {
      temperature: string;
      bloodPressure: string;
      heartRate: string;
      oxygenLevel: string;
    };
  };
  previousConsultations: {
    id: string;
    date: string;
    doctorName: string;
    diagnosis: string;
    symptoms: string[];
    prescription: {
      medicines: Array<{
        name: string;
        dosage: string;
        duration: string;
        instructions: string;
      }>;
    };
  }[];
  isRecurring: boolean;
}
