import React from "react";
import { LeftChart } from "../../LeftChart";

export function DiseaseStats() {
  const chartData = [
    { hospital: "Cough", patients: 275, fill: "hsl(var(--chart-1))" },
    { hospital: "Fever", patients: 200, fill: "hsl(var(--chart-2))" },
    { hospital: "Typhoid", patients: 287, fill: "hsl(var(--chart-3))" },
    { hospital: "Dengue", patients: 173, fill: "hsl(var(--chart-4))" },
    { hospital: "Other", patients: 190, fill: "hsl(var(--chart-5))" },
  ].map((item) => ({
    label: item.hospital,
    value: item.patients,
    fill: item.fill,
  }));

  return (
    <LeftChart
      data={chartData}
      title="Disease Distribution"
      description="Monthly disease statistics"
      valueLabel="cases"
      cols={2}
    />
  );
}
