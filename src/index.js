const {
  Kuzzle,
  WebSocket,
} = require('kuzzle-sdk');

const serverIp = process.env.KUZZLE_HOST;
console.log('serverIp', serverIp);
// const serverIp = 'nexus.umhtx.org';

function isIPAddress(ipaddress) {
  if (
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ipaddress,
    )
  ) {
    return true;
  }
  return false;
}

const getKuzzleHost = (
  serverIpParam,
  isIp,
) => {
  if (isIp) return serverIpParam;

  return `${serverIpParam}/kuzzle`;
};

const getKuzzleInstance = (
  serverIpParam,
  isIp,
) => new Kuzzle(
  new WebSocket(
    getKuzzleHost(serverIpParam, isIp),
    { ...(!isIp && { ssl: true }), pingInterval: 30000, autoReconnect: true },
  ),
);

const subscribePing = async (serverIpParam) => {
  console.log('subscribePing', serverIpParam);
  const kuzzle = getKuzzleInstance(
    serverIpParam,
    true,
  );
  await kuzzle.connect();
  console.log('ping subscribe');
  return kuzzle.realtime.subscribe(
    'nexus',
    'ping-collection',
    {
      and: [
        {
          equals: {
            ping: '123456',
          },
        },
      ],
    },
    (response) => {
      console.log('publish subscribe callback..........', response);
    },
  );
};

const publishPing = async (serverIpParam) => {
  console.log('publishPing', serverIpParam);
  console.log('publishPing');
  const kuzzle = getKuzzleInstance(
    serverIpParam,
    true,
  );
  await kuzzle.connect();
  console.log('ping publish');
  return kuzzle.realtime.publish(
    'nexus',
    'ping-collection',
    {
      ping: '123456',
    },
  );
};

subscribePing(serverIp)
  .then(() => {})
  .catch((e) => {
    console.log('error subscribePing', e);
  });

setInterval(() => {
  publishPing(serverIp)
    .then(() => {})
    .catch((e) => {
      console.log('error publishPing', e);
    });
},
10000);