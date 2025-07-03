import { Model } from 'dynamoose/dist/Model'
import { Item } from 'dynamoose/dist/Item'
import { logger } from '@lib/commons/powertools'
import { DynamoDbException } from '@lib/commons/exceptions'
import { InputKey } from 'dynamoose/dist/General'
import { ErrorResponseInterface } from '@lib/commons/_interfaces/handler'
export class BaseRepository<T extends Item> {
  protected model: Model<T>
  constructor(model: Model<T>) {
    this.model = model
  }

  async create(item: T, overwrite: boolean = false): Promise<T | ErrorResponseInterface> {
    try {
      const record = await this.model.create(item, { overwrite })
      return record
    } catch (error) {
      logger.error('dynomoose:error', error as Error)
      throw new DynamoDbException(`@dynomoose:create failed to process request.`)
    }
  }

  async get(filters: InputKey): Promise<T | ErrorResponseInterface> {
    try {
      const record = await this.model.get(filters)

      return record
    } catch (error) {
      logger.error('dynomoose:error', error as Error)
      throw new DynamoDbException(`@dynomoose:get failed to process request.`)
    }
  }

  async update(key: InputKey, update: T): Promise<T | ErrorResponseInterface> {
    try {
      const record = await this.model.update(key, update)
      return record
    } catch (error) {
      logger.error('dynomoose:error', error as Error)
      throw new DynamoDbException(`@dynomoose:update failed to process request.`)
    }
  }

  async delete(key: InputKey): Promise<void | ErrorResponseInterface> {
    try {
      await this.model.delete(key)
    } catch (error) {
      logger.error('dynomoose:error', error as Error)
      throw new DynamoDbException(`@dynomoose:delete failed to process request.`)
    }
  }
}
