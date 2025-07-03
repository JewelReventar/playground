import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
  SendMessageCommandOutput,
} from '@aws-sdk/client-sqs'
import { logger } from '@lib/commons/powertools'
import { AWSSDKException } from '@lib/commons/exceptions'
import { ErrorResponseInterface } from '@lib/commons/_interfaces/handler'

class SQS {
  private readonly client: SQSClient

  constructor() {
    this.client = new SQSClient()
  }

  async sendMessage(
    queueUrl: string,
    messageBody: object,
    messageGroupId?: string,
    deduplicationId?: string,
  ): Promise<SendMessageCommandOutput | ErrorResponseInterface> {
    try {
      const input: SendMessageCommandInput = {
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(messageBody),
        ...(messageGroupId && { MessageGroupId: messageGroupId }),
        ...(deduplicationId && { MessageDeduplicationId: deduplicationId }),
      }

      const command = new SendMessageCommand(input)
      const response = await this.client.send(command)

      return response
    } catch (error) {
      logger.error('aws-sdk:sqs:sendMessage', error as Error)
      throw new AWSSDKException('@aws-sdk/client-sqs failed to send message.')
    }
  }
}

export default SQS
