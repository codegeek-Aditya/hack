import React from "react";
import type { Patient } from "~/lib/types";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";

interface PatientDetailsProps {
  patient: Patient;
}

export const PatientDetails = ({ patient }: PatientDetailsProps) => {
  return (
    <Card className="my-4 min-h-[calc(100vh-8rem)] w-full overflow-y-auto p-6">
      <h3 className="text-xl font-semibold">Patient Details</h3>
      <Separator className="my-4" />

      <div className="space-y-8">
        <div>
          <h4 className="text-md font-medium text-muted-foreground">
            Personal Information
          </h4>
          <div className="mt-2 space-y-2">
            <p>Age: {patient.age}</p>
            <p>Gender: {patient.gender}</p>
            <p>Blood Group: {patient.bloodGroup}</p>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-muted-foreground">
            Contact Details
          </h4>
          <div className="mt-2 space-y-2">
            <p>Phone: {patient.contact.phone}</p>
            <p>Email: {patient.contact.email}</p>
            <p>Address: {patient.contact.address}</p>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-muted-foreground">
            Medical History
          </h4>
          <div className="mt-2 space-y-6">
            <div>
              <p className="text-sm font-medium">Allergies</p>
              {patient.medicalHistory.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {patient.medicalHistory.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="rounded-md bg-destructive/10 px-2 py-1 text-sm text-destructive"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="rounded-md bg-destructive/10 px-2 py-1 text-sm text-destructive">
                  N/A
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Current Medications</p>
              {patient.medicalHistory.currentMedications.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {patient.medicalHistory.currentMedications.map(
                    (medication) => (
                      <span
                        key={medication}
                        className="rounded-md bg-destructive/10 px-2 py-1 text-sm text-destructive"
                      >
                        {medication}
                      </span>
                    ),
                  )}
                </div>
              ) : (
                <p className="rounded-md bg-destructive/10 px-2 py-1 text-sm text-destructive">
                  N/A
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
