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
  } from "homebridge";


 
export class ToonSmokeDetector {
    private smokesensorService: Service;
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

         this.smokesensorService = this.accessory.getService(this.platform.Service.SmokeSensor) || this.accessory.addService(this.platform.Service.SmokeSensor);
     
         this.smokesensorService.getCharacteristic(this.platform.Characteristic.SmokeDetected)
           .onGet(this.handleSmokeDetected.bind(this));

        const result = this.toon.connection.toonstatus.smokeDetectors.device.find(device => device.devUuid === devUuid);
        
        if (result) {
            this.smokedetector = result;

            this.smokesensorService.updateCharacteristic(this.platform.Characteristic.Name, this.smokedetector.name);
            this.smokesensorService.updateCharacteristic(this.platform.Characteristic.StatusActive, this.smokedetector.connected);

            if (this.smokedetector.batteryLevel < 10) {
                this.smokesensorService.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, 1); // Battery Level is Low
            } else {
                this.smokesensorService.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, 0); // Battery Level is Normal
            }
        }else {
            this.log.info(`Smoke detector with DEVUUID ${devUuid} not found`);
        }
    }

    handleSmokeDetected(): Promise<CharacteristicValue> {
        this.log.debug('Triggered GET SmokeDetected');
    
        // set this to a valid value for SmokeDetected
        const currentValue = this.platform.Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;
    
        return currentValue;
      }
} 