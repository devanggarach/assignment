import { registerAs } from '@nestjs/config';
import { ENV_NAMESPACES } from './config.token';

export default registerAs(ENV_NAMESPACES.SERVER, () => {
  return {
    port: parseInt(process.env.PORT, 10) || 3500,
    host: process.env.HOST || '127.0.0.1',
  };
});
