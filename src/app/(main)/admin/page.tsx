"use client";

import { DiseaseStats } from "~/components/charts/admin/dashboard/DiseaseStats";
import { MostCommonMedicines } from "~/components/charts/admin/dashboard/MostCommonMedicines";
import { PatientsChart } from "~/components/charts/admin/dashboard/PatientsChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { StatCard } from "~/components/ui/stat-card";

const AdminPage = () => {
  return (
    <div className="flex">
      <div className="m-4 min-h-[calc(100vh-8rem)] flex-[0.75] space-y-4 overflow-y-auto rounded-xl p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Hospitals"
            value={12234}
            change="+20.1% from last month"
          />
          <StatCard
            title="Total Doctors"
            value={12234}
            change="+20.1% from last month"
          />
          <StatCard
            title="Total Patients"
            value={12234}
            change="+20.1% from last month"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Common Medicines</CardTitle>
              <CardDescription>Top most common medicines</CardDescription>
            </CardHeader>
            <CardContent>
              <MostCommonMedicines />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
              <CardDescription>Monthly patients statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientsChart />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-[0.25] py-4 pr-4">
        <DiseaseStats />
      </div>
    </div>
  );
};

export default AdminPage;
