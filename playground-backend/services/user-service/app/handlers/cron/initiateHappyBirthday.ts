import middy from '@middy/core'
import { captureLambdaHandler, logger, tracer } from '@lib/commons/powertools'
import { Context, ScheduledEvent } from '@lib/commons/_interfaces/handler'
import UserController from '../../controllers/UserController'

const execute = async (_event: ScheduledEvent, _context: Context): Promise<void> => {
  try {
    logger.info('_request:cron:initiated')

    const controller = new UserController()
    await controller.initiateHappyBirthday()
  } catch (error) {
    logger.error('_response:cron:error', error as Error)
  }
}

export const handler = middy(execute).use(captureLambdaHandler(tracer))
