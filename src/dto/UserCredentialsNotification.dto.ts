import { z } from 'zod';

export const userCredentialsNotificationSchema = z.object({
    userId: z.number().int().positive(),
    fullName: z.string().trim().min(1),
    email: z.string().trim().email(),
    temporaryPassword: z.string().min(1),
    loginUrl: z.string().url(),
});

export type UserCredentialsNotificationDto =
    z.infer<typeof userCredentialsNotificationSchema>;
