"use client";

import { DiseaseStatsHospital } from "~/components/charts/hospital/DiseaseStats";
import { MostCommonMedicinesHospital } from "~/components/charts/hospital/MostCommonMedicines";
import { PatientsChartHospital } from "~/components/charts/hospital/PatientsChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import NumberTicker from "~/components/ui/number-ticker";
import { StatCard } from "~/components/ui/stat-card";

const HospitalsPage = () => {
  return (
    <div className="flex">
      <div className="flex-[0.75] space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total patients"
            value={12234}
            change="+20.1% from last month"
          />
          <StatCard
            title="Total Doctors"
            value={12234}
            change="+20.1% from last month"
          />
          <StatCard
            title="Total Revenue"
            value={12234}
            change="+20.1% from last month"
            prefix="₹"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Common Medicines</CardTitle>
              <CardDescription>Top most common medicines</CardDescription>
            </CardHeader>
            <CardContent>
              <MostCommonMedicinesHospital />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
              <CardDescription>Monthly patients statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientsChartHospital />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-[0.25] py-4 pr-4">
        <DiseaseStatsHospital />
      </div>
    </div>
  );
};

export default HospitalsPage;
