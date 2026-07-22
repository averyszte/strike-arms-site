import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listOrders,
  updateOrderFulfillment,
  getOrder,
  listAllOrdersWithItems,
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
