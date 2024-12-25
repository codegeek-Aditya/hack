import { CalendarDays, Clock, FileText, Users } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";

interface PastAppointmentCardProps {
  id: string;
  doctorName: string;
  hospitalName: string;
  dateTime: string;
  speciality: string;
  status: boolean;
  symptoms: string[];
  possibleAilment: string;
}

export function PastAppointmentCard({
  id,
  doctorName,
  hospitalName,
  dateTime,
  speciality,
  status,
  symptoms,
  possibleAilment,
}: PastAppointmentCardProps) {
  const date = new Date(dateTime).toLocaleDateString();
  const time = new Date(dateTime).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Card className="mt-6 max-h-[250px]">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{doctorName}</h3>
            <p className="text-sm text-muted-foreground">{hospitalName}</p>
          </div>
          <div className="flex gap-1.5 rounded-full bg-muted px-4 py-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {status ? "Completed" : "Cancelled"}
            </span>
          </div>
        </div>

        <Separator className="my-3" />
        <div className="flex justify-between">
          <div>
            <div className="flex gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{date}</span>
              <Clock className="ml-4 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{time}</span>
            </div>
            <div className="mt-2 flex items-center space-x-2 text-muted-foreground">
              <span className="text-sm">Consultation:</span>
              <p className="text-sm">{speciality}</p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-2" variant="outline" size="lg">
                <FileText className="size-4" />
                <span className="ml-2 mt-1">View Report</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Medical Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Symptoms:</h4>
                  <ul className="list-inside list-disc">
                    {symptoms.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Possible Ailment:</h4>
                  <p>{possibleAilment}</p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
