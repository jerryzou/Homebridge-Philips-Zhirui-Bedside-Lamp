const miio = require('miio');
const colorsys = require('colorsys');

var Service, Characteristic;

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-philips-bedside-lamp", "Philips-Bedside-Lamp", myPhiLamp);
};

function myPhiLamp(log, config) {
  this.log = log;
  if (config) {
    this.name = config["name"];
    this.ipaddress = config["ipaddress"];
    this.token = config["token"];
  } else {
    this.log("No configuration found. Please add configuration in config.json");
    return;
  }
}

myPhiLamp.prototype.getServices = function() {
  let informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, "Philips")
    .setCharacteristic(Characteristic.Model, "Zhirui")
    .setCharacteristic(Characteristic.SerialNumber, "Unavailable");

  let lightbulbService = new Service.Lightbulb(this.name, "Bedside Lamp");
  lightbulbService
    .setCharacteristic(Characteristic.ConfiguredName, this.name);
  lightbulbService
    .getCharacteristic(Characteristic.On)
    .on('get', this.getSwitchOnCharacteristic.bind(this))
    .on('set', this.setSwitchOnCharacteristic.bind(this));
  lightbulbService
    .addCharacteristic(Characteristic.Brightness)
    .on("get", this.getBrightness.bind(this))
    .on("set", this.setBrightness.bind(this));
  // lightbulbService
  //   .addCharacteristic(Characteristic.ColorTemperature)
  //   .on("get", this.getColorTemperature.bind(this))
  //   .on("set", this.setColorTemperature.bind(this))
  //   .setProps({
  //       minValue: 103,
  //       maxValue: 397
  //   });
  lightbulbService
    .addCharacteristic(Characteristic.Hue)
    .on("get", this.getHue.bind(this))
    .on("set", this.setHue.bind(this));
  lightbulbService.addCharacteristic(Characteristic.Saturation)
    .on("get", this.getSaturation.bind(this))
    .on("set", this.setSaturation.bind(this));

  this.informationService = informationService;
  this.lightbulbService = lightbulbService;
  return [informationService, lightbulbService];
};

myPhiLamp.prototype.getSwitchOnCharacteristic = function (next) {
    const me = this;
    //me.log("start getting power state ...");
    miio.device({ address: me.ipaddress, token: me.token })
    .then(device => {
      device.call('get_prop', ["pow"])
        .then( msg => {
          me.log("Lamp is " + msg);

          if (msg.indexOf('on')>-1) {
            next(null, true);
          } else {
            next(null, false);
          }
        })
        .catch(console.error);
    })
    .catch(console.error);
};

myPhiLamp.prototype.setSwitchOnCharacteristic = function (on, next) {
  const me = this;
  //me.log("start setting power state ...");

  const nowStatus = me.lightbulbService.getCharacteristic(Characteristic.On).value ? 'on' : 'off';

  if(on===true && nowStatus==='on'){
    next();
    return;
  }

  const modeFlag = on ? ['on'] : ['off'];
  miio.device({ address: me.ipaddress, token: me.token })
    .then(device => {
      device.call('set_power', modeFlag)
      .then( msg => {
        me.log("Lamp is turning " + modeFlag + " ..." + msg);
        next();
      })
      .catch(console.error);
    })
    .catch(console.error);
}

myPhiLamp.prototype.getBrightness = function (next) {
  const me = this;
  //me.log("start getting brightness ...");
  const nowStatus = me.lightbulbService.getCharacteristic(Characteristic.On).value ? 'on' : 'off';
  //me.log("Lamp is currently " + nowStatus);
  if(nowStatus==="off"){
    //me.log("Current Brightness: 0");
    next(null, 0);
  }else{
    miio.device({ address: me.ipaddress, token: me.token })
    .then(device => {
      device.call('get_prop', ["bri"])
        .then( msg => {
          me.log("Current brightness: " + msg[0]);
          next(null, msg[0]);
        })
        .catch(console.error);
    })
    .catch(console.error);
  }
}

