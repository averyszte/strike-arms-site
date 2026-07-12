import { useState } from 'react';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInquiries, useUpdateInquiryStatus } from '@/hooks/use-inquiries';
import { InquiryDetailSheet } from '@/components/admin/InquiryDetailSheet';
import { useToast } from '@/hooks/use-toast';
import type { Inquiry, InquiryStatus } from '@/types/inquiry';

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_TABS: { value: InquiryStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];

export function InquiriesTable() {
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const { data: inquiries, isLoading } = useInquiries(
    statusFilter === 'all' ? undefined : statusFilter,
  );
  const updateStatus = useUpdateInquiryStatus();
  const { toast } = useToast();

  async function handleStatusChange(id: string, status: InquiryStatus) {
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  }

  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">Inquiries</h2>
        <Tabs
          value={statusFilter}
          onValueChange={v => setStatusFilter(v as InquiryStatus | 'all')}
        >
          <TabsList>
            {STATUS_TABS.map(t => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">From</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Message</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {(inquiries ?? []).map(inq => (
                  <tr
                    key={inq.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedInquiry(inq)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-foreground font-medium">{inq.name}</p>
                      <p className="text-xs text-muted-foreground">{inq.email}</p>
                      {inq.phone && <p className="text-xs text-muted-foreground">{inq.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {format(new Date(inq.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-foreground">{inq.subject ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[260px]">
                      <p className="line-clamp-2">{inq.message}</p>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <Select
                        value={inq.status}
                        onValueChange={v => void handleStatusChange(inq.id, v as InquiryStatus)}
                      >
                        <SelectTrigger className="h-7 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(s => (
                            <SelectItem key={s.value} value={s.value} className="text-xs">
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {(inquiries?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      No inquiries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InquiryDetailSheet
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
      />
    </>
  );
}
