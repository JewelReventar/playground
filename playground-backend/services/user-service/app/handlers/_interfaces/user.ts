interface CreateUserInterface {
  firstName: string
  lastName: string
  birthday: string
  timezone: string
}

interface UpdateUserInterface {
  id: string
  firstName?: string
  lastName?: string
  birthday?: string
  timezone?: string
}

interface DeleteUserInterface {
  id: string
}

interface InitiateHappyBirthdayInterface {
  utcBirthDate?: string
}

interface MainQueueConsumerInterface<T> {
  batch: Array<T>
  currentYear: string
  queuedAt: string
}

export {
  CreateUserInterface,
  UpdateUserInterface,
  DeleteUserInterface,
  InitiateHappyBirthdayInterface,
  MainQueueConsumerInterface,
}
