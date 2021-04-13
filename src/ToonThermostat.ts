import { ToonStatus } from './ToonAPI-Definitions';
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
    Logger,
    Service,
    PlatformAccessory,
    PlatformAccessoryEvent,
    PlatformConfig,
  } from "homebridge";

export class ToonThermostat {
    private thermostatService: Service;
    private log : Logger;

    constructor(
        private readonly platform: ToonHomebridgePlatform,
        private readonly accessory: PlatformAccessory,
  //      private devType: string,
        private devUuid: string,
        private toon: ToonAPI,
        private create_new: boolean,
    ) {
        this.log = platform.log;

        
        // setup new homekit accessory
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.devName)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Eneco')
            .setCharacteristic(this.platform.Characteristic.Model, 'Toon Thermostaat Model 1')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.toon.connection.getDisplayCommonName() )
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, this.toon.connection.getSoftwareVersion())                .setCharacteristic(this.platform.Characteristic.HardwareRevision, this.toon.connection.getHardwareVersion());

        this.thermostatService = this.accessory.getService(this.platform.Service.Thermostat) || this.accessory.addService(this.platform.Service.Thermostat);
        if (create_new) {

            this.thermostatService
                .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
                .setProps({
                    validValues: [this.platform.Characteristic.TargetHeatingCoolingState.AUTO]
                });
    
            this.thermostatService
                .getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
                .on("get", this.getCurrentHeatingCoolingState);
    
            this.thermostatService
                .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
                .on("set", this.setTargetHeatingCoolingState)
                .on("get", this.getTargetHeatingCoolingState);
    
            this.thermostatService
                .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
                .on("get", this.getCurrentTemperature);
    
            this.thermostatService
                .getCharacteristic(this.platform.Characteristic.TargetTemperature)
                .on("set", this.setTargetTemperature)
                .on("get", this.getTargetTemperature);
    
            this.thermostatService
                .getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
                .on("get", this.getTemperatureDisplayUnits);
        }  
        
        const { thermostatInfo } = this.toon.connection.toonstatus;
  
        this.thermostatService.updateCharacteristic(
            this.platform.Characteristic.CurrentTemperature,
            thermostatInfo.currentDisplayTemp / 100
        );

        this.thermostatService.updateCharacteristic(
            this.platform.Characteristic.TargetTemperature,
            thermostatInfo.currentSetpoint / 100
        );
              
        var heatingCoolingState;
        if (thermostatInfo.burnerInfo === "1") {
            heatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.HEAT;
        } else {
            heatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
        }
  
        this.thermostatService.updateCharacteristic(
            this.platform.Characteristic.CurrentHeatingCoolingState,
            heatingCoolingState
        );
    }
     
    identify(callback: () => void) {
      callback();
    }
  
    getCurrentHeatingCoolingState = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      const burnerInfo = this.toon.connection.getBurnerInfo();
  
      // Toon can only activate the heating, so return heat or off.
      var heatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
  
      if (burnerInfo === "1") {
        heatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.HEAT;
      }
  
      if (burnerInfo !== undefined) {
        callback(null, heatingCoolingState);
      } else {
        callback(new Error("Error getting HeatingCoolingState"));
      }
    };
  
    setTargetHeatingCoolingState = (
      _: any,
      callback: (err: Error | null, value?: any) => void
    ) => {
      const thermostatService = this.accessory.getService(this.platform.Service.Thermostat);
      callback(null, this.platform.Characteristic.TargetHeatingCoolingState.AUTO);
    };
  
    getTargetHeatingCoolingState = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      callback(null, this.platform.Characteristic.TargetHeatingCoolingState.AUTO);
    };
  
    getCurrentTemperature = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      const currentTemp = this.toon.connection.getCurrentTemperature();
  
      this.log.info("Current Temperature: ", currentTemp);
      callback(null, currentTemp);
    };
  
    getTargetTemperature = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      const currentSetpoint = this.toon.connection.getCurrentSetpoint();
  
      this.log.info("Current Target Temperature: ", currentSetpoint);
      callback(null, currentSetpoint);
    };
  
    setTargetTemperature = (
      value: any,
      callback: (err?: Error | null, value?: any) => void
    ) => {
      if (value === this.toon.connection.getCurrentSetpoint()) {
        callback();
        return;
      }
  
      this.toon.connection.setTemperature(value);
      callback();
    };
  
    getTemperatureDisplayUnits = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      callback(null, this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS);
    };
  
    getDisplayCommonName = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      callback(null, this.toon.connection.getDisplayCommonName());
    };
  
    getHardwareVersion = (callback: (err: Error | null, value?: any) => void) => {
      callback(null, this.toon.connection.getHardwareVersion());
    };
  
    getFirmwareRevision = (callback: (err: Error | null, value?: any) => void) => {
      callback(null, this.toon.connection.getSoftwareVersion());
    };
} 



