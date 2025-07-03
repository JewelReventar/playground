import dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'

const table = `${process.env['PROJECT_NAME']}-${process.env['ENVIRONMENT']}-users-table`
const schema = new dynamoose.Schema(
  {
    pk: { type: String, hashKey: true }, // app:user
    sk: { type: String, rangeKey: true, required: true }, // UUIDV4
    firstName: { type: String },
    lastName: { type: String },
    birthday: { type: String },
    timezone: { type: String },
    createdAt: { type: String },
    updatedAt: { type: String },
  },
  {
    saveUnknown: true,
  },
)

export interface UserInterface {
  pk: string
  sk: string
  firstName: string
  lastName: string
  birthday: string
  timezone: string
  createdAt?: string
  updatedAt?: string
}

export interface UserTableDocumentInterface extends UserInterface, Item {}

export default dynamoose.model<UserTableDocumentInterface>(table, schema, {
  create: false,
  update: false,
})
