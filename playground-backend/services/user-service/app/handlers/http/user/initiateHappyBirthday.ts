import middy from '@middy/core'
import { captureLambdaHandler, logger, tracer } from '@lib/commons/powertools'
// INTERFACES
import { InitiateHappyBirthdayInterface } from '../../_interfaces/user'
import {
  HttpsLambdaInterface,
  Context,
  SuccessResponseInterface,
  ExceptionInterface,
  ErrorResponseInterface,
  SuccessBodyInterface,
} from '@lib/commons/_interfaces/handler'
import { errorResponse, successResponse } from '@lib/commons/response'
// SCHEMA RULES
import { initiateHappyBirthdaySchema as schema } from '../_rules/schemas/user'
import schemaValidator from '../_rules/schemas/validate'
// CONTROLLERS
import UserController from '../../../controllers/UserController'

const execute = async (
  event: HttpsLambdaInterface<InitiateHappyBirthdayInterface>,
  _context: Context,
): Promise<SuccessResponseInterface | ErrorResponseInterface> => {
  try {
    logger.info('_request:https', {
      parsedEvent: {
        request: event.request,
      },
    })

    const controller = new UserController()
    await controller.initiateHappyBirthday(event.request)

    return successResponse({
      message: 'Successfully sent birthday messages.',
    } as unknown as SuccessBodyInterface)
  } catch (error) {
    logger.error('_response:https:error', error as Error)
    return errorResponse(error as ExceptionInterface)
  }
}

export const handler = middy(execute)
  .use(captureLambdaHandler(tracer))
  .use(schemaValidator<InitiateHappyBirthdayInterface>(schema))
