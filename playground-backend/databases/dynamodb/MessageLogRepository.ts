import { BaseRepository } from './_base'
import MessageLogTable, {
  MessageLogInterface,
  MessageLogTableTableDocumentInterface,
} from '@models/dynamodb/MessageLogTable'

export default class MessageLogRepository extends BaseRepository<MessageLogTableTableDocumentInterface> {
  constructor() {
    super(MessageLogTable)
  }
}

export { MessageLogInterface, MessageLogTableTableDocumentInterface }
