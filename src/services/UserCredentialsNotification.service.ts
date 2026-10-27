import { NotificationType } from '../../generated/prisma/enums';
import { UserCredentialsNotificationDto } from '../dto/UserCredentialsNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import { NotificationExecutorPayload } from '../types/NotificationPayload.type';
import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';
import { deliverToChannels } from './channelDelivery.helper';

class UserCredentialsNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly notificationDeliveryRepository: NotificationDeliveryRepository
    ) {}

    async sendNotification(
        payload: UserCredentialsNotificationDto
    ): Promise<void> {
        const notification =
            await this.notificationRepository.findOrCreateNotification({
                candidateId: payload.userId,
                externalRef: `user-${payload.userId}`,
                notificationType: NotificationType.USER_CREDENTIALS,
                reminderNumber: 0,
            });

        await deliverToChannels({
            notificationId: notification.id,
            channels: [NotificationChannel.EMAIL],
            notificationDeliveryRepository: this.notificationDeliveryRepository,

            buildExecutorPayload: (): NotificationExecutorPayload => ({
                recipient: payload.email,
                candidateName: payload.fullName,
                subject: 'Your account has been created',
                templateKey: 'UserCredentials',
                emailParams: {
                    fullName: payload.fullName,
                    email: payload.email,
                    temporaryPassword: payload.temporaryPassword,
                    loginUrl: payload.loginUrl,
                },
            }),
        });
    }
}

export default UserCredentialsNotificationService;