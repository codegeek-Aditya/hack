import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

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

interface BreadCrumbRenderProps {
  currentView: ViewState;
  handleBreadcrumbClick: (view: ViewState) => void;
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
}

export const BreadCrumbRender = ({
  currentView,
  handleBreadcrumbClick,
  selectedPatient,
  setSelectedPatient,
}: BreadCrumbRenderProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => {
              handleBreadcrumbClick("appointments");
              setSelectedPatient(null);
            }}
            className="cursor-pointer"
          >
            Appointments
          </BreadcrumbLink>
        </BreadcrumbItem>

        {selectedPatient && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => handleBreadcrumbClick("consultation")}
                className="cursor-pointer"
              >
                {selectedPatient.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {currentView === "prescription" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Prescription</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {currentView === "createCase" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => handleBreadcrumbClick("prescription")}
                className="cursor-pointer"
              >
                Prescription
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Case</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
