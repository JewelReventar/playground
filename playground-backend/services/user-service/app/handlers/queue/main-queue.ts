import middy from '@middy/core'
import { tracer, captureLambdaHandler, logger } from '@lib/commons/powertools'
import { SqsLambdaInterface, Context } from '@lib/commons/_interfaces/handler'
import UserController from '../../controllers/UserController'
import { UserInterface } from '@models/dynamodb/UserTable'
import { MainQueueConsumerInterface } from '../_interfaces/user'

const execute = async (event: SqsLambdaInterface, _context: Context): Promise<void> => {
  try {
    logger.info('_request:queue:event', {
      event,
    })

    for (const record of event.Records) {
      const body = JSON.parse(record.body) as MainQueueConsumerInterface<UserInterface>
      if (body.batch && Array.isArray(body.batch)) {
        const controller = new UserController()
        await controller.sendHappyBirthdayMessage(body.batch, body.currentYear)
      }
    }
  } catch (error) {
    logger.error('_response:queue:error', error as Error)
  }
}

export const handler = middy(execute).use(captureLambdaHandler(tracer))
