// mdns.js

import { Bonjour } from 'bonjour-service';
import { SERVICE_TYPE, PORT } from './const.js';

const instance = new Bonjour();

instance.publish({ name: ' ', host: ' ', type: SERVICE_TYPE, port: PORT });

instance.find({ type: SERVICE_TYPE }, function (service) {
  console.log('Found a server:', service)
})