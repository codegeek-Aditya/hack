"use client";
import { TabsTrigger } from "@radix-ui/react-tabs";
import { Pill, Plus, ArrowLeft, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import MedicalSidebar from "~/components/patient/appointmentSidebar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList } from "~/components/ui/tabs";
import { AppointmentCard } from "~/components/patient/appointment-card";
import { PastAppointmentCard } from "~/components/patient/past-appointment-card";
import { Separator } from "~/components/ui/separator";
import EmptyState from "~/components/emptyState";
import { useRouter } from "next/navigation";
import AppointmentForm from "~/components/patient/appointment-form";
import { useUser } from "~/hooks/useUser";
import { useApi } from "~/hooks/useApi";
import { AppointmentCardProps } from "~/components/patient/appointment-card";
import { LuLoader2 } from "react-icons/lu";

interface PastAppointment {
  _id: string;
  hospitalName: string;
  doctorName: string;
  speciality: string;
  dateTime: string;
  slotUsers: Array<{
    userId: string;
    priority: number;
    symptoms: string[];
    possibleAilment: string;
  }>;
}

const medications = [
  {
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
  },
  {
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice Weekly",
  },
];

const AppointmentsPage = () => {
  const router = useRouter();
  const [isBooking, setIsBooking] = React.useState(false);

  const { user } = useUser();
  const [upcomingAppointments, setUpcomingAppointments] = React.useState([]);
  const [pastAppointments, setPastAppointments] = React.useState([]);
  const api = useApi();

  const [isLoadingUpcoming, setIsLoadingUpcoming] = React.useState(true);
  const [isLoadingPast, setIsLoadingPast] = React.useState(true);

  const fetchUpcomingAppointments = async () => {
    setIsLoadingUpcoming(true);
    try {
      const appointments = await api.post("api/user/getUpcomingAppointments", {
        userId: user?._id,
      });

      if ((appointments as any).success) {
        setUpcomingAppointments((appointments as any).appointments);
      } else {
        setUpcomingAppointments([]);
      }
    } catch (error) {
      console.log("Error fetching upcoming appointments:", error);
      setUpcomingAppointments([]);
    } finally {
      setIsLoadingUpcoming(false);
    }
  };

  const fetchPastAppointments = async () => {
    setIsLoadingPast(true);
    try {
      const appointments = await api.post("api/user/getPastAppointments", {
        userId: user?._id,
      });

      if ((appointments as any).success) {
        setPastAppointments((appointments as any).appointments);
      } else {
        setPastAppointments([]);
      }
    } catch (error) {
      console.log("Error fetching past appointments:", error);
      setPastAppointments([]);
    } finally {
      setIsLoadingPast(false);
    }
  };

  useEffect(() => {
    fetchUpcomingAppointments();
    fetchPastAppointments();
  }, []);

  if (isBooking) {
    return (
      <div className="h-full w-full">
        <div className="flex items-center gap-4 p-4 md:px-6 md:pt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsBooking(false)}
            className="h-10 w-10 md:h-12 md:w-12"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold md:text-2xl">
              Book Appointment
            </h2>
            <p className="text-xs text-muted-foreground md:text-sm">
              Schedule a new appointment
            </p>
          </div>
        </div>
        <AppointmentForm goBack={() => setIsBooking(false)} />
      </div>
    );
  }

  return (
    <div className="flex max-h-[calc(100vh-4rem)] flex-col overflow-hidden md:max-h-[calc(100vh-8rem)] lg:flex-row">
      <div className="flex-1 space-y-4 p-4 md:space-y-6 md:px-6 md:pt-6 lg:flex-[0.75]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold md:text-2xl">
              All Appointments
            </h2>
            <p className="text-xs text-muted-foreground md:text-sm">
              Manage all the appointments
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsBooking(true)}
            className="w-full p-3 md:p-4 lg:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium md:text-base">
              New appointment
            </span>
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="flex w-full justify-start gap-2 border-b bg-transparent p-0">
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
            <TabsTrigger
              value="medications"
              className="relative h-10 rounded-none bg-transparent px-4 pb-3 pt-2 font-medium before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] before:bg-primary before:opacity-0 before:transition-opacity data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:before:opacity-100"
            >
              Medications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <div className="scrollbar flex max-h-[calc(100vh-16rem)] flex-col space-y-4 overflow-y-auto pr-2 md:max-h-[calc(100vh-18rem)]">
              {isLoadingUpcoming ? (
                <div className="flex items-center justify-center py-8">
                  <LuLoader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="flex h-screen w-full flex-col items-center justify-center">
                  <EmptyState
                    title="No Upcoming Appointments"
                    description="You don't have any upcoming appointments scheduled"
                  />
                </div>
              ) : (
                upcomingAppointments.map((appointment: any) => (
                  <AppointmentCard
                    key={appointment._id}
                    id={appointment._id as string}
                    doctorName={appointment.doctorName as string}
                    hospitalName={appointment.hospitalName as string}
                    date={new Date(appointment.dateTime).toLocaleDateString()}
                    time={new Date(appointment.dateTime).toLocaleTimeString(
                      [],
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      },
                    )}
                    consultationType={appointment.speciality as string}
                    queuePosition={appointment.userPosition as number}
                    peopleAhead={(appointment.onlineCount - 1) as number}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <div className="scrollbar flex max-h-[calc(100vh-16rem)] flex-col space-y-4 overflow-y-auto pr-2 md:max-h-[calc(100vh-18rem)]">
              {isLoadingPast ? (
                <div className="flex items-center justify-center py-8">
                  <LuLoader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : pastAppointments.length === 0 ? (
                <div className="flex h-screen w-full flex-col items-center justify-center">
                  <EmptyState
                    title="No Past Appointments"
                    description="Your past appointments history will appear here"
                  />
                </div>
              ) : (
                pastAppointments.map((appointment: PastAppointment) => (
                  <PastAppointmentCard
                    key={appointment._id}
                    id={appointment._id}
                    doctorName={appointment.doctorName}
                    hospitalName={appointment.hospitalName}
                    dateTime={appointment.dateTime}
                    speciality={appointment.speciality}
                    status={true}
                    symptoms={appointment.slotUsers[0].symptoms}
                    possibleAilment={appointment.slotUsers[0].possibleAilment}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="medications" className="mt-4">
            <div className="scrollbar flex max-h-[calc(100vh-16rem)] flex-col space-y-4 overflow-y-auto pr-2 md:max-h-[calc(100vh-18rem)]">
              <Card className="overflow-hidden border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="mb-5 flex gap-2 text-base font-semibold md:text-lg">
                    <Pill className="size-4 md:size-5" />
                    Active Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medications.length === 0 ? (
                      <EmptyState
                        title="No Active Medications"
                        description="Your active medications will appear here"
                      />
                    ) : (
                      medications.map((medication, index) => (
                        <div
                          key={index}
                          className="border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="text-base font-semibold text-primary md:text-lg">
                            {medication.name}
                          </div>
                          <div className="text-sm text-muted-foreground md:text-base">
                            Dosage: {medication.dosage}
                          </div>
                          <div className="text-sm text-muted-foreground md:text-base">
                            Frequency: {medication.frequency}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden flex-[0.25] py-4 pr-4 lg:flex">
        <MedicalSidebar />
      </div>
    </div>
  );
};

export default AppointmentsPage;
