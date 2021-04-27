import { API } from 'homebridge';
import { PLATFORM_NAME } from './settings';
import { ToonHomebridgePlatform } from './dynamic-platform';

var Service, Characteristic, UUIDGen, CustomCharacteristic; 


/**
 * This method registers the platform with Homebridge
 */

// export = (api: API) => {
  export default function(homebridge: any) {
    Service = homebridge.hap.Service;
	  Characteristic = homebridge.hap.Characteristic;
	  UUIDGen = homebridge.hap.uuid;
    CustomCharacteristic = require("./CustomCharacteristic")(homebridge);
  
    homebridge.registerPlatform(PLATFORM_NAME, ToonHomebridgePlatform);
  };