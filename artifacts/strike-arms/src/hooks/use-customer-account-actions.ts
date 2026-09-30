import { useMutation } from '@tanstack/react-query';

import {
  deleteCustomerAccount,
  fetchCustomerProfile,
  fetchMyOrders,
} from '@/data/customer-account-repository';
import {
  requestEmailChange,
  signInCustomer,
  signOutCustomer,
  updateCustomerPassword,
} from '@/data/customer-auth-repository';
import { useJsonDownload } from '@/hooks/use-json-download';
import type { CustomerDataExport } from '@/types/customer-account';

type PasswordChange = { email: string; currentPassword: string; newPassword: string };

type AccountOwner = { id: string; email: string };

/**
 * The account-level actions on /account/details. Changing the password asks
 * for the current one first, so a session left open on a shared computer
 * cannot be used to lock the owner out.
 */
export function useCustomerAccountActions(owner: AccountOwner | null) {
  const download = useJsonDownload();

  const changePassword = useMutation({
    mutationFn: async ({ email, currentPassword, newPassword }: PasswordChange) => {
      try {
        await signInCustomer(email, currentPassword);
      } catch {
        throw new Error('Your current password is not right.');
      }
      await updateCustomerPassword(newPassword);
    },
  });

  const changeEmail = useMutation({
    mutationFn: (email: string) => requestEmailChange(email),
  });

  const deleteAccount = useMutation({
    mutationFn: (password: string) => deleteCustomerAccount(password),
  });

  const signOut = useMutation({ mutationFn: signOutCustomer });

  const exportData = useMutation({
    mutationFn: async () => {
      if (!owner) throw new Error('Sign in to download your data.');
      const [profile, orders] = await Promise.all([fetchCustomerProfile(owner.id), fetchMyOrders()]);
      const data: CustomerDataExport = {
        exportedAt: new Date().toISOString(),
        email: owner.email,
        profile,
        orders,
      };
      download(data, 'strike-arms-account.json');
    },
  });

  return { changePassword, changeEmail, deleteAccount, signOut, exportData };
}
