import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

import { ContactLinks } from '@/components/admin/contact-links';
import { useUpdateInquiryStatus } from '@/hooks/use-inquiries';
import { useToast } from '@/hooks/use-toast';
import type { Inquiry, InquiryStatus } from '@/types/inquiry';

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];

interface Props {
  inquiry: Inquiry | null;
  onClose: () => void;
}

export function InquiryDetailSheet({ inquiry, onClose }: Props) {
  const updateStatus = useUpdateInquiryStatus();
  const { toast } = useToast();

  async function handleStatusChange(status: InquiryStatus) {
    if (!inquiry) return;
    try {
      await updateStatus.mutateAsync({ id: inquiry.id, status });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  }

  return (
    <Sheet open={!!inquiry} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>{inquiry?.subject ?? 'Inquiry'}</SheetTitle>
          <SheetDescription>
            {inquiry ? format(new Date(inquiry.createdAt), 'dd MMM yyyy, HH:mm') : ''}
          </SheetDescription>
        </SheetHeader>

        {inquiry && (
          <div className="space-y-6">
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                From
              </h3>
              <p className="text-sm font-medium text-foreground">{inquiry.name}</p>
              <ContactLinks
                email={inquiry.email}
                phone={inquiry.phone}
                subject={`Re: ${inquiry.subject ?? 'your enquiry'}`}
                emptyEmailLabel="No email given"
              />
            </section>

            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                Status
              </h3>
              <Select
                value={inquiry.status}
                onValueChange={v => void handleStatusChange(v as InquiryStatus)}
              >
                <SelectTrigger className="h-8 text-xs w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Message
              </h3>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </p>
            </section>

            {inquiry.sourcePage && (
              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Source
                </h3>
                <p className="text-xs text-muted-foreground font-mono">{inquiry.sourcePage}</p>
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
