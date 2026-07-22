import { useMutation } from '@tanstack/react-query';
import { updatePassword } from '@/data/admin-auth-repository';

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (password: string) => updatePassword(password),
  });
}
