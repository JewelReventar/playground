import UserController from '../../app/controllers/UserController'
import {
  CreateUserInterface,
  DeleteUserInterface,
  InitiateHappyBirthdayInterface,
  UpdateUserInterface,
} from 'services/user-service/app/handlers/_interfaces/user'
import {
  AWSSDKException,
  DynamoDbException,
  HookbinIntegrationException,
  RequestValidationException,
  ResourceNotFoundException,
} from '@lib/commons/exceptions'
import { UserInterface } from '@databases/dynamodb/UserRepository'

jest.mock('@databases/dynamodb/UserRepository', () => {
  return jest.fn().mockImplementation(() => {
    return {
      create: jest.fn(async (_payload, _overwrite = false) => {
        if (_payload.firstName === 'Success User') {
          return _payload
        } else {
          throw new DynamoDbException()
        }
      }),
      delete: jest.fn(async (_filters) => {
        if (_filters.pk === 'app:user' && _filters.sk === 'valid-id-delete-error') {
          throw new DynamoDbException()
        }
      }),
      get: jest.fn(async (_filters) => {
        if (
          _filters.pk === 'app:user' &&
          ['valid-id', 'valid-id-delete-error', 'valid-id-update-error'].includes(_filters.sk)
        ) {
          return {
            pk: 'app:user',
            sk: _filters.sk,
            firstName: 'Valid User',
            lastName: 'Valid User',
            birthday: '2000-01-01',
            timezone: 'Asia/Manila',
          }
        } else if (_filters.pk === 'app:user' && _filters.sk === 'invalid-id') {
          throw new DynamoDbException()
        } else if (_filters.pk === 'app:user' && _filters.sk === 'not-found') {
          return null
        }

        return null
      }),
      update: jest.fn(async (_key, _payload) => {
        if (_key.pk === 'app:user' && _key.sk === 'valid-id') {
          return {
            ..._key,
            ..._payload,
          }
        } else if (_key.pk === 'app:user' && _key.sk === 'valid-id-update-error') {
          throw new DynamoDbException()
        }
      }),
      queryByBirthMonthDay: jest.fn(async (_birthMonthDay) => {
        if (_birthMonthDay === '01-01') {
          return [
            {
              pk: 'app:user',
              sk: 'valid-id-1',
              firstName: 'Celebrant 1',
              lastName: 'Celebrant 1',
              birthday: '2000-01-01',
              timezone: 'Asia/Manila',
            },
            {
              pk: 'app:user',
              sk: 'valid-id-2',
              firstName: 'Celebrant 2',
              lastName: 'Celebrant 2',
              birthday: '2005-01-01',
              timezone: 'Asia/Manila',
            },
            {
              pk: 'app:user',
              sk: 'valid-id-3',
              firstName: 'Celebrant 3',
              lastName: 'Celebrant 3',
              birthday: '2010-01-01',
              timezone: 'Asia/Manila',
            },
          ]
        }
        if (_birthMonthDay === '09-09') {
          return [
            {
              pk: 'app:user',
              sk: 'valid-id-4',
              firstName: 'Celebrant 4',
              lastName: 'Celebrant 4',
              birthday: '2003-09-09',
              timezone: 'Australia/Melbourne',
            },
            {
              pk: 'app:user',
              sk: 'valid-id-5',
              firstName: 'Celebrant 5',
              lastName: 'Celebrant 5',
              birthday: '2006-01-01',
              timezone: 'Australia/Melbourne',
            },
            {
              pk: 'app:user',
              sk: 'valid-id-6',
              firstName: 'Celebrant 6',
              lastName: 'Celebrant 6',
              birthday: '2009-01-01',
              timezone: 'Australia/Melbourne',
            },
          ]
        }
        if (_birthMonthDay === '12-12') {
          throw new DynamoDbException()
        }

        return []
      }),
    }
  })
})

jest.mock('@databases/dynamodb/MessageLogRepository', () => {
  return jest.fn().mockImplementation(() => {
    return {
      create: jest.fn(async (_payload, _overwrite = false) => {
        if (
          ['app:message:birthday:invalid-id-6'].includes(_payload.pk) &&
          ['2019'].includes(_payload.sk)
        ) {
          throw new DynamoDbException()
        }
      }),
      get: jest.fn(async (_filters) => {
        if (
          ['app:message:birthday:invalid-id-2'].includes(_filters.pk) &&
          ['2018'].includes(_filters.sk)
        ) {
          return {
            pk: _filters.pk,
            sk: _filters.sk,
            message: 'Test message',
            status: 'success',
            createdAt: '2023-01-01T00:00:00Z',
          }
        }
        if (
          ['app:message:birthday:invalid-id-5'].includes(_filters.pk) &&
          ['2019'].includes(_filters.sk)
        ) {
          throw new DynamoDbException()
        }

        return null
      }),
    }
  })
})

