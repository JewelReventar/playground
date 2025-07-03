import dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'

const table = `${process.env['PROJECT_NAME']}-${process.env['ENVIRONMENT']}-message-log-table`
const schema = new dynamoose.Schema(
  {
    pk: { type: String, hashKey: true }, // app:message:birthday:{year}
    sk: { type: String, rangeKey: true, required: true }, // USER UUID
    message: { type: String },
    status: { type: String, enum: ['success', 'failed'] },
    sentAt: { type: String },
  },
  {
    saveUnknown: true,
  },
)

export interface MessageLogInterface extends Item {
  pk: string
  sk: string
  message: string
  status: string
  sentAt: string
}

export interface MessageLogTableTableDocumentInterface extends MessageLogInterface, Item {}

export default dynamoose.model<MessageLogTableTableDocumentInterface>(table, schema, {
  create: false,
  update: false,
})
