"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
const chartData = [
  { browser: "Pitampura", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "Rohini", visitors: 200, fill: "var(--color-safari)" },
  { browser: "Dwarka", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "Janakpuri", visitors: 173, fill: "var(--color-edge)" },
  { browser: "Other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Patients",
  },
  chrome: {
    label: "Pitampura",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Rohini",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Dwarka",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Janakpuri",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function PatientsChartHospital() {
  return (
    <div className="flex flex-col gap-6">
      <ChartContainer
        config={chartConfig}
        className="h-[200px] w-full max-w-[600px]"
      >
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{
            left: 80,
            right: 20,
            top: 10,
            bottom: 10,
          }}
          width={500}
          height={180}
        >
          <YAxis
            dataKey="browser"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            width={1}
            tickFormatter={(value) => value}
          />
          <XAxis dataKey="visitors" type="number" hide />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="visitors" layout="vertical" radius={5} />
        </BarChart>
      </ChartContainer>
      <div className="flex-col items-start gap-4 text-sm">
        <div className="flex gap-2 pb-2 font-medium leading-none">
          Patients up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total patients for the last 6 months
        </div>
      </div>
    </div>
  );
}
