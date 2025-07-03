import { ExceptionInterface } from '@lib/commons/_interfaces/handler'
import { HookbinIntegrationException } from '@lib/commons/exceptions'
import { logger } from '@lib/commons/powertools'
import axios, { AxiosRequestConfig } from 'axios'

export interface HookbinSendMessageInterface {
  message: string
  sentAt: string
}

export default class Hookbin {
  private BASE_URL!: string

  constructor() {
    this.BASE_URL = process.env['HOOKBIN_BASE_URL'] || ''
  }

  async sendMessage(payload: HookbinSendMessageInterface): Promise<void | ExceptionInterface> {
    logger.info('hookbin:sendMessage:executed')
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    try {
      await axios.post(this.BASE_URL, payload, config)
    } catch (error) {
      logger.error('hookbin:sendMessage:error', {
        error,
      })

      if (axios.isAxiosError(error)) {
        throw new HookbinIntegrationException(
          'Failed to send message. Please try again later.',
          error.response?.status ?? 500,
        )
      }
    }
  }
}
