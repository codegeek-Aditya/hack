"use client";

import React from "react";
import ChartLayout from "~/components/ChartLayout";
import { CreateCaseView } from "~/components/doctor/CreateCaseView";
import { PatientDetails } from "~/components/doctor/PatientDetails";
import { useAtom } from "jotai";
import { patientAtom } from "~/store/atom";

const CreateCasePage = () => {
  const [patientDetails] = useAtom(patientAtom);

  if (!patientDetails?.id) {
    return null;
  }

  const LeftContent = <CreateCaseView patientId={patientDetails.id} />;
  const RightContent = <PatientDetails patient={patientDetails} />;

  return <ChartLayout leftContent={LeftContent} rightContent={RightContent} />;
};

export default CreateCasePage;
