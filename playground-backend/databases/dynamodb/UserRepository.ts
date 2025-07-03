import { BaseRepository } from './_base'
import UserTable, { UserInterface, UserTableDocumentInterface } from '@models/dynamodb/UserTable'
import { logger } from '@lib/commons/powertools'
import { DynamoDbException } from '@lib/commons/exceptions'
export default class UserRepository extends BaseRepository<UserTableDocumentInterface> {
  constructor() {
    super(UserTable)
  }

  async queryByBirthMonthDay(birthMonthDay: string): Promise<UserInterface[] | Error> {
    try {
      const results = await this.model
        .query('pk')
        .eq('app:user')
        .filter('birthday')
        .contains(`-${birthMonthDay}`)
        .exec()

      return results
    } catch (error) {
      logger.error('dynamoose:error', error as Error)
      throw new DynamoDbException(`@dynamoose:queryByBirthMonthDay failed to process request.`)
    }
  }
}

export { UserInterface, UserTableDocumentInterface }
