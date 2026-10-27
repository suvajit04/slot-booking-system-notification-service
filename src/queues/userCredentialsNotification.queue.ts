import { Queue } from 'bullmq';

import { bullMqConnection } from '../configs/bullMq.config';
import { defaultJobOptions } from '../configs/queueOptions.config';
import { USER_CREDENTIALS_NOTIFICATION_QUEUE } from '../constants';
import { UserCredentialsNotificationDto } from '../dto/UserCredentialsNotification.dto';

const userCredentialsNotificationQueue =
    new Queue<UserCredentialsNotificationDto>(
        USER_CREDENTIALS_NOTIFICATION_QUEUE,
        {
            connection: bullMqConnection,
            defaultJobOptions,
        }
    );

export default userCredentialsNotificationQueue;