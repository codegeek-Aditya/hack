"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Check, Circle, X } from "lucide-react";
import { ny } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { FiArrowUpRight } from "react-icons/fi";
import { MdArrowOutward } from "react-icons/md";
import { useApi } from "~/hooks/useApi";
import { LuLoader, LuLoader2 } from "react-icons/lu";
import { useToast } from "~/hooks/use-toast";
import { useUser } from "~/hooks/useUser";
import RazorpayPayment from "../payment/RazorPayment";

interface Slot {
  startTime: string;
  endTime: string;
  onlineCount: number;
  notified: boolean;
  elapsed: boolean;
  users: Array<{
    userId: string;
    priority: number;
    symptoms: string;
    possibleAilment: string;
  }>;
}

interface Hospital {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalRating?: number;
  doctorId: string;
  doctorName: string;
  speciality: string;
  dateTime: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  recurring: boolean;
  recurringConfig: {
    paused: boolean;
    frequency: string;
    nextDateTime: string;
  };
  slots: Slot[];
  slotDuration: number;
  distance: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  result: Hospital[];
  analysis: {
    possibleAilment: string;
    symptomKeywords: string[];
    treatmentUrgency: number;
    transmittable: number;
    department: string;
    illness_severity?: number;
  };
}

export default function AppointmentForm({ goBack }: { goBack: () => void }) {
  const [date, setDate] = useState<Date>();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedHospital, setSelectedHospital] = useState<string>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>();
  const [symptoms, setSymptoms] = useState("");
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Hospital[] | null>(null);

  const { toast } = useToast();
  const { user } = useUser();

  const api = useApi();

  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [coordinates, setCoordinates] = useState<{
    lat: number;
    long: number;
  } | null>(null);

  const [selectedHospitalId, setSelectedHospitalId] = useState<string>();

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>();
  const [consultationDetails, setConsultationDetails] = useState<{
    consultationId?: string;
    doctorId?: string;
    userId?: string;
    slotIndex?: number;
    possibleAilment?: string;
    symptomKeywords?: string[];
    illness_severity?: number;
    online?: boolean;
    transmittable?: number;
  }>({});

  const [analysis, setAnalysis] = useState<{
    possibleAilment: string;
    symptomKeywords: string[];
    treatmentUrgency: number;
    transmittable: number;
    department: string;
    illness_severity?: number;
  } | null>(null);

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2) + " km";
  };

  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    duration: number,
  ) => {
    const slots = [];
    const start = new Date(startTime);
    const end = new Date(endTime);

    let current = start;
    while (current < end) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + duration * 60000);

      slots.push({
        start: format(slotStart, "h:mm a"),
        end: format(slotEnd, "h:mm a"),
        value: format(slotStart, "HH:mm"),
        disabled: false,
      });

      current = slotEnd;
    }

    return slots;
  };

  const getUserLocation = () => {
    return new Promise<{ lat: number; long: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
      );
    });
  };

  const handleAnalyze = async () => {
    setIsAnalysisComplete(false);
    setAnalysisResult(null);
    if (symptoms.trim() && date) {
      try {
        setAnalysisLoading(true);

        if (!coordinates) {
          try {
            const location = await getUserLocation();
            setCoordinates(location);
          } catch (error) {
            toast({
              title: "Location Error",
              description:
                "Please allow location access to find nearby consultations",
              variant: "destructive",
            });
            return;
          }
        }

        const response = await api.post<ApiResponse>(
          "/api/hospital/consultation/find",
          {
            symptoms: symptoms.trim(),
            lat: coordinates?.lat || 21.233566223452705,
            long: coordinates?.long || 81.34692561717546,
            date: date.toISOString(),
          },
        );

        if (response.success) {
          setAnalysisResult(response.result);
          setAnalysis(response.analysis);
          setIsAnalysisComplete(true);
          console.log("Illness Severity:", response.analysis.treatmentUrgency);
          toast({
            title: "Success",
            description: "Found available consultations",
          });
        } else {
          toast({
            title: "No Consultations Available",
            description:
              response.message ||
              "No consultations found for the given criteria",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setAnalysisLoading(false);
      }
    }
  };

  const handleTimeSlotSelect = (
    value: string,
    hospital: Hospital,
    slotIndex: number,
  ) => {
    setSelectedTimeSlot(value);
    setSelectedSlotIndex(slotIndex);
    setConsultationDetails({
      consultationId: hospital._id,
      userId: user?._id,
      doctorId: hospital.doctorId,
      slotIndex: slotIndex,
      possibleAilment: analysis?.possibleAilment || "",
      symptomKeywords: analysis?.symptomKeywords || [],
      illness_severity: analysis?.treatmentUrgency,
      transmittable: analysis?.transmittable,
      online: true,
    });
  };

  const [loading, setLoading] = useState(false);

  console.log(consultationDetails);

  const bookAppointment = async () => {
    setLoading(true);
    try {
      if (
        !consultationDetails.consultationId ||
        !consultationDetails.userId ||
        !consultationDetails.slotIndex === undefined
      ) {
        throw new Error("Missing required appointment details");
      }

      const response = await api.post("/api/user/appointment/book", {
        consultationId: consultationDetails.consultationId,
        userId: consultationDetails.userId,
        slotIndex: consultationDetails.slotIndex,
        symptoms: symptoms,
        possibleAilment: consultationDetails.possibleAilment,
        symptomKeywords: consultationDetails.symptomKeywords,
        illness_severity: consultationDetails.illness_severity,
        online: consultationDetails.online,
        transmittable: consultationDetails.transmittable,
      });

      if ((response as any).success) {
        toast({
          title: "Appointment Booked",
          description: "Appointment booked successfully",
        });
        goBack();
      } else {
        throw new Error(
          (response as any).message || "Failed to book appointment",
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Appointment Details</h2>

            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Describe Your Symptoms
                </label>
              </div>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Please describe your symptoms in detail..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="mb-8 flex items-center justify-between gap-8">
              <div className="w-full">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={ny(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                className="flex w-52 gap-2"
                variant={"default"}
                disabled={!symptoms.trim() || !date}
                onClick={handleAnalyze}
              >
                {analysisLoading ? (
                  <LuLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Analyse symptoms</span>
                )}
              </Button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select Hospital
                </label>
                <Select
                  onValueChange={(value) => {
                    setSelectedHospital(value);
                    setSelectedHospitalId(value);
                    setSelectedTimeSlot(undefined);
                  }}
                  value={selectedHospital}
                  disabled={!isAnalysisComplete}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisResult?.map((hospital) => (
                      <SelectItem
                        key={hospital._id}
                        value={hospital.hospitalId}
                        className="py-3"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">
                            {hospital.hospitalName}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{hospital.speciality}</span>
                            <span>•</span>
                            <span>{formatDistance(hospital.distance)}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{hospital.doctorName}</span>
                            <span>•</span>
                            <span>{hospital.hospitalRating} ★</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select Time Slot
                </label>
                <Select
                  disabled={!selectedHospital || !isAnalysisComplete}
                  value={selectedTimeSlot}
                  onValueChange={(value) => {
                    const hospital = analysisResult?.find(
                      (h) => h.hospitalId === selectedHospital,
                    );
                    if (hospital) {
                      const slotIndex = hospital.slots.findIndex(
                        (slot) =>
                          format(new Date(slot.startTime), "HH:mm") === value,
                      );
                      handleTimeSlotSelect(value, hospital, slotIndex);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedHospital &&
                      analysisResult?.map((hospital: Hospital) => {
                        if (hospital.hospitalId === selectedHospital) {
                          return hospital.slots.map(
                            (slot: Slot, index: number) => {
                              const startTime = new Date(slot.startTime);
                              const endTime = new Date(slot.endTime);
                              const isDisabled = slot.onlineCount >= 3;

                              return (
                                <SelectItem
                                  key={`${slot.startTime}-${index}`}
                                  value={format(startTime, "HH:mm")}
                                  disabled={isDisabled}
                                  onSelect={() =>
                                    handleTimeSlotSelect(
                                      format(startTime, "HH:mm"),
                                      hospital,
                                      index,
                                    )
                                  }
                                >
                                  {`${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`}
                                </SelectItem>
                              );
                            },
                          );
                        }
                        return null;
                      })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Appointment Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-4">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {date ? format(date, "MMMM d, yyyy") : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span className="text-muted-foreground">Hospital</span>
                <span className="font-medium">
                  {analysisResult?.find(
                    (h: Hospital) => h.hospitalId === selectedHospital,
                  )?.hospitalName || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between pb-4">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">
                  {selectedTimeSlot
                    ? analysisResult
                        ?.find(
                          (h: Hospital) => h.hospitalId === selectedHospital,
                        )
                        ?.slots.map((slot: Slot) => {
                          const startTime = new Date(slot.startTime);
                          if (format(startTime, "HH:mm") === selectedTimeSlot) {
                            return `${format(startTime, "h:mm a")} - ${format(new Date(slot.endTime), "h:mm a")}`;
                          }
                          return null;
                        })
                        .filter(Boolean)[0]
                    : "Not selected"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex w-full justify-end">
            <RazorpayPayment
              amount={20}
              onSuccess={() => bookAppointment()}
              onFailure={() =>
                toast({
                  title: "Error",
                  description: "An unexpected error occurred",
                  variant: "destructive",
                })
              }
            >
              <Button
                className="flex-1 bg-green-500 py-6 font-medium text-white hover:bg-green-600"
                disabled={!date || !selectedHospital || !selectedTimeSlot}
              >
                <span className="mt-0.5">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      Processing <LuLoader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    "Pay token fees (₹20)"
                  )}
                </span>
              </Button>
            </RazorpayPayment>
          </div>
        </div>
      </div>
    </div>
  );
}
