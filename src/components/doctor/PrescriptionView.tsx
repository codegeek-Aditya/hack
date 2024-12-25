import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { useStock } from "~/hooks/useOrderStock";
import { useApi } from "~/hooks/useApi";
import { useToast } from "~/hooks/use-toast";
import { useUser } from "~/hooks/useUser";

interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface PrescriptionDetails {
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
}

interface PrescriptionViewProps {
  patientId: string;
  patientName?: string;
  consultationId?: string;
  onCreateCase: () => void;
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
  setPrescriptionDetails: React.Dispatch<
    React.SetStateAction<PrescriptionDetails[]>
  >;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPrescribeComplete: () => void;
}

interface PrescribedMedicine {
  consumableId: string;
  qty: number;
  notes: string;
}

const QUANTITY_SUGGESTIONS = [1, 2, 3, 5];

export const PrescriptionView = ({
  patientId,
  patientName,
  consultationId,
  onCreateCase,
  prescriptionDetails,
  setPrescriptionDetails,
  isDialogOpen,
  setIsDialogOpen,
  onPrescribeComplete,
}: PrescriptionViewProps) => {
  const [selectedMedicine, setSelectedMedicine] = React.useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  const [timing, setTiming] = React.useState({
    morning: false,
    afternoon: false,
    night: false,
  });
  const [quantity, setQuantity] = React.useState("1");
  const [additionalNote, setAdditionalNote] = React.useState("");

  const { stock: medicines, isLoading } = useStock();

  console.log(medicines);

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      medicine.tag?.includes("medicine"),
  );

  const handleMedicineSelect = (medicineId: string) => {
    setSelectedMedicine(medicineId);
  };

  const handleAddMedicine = () => {
    setIsDialogOpen(true);
  };

  const isFormValid = () => {
    const hasTimingSelected = Object.values(timing).some((value) => value);
    const hasValidQuantity = quantity !== "" && parseInt(quantity) > 0;
    return hasTimingSelected && hasValidQuantity;
  };

  const handleSubmitPrescription = () => {
    if (!isFormValid()) return;

    const selectedMedicineDetails = medicines.find(
      (m) => m._id === selectedMedicine,
    );
    if (!selectedMedicineDetails) return;

    const newPrescription = {
      medicineId: selectedMedicineDetails._id,
      name: selectedMedicineDetails.name,
      timing,
      quantity: parseInt(quantity),
      price: Number(selectedMedicineDetails.price),
      additionalNote,
    };

    setPrescriptionDetails((prev: PrescriptionDetails[]) => [
      ...prev,
      newPrescription,
    ]);
    setIsDialogOpen(false);
    resetForm();
  };

  const api = useApi();
  const { toast } = useToast();
  const { user } = useUser();
  const hospitalId = user?.hospitalId;

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handlePrescribe = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const prescribedMedicines: PrescribedMedicine[] = prescriptionDetails.map(
        (prescription) => ({
          consumableId: prescription.medicineId,
          qty: prescription.quantity,
          notes: prescription.additionalNote || "",
        }),
      );

      const totalAmount = prescriptionDetails.reduce((sum, medicine) => {
        const itemTotal = medicine.price * medicine.quantity;
        console.log(
          `Medicine: ${medicine.name}, Price: ${medicine.price}, Quantity: ${medicine.quantity}, Item Total: ${itemTotal}`,
        );
        return sum + itemTotal;
      }, 0);

      const prescriptionData = {
        consultationId,
        hospitalId: hospitalId || "",
        userId: patientId,
        diagnosis: "temp",
        meds: prescribedMedicines,
        patientName,
        amount: totalAmount,
      };

      console.log("Prescription Data:", prescriptionData);

      const response = await api.post(
        "/api/hospital/consultation/createDiagnosis",
        prescriptionData,
      );

      console.log("API Response:", response);

      if ((response as any).success) {
        toast({
          title: "Prescription created successfully",
          description: "The prescription has been created successfully",
        });
        onPrescribeComplete();
      } else {
        toast({
          title: "Error",
          description: "An error occurred while creating the prescription",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating the prescription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTiming({ morning: false, afternoon: false, night: false });
    setQuantity("");
    setAdditionalNote("");
    setSelectedMedicine(null);
  };

  const boxSizesRef = React.useRef<Record<string, number>>({});

  const formatMedicineDescription = (quantity: number, medicineId: string) => {
    if (!boxSizesRef.current[medicineId]) {
      boxSizesRef.current[medicineId] = [8, 12, 16, 24][
        Math.floor(Math.random() * 4)
      ];
    }
    return `${quantity >= 10 ? `${quantity}mg` : `${quantity * 1000}g`} tablets | Box of ${boxSizesRef.current[medicineId]}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prescription</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleAddMedicine} disabled={!selectedMedicine}>
            Add Medicine
          </Button>
          {prescriptionDetails.length > 0 && (
            <Button
              onClick={handlePrescribe}
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Prescribing..." : "Prescribe"}
            </Button>
          )}
        </div>
      </div>

      <Input
        placeholder="Search medicines..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-xs"
      />

      <div className="scrollbar flex max-h-[calc(100vh-300px)] flex-col gap-4 overflow-y-auto pr-2">
        {filteredMedicines.map((medicine) => (
          <Card
            key={medicine._id}
            className={`cursor-pointer p-4 ${
              selectedMedicine === medicine._id
                ? "border-2 border-dashed border-primary"
                : ""
            }`}
            onClick={() => handleMedicineSelect(medicine._id)}
          >
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  height={400}
                  width={400}
                  src={medicine.imgUrl ?? "/default-image.png"}
                  alt={medicine.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between">
                  <h3 className="text-lg font-medium">{medicine.name}</h3>
                  <p className="text-lg font-semibold text-primary">
                    ₹{medicine.price}
                  </p>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  {formatMedicineDescription(medicine.quantity, medicine._id)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medicine Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Timing</Label>
              <div className="mt-2 flex gap-4">
                {["morning", "afternoon", "night"].map((time) => (
                  <div
                    key={time}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 hover:bg-muted ${
                      timing[time as keyof typeof timing]
                        ? "border-primary bg-primary/10"
                        : "border-input"
                    }`}
                    onClick={() =>
                      setTiming((prev) => ({
                        ...prev,
                        [time]: !prev[time as keyof typeof timing],
                      }))
                    }
                  >
                    <Checkbox
                      checked={timing[time as keyof typeof timing]}
                      onCheckedChange={(checked) =>
                        setTiming((prev) => ({
                          ...prev,
                          [time]: checked as boolean,
                        }))
                      }
                    />
                    <Label className="cursor-pointer capitalize">{time}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Quantity (packets)</Label>
              <div className="mt-2 space-y-2">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <div className="grid grid-cols-4 gap-2">
                  {QUANTITY_SUGGESTIONS.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setQuantity(suggestion.toString())}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>Additional Note (optional)</Label>
              <Textarea
                value={additionalNote}
                onChange={(e) => setAdditionalNote(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleSubmitPrescription}
              className="w-full"
              disabled={!isFormValid()}
            >
              Add Medicine
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
