class GenericException extends Error {
  statusCode: number

  constructor(
    message: string = 'Something went wrong, please contact your System Administrator.',
    statusCode: number = 500,
  ) {
    super(message)
    this.name = 'GENERIC_EXCEPTION'
    this.statusCode = statusCode
  }
}

export class RequestValidationException extends GenericException {
  constructor(message: string) {
    super(message, 422)
    this.name = 'REQUEST_VALIDATION_EXCEPTION'
  }
}

export class ResourceNotFoundException extends GenericException {
  constructor(message: string = 'Resource not found.') {
    super(message, 404)
    this.name = 'RESOURCE_NOT_FOUND_EXCEPTION'
  }
}
export class UnauthorizedAccessException extends GenericException {
  constructor(message: string = 'You are not authorzied to access this resource.') {
    super(message, 401)
    this.name = 'UNAUTHORIZED_ACCESS'
  }
}

export class AWSSDKException extends GenericException {
  constructor(message: string = 'aws-sdk was unable to process the request.') {
    super(message, 500)
    this.name = 'AWS_SDK_EXCEPTION'
  }
}

export class DynamoDbException extends GenericException {
  constructor(message: string = 'dynamodb was unable to process the request.') {
    super(message, 500)
    this.name = 'DYNAMODB_EXCEPTION'
  }
}

export class ResourceExistsException extends GenericException {
  constructor(message: string = 'Resource exists.') {
    super(message, 409)
    this.name = 'RESOURCE_EXISTS_EXCEPTION'
  }
}

export class HookbinIntegrationException extends GenericException {
  constructor(message: string = 'hookbin integration request failed.', code = 422) {
    super(message, code)
    this.name = 'HOOKBIN_INTEGRATION_EXCEPTION'
  }
}
