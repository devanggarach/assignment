import { HttpException, HttpStatus } from '@nestjs/common';

interface IExceptionArgs {
  /**
   * Response error status code to be sent.
   * i.e. 400, 500
   *
   * Import `HttpStatus` from `@nestjs/common` lib & assign enum to this value
   *
   * @usage
   * ```javascript
   * import { HttpStatus } from '@nestjs/common';
   *
   * throw new Exception({
   *  ...
   *  status: HttpStatus.BAD_REQUEST,
   * });
   * ```
   */
  status: HttpStatus;
  /** User friendly error message/description */
  message: string;
  /** Error code for internal usage (from error file) */
  code: string;
  /** Extra information if needed */
  meta?: any;
  /**
   * Original error object
   *
   * It can be value of error object received from API call or some catch block.
   */
  err?: Error;
}

export class Exception extends HttpException {
  code: string;

  traceId: string;

  meta: any;

  err: Error;

  constructor(exceptionArgs: IExceptionArgs) {
    super(exceptionArgs.message, exceptionArgs.status);

    this.message = exceptionArgs.message;
    this.code = exceptionArgs.code;

    this.meta = exceptionArgs.meta || {};
    this.err = exceptionArgs.err;
  }
}
