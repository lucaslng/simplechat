// mdns.js

import { Bonjour } from 'bonjour-service';

const instance = new Bonjour();

instance.publish({ name: 'Wassup server', type: 'wassup', port: 55567 })

instance.find({ type: 'wassup' }, function (service) {
  console.log('Found a server:', service)
})