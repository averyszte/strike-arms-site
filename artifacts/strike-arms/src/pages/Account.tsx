import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Download, LogOut, Trash2 } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { SITE_URL } from '@/lib/site-config';

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Account() {
  const { user, signOut } = useAuth();
  const [, navigate] = useLocation();
  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <SiteLayout>
      <Helmet>
        <title>My account | Strike Arms Airsoft Dublin</title>
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={`${SITE_URL}/account`} />
      </Helmet>
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>

        <div className="mt-8 space-y-6">
          <ProfileSection />
          <PreferencesSection />
          <DataSection />
        </div>
      </div>
    </SiteLayout>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-border bg-card p-6">
      <h2 className="font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfileSection() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile({ fullName, phone });
    setSaving(false);
    toast(result.ok ? { title: 'Profile saved' } : { title: 'Could not save', description: result.error });
  };

  return (
    <Section title="Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-email">Email</Label>
          <Input id="acc-email" value={user?.email ?? ''} disabled />
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </form>
    </Section>
  );
}

function PreferencesSection() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    const result = await updateProfile({ marketingOptIn: checked });
    if (result.ok) {
      toast({ title: checked ? 'Subscribed to emails' : 'Unsubscribed' });
    }
  };

  return (
    <Section title="Email preferences" description="Manage marketing emails. You can opt out at any time.">
      <label className="flex items-start gap-2.5 text-sm text-foreground">
        <Checkbox
          checked={user?.marketingOptIn ?? false}
          onCheckedChange={(v) => handleToggle(v === true)}
          className="mt-0.5"
          aria-label="Marketing emails"
        />
        <span>Email me offers and airsoft news.</span>
      </label>
    </Section>
  );
}

function DataSection() {
  const { user, exportData, deleteAccount } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    const data = await exportData();
    if (data) downloadJson(data, `strike-arms-my-data-${user?.id}.json`);
  };

  const handleDelete = async () => {
    setBusy(true);
    await deleteAccount();
    toast({ title: 'Account deleted', description: 'Your personal data has been removed.' });
    navigate('/');
  };

  return (
    <Section
      title="Your data"
      description="Under GDPR you can download a copy of your data or delete your account at any time."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Download my data
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes your personal details and closes your account. Records we are legally
                required to keep (such as completed orders, for tax purposes) are retained in an
                anonymised form. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={busy}>
                {busy ? 'Deleting…' : 'Delete account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Section>
  );
}
