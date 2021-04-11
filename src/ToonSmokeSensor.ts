import { SmokeDetector, ToonStatus } from './ToonAPI-Definitions';
import { ToonConnection } from './ToonConnection';
import {
    API,
    APIEvent,
    CharacteristicEventTypes,
    CharacteristicSetCallback,
    CharacteristicValue,
    DynamicPlatformPlugin,
    HAP,
    Logger,
    PlatformAccessory,
    PlatformAccessoryEvent,
    PlatformConfig,
  } from "homebridge";


/* 
class ToonSmokeDetector {
    private deviceId: string;
    private smokedetectors: Array <SmokeDetector>;
    
    constructor(
      private accessory: PlatformAccessory,
      private connection: ToonConnection,
      private log: any,
      
    ) {
        this.deviceId = this.accessory.context.deviceId;
        if (connection.toonstatus.smokeDetectors.device.length = 0) {
            this.log.info("ToonSmokeDetector: No Smoke dectectors found");
        } else {}
    
        this.smokedetectors = this.connection.toonstatus.smokeDetectors.device;
    
        for (let i=0; i < this.smokedetectors.length; i++) {
          const accessory = new Accessory(`Toon Smoke Detector - ${this.smokedetectors[i].name}`,
            UUIDGen.generate(`Toon Smoke Detector - ${this.smokedetectors[i].name}`));
    
    //  set accessory information
          this.accessory.getService(Service.AccessoryInformation)!
            .setCharacteristic(Characteristic.Manufacturer, 'Fibaro')
            .setCharacteristic(Characteristic.Model, this.smokedetectors[i].type)
            .setCharacteristic(Characteristic.SerialNumber, accessory.context.device.uniqueid);
    
          const smokedetectService = new ServiceSmoke(ServiceSmoke.SmokeSensor);
        
          this.log(`UpdateSmokeDetectors: smokedetectService ${smokedetectService}`);
      
          smokedetectService.updateCharacteristic( Characteristic.Name, this.smokedetectors[i].name);
    
          if (this.smokedetectors[i].batteryLevel < 10) {
            smokedetectService.updateCharacteristic( Characteristic.StatusLowBattery, 1); // Battery Level is Low
          } else {
            smokedetectService.updateCharacteristic( Characteristic.StatusLowBattery, 0); // Battery Level is Normal
          }
          smokedetectService.updateCharacteristic( Characteristic.StatusActive, this.smokedetectors[i].connected);
          smokedetectService.updateCharacteristic( Characteristic.SmokeDetected, 0); // No Smoke Detected
    
          this.log(`Setting up Toon Smoke Detector ${this.smokedetectors[i].name}`);
    
          this.accessory.addService(Service.AccessoryInformation,
            `Toon Smoke Detector - ${this.smokedetectors[i].name}`);
        }
      }
    } */