jest.mock('@providers/aws/sqs', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendMessage: jest.fn(
        async (
          _queueUrl: string,
          _messageBody: object,
          _messageGroupId?: string,
          _deduplicationId?: string,
        ) => {
          const message = _messageBody as {
            batch: Array<UserInterface>
            currentYear: string
            queuedAt: string
          }
          if (message.currentYear === '2015') {
            throw new AWSSDKException()
          }
        },
      ),
    }
  })
})

jest.mock('@providers/external/hookbin', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendMessage: jest.fn(async (_payload) => {
        if (
          _payload.message ===
          `Hey, Celebrant 4 Celebrant 4 it's your birthday today! Have a great day!`
        ) {
          throw new HookbinIntegrationException()
        }
      }),
    }
  })
})

describe('UserController:create', () => {
  let controller: UserController
  beforeEach(() => {
    controller = new UserController()
  })
  it('Should return create user and complete request.', async () => {
    const request: CreateUserInterface = {
      firstName: 'Success User',
      lastName: 'Success User',
      birthday: '2000-01-01',
      timezone: 'Asia/Manila',
    }
    await controller.create(request)
  })
  it('Should throw DynamoDbException on userRepository.create method', async () => {
    const request: CreateUserInterface = {
      firstName: 'Failed User',
      lastName: 'Failed User',
      birthday: '2000-01-01',
      timezone: 'Asia/Manila',
    }

    await expect(controller.create(request)).rejects.toThrow(DynamoDbException)
  })
})

describe('UserController:delete', () => {
  let controller: UserController
  beforeEach(() => {
    controller = new UserController()
  })
  it('Should delete user.', async () => {
    const request: DeleteUserInterface = {
      id: 'valid-id',
    }
    await controller.delete(request)
  })
  it('Should throw DynamoDbException on userRepository.get method.', async () => {
    const request: DeleteUserInterface = {
      id: 'invalid-id',
    }
    await expect(controller.delete(request)).rejects.toThrow(DynamoDbException)
  })
  it('Should throw DynamoDbException on userRepository.delete method.', async () => {
    const request: DeleteUserInterface = {
      id: 'valid-id-delete-error',
    }
    await expect(controller.delete(request)).rejects.toThrow(DynamoDbException)
  })
  it('Should throw ResourceNotFoundException on userRepository.get method.', async () => {
    const request: DeleteUserInterface = {
      id: 'not-found',
    }
    await expect(controller.delete(request)).rejects.toThrow(ResourceNotFoundException)
  })
})

describe('UserController:update', () => {
  let controller: UserController
  beforeEach(() => {
    controller = new UserController()
  })
  it('Should update user and complete request.', async () => {
    const request: UpdateUserInterface = {
      id: 'valid-id',
      firstName: 'Success Updated User',
    }
    await controller.update(request)
  })
  it('Should throw DynamoDbException on userRepository.get method.', async () => {
    const request: UpdateUserInterface = {
      id: 'invalid-id',
      firstName: 'Failed Updated User',
    }
    await expect(controller.update(request)).rejects.toThrow(DynamoDbException)
  })
  it('Should throw DynamoDbException on userRepository.update method.', async () => {
    const request: UpdateUserInterface = {
      id: 'valid-id-update-error',
      firstName: 'Failed Updated User',
    }
    await expect(controller.update(request)).rejects.toThrow(DynamoDbException)
  })
  it('Should throw ResourceNotFoundException on userRepository.get method.', async () => {
    const request: UpdateUserInterface = {
      id: 'not-found',
      firstName: 'Failed Updated User',
    }
    await expect(controller.update(request)).rejects.toThrow(ResourceNotFoundException)
  })
  it('Should throw RequestValidationException.', async () => {
    const request: UpdateUserInterface = {
      id: 'valid-id',
    }
    await expect(controller.update(request)).rejects.toThrow(RequestValidationException)
  })
})

