import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { ToonHomebridgePlatform } from './dynamic-platform';

/**
 * This method registers the platform with Homebridge
 */

export = (api: API) => {
//    hap = api.hap;
//    Accessory = api.platformAccessory;
//    ToonService = api.hap.Service;
  
    api.registerPlatform(PLATFORM_NAME, ToonHomebridgePlatform);
  };