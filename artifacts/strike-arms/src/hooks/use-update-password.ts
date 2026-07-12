import { useMutation } from '@tanstack/react-query';
import { updatePassword } from '@/data/auth-repository';

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (password: string) => updatePassword(password),
  });
}
