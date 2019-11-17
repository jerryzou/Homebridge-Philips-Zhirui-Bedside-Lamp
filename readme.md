# Homebridge Plugin for Philips Zhirui Bedside Lamp (Xiaomi Ecosystem Product)

Please check if you've got the right product:
https://au.gearbest.com/night-lights/pp_009659205361.html

After you've got your homebridge up and running:

`npm i -g homebridge-philips-bedside-lamp`

Then edit the config.json of your homebridge -

```javascript
{
  "accessory": "Philips-Bedside-Lamp",
  "name": "Bedside Lamp",
  "ipaddress": "192.168.xxx.xxx",
  "token": "xxxxxxxxxxxxxxxxxxxxxx"
}
```
Please refer to this great guide on revealing the token of your lamp -
https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token.md

If you have an android phone, I would recommend that special verson of Mi Home app. Worked like a charm. If not, you can still use a simulator like BlueStacks.

This is my first homebridge plugin and actually first npm package. So please pardon me on the immature code. Only got a few hours to work on it.

All the basic functions such as on/off, brightness, rgb color and color temperature are all working, which I feel pretty happy about. The lamp is a good product and it's finally integrated to my homekit as all my other devices. Thank all the relevant package developers who made this wonderful journey possible.
