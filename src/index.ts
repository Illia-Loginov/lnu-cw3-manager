import { server } from './app';
import { serverConfig } from './config';
import { initIo } from './io';

try {
  initIo(server);
} catch (error) {
  console.error(error);
}

server.listen(serverConfig.port, () => {
  console.log(`Manager server started on port ${serverConfig.port}`);
});
