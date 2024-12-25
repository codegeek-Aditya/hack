import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FiPlus } from "react-icons/fi";
import { MdArrowOutward } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useApi } from "~/hooks/useApi";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
import { useUser } from "~/hooks/useUser";
import { toast, useToast } from "~/hooks/use-toast";

interface PastConsultation {
  _id: string;
  hospitalName: string;
  doctorName: string;
  speciality: string;
  dateTime: string;
  consultationId: string;
  slotStartTime: string;
  slotEndTime: string;
  slotUsers: Array<{
    userId: string;
    priority: number;
    possibleAilment: string;
    symptomKeywords: string[];
  }>;
  onlineCount: number;
}

interface ConsultationViewProps {
  patient: {
    id: string;
    name: string;
    currentConsultation: {
      symptoms: string[];
      description: string;
    };
    rating?: number;
    review?: string;
  };
  onConsult: () => void;
  onCase: () => void;
}

export const ConsultationView = ({
  patient,
  onConsult,
  onCase,
}: ConsultationViewProps) => {
  const [selectedConsultation, setSelectedConsultation] =
    useState<PastConsultation | null>(null);
  const [pastConsultations, setPastConsultations] = useState<
    PastConsultation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(patient.rating || 0);
  const [review, setReview] = useState(patient.review || "");

  const router = useRouter();
  const api = useApi();
  const hospitalId = ":hospitalId";
  const { toast } = useToast();
  console.log(patient.id);
  const { user } = useUser();
  const doctorId = user?._id;
  const fetchPastConsultations = async () => {
    try {
      const response = await api.post("api/user/getPastAppointments", {
        userId: patient.id,
      });

      if ((response as any).success) {
        setPastConsultations((response as any).appointments);
      }
    } catch (error) {
      console.log("Error fetching past consultations:", error);
    } finally {
      setIsLoading(false);
    }
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

      console.log(response);

      if ((response as any).success) {
        toast({
          title: "Review saved successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Failed to save review",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log("Error saving review:", error);
      toast({
        title: "Failed to save review",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPastConsultations();
  }, [patient.id]);

  return (
    <div className="grid gap-6">
      <Card className="scrollbar h-[calc(100vh-9rem)] overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Detailed description</h2>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push(`/doctor/${hospitalId}/cases/create`)}
              variant="outline"
            >
              Create Case <FiPlus className="ml-2" />
            </Button>
            <Button variant="default" onClick={onConsult}>
              Create Prescription <MdArrowOutward className="ml-2" />
            </Button>
          </div>
        </div>
        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="">
            <div className="mb-6">
              <h3 className="mb-3 font-semibold">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {patient.currentConsultation.symptoms.map((symptom, index) => (
                  <span
                    key={`${symptom}-${index}`}
                    className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 font-semibold">Description</h3>
              <p className="text-muted-foreground">
                {patient.currentConsultation.description}
              </p>
            </div>
          </div>

          <div className="w-80 space-y-4">
            <h3 className="font-semibold">Patient Review</h3>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  {star <= rating ? (
                    <StarFilledIcon className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-6 w-6 text-gray-300" />
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <Textarea
                placeholder="Write your review about the patient..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                disabled={isLoading}
                className="resize-none pr-24"
              />
              <Button
                onClick={() => reviewPatients(patient.id, rating, review)}
                className="absolute bottom-2 right-2"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MdArrowOutward />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">Past Consultations</h3>
          <div className="scrollbar h-[16rem] space-y-4 overflow-y-auto pr-2">
            {isLoading ? (
              <Card className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </Card>
            ) : pastConsultations.length > 0 ? (
              pastConsultations.map((consultation) => (
                <Card key={consultation._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(consultation.dateTime), "PPP")}
                        </span>
                        <span className="text-sm font-medium">
                          {consultation.doctorName}
                        </span>
                      </div>
                      <p className="mt-2 font-medium">
                        Hospital: {consultation.hospitalName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Speciality: {consultation.speciality}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedConsultation(consultation)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">
                  No past appointments found
                </p>
              </Card>
            )}
          </div>
        </div>

        <Dialog
          open={!!selectedConsultation}
          onOpenChange={() => setSelectedConsultation(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Consultation Details</DialogTitle>
            </DialogHeader>
            {selectedConsultation && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Consultation ID
                  </p>
                  <p className="font-medium">{selectedConsultation._id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {format(new Date(selectedConsultation.dateTime), "PPP p")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">
                    {selectedConsultation.doctorName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hospital</p>
                  <p className="font-medium">
                    {selectedConsultation.hospitalName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Speciality</p>
                  <p className="font-medium">
                    {selectedConsultation.speciality}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="font-medium">
                    {selectedConsultation.slotUsers[0]?.possibleAilment ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Symptoms</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedConsultation.slotUsers[0]?.symptomKeywords.map(
                      (symptom, index) => (
                        <span
                          key={`${symptom}-${index}`}
                          className="rounded-md bg-secondary px-2 py-1 text-sm"
                        >
                          {symptom}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};
