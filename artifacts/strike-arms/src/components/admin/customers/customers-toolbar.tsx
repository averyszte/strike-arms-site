import { Download, Mail, RefreshCw } from 'lucide-react';

import { AdminSearchBox } from '@/components/admin/AdminSearchBox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CustomerSort } from '@/types/admin-customer';

const SORT_LABELS: Record<CustomerSort, string> = {
  newest: 'Newest first',
  spent: 'Biggest spenders',
  orders: 'Most orders',
  'last-sign-in': 'Recently signed in',
};

function isCustomerSort(value: string): value is CustomerSort {
  return value in SORT_LABELS;
}

interface Props {
  search: string;
  sort: CustomerSort;
  shownCount: number;
  optInCount: number;
  isFetching: boolean;
  onSearch: (search: string) => void;
  onSort: (sort: CustomerSort) => void;
  onRefresh: () => void;
  onExport: () => void;
  onExportMailingList: () => void;
}

export function CustomersToolbar(props: Props) {
  const { search, sort, shownCount, optInCount, isFetching } = props;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex-1 min-w-[14rem]">
        <AdminSearchBox
          value={search}
          placeholder="Search by name, email or phone"
          label="Search customers"
          onSearch={props.onSearch}
        />
      </div>
      <Select value={sort} onValueChange={(value) => isCustomerSort(value) && props.onSort(value)}>
        <SelectTrigger className="h-9 sm:w-48 text-xs" aria-label="Sort customers">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" disabled={isFetching} onClick={props.onRefresh}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </Button>
        {/* Exports what the search is showing, every page of it. */}
        <Button type="button" size="sm" variant="outline" disabled={shownCount === 0} onClick={props.onExport}>
          <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {search.trim() ? `Export ${shownCount} shown` : 'Export CSV'}
        </Button>
        {/* Opt-ins only, so nobody who said no lands in a mail tool. */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={optInCount === 0}
          onClick={props.onExportMailingList}
        >
          <Mail className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Mailing list
        </Button>
      </div>
    </div>
  );
}
