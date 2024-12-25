"use client";

import React from "react";
import ChartLayout from "~/components/ChartLayout";
import { CreateCaseView } from "~/components/doctor/CreateCaseView";
import { PatientDetails } from "~/components/doctor/PatientDetails";

const CreateCasePage = () => {
  const patientData = {
    id: "1",
    name: "Sarah Johnson",
    age: 24,
    gender: "Female",
    bloodGroup: "O+",
    contact: {
      phone: "+1 (555) 123-4567",
      email: "sarah.j@email.com",
      address: "123 Main St, Anytown, ST 12345",
    },
    medicalHistory: {
      allergies: ["Penicillin", "Peanuts"],
      currentMedications: ["Antihistamine"],
      chronicConditions: ["Asthma"],
    },
    currentConsultation: {
      symptoms: ["fever", "cold", "Cough"],
      description:
        "Patient reports persistent cough for 5 days with fever starting 2 days ago. No chest pain reported.",
      vitals: {
        temperature: "38.5°C",
        bloodPressure: "120/80",
        heartRate: "88 bpm",
        oxygenLevel: "98%",
      },
    },
    previousConsultations: [
      {
        id: "pc1",
        date: "2024-02-15",
        doctorName: "Dr. Michael Chen",
        diagnosis: "Acute Bronchitis",
        symptoms: ["cough", "fever"],
        prescription: {
          medicines: [
            {
              name: "Amoxicillin",
              dosage: "500mg",
              duration: "7 days",
              instructions: "Take twice daily after meals",
            },
          ],
        },
      },
    ],
    isRecurring: true,
  };

  const LeftContent = <CreateCaseView patientId={patientData.id} />;
  const RightContent = <PatientDetails patient={patientData} />;

  return <ChartLayout leftContent={LeftContent} rightContent={RightContent} />;
};

export default CreateCasePage;
