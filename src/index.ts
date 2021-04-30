import { API } from 'homebridge';
import { PLATFORM_NAME } from './settings';
import { ToonHomebridgePlatform } from './toon-platform';

var Service, Characteristic, UUIDGen, CustomCharacteristic; 

/**
 * This method registers the platform with Homebridge
 */

 export = (api: API) => {
    Service = api.hap.Service;
	  Characteristic =api.hap.Characteristic;
	  UUIDGen = api.hap.uuid;

    api.registerPlatform(PLATFORM_NAME, ToonHomebridgePlatform);
  };