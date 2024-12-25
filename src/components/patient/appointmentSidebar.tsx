import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CalendarDays, ClipboardPenLine } from "lucide-react";
import { Calendar } from "../ui/calendar";

export default function MedicalDashboard() {
  const highlightedDates = [new Date(2024, 10, 12), new Date(2024, 10, 24)];

  return (
    <div className="min-w-xl mx-auto w-full space-y-4 px-2">
      <Card className="h-[calc(100vh-10rem)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex gap-2 text-lg font-semibold">
            <CalendarDays />
            Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-screen flex-col items-center space-y-4">
          <div className="flex w-full items-center justify-center rounded-lg bg-primary/5">
            <Calendar
              mode="single"
              selected={new Date()}
              modifiers={{
                highlighted: highlightedDates,
              }}
              modifiersStyles={{
                highlighted: {
                  backgroundColor: "hsl(var(--primary) / 0.9)",
                  color: "white",
                  borderRadius: "50%",
                },
                today: {
                  backgroundColor: "hsl(var(--foreground))",
                  color: "hsl(var(--background))",
                  borderRadius: "50%",
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
