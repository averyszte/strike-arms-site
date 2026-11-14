import { useMutation } from '@tanstack/react-query';
import { updatePassword } from '@/data/admin-auth-repository';

export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({ password, currentPassword }: { password: string; currentPassword?: string }) =>
      updatePassword(password, currentPassword),
  });
}
