import { UnrecoverableError, Worker } from 'bullmq';

import { bullMqConnection } from '../configs/bullMq.config';
import logger from '../configs/logger.config';
import { workerRetentionOptions } from '../configs/queueOptions.config';
import {
    USER_CREDENTIALS_NOTIFICATION_PAYLOAD,
    USER_CREDENTIALS_NOTIFICATION_QUEUE,
} from '../constants';
import {
    UserCredentialsNotificationDto,
    userCredentialsNotificationSchema,
} from '../dto/UserCredentialsNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import UserCredentialsNotificationService from '../services/UserCredentialsNotification.service';

export function setupUserCredentialsNotificationProcessor() {
    const userCredentialsProcessor = new Worker<UserCredentialsNotificationDto>(
        USER_CREDENTIALS_NOTIFICATION_QUEUE,
        async (job) => {
            if (job.name !== USER_CREDENTIALS_NOTIFICATION_PAYLOAD) {
                throw new UnrecoverableError('Invalid user credentials notification job name');
            }

            const parsed = userCredentialsNotificationSchema.safeParse(job.data);

            if (!parsed.success) {
                const reasons = parsed.error.issues
                    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                    .join('; ');

                throw new UnrecoverableError(
                    `Invalid user credentials notification payload: ${reasons}`,
                );
            }

            const service = new UserCredentialsNotificationService(
                new NotificationRepository(),
                new NotificationDeliveryRepository(),
            );

            await service.sendNotification(parsed.data);
        },
        {
            connection: bullMqConnection,
            concurrency: 5,
            ...workerRetentionOptions,
        },
    );

    userCredentialsProcessor.on('completed', (job) => {
        logger.info('User credentials notification job completed', {
            jobId: job.id,
            jobName: job.name,
        });
    });

    userCredentialsProcessor.on('failed', (job, error) => {
        logger.error('User credentials notification job failed', {
            jobId: job?.id,
            jobName: job?.name,
            error: error.message,
        });
    });

    logger.info('User credentials notification processor setup completed');
}