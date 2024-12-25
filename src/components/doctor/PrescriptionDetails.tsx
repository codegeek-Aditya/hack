"use client";

import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "~/hooks/use-toast";

interface PrescriptionDetailsProps {
  prescriptionDetails: Array<{
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
  }>;
  onAddMedicine: () => void;
  onPrescribe: () => void;
  isCreateCasePage?: boolean;
}

export default function PrescriptionDetails({
  prescriptionDetails,
  onPrescribe,
  isCreateCasePage = false,
}: PrescriptionDetailsProps) {
  const { toast } = useToast();

  const totalCost = prescriptionDetails.reduce(
    (sum, medicine) => sum + medicine.price * medicine.quantity,
    0,
  );

  const handlePrescribe = () => {
    toast({
      title: "Success",
      description: "Medicine prescribed successfully",
    });
    onPrescribe();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-xl font-semibold">Prescribed Medicines</h3>
        <span className="text-lg font-medium">
          ₹{totalCost ? totalCost.toFixed(2) : "0.00"}
        </span>
      </div>

      <div className="scrollbar flex-1 overflow-y-auto">
        {prescriptionDetails.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No medicines prescribed yet
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {prescriptionDetails.map((medicine) => (
              <Card key={medicine.medicineId} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{medicine.name}</span>
                  <span className="text-muted-foreground">
                    {medicine.quantity} packet(s)
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  Per day:{" "}
                  {[
                    medicine.timing.morning && "1x Morning",
                    medicine.timing.afternoon && "1x Afternoon",
                    medicine.timing.night && "1x Night",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>

                {medicine.additionalNote && (
                  <div className="text-sm text-muted-foreground">
                    Note: {medicine.additionalNote}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
