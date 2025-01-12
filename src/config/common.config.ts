import { registerAs } from '@nestjs/config';
import { ENV_NAMESPACES } from './config.token';

export default registerAs(ENV_NAMESPACES.COMMON, () => {
  return {};
});
