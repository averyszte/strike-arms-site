import { useState } from 'react';
import { Redirect } from 'wouter';
import { AdminAuthScreen } from '@/components/admin/AdminAuthScreen';
import { AdminSignInForm } from '@/components/admin/AdminSignInForm';
import { ForgotPasswordPanel } from '@/components/admin/ForgotPasswordPanel';
import { useAdminAuth } from '@/lib/admin-auth-context';

export default function LoginPage() {
  const { user, isAdmin, isLoading } = useAdminAuth();
  const [view, setView] = useState<'sign-in' | 'forgot'>('sign-in');
  const [email, setEmail] = useState('');

  if (!isLoading && user && isAdmin) return <Redirect to="/admin" />;

  if (view === 'forgot') {
    return (
      <AdminAuthScreen pageTitle="Reset password" heading="Reset password">
        <ForgotPasswordPanel initialEmail={email} onBack={() => setView('sign-in')} />
      </AdminAuthScreen>
    );
  }

  return (
    <AdminAuthScreen pageTitle="Login" heading="Admin" intro="Strike Arms management portal">
      <AdminSignInForm email={email} onEmailChange={setEmail} onForgot={() => setView('forgot')} />
    </AdminAuthScreen>
  );
}
