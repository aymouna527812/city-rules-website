
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TimeText } from "@/components/TimeText";

type RuleCardProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  helper?: string;
  className?: string;
  id?: string;
};

export function RuleCard({ icon: Icon, title, value, helper, className, id }: RuleCardProps) {
  return (
    <Card id={id} className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-lg font-semibold text-slate-900"><TimeText value={value} /></p>
        {helper ? (<p className="text-sm text-slate-600"><TimeText value={helper} /></p>) : null}
      </CardContent>
    </Card>
  );
}