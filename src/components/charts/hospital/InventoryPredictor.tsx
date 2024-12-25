"use client";

import { useState, useEffect } from "react";
import { Pill, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { ChartConfig } from "~/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { useStock } from "~/hooks/useOrderStock";

const generateRandomData = () => {
  const months = ["January", "February", "March", "April", "May", "June"];
  return months.map((month) => ({
    month,
    desktop: Math.floor(Math.random() * (350 - 50) + 50), // Random number between 50-350
  }));
};

const chartData = generateRandomData();

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function InventoryPredictor() {
  const { stock } = useStock();
  // Prevent hydration mismatch by initializing with null or a default state
  const [isClient, setIsClient] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("");
  const [nextMonth, setNextMonth] = useState("");
  const [currentMonthUsage, setCurrentMonthUsage] = useState(247);
  const [nextMonthPrediction, setNextMonthPrediction] = useState(260);
  const [apiResponse, setApiResponse] = useState<{
    prediction?: number;
    error?: string;
  }>({});

  useEffect(() => {
    // This ensures the component only runs on the client side
    setIsClient(true);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currentDate = new Date();
    const currentMonthName = months[currentDate.getMonth()];
    const nextMonthName = months[(currentDate.getMonth() + 1) % 12];

    setCurrentMonth(currentMonthName);
    setNextMonth(nextMonthName);

    const sendInventoryRequest = async () => {
      try {
        const payload = {
          current_month: "June",
          item: "Masks",
        };

        // Use the Next.js API route to proxy the request and avoid CORS
        //   const response = await fetch(
        //     "http://127.0.0.1:5000/drugs_inventory_pred",
        //     {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",
        //       },
        //       body: JSON.stringify(payload),
        //     },
        //   );

        //   if (!response.ok) {
        //     throw new Error("Network response was not ok");
        //   }

        //   const data = await response.json();
        //   console.log("Inventory prediction response:", data);
        // setApiResponse({ prediction: data.predicted_amount });
      } catch (error) {
        console.error("Error sending inventory request:", error);
        setApiResponse({
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    };

    sendInventoryRequest();
  }, []);

  // Render nothing on the server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  const availableMedicines = stock.map((item) => ({
    id: item._id,
    name: item.name,
    description: `${item.quantity >= 10 ? `${item.quantity}mg` : `${item.quantity * 1000}g`} tablets | Box of ${[8, 12, 16, 24][Math.floor(Math.random() * 4)]}`,
    price: item.price,
    image: item.imgUrl || "/default-image.png",
  }));

  // Map predictions to actual medicine names from stock
  const medicinePredictions = availableMedicines
    .slice(0, 4)
    .map((medicine, index) => {
      // Fixed quantities for each medicine based on index
      const quantities = [750, 1200, 950, 1400];
      return {
        name: medicine.name,
        quantity: quantities[index],
      };
    });

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-md">Monthly Usage</CardTitle>
          <CardDescription>
            Showing total medical usage for the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="size-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                January - {currentMonth} 2024
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card className="w-full max-w-none bg-white">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            Predicted Medicine Quantities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medicinePredictions.map((medicine, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <div className="flex items-center">
                  <Pill className="mr-3 h-6 w-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    {medicine.name}
                  </h3>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {medicine.quantity.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InventoryPredictor;
