"use client";

import React, { useEffect } from "react";

import { DataTable } from "~/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import ChartLayout from "~/components/ChartLayout";
import { PatientsChart } from "~/components/charts/admin/dashboard/PatientsChart";
import { PatientCard } from "~/components/doctor/PatientCard";
import { ConsultationView } from "~/components/doctor/ConsultationView";
import { PrescriptionView } from "~/components/doctor/PrescriptionView";
import { CreateCaseView } from "~/components/doctor/CreateCaseView";

import { BreadCrumbRender } from "~/components/doctor/BreadCrumbRender";
import { PatientDetails } from "~/components/doctor/PatientDetails";
import PrescriptionDetails from "~/components/doctor/PrescriptionDetails";
import { DiseaseStats } from "~/components/charts/admin/dashboard/DiseaseStats";
import { useUser } from "~/hooks/useUser";
import { useApi } from "~/hooks/useApi";
import { useToast } from "~/hooks/use-toast";
import { Row } from "@tanstack/react-table";
import { patientAtom } from "~/store/atom";
import { useAtom, useSetAtom } from "jotai";

type ViewState =
  | "appointments"
  | "consultation"
  | "prescription"
  | "createCase";

interface Patient {
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

interface ApiPatient {
  consultationId: string;
  dateTime: string;
  userId: string;
  symptomKeywords: string[];
  possibleAilment: string;
  name: string;
  user: {
    _id: string;
    tier: number;
    name: string;
    address: string;
    dob: string;
    gender: string;
    email: string;
    phone: string;
    bloodGroup: string;
    allergies: string[];
  };
}

const DoctorPage = () => {
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = React.useState<
    string | null
  >(null);
  const [currentView, setCurrentView] =
    React.useState<ViewState>("appointments");
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [prescriptionDetails, setPrescriptionDetails] = React.useState<
    Array<{
      medicineId: string;
      name: string;
      timing: {
        morning: boolean;
        afternoon: boolean;
        night: boolean;
      };
      quantity: number;
      price: number;
      additionalNote?: string;
    }>
  >([]);
  const [apiPatients, setApiPatients] = React.useState<ApiPatient[]>([]);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = React.useState(false);
  const [patientDetails, setPatientDetails] = useAtom(patientAtom);

  const pastAppointmentsColumns = [
    {
      header: "ID",
      accessorKey: "consultationId",
      cell: ({ row }: { row: Row<any> }) => {
        return row.original.consultationId.slice(-6).toUpperCase();
      },
    },
    {
      header: "Patient Name",
      accessorKey: "name",
    },
    {
      header: "Date",
      accessorKey: "dateTime",
      cell: ({ row }: { row: Row<any> }) => {
        try {
          const date = new Date(row.original.dateTime);
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        } catch (error) {
          return "-";
        }
      },
    },
    {
      header: "Time",
      accessorKey: "dateTime",
      cell: ({ row }: { row: Row<any> }) => {
        try {
          const date = new Date(row.original.dateTime);
          let hours = date.getHours();
          const minutes = date.getMinutes().toString().padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12;
          hours = hours ? hours : 12; // Convert 0 to 12
          return `${hours}:${minutes} ${ampm}`;
        } catch (error) {
          return "-";
        }
      },
    },
  ];

  const { user } = useUser();
  const doctorId = user?._id;
  const [pastAppointments, setPastAppointments] = React.useState<any[]>([]);
  const [isLoadingPast, setIsLoadingPast] = React.useState(false);
  const api = useApi();

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const reviewPatients = async (
    patientId: string,
    rating: number,
    review: string,
  ) => {
    try {
      const response = await api.post("api/hospital/reviewPatient", {
        ratedBy: doctorId,
        userId: patientId,
        rating: rating,
        review: review,
      });

      if ((response as any).success) {
        toast({
          title: "Success",
          description: "Review submitted successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit review",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while submitting the review",
      });
    }
  };

  const fetchUpcomingAppointments = async () => {
    if (doctorId) {
      setIsLoadingUpcoming(true);
      try {
        const response = await api.post(
          `api/hospital/consultation/getUpcomingPatients`,
          {
            doctorId: doctorId,
          },
        );

        if ((response as any).success) {
          setApiPatients((response as any).patients || []);
        } else {
          setApiPatients([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setApiPatients([]);
      } finally {
        setIsLoadingUpcoming(false);
      }
    }
  };

  const fetchPastAppointments = async () => {
    if (!doctorId) {
      console.log("No doctorId available");
      return;
    }

    setIsLoadingPast(true);
    try {
      console.log("Fetching past appointments for doctorId:", doctorId);

      const response = await api.post(
        "api/hospital/consultation/getPastPatients",
        {
          doctorId: doctorId,
        },
      );

      console.log("Past appointments API response:", response);

      if ((response as any).success) {
        console.log("Setting past appointments:", (response as any).patients);
        setPastAppointments((response as any).patients || []);
      } else {
        console.log("No past appointments found");
        setPastAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching past appointments:", error);
      setPastAppointments([]);
    } finally {
      setIsLoadingPast(false);
    }
  };

  useEffect(() => {
    console.log("Current doctorId:", doctorId);
  }, [doctorId]);

  useEffect(() => {
    console.log("Current pastAppointments:", pastAppointments);
  }, [pastAppointments]);

  useEffect(() => {
    fetchUpcomingAppointments();
    fetchPastAppointments();
  }, []);

  const [searchQuery, setSearchQuery] = React.useState("");

  const handleViewDetails = (patientId: string) => {
    const apiPatient = apiPatients.find((p) => p.user._id === patientId);
    if (apiPatient) {
      const formattedPatient: Patient = {
        id: apiPatient.userId,
        name: apiPatient.user.name,
        age: calculateAge(apiPatient.user.dob),
        gender: apiPatient.user.gender,
        bloodGroup: apiPatient.user.bloodGroup,
        contact: {
          phone: apiPatient.user.phone,
          email: apiPatient.user.email,
          address: apiPatient.user.address,
        },
        medicalHistory: {
          allergies: apiPatient.user.allergies.length
            ? apiPatient.user.allergies
            : ["NA"],
          currentMedications: [],
          chronicConditions: [],
        },
        currentConsultation: {
          symptoms: apiPatient.symptomKeywords,
          description: apiPatient.possibleAilment,
          vitals: {
            temperature: "N/A",
            bloodPressure: "N/A",
            heartRate: "N/A",
            oxygenLevel: "N/A",
          },
        },
        previousConsultations: [],
        isRecurring: false,
      };
      setSelectedPatient(formattedPatient);
      setPatientDetails(formattedPatient);
      setSelectedPatientId(patientId);
      setCurrentView("consultation");
    }
  };

  const handlePrescribe = () => {
    setPrescriptionDetails([]);
    setCurrentView("appointments");
  };

  const handleConsult = () => {
    setCurrentView("prescription");
  };

  const handleCreateCase = () => {
    setCurrentView("createCase");
  };

  const handleBreadcrumbClick = (view: ViewState) => {
    setCurrentView(view);
  };

  const renderBreadcrumb = () => {
    if (currentView === "appointments") return null;

    return (
      <BreadCrumbRender
        currentView={currentView}
        handleBreadcrumbClick={handleBreadcrumbClick}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
      />
    );
  };

  const handlePrescribeComplete = () => {
    setPrescriptionDetails([]);
    setCurrentView("appointments");
    fetchUpcomingAppointments();
  };

  const LeftContent = (
    <div className="flex w-full flex-col gap-4">
      {renderBreadcrumb()}

      {currentView === "appointments" && (
        <>
          <div className="header mt-2 flex w-full justify-between">
            <div>
              <h2 className="text-2xl font-bold">Appointments</h2>
              <p className="ml-[-1px] text-sm text-muted-foreground">
                Manage your appointments
              </p>
            </div>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <div className="flex items-center justify-between border-b">
              <TabsList className="h-auto bg-transparent p-0">
                <TabsTrigger
                  value="upcoming"
                  className="relative h-10 rounded-none bg-transparent px-4 pb-3 pt-2 font-medium before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] before:bg-primary before:opacity-0 before:transition-opacity data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:before:opacity-100"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="relative h-10 rounded-none bg-transparent px-4 pb-3 pt-2 font-medium before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] before:bg-primary before:opacity-0 before:transition-opacity data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:before:opacity-100"
                >
                  Past
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="upcoming">
              <div className="scrollbar mt-4 flex max-h-[calc(100vh-300px)] flex-col gap-4 overflow-y-auto pr-2">
                {isLoadingUpcoming ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : apiPatients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <div className="mb-2 text-4xl">📅</div>
                    <p className="text-lg font-medium">
                      No Upcoming Appointments
                    </p>
                    <p className="text-sm">
                      You have no scheduled appointments at the moment.
                    </p>
                  </div>
                ) : (
                  apiPatients.map((apiPatient) => (
                    <PatientCard
                      key={`${apiPatient.consultationId}-${apiPatient.userId}`}
                      patient={{
                        id: apiPatient.userId,
                        name: apiPatient.name,
                        age: calculateAge(apiPatient.user.dob),
                        gender: apiPatient.user.gender,
                        symptomKeywords: apiPatient.symptomKeywords,
                        possibleAilment: apiPatient.possibleAilment,
                        isRecurring: false,
                      }}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="past">
              {isLoadingPast ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : pastAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <div className="mb-2 text-4xl">📋</div>
                  <p className="text-lg font-medium">No Past Appointments</p>
                  <p className="text-sm">
                    Your past appointments history will appear here.
                  </p>
                </div>
              ) : (
                <DataTable
                  data={pastAppointments}
                  columns={pastAppointmentsColumns}
                  showViewButton
                  searchKey="name"
                  searchPlaceholder="Search patient name"
                  sortOptions={[
                    {
                      label: "Date: Newest First",
                      value: "dateDesc",
                      sortKey: "dateTime",
                      sortOrder: "desc",
                    },
                    {
                      label: "Date: Oldest First",
                      value: "dateAsc",
                      sortKey: "dateTime",
                      sortOrder: "asc",
                    },
                    {
                      label: "Name: A to Z",
                      value: "nameAsc",
                      sortKey: "name",
                      sortOrder: "asc",
                    },
                    {
                      label: "Name: Z to A",
                      value: "nameDesc",
                      sortKey: "name",
                      sortOrder: "desc",
                    },
                  ]}
                />
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {currentView === "consultation" && selectedPatient && (
        <ConsultationView
          patient={selectedPatient}
          onConsult={handleConsult}
          onCase={handleCreateCase}
        />
      )}

      {currentView === "prescription" && selectedPatientId && (
        <>
          <PrescriptionView
            patientId={selectedPatientId}
            patientName={selectedPatient?.name}
            consultationId={
              apiPatients.find((p) => p.userId === selectedPatientId)
                ?.consultationId
            }
            onCreateCase={handleCreateCase}
            prescriptionDetails={prescriptionDetails}
            setPrescriptionDetails={setPrescriptionDetails}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            onPrescribeComplete={handlePrescribeComplete}
          />
        </>
      )}
    </div>
  );

  const RightContent = (
    <div className="p-2">
      {selectedPatientId ? (
        <div className="space-y-4">
          {currentView === "consultation" && (
            <>
              {selectedPatient && <PatientDetails patient={selectedPatient} />}
            </>
          )}
          {currentView === "prescription" && (
            <>
              <PrescriptionDetails
                prescriptionDetails={prescriptionDetails}
                onAddMedicine={() => setIsDialogOpen(true)}
                onPrescribe={handlePrescribe}
              />
            </>
          )}
          {currentView === "createCase" && (
            <>
              <PrescriptionDetails
                prescriptionDetails={prescriptionDetails}
                onAddMedicine={() => setIsDialogOpen(true)}
                onPrescribe={handlePrescribe}
                isCreateCasePage={true}
              />
            </>
          )}
        </div>
      ) : (
        <DiseaseStats />
      )}
    </div>
  );

  return <ChartLayout leftContent={LeftContent} rightContent={RightContent} />;
};

export default DoctorPage;
