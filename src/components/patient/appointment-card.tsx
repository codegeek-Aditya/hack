import { CalendarDays, Clock, Users } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export interface AppointmentCardProps {
  id: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  time: string;
  consultationType: string;
  queuePosition: number;
  peopleAhead: number;
}

export function AppointmentCard({
  id,
  doctorName,
  hospitalName,
  date,
  time,
  consultationType,
  queuePosition,
  peopleAhead,
}: AppointmentCardProps) {
  return (
    <Card className="mt-6 max-h-[250px]">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{doctorName}</h3>
            <p className="text-sm text-muted-foreground">{hospitalName}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {peopleAhead} people ahead
            </span>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{date}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{time}</span>
          </div>
        </div>

        <div className="mt-2 space-y-3">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span className="text-sm">Consultation:</span>
            <p className="text-sm">{consultationType}</p>
          </div>
          <div className="text-text flex items-center space-x-2">
            <span className="text-sm">Queue Position:</span>
            <p className="text-sm">{queuePosition}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
