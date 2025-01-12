import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

export const RequestId = createParamDecorator(() => {
  return uuidV4();
});
