import { z } from 'zod';

const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  shippingAddress: AddressSchema,
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
