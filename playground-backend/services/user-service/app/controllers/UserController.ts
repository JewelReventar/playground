import { v4 as uuidv4 } from 'uuid'
import { logger } from '@lib/commons/powertools'
import {
  convertUTCToTimezone,
  formatUTCDate,
  getCurrentDateTime,
  getCurrentUTCHourDateTime,
} from '@lib/helpers/dayjs'
import { chunkArray } from '@lib/helpers/parser'
import UserRepository, {
  UserInterface,
  UserTableDocumentInterface,
} from '@databases/dynamodb/UserRepository'
import MessageLogRepository, { MessageLogInterface } from '@databases/dynamodb/MessageLogRepository'
import {
  CreateUserInterface,
  DeleteUserInterface,
  InitiateHappyBirthdayInterface,
  UpdateUserInterface,
} from '../handlers/_interfaces/user'
import { RequestValidationException, ResourceNotFoundException } from '@lib/commons/exceptions'
import SQS from '@providers/aws/sqs'
import Hookbin, { HookbinSendMessageInterface } from '@providers/external/hookbin'

export default class UserController {
  private readonly userRepository: UserRepository
  private readonly messageLogRepository: MessageLogRepository
  private readonly sqs: SQS
  private readonly hookbin: Hookbin
  constructor() {
    this.userRepository = new UserRepository()
    this.messageLogRepository = new MessageLogRepository()
    this.sqs = new SQS()
    this.hookbin = new Hookbin()
  }

  async create(request: CreateUserInterface): Promise<UserInterface | Error> {
    logger.info('UserController:create:executed', {
      request,
      datetime: getCurrentDateTime(),
    })
    const id = uuidv4()

    const user = (await this.userRepository.create(
      {
        pk: 'app:user',
        sk: id,
        firstName: request.firstName,
        lastName: request.lastName,
        birthday: request.birthday,
        timezone: request.timezone,
        createdAt: getCurrentDateTime(),
      } as UserTableDocumentInterface,
      true,
    )) as UserInterface

    return user
  }

  async delete(request: DeleteUserInterface): Promise<void | Error> {
    logger.info('UserController:delete:executed')

    const user = (await this.userRepository.get({
      pk: 'app:user',
      sk: request.id,
    })) as UserInterface

    if (!user) {
      throw new ResourceNotFoundException()
    }

    await this.userRepository.delete({
      pk: 'app:user',
      sk: request.id,
    })
  }

  async update(request: UpdateUserInterface): Promise<UserInterface | Error> {
    logger.info('UserController:update:executed')

    const { id, ...details } = request

    if (Object.keys(details).length === 0) {
      throw new RequestValidationException('Please provide valid details to update user.')
    }

    const user = (await this.userRepository.get({
      pk: 'app:user',
      sk: request.id,
    })) as UserInterface

    if (!user) {
      throw new ResourceNotFoundException()
    }

    const updatedUser = (await this.userRepository.update(
      {
        pk: 'app:user',
        sk: id,
      },
      {
        ...details,
        updatedAt: getCurrentDateTime(),
      } as UserTableDocumentInterface,
    )) as UserInterface

    return updatedUser
  }

  async initiateHappyBirthday(
    request: InitiateHappyBirthdayInterface | null = null,
  ): Promise<void | Error> {
    logger.info('UserController:initiateHappyBirthday:executed')
    const currentUTCHourDateTime = getCurrentUTCHourDateTime(request?.utcBirthDate ?? null)
    const birthMonthDay = formatUTCDate(request?.utcBirthDate ?? null, 'MM-DD')
    const currentYear = formatUTCDate(request?.utcBirthDate ?? null, 'YYYY')

    logger.info('UTC Values', {
      currentUTCHourDateTime,
      birthMonthDay,
      currentYear,
    })

    const celebrants = (await this.userRepository.queryByBirthMonthDay(
      birthMonthDay,
    )) as UserInterface[]
    logger.info('Celebrants', {
      celebrants,
    })

    const filteredCelebrants = celebrants.filter((user: UserInterface) => {
      const localTime = convertUTCToTimezone(currentUTCHourDateTime, user.timezone)
      return localTime.hour() === 9
    })

    const celebrantsBatch = chunkArray(filteredCelebrants, 5)

    for (const batch of celebrantsBatch) {
      logger.info('Batched Filtered Celebrants', {
        batch,
      })
      await this.sqs.sendMessage(process.env['SQS_MAIN_QUEUE_URL'] ?? '', {
        batch,
        currentYear,
        queuedAt: getCurrentDateTime(),
      })
    }
  }

  async sendHappyBirthdayMessage(
    celebrants: UserInterface[],
    currentYear: string,
  ): Promise<void | Error> {
    logger.info('UserController:sendHappyBirthdayMessage:executed')
    for (const celebrant of celebrants) {
      let status = 'success'
      const message = `Hey, ${celebrant.firstName} ${celebrant.lastName} it's your birthday today! Have a great day!`

      try {
        const existingMessage = (await this.messageLogRepository.get({
          pk: `app:message:birthday:${celebrant.sk}`,
          sk: currentYear,
        })) as MessageLogInterface

        if (existingMessage && existingMessage.status === 'success') {
          logger.warn(`Already sent message for this year ${currentYear} UUID: ${celebrant.sk}`, {
            celebrant,
          })
          continue
        }

        await this.hookbin.sendMessage({
          message,
          sentAt: getCurrentDateTime(),
        } as HookbinSendMessageInterface)
      } catch (error) {
        status = 'failed'
        logger.error(`Failed to send message to ${celebrant.sk}`, {
          celebrant,
          error: error as Error,
        })
      }

      await this.messageLogRepository.create(
        {
          pk: `app:message:birthday:${celebrant.sk}`,
          sk: currentYear,
          message,
          status,
          sentAt: getCurrentDateTime(),
        } as MessageLogInterface,
        true,
      )
    }
  }
}
