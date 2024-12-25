"use client";

import React, { useState } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { format } from "date-fns";
import { ny } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useUser } from "~/hooks/useUser";
import { useApi } from "~/hooks/useApi";

interface CreateCaseViewProps {
  patientId: string;
  patientDetails?: any;
}

export const CreateCaseView = ({
  patientId,
  patientDetails,
}: CreateCaseViewProps) => {
  const [startDate, setStartDate] = React.useState<Date>(new Date());
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [hasEndDate, setHasEndDate] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [additionalInfo, setAdditionalInfo] = React.useState("");
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>("");
  const [doctorOffset, setDoctorOffset] = useState<number>(0);
  const { toast } = useToast();
  const router = useRouter();

  const { user, isLoading } = useUser();
  const api = useApi();

  const isFormValid = () => {
    return (
      startDate !== undefined &&
      (!hasEndDate || endDate !== undefined) &&
      !isLoading &&
      !!user
    );
  };

  const handleAdmit = async () => {
    if (!user || isLoading) {
      toast({
        title: "Error",
        description: "User data not available. Please try again.",
      });
      return;
    }

    const admissionData = {
      doctorOffset,
      doctorId: user._id,
      departmentId: user.departmentId,
      hospitalId: user.hospitalId,
      userId: patientId,
      bedIndex: 1,
      userName: user.name,
      ailment: patientDetails?.currentConsultation?.description ?? "",
      documents: [],
      prescriptions: [],
      doctorName: user.name,
      admittedAt: startDate.toISOString(),
      dischargeAt: hasEndDate ? endDate?.toISOString() : null,
      illness_severity: 2,
      transmittable: 0,
    };

    console.log("User before submission:", user);
    console.log("Admission Data:", admissionData);

    try {
      const response = await api.post("api/case/create", admissionData);
      console.log("API Response:", response);

      toast({
        title: "Success",
        description: "Patient has been admitted successfully",
      });
    } catch (error) {
      console.error("API Error:", error);
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
      });
    }
  };

  React.useEffect(() => {
    console.log("User data changed:", user);
  }, [user]);

  const dateSection = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Select Dates</label>
        <div className="flex items-center space-x-2">
          <Switch
            checked={hasEndDate}
            onCheckedChange={setHasEndDate}
            id="end-date"
          />
          <Label htmlFor="end-date" className="text-sm text-muted-foreground">
            Include end date
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={ny(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, "PPP")
                ) : (
                  <span>Pick start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                disabled={(date) => date < new Date()}
                initialFocus
                className="rounded-md border shadow"
              />
            </PopoverContent>
          </Popover>
        </div>

        {hasEndDate && (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={ny(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP")
                  ) : (
                    <span>Pick end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < startDate}
                  initialFocus
                  className="rounded-md border shadow"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid gap-4 p-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create Case</h2>
            <p className="text-sm text-muted-foreground">
              Manage your consultations
            </p>
          </div>
          <Button onClick={handleAdmit} disabled={!isFormValid()}>
            Admit patient
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <label className="text-sm font-medium">Doctor Offset</label>
            <Input
              type="number"
              value={doctorOffset}
              onChange={(e) => setDoctorOffset(Number(e.target.value))}
              className="w-[200px]"
            />
          </div>

          <div className="flex gap-2">
            <Card className="flex flex-col gap-y-2 p-2">
              <p className="text-sm">Total beds available:</p>
              <span className="font-semibold text-primary">12 / 50</span>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Description of disease/severity"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-32 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional Info (optional)
            </label>
            <Textarea
              placeholder="Additional info (saline blood?)"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="h-32 resize-none"
            />
          </div>
        </div>

        {dateSection}
      </div>
    </div>
  );
};
