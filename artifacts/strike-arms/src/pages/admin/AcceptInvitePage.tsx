// Supabase redirect URL setup required:

// Dashboard → Authentication → URL Configuration → Redirect URLs

// Add: http://localhost:5173/auth/confirm  (dev)

// Add: https://<your-pages-domain>/auth/confirm  (production)



import { useState } from 'react';

import type { FormEvent } from 'react';

import { useLocation } from 'wouter';

import { Helmet } from 'react-helmet-async';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { useInviteVerification } from '@/hooks/use-invite-verification';
import { useUpdatePassword } from '@/hooks/use-update-password';





function readTokenHash(): string | null {

  return new URLSearchParams(window.location.search).get('token_hash');

}



export default function AcceptInvitePage() {

  const [, navigate] = useLocation();

  const verification = useInviteVerification(readTokenHash());
  const [password, setPassword] = useState('');

  const [confirm, setConfirm] = useState('');

  const [validationError, setValidationError] = useState('');

  const [submitError, setSubmitError] = useState('');

  const updatePassword = useUpdatePassword();


  async function handleSubmit(e: FormEvent) {

    e.preventDefault();

    setValidationError('');

    setSubmitError('');



    if (password.length < 8) {

      setValidationError('Password must be at least 8 characters');

      return;

    }

    if (password !== confirm) {

      setValidationError('Passwords do not match');

      return;

    }



    try {
      await updatePassword.mutateAsync(password);
      navigate('/admin');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to set password');
    }
  }



  return (

    <>

      <Helmet>

        <title>Accept Invite | Strike Arms Admin</title>

      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-4">

        <div className="w-full max-w-[360px]">

          <h1 className="text-2xl font-bold text-foreground mb-1">Set your password</h1>

          <p className="text-sm text-muted-foreground mb-7">Complete your account setup.</p>



          {verification.state === 'verifying' && (

            <div className="flex items-center gap-3 text-muted-foreground text-sm">

              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent shrink-0" />

              Verifying invite link...

            </div>

          )}



          {verification.state === 'error' && (

            <div className="space-y-4">

              <p className="text-sm text-destructive">{verification.message}</p>

              <a

                href="/admin/login"

                className="text-sm text-accent underline underline-offset-4"

              >

                Return to login

              </a>

            </div>

          )}



          {verification.state === 'set-password' && (

            <form onSubmit={e => void handleSubmit(e)} className="space-y-4">

              <div className="space-y-1.5">

                <Label htmlFor="new-password">New Password</Label>

                <Input

                  id="new-password"

                  type="password"

                  value={password}

                  onChange={e => setPassword(e.target.value)}

                  autoComplete="new-password"

                  required

                  minLength={8}

                />

              </div>

              <div className="space-y-1.5">

                <Label htmlFor="confirm-password">Confirm Password</Label>

                <Input

                  id="confirm-password"

                  type="password"

                  value={confirm}

                  onChange={e => setConfirm(e.target.value)}

                  autoComplete="new-password"

                  required

                  minLength={8}

                />

              </div>



              {validationError && (

                <p className="text-sm text-destructive">{validationError}</p>

              )}

              {submitError && (

                <p className="text-sm text-destructive">{submitError}</p>

              )}



              <Button type="submit" className="w-full" disabled={updatePassword.isPending}>

                {updatePassword.isPending ? 'Setting password...' : 'Set Password'}

              </Button>

            </form>

          )}

        </div>

      </div>

    </>

  );

}

