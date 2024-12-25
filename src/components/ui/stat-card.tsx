import { Card, CardContent, CardTitle, CardHeader } from "./card";
import NumberTicker from "./number-ticker";

interface StatCardProps {
  title: string;
  value: number;
  change: string;
  prefix?: string;
}

export function StatCard({ title, value, change, prefix }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix && (
            <span className="text-lg">
              {prefix} {"  "}
            </span>
          )}
          <NumberTicker value={value} />
        </div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}
