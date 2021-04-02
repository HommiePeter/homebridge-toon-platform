

import { ToonStatus } from './ToonAPI-Definitions';
import { ToonConnection } from './ToonConnection';
import {
    API,
    APIEvent,
    CharacteristicEventTypes,
    CharacteristicSetCallback,
    CharacteristicValue,
    DynamicPlatformPlugin,
    HAP,
    Logging,
    PlatformAccessory,
    PlatformAccessoryEvent,
    PlatformConfig,
  } from "homebridge";


var Accessory: any, Service: any, Characteristic: any

export class ToonThermostat {
    private deviceId: string;
    private connection: ToonConnection;
  
    constructor(
      private accessory: any,
      private config: PlatformConfig,
      private log: any
    ) {
      this.deviceId = this.accessory.context.deviceId;
      this.log.info(`Device ID is ${this.deviceId}`);
      this.connection = new ToonConnection(this.config, this.log, this.onUpdate);
      this.log.info("ToonConnection is completed");
     //* this.configure(); 
    }
    onUpdate = (toonStatus: ToonStatus) => {
      const thermostatService = this.accessory.getService(Service.Thermostat);
      const { thermostatInfo } = toonStatus;
  
      thermostatService.updateCharacteristic(
        Characteristic.CurrentTemperature,
        thermostatInfo.currentDisplayTemp / 100
      );
      thermostatService.updateCharacteristic(
        Characteristic.TargetTemperature,
        thermostatInfo.currentSetpoint / 100
      );
  
      var heatingCoolingState;
      if (thermostatInfo.burnerInfo === "1") {
        heatingCoolingState = Characteristic.CurrentHeatingCoolingState.HEAT;
      } else {
        heatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
      }
  
      thermostatService.updateCharacteristic(
        Characteristic.CurrentHeatingCoolingState,
        heatingCoolingState
      );
  
      const informationService = this.accessory.getService(
        Service.AccessoryInformation
      );
  
      informationService
        .setCharacteristic(Characteristic.Name, this.config.name)
        .setCharacteristic(Characteristic.Manufacturer, "Eneco")
        .setCharacteristic(Characteristic.Model, "Toon")
        .setCharacteristic(
          Characteristic.SerialNumber,
          this.connection.getDisplayCommonName()
        )
        .setCharacteristic(
          Characteristic.FirmwareRevision,
          this.connection.getSoftwareVersion()
        )
        .setCharacteristic(
          Characteristic.HardwareRevision,
          this.connection.getHardwareVersion()
        );
    };
  
    identify(callback: () => void) {
      callback();
    }
  
    getCurrentHeatingCoolingState = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      const burnerInfo = this.connection.getBurnerInfo();
  
      // Toon can only activate the heating, so return heat or off.
      var heatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
  
      if (burnerInfo === "1") {
        heatingCoolingState = Characteristic.CurrentHeatingCoolingState.HEAT;
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
      const thermostatService = this.accessory.getService(Service.Thermostat);
      callback(null, Characteristic.TargetHeatingCoolingState.AUTO);
    };
  
    getTargetHeatingCoolingState = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      callback(null, Characteristic.TargetHeatingCoolingState.AUTO);
    };
  
    getCurrentTemperature = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      const currentTemp = this.connection.getCurrentTemperature();
  
      this.log("Current Temperature: ", currentTemp);
      callback(null, currentTemp);
    };
  
    getTargetTemperature = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      const currentSetpoint = this.connection.getCurrentSetpoint();
  
      this.log("Current Target Temperature: ", currentSetpoint);
      callback(null, currentSetpoint);
    };
  
    setTargetTemperature = (
      value: any,
      callback: (err?: Error | null, value?: any) => void
    ) => {
      if (value === this.connection.getCurrentSetpoint()) {
        callback();
        return;
      }
  
      this.connection.setTemperature(value);
      callback();
    };
  
    getTemperatureDisplayUnits = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      callback(null, Characteristic.TemperatureDisplayUnits.CELSIUS);
    };
  
    getDisplayCommonName = (
      callback: (err: Error | null, value?: any) => void
    ) => {
      callback(null, this.connection.getDisplayCommonName());
    };
  
    getHardwareVersion = (callback: (err: Error | null, value?: any) => void) => {
      callback(null, this.connection.getHardwareVersion());
    };
  
    getFirmareRevision = (callback: (err: Error | null, value?: any) => void) => {
      callback(null, this.connection.getSoftwareVersion());
    };
  
    configure() {
      if (!this.accessory.getService(Service.AccessoryInformation)) {
        this.accessory.addService(
          Service.AccessoryInformation,
          "Toon Thermostaat"
        );
      }
  
      const informationService = this.accessory.getService(
        Service.AccessoryInformation
      );
  
      informationService.setCharacteristic(Characteristic.Name, this.config.name);
      informationService.setCharacteristic(Characteristic.Manufacturer, "Eneco");
  
      if (!this.accessory.getService(Service.Thermostat)) {
        this.accessory.addService(Service.Thermostat, "Toon Thermostaat");
      }
  
      const thermostatService = this.accessory.getService(Service.Thermostat);
  
      thermostatService
        .getCharacteristic(Characteristic.TargetHeatingCoolingState)
        .setProps({
          validValues: [Characteristic.TargetHeatingCoolingState.AUTO]
        });
  
      thermostatService
        .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
        .on("get", this.getCurrentHeatingCoolingState);
  
      thermostatService
        .getCharacteristic(Characteristic.TargetHeatingCoolingState)
        .on("set", this.setTargetHeatingCoolingState)
        .on("get", this.getTargetHeatingCoolingState);
  
      thermostatService
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on("get", this.getCurrentTemperature);
  
      thermostatService
        .getCharacteristic(Characteristic.TargetTemperature)
        .on("set", this.setTargetTemperature)
        .on("get", this.getTargetTemperature);
  
      thermostatService
        .getCharacteristic(Characteristic.TemperatureDisplayUnits)
        .on("get", this.getTemperatureDisplayUnits);
    }
  } 
