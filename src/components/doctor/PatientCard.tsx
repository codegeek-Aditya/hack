import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { MdArrowOutward } from "react-icons/md";

interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    symptomKeywords?: string[];
    isRecurring: boolean;
  };
  onViewDetails: (patientId: string) => void;
}

export const PatientCard = ({ patient, onViewDetails }: PatientCardProps) => {
  const symptoms = patient.symptomKeywords || [];

  return (
    <Card className="relative p-6">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-2xl font-semibold text-foreground">
          {patient.name}
        </h3>
        {patient.isRecurring && (
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
            Recurring
          </span>
        )}
      </div>

      <div className="mb-4 text-muted-foreground">
        Age: {patient.age} | {patient.gender}
      </div>

      <div className="flex flex-wrap gap-2">
        {symptoms.map((symptom, index) => (
          <span
            key={`${symptom}-${index}`}
            className="rounded-lg bg-primary/10 px-4 py-1.5 text-sm text-primary"
          >
            {symptom}
          </span>
        ))}
      </div>

      <div className="absolute bottom-6 right-6">
        <Button
          onClick={() => onViewDetails(patient.id)}
          variant="outline"
          className="flex items-center gap-2 p-8 px-12 font-medium"
        >
          <span className="mt-1">View Patient Details</span>
          <MdArrowOutward className="text-xl" />
        </Button>
      </div>
    </Card>
  );
};
