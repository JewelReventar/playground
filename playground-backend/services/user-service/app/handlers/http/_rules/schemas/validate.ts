import {
  LambdaInterface,
  MiddyInterface,
  Schema,
  ExceptionInterface,
  ErrorResponseInterface,
  HttpsLambdaInterface,
} from '@lib/commons/_interfaces/handler'
import { RequestValidationException } from '@lib/commons/exceptions'
import { logger } from '@lib/commons/powertools'
import { errorResponse } from '@lib/commons/response'

export default <T>(schema: Schema): MiddyInterface<T> => ({
  before: async (handler: LambdaInterface<T>): Promise<void | ErrorResponseInterface> => {
    const event = handler.event as HttpsLambdaInterface<T>
    let request = {}

    try {
      if (event.body) {
        request = JSON.parse(event.body)
      }

      if (event.queryStringParameters) {
        request = {
          ...request,
          ...event.queryStringParameters,
        }
      }

      if (event.pathParameters) {
        request = {
          ...request,
          ...event.pathParameters,
        }
      }

      const { error, value } = schema.validate(request)

      if (error) {
        throw new RequestValidationException(error.message.replaceAll('"', ''))
      }

      logger.info('validate:joi-request', {
        valid: true,
      })

      // Set request value
      handler.event.request = value
    } catch (error) {
      logger.error('validate:joi-exception', {
        error,
      })

      return errorResponse(error as ExceptionInterface)
    }
  },
  // Uncomment if sequence are needed
  // after: async (handler: LambdaInterface<T>): Promise<void | ErrorResponseInterface> => {
  // },
  // onError: async (handler: LambdaInterface<T>): Promise<void | ErrorResponseInterface> => {
  // },
})
