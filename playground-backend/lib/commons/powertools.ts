import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'

const defaultValues = {
  region: process.env['AWS_REGION'] as string,
  executionEnv: process.env['ENVIRONMENT'] as string,
}

const service = process.env['SERVICE_NAME'] as string

const logger = new Logger({
  persistentLogAttributes: {
    ...defaultValues,
    serviceName: service,
    logger: {
      name: '@aws-lambda-powertools/logger',
      version: '0.0.1',
    },
  },
})

const metrics = new Metrics({
  defaultDimensions: defaultValues,
})

const tracer = new Tracer({
  enabled: true,
  captureHTTPsRequests: true,
  serviceName: service,
})

export {
  // Loggers
  logger,
  // Metrics
  metrics,
  // Tracers
  tracer,
  captureLambdaHandler,
}
