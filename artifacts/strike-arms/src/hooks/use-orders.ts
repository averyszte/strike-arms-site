import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listOrders,
  updateOrderFulfillment,
  getOrder,
  listAllOrdersWithItems,
  setOrderArchived,
} from '@/data/orders-repository';
import type { FulfillmentStatus, OrderListFilters } from '@/types/order';

export function useOrders(filters: OrderListFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => listOrders(filters),
  });
}

export function useAllOrdersWithItems() {
  return useQuery({
    queryKey: ['admin', 'orders', 'all-with-items'],
    queryFn: listAllOrdersWithItems,
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => (id ? getOrder(id) : null),
    enabled: !!id,
  });
}

export function useUpdateFulfillmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: FulfillmentStatus }) =>
      updateOrderFulfillment(orderId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'order'] });
    },
  });
}

/**
 * Archives an order or brings it back.
 *
 * Invalidates the whole orders key rather than one view: the row has to leave
 * the list it is in and appear in the other one, and the dashboard counts it
 * either way.
 */
export function useSetOrderArchived() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, isArchived }: { orderId: string; isArchived: boolean }) =>
      setOrderArchived(orderId, isArchived),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'order'] });
    },
  });
}
