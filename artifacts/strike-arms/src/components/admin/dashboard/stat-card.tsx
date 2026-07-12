import type { ElementType } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  title: string;
  value: string;
  detail: string;
  icon: ElementType;
}

export function StatCard({ title, value, detail, icon: Icon }: Props) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{detail}</p>
          </div>
          <div className="p-2 bg-accent/10 rounded-md shrink-0 mt-0.5">
            <Icon className="w-4 h-4 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
