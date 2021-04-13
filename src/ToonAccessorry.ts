import { DEV_TYPE_HueLight, DEV_TYPE_SmartPlug, DEV_TYPE_SmokeSensor, DEV_TYPE_Thermostat } from "./ToonAPI-Definitions";
import { ToonHomebridgePlatform } from './dynamic-platform';
import { ToonThermostat } from "./ToonThermostat";
import {ToonSmokeDetector} from "./ToonSmokeSensor";
import { PlatformConfig, Logger, PlatformAccessory } from "homebridge";
import { ToonAPI } from "./ToonObject";

export class ToonAccessory {

    constructor(
        private readonly platform: ToonHomebridgePlatform,
        private readonly accessory: PlatformAccessory,
        private devType: string,
        private devUuid: string,
        private toon: ToonAPI,
        private create_new: boolean,
    ) {
      
      if (devType == DEV_TYPE_SmokeSensor) {
        platform.log.info ("Setting up new Toon SmokeDetector");
        new ToonSmokeDetector (platform, accessory, devUuid, toon, create_new);
      }

      if (devType == DEV_TYPE_SmartPlug) {
       // new ToonSmartPlug (platform, accessory, devUuid, toon);
      }
      
      if (devType == DEV_TYPE_HueLight) {
      // new ToonSmokeDetector (platform, accessory, devUuid, toon);
      }
      if (devType == DEV_TYPE_Thermostat) {
        platform.log.info ("Setting up new Toon Thermostat");
        new ToonThermostat (platform, accessory, devUuid, toon, create_new);
     
      }
    }
}