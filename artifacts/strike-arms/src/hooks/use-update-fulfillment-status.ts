import { useMutation } from '@tanstack/react-query';

import { recordOrderIdCheck, updateOrderFulfillment } from '@/data/orders-repository';
import { useInvalidateOrders } from '@/hooks/use-invalidate-orders';
import type { FulfillmentStatus } from '@/types/order';

type UpdateInput = {
  orderId: string;
  status: FulfillmentStatus;
  /** Staff confirmed photo ID on handover (N-084); recorded after the move. */
  isIdChecked?: boolean;
};

/**
 * What happened to the ID check, when one was asked for. The status move is
 * the part that matters on the shop floor, so it goes first; a check that then
 * fails to record is reported, not allowed to undo a handover that happened.
 */
export type UpdateFulfillmentResult = { idCheckError: unknown };

async function updateFulfillment({
  orderId,
  status,
  isIdChecked,
}: UpdateInput): Promise<UpdateFulfillmentResult> {
  await updateOrderFulfillment(orderId, status);
  if (!isIdChecked) return { idCheckError: null };
  try {
    await recordOrderIdCheck(orderId);
    return { idCheckError: null };
  } catch (error) {
    return { idCheckError: error };
  }
}

export function useUpdateFulfillmentStatus() {
  const invalidate = useInvalidateOrders();
  return useMutation({ mutationFn: updateFulfillment, onSuccess: invalidate });
}
