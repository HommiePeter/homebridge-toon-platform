import { SmokeDetector, ToonStatus } from './ToonAPI-Definitions';
import { ToonAPI } from  './ToonObject';
import { ToonHomebridgePlatform } from './dynamic-platform';
import {
    API,
    APIEvent,
    CharacteristicEventTypes,
    CharacteristicSetCallback,
    CharacteristicValue,
    DynamicPlatformPlugin,
    HAP,
    Service,
    Logger,
    PlatformAccessory,
    PlatformAccessoryEvent,
    PlatformConfig,
  } from 'homebridge';


 
export class ToonSmokeDetector {
    private service: Service;
    private smokedetector?: SmokeDetector;
    private log : Logger;
    
    constructor(
        private readonly platform: ToonHomebridgePlatform,
        private readonly accessory: PlatformAccessory,
       // private devType: string,
        private devUuid: string,
        private toon: ToonAPI,
    ) {
        this.log = platform.log;
        // set accessory information TO DO Nog eigenschappen uit Agreement toevoegen
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
         .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Fibaro')
         .setCharacteristic(this.platform.Characteristic.Model, "FSGD-002-NL");

         this.service = this.accessory.getService(this.platform.Service.SmokeSensor) || this.accessory.addService(this.platform.Service.SmokeSensor);
     
        const result = this.toon.connection.toonstatus.smokeDetectors.device.find(device => device.devUuid === devUuid);
        
        if (result) {
            this.smokedetector = result;

            this.service.setCharacteristic(this.platform.Characteristic.Name, this.smokedetector.name);
            this.service.setCharacteristic(this.platform.Characteristic.StatusActive, this.smokedetector.connected);

            if (this.smokedetector.batteryLevel < 10) {
                this.service.setCharacteristic(this.platform.Characteristic.StatusLowBattery, 1); // Battery Level is Low
            } else {
                this.service.setCharacteristic(this.platform.Characteristic.StatusLowBattery, 0); // Battery Level is Normal
            }
        } else {
            this.log.info(`Smoke detector with DEVUUID ${devUuid} not found`);
        }
//        this.service.getCharacteristic(this.platform.Characteristic.SmokeDetected)
  //        .onGet(this.handleSmokeDetected.bind(this));
    }

    handleSmokeDetected() {
        this.log.debug('Triggered GET SmokeDetected');
    
        // set this to a valid value for SmokeDetected
        const currentValue = this.platform.Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;
    
        return currentValue;
      }

} 