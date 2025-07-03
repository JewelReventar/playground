import { APIGatewayProxyEvent, Context, SQSEvent, SQSRecord, ScheduledEvent } from 'aws-lambda'
import { Schema } from 'joi'

interface RequesterInterface {
  cognitoId: string
  name: string
  email: string
  phone_number: string
  role: string
}

interface HttpsLambdaInterface<T> extends APIGatewayProxyEvent {
  request: T
  requester?: RequesterInterface
}

interface SqsLambdaInterface extends SQSEvent {
  Records: SQSRecord[]
}

type LambdaEvent<T> = HttpsLambdaInterface<T>
interface LambdaInterface<T> {
  event: LambdaEvent<T>
  context: Context
}

interface SuccessBodyInterface {
  message: string
  data: JSON
}

interface SuccessResponseInterface {
  headers?: {
    'Content-Type': string
    'Access-Control-Allow-Origin': string
  }
  body: string
  statusCode: number
}

interface ExceptionInterface {
  name?: string
  message?: string
  statusCode: number
}

interface ErrorResponseInterface {
  headers?: {
    'Content-Type': string
    'Access-Control-Allow-Origin': string
  }
  body: string
  statusCode: number
}

interface MiddyInterface<T> {
  before: (handler: LambdaInterface<T>) => Promise<void | ErrorResponseInterface>
  after?: (handler: LambdaInterface<T>) => Promise<void | ErrorResponseInterface>
  onError?: (handler: LambdaInterface<T>) => Promise<void | ErrorResponseInterface>
}

export {
  // Default
  Context,
  Schema,
  ScheduledEvent,
  // Custom
  RequesterInterface,
  LambdaInterface,
  HttpsLambdaInterface,
  SqsLambdaInterface,
  MiddyInterface,
  SuccessBodyInterface,
  SuccessResponseInterface,
  ExceptionInterface,
  ErrorResponseInterface,
}
