var ATT     = exports;

var request = require('request');
var mqtt    = require('mqtt');

/**
 * Public API
 */
ATT.addAsset  = addAsset;

/**
 * Private variables
 */
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
    is: isActuator ? 'actuator' : sensor,
    profile: {
      type: assetType
    },
    deviceId: ATT.DeviceId
  };

  var options = {
    url: baseHttpUrl + '/api/asset/' + ATT.DeviceId + id,
    method: 'PUT',
    headers: {
      'Auth-ClientKey': ClientKey,
      'Auth-ClientId': ClientId
    },
    json: true,
    body: body
  };

  request(options, callback || function() {});
}
