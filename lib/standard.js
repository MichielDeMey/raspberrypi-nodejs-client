var ATT     = exports;

var request = require('request');
var mqtt    = require('mqtt');

/**
 * Public API
 */
ATT.addAsset  = addAsset;
ATT.subscribe = subscribe;
ATT.send      = send;
ATT.onMessage = function() {};

/**
 * Private variables
 */
var mqttClient;
var baseHttpUrl = 'http://api.smartliving.io';
var baseMQTTUrl = 'broker.smartliving.io';

/**
 * Public Getters and Setters
 */
var _clientId = null;
Object.defineProperty(ATT, 'ClientId', {
  enumerable: true,

  get: function() {
    if (_clientId === null)
      throw new Error('No ClientId set');

    return _clientId;
  },
  set: function(id) {
    _clientId = id;
  }
});

var _clientKey = null;
Object.defineProperty(ATT, 'ClientKey', {
  enumerable: true,

  get: function() {
    if (_clientKey === null)
      throw new Error('No ClientKey set');

    return _clientKey;
  },
  set: function(id) {
    _clientKey = id;
  }
});

var _deviceId = null;
Object.defineProperty(ATT, 'DeviceId', {
  enumerable: true,

  get: function() {
    if (_deviceId === null)
      throw new Error('No DeviceId set');

    return _deviceId;
  },
  set: function(id) {
    _deviceId = id;
  }
});

function addAsset(id, name, description, isActuator, assetType, callback) {

  var body = {
    name: name,
    description: description,
    is: isActuator ? 'actuator' : 'sensor',
    profile: {
      type: assetType
    },
    deviceId: ATT.DeviceId
  };

  var options = {
    url: baseHttpUrl + '/api/asset/' + ATT.DeviceId + id,
    method: 'PUT',
    headers: {
      'Auth-ClientKey': ATT.ClientKey,
      'Auth-ClientId': ATT.ClientId
    },
    json: true,
    body: body
  };

  request(options, callback || function() {});
}

function subscribe(url, port) {
  var mqttId   = ATT.DeviceId.length > 23 ? ATT.DeviceId.substring(0, 23) : ATT.DeviceId;
  var brokerId = ATT.ClientId + ':' + ATT.ClientId;

  var topic = 'client/' + ATT.ClientId + '/in/device/' + ATT.DeviceId + '/asset/+/command';

  console.log('Subscribing to: ' + topic);

  mqttClient = mqtt.createClient(port || 1883, url || baseMQTTUrl, {
    clientId: mqttId,
    username: brokerId,
    password: ATT.ClientKey
  })
  .subscribe(topic)
  .on('message', function onMessage(topic, message, packet) {
    console.log('Incoming message - topic: ' + topic + ', payload: ' + message);
    var topicParts = topic.split('/');

    ATT.onMessage(topicParts[-2], message);
  })
  .on('connect', function onConnect(client, userdata, rc) {
    console.log('Connected to the MQTT broker.');
  });
}

function send(value, assetId) {

  if (!mqttClient || !assetId)
    return;

  var timestamp = Date.now();
  var message   = timestamp + '|' + value;
  var topic     = 'client/' + ATT.ClientId + '/out/asset/' + ATT.DeviceId + assetId + '/state';

  console.log('Publishing message - topic: ' + topic + ', payload: ' + toSend);
  mqttClient.publish(topic, message, {
    qos: 0,
    retain: false
  });
}
