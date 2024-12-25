"use client";

import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/DataTable";
import { IoAdd, IoArrowBack } from "react-icons/io5";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "~/components/ui/dialog";
import CreateConsultation from "~/components/forms/CreateConsultation";
import { useUser } from "~/hooks/useUser";
import { useApi } from "~/hooks/useApi";

interface DoctorDetails {
  doctorName: string;
  speciality: string;
  date: string;
  time: string;
  originalData: Consultation;
}

interface PatientDetails {
  name: string;
  possibleAilment: string;
  priority: number;
  queuePosition: number;
  slotIndex: number;
}

interface ConsultationUser {
  userId: string;
  name: string;
  possibleAilment: string;
  priority: number;
  symptomKeywords?: string[];
  symptoms?: string[];
}

interface ConsultationSlot {
  notified: boolean;
  elapsed: boolean;
  users: ConsultationUser[];
  onlineCount: number;
  startTime: string;
  endTime: string;
}

interface Consultation {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  speciality: string;
  dateTime: string;
  location: {
    type: string;
    coordinates: number[];
  };
  recurring: null | any;
  recurringConfig: {
    paused: boolean;
    frequency: string;
    nextDateTime: string;
  };
  slots: ConsultationSlot[];
  slotDuration: number;
}

const ConsultationsPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetails | null>(
    null,
  );

  const { user } = useUser();
  const api = useApi();
  const hospitalId = user?.hospitalId;
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const fetchConsultations = async () => {
    const response = await api.post(
      `api/hospital/consultation/getConsultationsinHospital`,
      {
        hospitalId,
      },
    );
    const data = response as { success: boolean; result: Consultation[] };
    if (data.success) {
      setConsultations(data.result);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString("en-GB"),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const transformedConsultationData = consultations.map((consultation) => {
    const { date, time } = formatDateTime(consultation.dateTime);
    return {
      doctorName: consultation.doctorName,
      speciality: consultation.speciality,
      date,
      time,
      originalData: consultation,
    };
  });

  const getPatientDetails = (consultation: Consultation): PatientDetails[] => {
    if (!consultation.slots) return [];

    return consultation.slots.flatMap((slot, slotIndex) =>
      slot.users.map((user: ConsultationUser, userIndex) => ({
        name: user.name,
        possibleAilment: user.possibleAilment,
        priority: user.priority,
        queuePosition: userIndex + 1,
        slotIndex: slotIndex + 1,
      })),
    );
  };

  const consultationColumns = [
    { header: "Doctor", accessorKey: "doctorName" },
    { header: "Speciality", accessorKey: "speciality" },
    { header: "Date", accessorKey: "date" },
    { header: "Time", accessorKey: "time" },
  ];

  const doctorConsultationColumns = [
    { header: "Patient Name", accessorKey: "name" },
    { header: "Possible Ailment", accessorKey: "possibleAilment" },
    { header: "Priority", accessorKey: "priority" },
    { header: "Queue Position", accessorKey: "queuePosition" },
    { header: "Slot Number", accessorKey: "slotIndex" },
  ];

  const handleRowClick = (row: DoctorDetails) => {
    setSelectedDoctor(row);
  };

  const handleBack = () => {
    setSelectedDoctor(null);
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-8 px-6 py-4">
      {/* Header */}
      <div className="header mt-2 flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedDoctor && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-2"
            >
              <IoArrowBack className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {selectedDoctor
                ? `${selectedDoctor.doctorName}`
                : "All Consultations"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedDoctor
                ? `Manage all the appointments`
                : "Manage all the consultations"}
            </p>
          </div>
        </div>

        {selectedDoctor ? (
          <Button
            className="items-center"
            onClick={() => setIsEditDialogOpen(true)}
            variant="outline"
          >
            <span className="">Edit consultation </span>
          </Button>
        ) : (
          <Button
            className="items-center"
            onClick={() => setIsCreateDialogOpen(true)}
            variant="default"
          >
            <span className="mt-0.5">Create consultation </span>
            <IoAdd className="ml-2" />
          </Button>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="min-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create consultation</DialogTitle>
          </DialogHeader>
          <CreateConsultation />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit consultation</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Table */}
      {selectedDoctor ? (
        <DataTable
          data={getPatientDetails(selectedDoctor.originalData)}
          columns={doctorConsultationColumns}
          searchKey="name"
          searchPlaceholder="Search patient's name"
        />
      ) : (
        <DataTable
          data={transformedConsultationData}
          columns={consultationColumns}
          searchKey="doctorName"
          searchPlaceholder="Search doctor's name"
          onRowClick={handleRowClick}
          sortOptions={[
            {
              label: "Doctor: A-Z",
              value: "doctorNameAsc",
              sortKey: "doctorName",
              sortOrder: "asc",
            },
            {
              label: "Doctor: Z-A",
              value: "doctorNameDesc",
              sortKey: "doctorName",
              sortOrder: "desc",
            },
          ]}
        />
      )}
    </div>
  );
};

export default ConsultationsPage;