myPhiLamp.prototype.setBrightness = function (brightness, next) {
  const me = this;
  if(brightness===0){
    next();
    return;
  }
  if(brightness>=1&&brightness<=100){
    //me.log("start setting brightness ...");
    miio.device({ address: me.ipaddress, token: me.token })
    .then(device => {
      device.call('set_bright', [brightness])
        .then( msg => {
          me.log("Setting brightness to " + brightness + " ... " + msg);
          next();
        })
        .catch(console.error);
    })
    .catch(console.error);
  }
}

// myPhiLamp.prototype.getColorTemperature = function (next) {
//   const me = this;
//   miio.device({ address: me.ipaddress, token: me.token })
//     .then(device => {
//       device.call('get_prop', ["cct"])
//         .then( msg => {
//           me.log("Current Color Temp Level: " + msg[0]);
//           next(null, (400 - 3 * msg[0]));
//         })
//         .catch(console.error);
//     })
//     .catch(console.error);
// }

// myPhiLamp.prototype.setColorTemperature = function (ct, next) {
//   const me = this;
//   const cct  = Math.round((400 - ct) / 3);
//   miio.device({ address: me.ipaddress, token: me.token })
//     .then(device => {
//       device.call('set_cct', [cct])
//         .then( msg => {
//           me.log("Setting Color Temp to " + cct + " ... " + msg);
//           next();
//         })
//         .catch(console.error);
//     })
//     .catch(console.error);
// }

myPhiLamp.prototype.getHue = function (next) {
  const me = this;
  miio.device({ address: me.ipaddress, token: me.token })
    .then(device => {
      device.call('get_prop', ["rgb"])
        .then( msg => {
          const red = (msg[0] >> 16) & 0xFF;
          const green = (msg[0] >> 8) & 0xFF;
          const blue = msg[0] & 0xFF;
          const hsv = colorsys.rgb_to_hsv({ r: red, g: green, b: blue });
          me.hsv = hsv;
          me.log("Current hue: " + hsv.h);
          next(null, hsv.h);
        })
        .catch(console.error);
    })
    .catch(console.error);
}

myPhiLamp.prototype.setHue = function (hue, next) {
  const me = this;
  //me.log(me.hsv);

  if(!me.hsv){
    next();
    return;
  }else{
    const newhsv = {h: hue, s: me.hsv.s, v: me.hsv.v};
    me.hsv = newhsv;
    const newrgb = colorsys.hsv_to_rgb(newhsv);
    const rgbcode = [newrgb.r, newrgb.g, newrgb.b];
    miio.device({ address: me.ipaddress, token: me.token })
      .then(device => {
        device.call('set_rgb', rgbcode)
          .then( msg => {
            me.log("Setting RGB to " + rgbcode + " ... " + msg);
            next();
          })
          .catch(console.error);
      })
      .catch(console.error);
  }
}

myPhiLamp.prototype.getSaturation = function (next) {
  const me = this;
  miio.device({ address: me.ipaddress, token: me.token })
    .then(device => {
      device.call('get_prop', ["rgb"])
        .then( msg => {
          const red = (msg[0] >> 16) & 0xFF;
          const green = (msg[0] >> 8) & 0xFF;
          const blue = msg[0] & 0xFF;
          const hsv = colorsys.rgb_to_hsv({ r: red, g: green, b: blue });
          me.hsv = hsv;
          me.log("Current saturation: " + hsv.s);
          next(null, hsv.s);
        })
        .catch(console.error);
    })
    .catch(console.error);
}

myPhiLamp.prototype.setSaturation = function (sat, next) {
  const me = this;
  //me.log(me.hsv);

  if(!me.hsv){
    next();
    return;
  }else{
    const newhsv = {h: me.hsv.h, s: sat, v: me.hsv.v};
    me.hsv = newhsv;
    const newrgb = colorsys.hsv_to_rgb(newhsv);
    const rgbcode = [newrgb.r, newrgb.g, newrgb.b];
    miio.device({ address: me.ipaddress, token: me.token })
      .then(device => {
        device.call('set_rgb', rgbcode)
          .then( msg => {
            me.log("Setting RGB to " + rgbcode + " ... " + msg);
            next();
          })
          .catch(console.error);
      })
      .catch(console.error);
  }
}