describe('UserController:initiateHappyBirthday', () => {
  let controller: UserController
  beforeEach(() => {
    controller = new UserController()
  })
  it('Should initiate without request payload and complete request', async () => {
    await controller.initiateHappyBirthday()
  })
  it('Should initiate with request payload for Asia/Manila and complete request', async () => {
    const request: InitiateHappyBirthdayInterface = {
      utcBirthDate: '2017-01-01 01:00:00',
    }
    await controller.initiateHappyBirthday(request)
  })
  it('Should initiate with request payload for Asia/Manila and throw AWSSDKException.', async () => {
    const request: InitiateHappyBirthdayInterface = {
      utcBirthDate: '2015-01-01 01:00:00',
    }
    await expect(controller.initiateHappyBirthday(request)).rejects.toThrow(AWSSDKException)
  })
  it('Should initiate with request payload for Australia/Melbourne and complete request.', async () => {
    const request: InitiateHappyBirthdayInterface = {
      utcBirthDate: '2000-09-09 23:00:00',
    }
    await controller.initiateHappyBirthday(request)
  })
  it('Should initiate with request payload for Australia/Melbourne and throw AWSSDKException.', async () => {
    const request: InitiateHappyBirthdayInterface = {
      utcBirthDate: '2015-09-09 23:00:00',
    }
    await expect(controller.initiateHappyBirthday(request)).rejects.toThrow(AWSSDKException)
  })
  it('Should initiate with request payload and throw DynamoDbException on userRepository.queryByBirthMonth.', async () => {
    const request: InitiateHappyBirthdayInterface = {
      utcBirthDate: '2015-12-12 23:00:00',
    }
    await expect(controller.initiateHappyBirthday(request)).rejects.toThrow(DynamoDbException)
  })
})

describe('UserController:sendHappyBirthdayMessage', () => {
  let controller: UserController
  beforeEach(() => {
    controller = new UserController()
  })
  it('Should send message with hookbin and complete request', async () => {
    const celebrants: Array<UserInterface> = [
      {
        pk: 'app:user',
        sk: 'valid-id-1',
        firstName: 'Celebrant 1',
        lastName: 'Celebrant 1',
        birthday: '2000-01-01',
        timezone: 'Asia/Manila',
      },
      {
        pk: 'app:user',
        sk: 'valid-id-2',
        firstName: 'Celebrant 2',
        lastName: 'Celebrant 2',
        birthday: '2005-01-01',
        timezone: 'Asia/Manila',
      },
      {
        pk: 'app:user',
        sk: 'valid-id-3',
        firstName: 'Celebrant 3',
        lastName: 'Celebrant 3',
        birthday: '2010-01-01',
        timezone: 'Asia/Manila',
      },
    ]
    const currentYear: string = '2017'
    await controller.sendHappyBirthdayMessage(celebrants, currentYear)
  })

  it('Should filter out users that has already received a message.', async () => {
    const celebrants: Array<UserInterface> = [
      {
        pk: 'app:user',
        sk: 'invalid-id-2',
        firstName: 'Celebrant 2',
        lastName: 'Celebrant 2',
        birthday: '2005-01-01',
        timezone: 'Asia/Manila',
      },
    ]
    const currentYear: string = '2018'
    await controller.sendHappyBirthdayMessage(celebrants, currentYear)
  })

  it('Should raise HookbinIntegrationException and log error but still complete request', async () => {
    const celebrants: Array<UserInterface> = [
      {
        pk: 'app:user',
        sk: 'invalid-id-4',
        firstName: 'Celebrant 4',
        lastName: 'Celebrant 4',
        birthday: '2005-01-01',
        timezone: 'Asia/Manila',
      },
    ]
    const currentYear: string = '2019'
    await controller.sendHappyBirthdayMessage(celebrants, currentYear)
  })

  it('Should raise DynamoDbException on messageLogRepository.get method and log request but still complete request', async () => {
    const celebrants: Array<UserInterface> = [
      {
        pk: 'app:user',
        sk: 'invalid-id-5',
        firstName: 'Celebrant 5',
        lastName: 'Celebrant 5',
        birthday: '2005-01-01',
        timezone: 'Asia/Manila',
      },
    ]
    const currentYear: string = '2019'
    await controller.sendHappyBirthdayMessage(celebrants, currentYear)
  })
  it('Should throw DynamoDbException on messageLogRepository.create method', async () => {
    const celebrants: Array<UserInterface> = [
      {
        pk: 'app:user',
        sk: 'invalid-id-6',
        firstName: 'Celebrant 6',
        lastName: 'Celebrant 6',
        birthday: '2005-01-01',
        timezone: 'Asia/Manila',
      },
    ]
    const currentYear: string = '2019'
    await expect(controller.sendHappyBirthdayMessage(celebrants, currentYear)).rejects.toThrow(
      DynamoDbException,
    )
  })
})
