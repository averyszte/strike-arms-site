import { useState } from 'react';
import type { ElementType } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  MessageSquare,
  Users,
  LogOut,
  KeyRound,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAdminAuth } from '@/hooks/use-admin-auth';

type NavItem = { label: string; href: string; icon: ElementType };
type NavGroupDef = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroupDef[] = [
  {
    label: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
      { label: 'Customers', href: '/admin/customers', icon: Users },
    ],
  },
];

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const [location] = useLocation();
  const active = location.startsWith(item.href);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-accent/10 text-accent'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {item.label}
    </Link>
  );
}

// Open by default: closing every group on each page meant reopening Sales
// to get to Orders every time. They can still be folded away by hand.
function NavGroup({ group, onNavigate }: { group: NavGroupDef; onNavigate?: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors">
        {group.label}
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pb-1">
        {group.items.map(item => (
          <NavLink key={item.href} item={item} onClick={onNavigate} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface Props {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: Props) {
  const [location] = useLocation();
  const { user, signOut } = useAdminAuth();
  const email = user?.email ?? '';
  const initial = email[0]?.toUpperCase() ?? 'A';

  return (
    <div className="flex flex-col h-full select-none">
      <div className="px-5 py-4 border-b border-border shrink-0">
        <p className="font-bold text-sm tracking-widest uppercase text-foreground">Strike Arms</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">Admin</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-3">
        <Link
          href="/admin"
          onClick={onNavigate}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location === '/admin'
              ? 'bg-accent/10 text-accent'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard
        </Link>

        {NAV_GROUPS.map(group => (
          <NavGroup key={group.label} group={group} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3 shrink-0 space-y-0.5">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0">
            {initial}
          </div>
          <p className="text-xs text-muted-foreground truncate flex-1">{email}</p>
        </div>
        <Link
          href="/admin/settings"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
          Settings
        </Link>
        <Link
          href="/admin/change-password"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5 shrink-0" />
          Change password
        </Link>
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}
