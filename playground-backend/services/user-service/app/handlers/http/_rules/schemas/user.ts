import Joi from 'joi'
import { validateTimzezone } from '@lib/helpers/dayjs'

export const createUserSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthday: Joi.string()
    .required()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .message('birthday must be in YYYY-MM-DD format'),
  timezone: Joi.string()
    .required()
    .custom((value, helpers) => {
      const isValidTimezone = validateTimzezone(value)
      if (!isValidTimezone) {
        return helpers.error('any.invalid')
      }
      return value
    }, 'Timezone validation')
    .messages({
      'any.invalid':
        'timezone must be a valid IANA timezone (e.g., Asia/Manila, Australia/Melbourne, America/New_York)',
      'any.required': 'timezone is required',
    }),
})

export const updateUserSchema = Joi.object({
  id: Joi.string().required(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  birthday: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .message('birthday must be in YYYY-MM-DD format'),
  timezone: Joi.string()
    .custom((value, helpers) => {
      const isValidTimezone = validateTimzezone(value)
      if (!isValidTimezone) {
        return helpers.error('any.invalid')
      }
      return value
    }, 'Timezone validation')
    .messages({
      'any.invalid':
        'timezone must be a valid IANA timezone (e.g., Asia/Manila, Australia/Melbourne, America/New_York)',
      'any.required': 'timezone is required',
    }),
})

export const deleteUserSchema = Joi.object({
  id: Joi.string().required(),
})

export const initiateHappyBirthdaySchema = Joi.object({
  utcBirthDate: Joi.string()
    .required()
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:00:00$/)
    .message('utcBirthDate must be in YYYY-MM-DD HH:00:00 format'),
})
