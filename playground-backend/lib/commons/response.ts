import {
  ExceptionInterface,
  ErrorResponseInterface,
  SuccessResponseInterface,
  SuccessBodyInterface,
  MayaSessionSuccessBodyInterface,
} from '@lib/commons/_interfaces/handler'

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export const successResponse = (
  payload: SuccessBodyInterface | MayaSessionSuccessBodyInterface,
  type: 'invocation' | 'https' | 'event' = 'https',
): SuccessResponseInterface => {
  const response: SuccessResponseInterface = {
    body: JSON.stringify(payload),
    statusCode: 200,
  }

  if (type === 'https') {
    response.headers = defaultHeaders
  }

  return response
}

export const errorResponse = (
  error: ExceptionInterface,
  type: 'invocation' | 'https' | 'event' = 'https',
): ErrorResponseInterface => {
  const response: ErrorResponseInterface = {
    body: JSON.stringify({
      exception: error.name,
      message: error.message,
    }),
    statusCode: type === 'invocation' ? 200 : error.statusCode,
  }

  if (type === 'https') {
    response.headers = defaultHeaders
  }

  return response
}
