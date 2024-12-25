"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

interface ChartDataItem {
  label: string;
  value: number;
  fill: string;
}

interface LeftChartProps {
  data: ChartDataItem[];
  title: string;
  description?: string;
  valueLabel?: string;
  cols?: number;
}

export function LeftChart({
  data,
  title,
  description,
  valueLabel = "Patients",
  cols = 1,
}: LeftChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      [valueLabel]: {
        label: valueLabel,
      },
    };

    data.forEach((item) => {
      config[item.label] = {
        label: item.label,
        color: item.fill,
      };
    });

    return config;
  }, [data, valueLabel]);

  return (
    <Card className="flex h-full min-h-[calc(100vh-8rem)] flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription className="pt-2">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-0 pt-8">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ payload }) => {
                if (payload && payload[0]) {
                  return (
                    <div className="rounded-lg bg-white p-2 shadow-md dark:bg-gray-800">
                      <div className="text-sm font-bold dark:text-white">
                        {payload[0].value}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
              stroke="var(--background)"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold dark:fill-white"
                        >
                          {totalValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground dark:fill-gray-300"
                        >
                          {valueLabel}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-lg">
        <div
          className={`mt-4 grid gap-2 pb-8 ${cols === 1 ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-md"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-[16px]">{item.label}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
