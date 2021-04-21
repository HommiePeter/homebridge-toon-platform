import { DeviceConfigInfo, DeviceStatusInfo, ToonStatus } from './ToonAPI-Definitions';
import { ToonAPI } from  './ToonObject';
import { ToonHomebridgePlatform } from './dynamic-platform';
import {
    API,
    APIEvent,
    Characteristic,
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


 
export class ToonWallPlug {
    private service: Service;
    private wallplug?: DeviceConfigInfo;
    private wallplug_status?:DeviceStatusInfo;
    private log : Logger;
    
    constructor(
        private readonly platform: ToonHomebridgePlatform,
        private readonly accessory: PlatformAccessory,
       // private devType: string,
        private devUuid: string,
        private toon: ToonAPI,
        private create_new: boolean,
    ) {
        this.log = platform.log;

        const device = this.toon.connection.toonstatus.deviceConfigInfo.device.find(device => device.devUUID === devUuid);
        const status = this.toon.connection.toonstatus.deviceStatusInfo.device.find(device => device.devUUID === devUuid);
    
        // setup new homekit accessory
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Fibaro')
            .setCharacteristic(this.platform.Characteristic.Model, "Wall Plug Type F");

        this.service = this.accessory.getService(this.platform.Service.Outlet) || this.accessory.addService(this.platform.Service.Outlet);
     
        if ((device) && (status)) {
            this.wallplug = device;
            this.wallplug_status = status;

            if (create_new) {
                this.service.setCharacteristic(this.platform.Characteristic.Name, this.wallplug?.name);
                this.service.setCharacteristic(this.platform.Characteristic.OutletInUse, this.wallplug_status?.currentState);
                this.service.setCharacteristic(this.platform.Characteristic.On, this.wallplug_status?.currentState);
              //  this.service.getCharacteristic(CurrentPowerConsumption).getValue(null);
		      //  this.service.getCharacteristic(TotalConsumption).getValue(null);
            } else {
                this.service.updateCharacteristic(this.platform.Characteristic.OutletInUse, this.wallplug_status?.currentState);
                this.service.updateCharacteristic(this.platform.Characteristic.On, this.wallplug_status?.currentState);
            }
        } else {
            this.log.info(`Plug Wall or Status with DEVUUID ${devUuid} not found`);
        }
        
        this.service.getCharacteristic(this.platform.Characteristic.OutletInUse)
        .onGet(this.handleOutletInUseGet.bind(this))
        .onSet(this.handleOutletInUseSet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.On)
         .onGet(this.handleOnGet.bind(this))
         .onSet(this.handleOnSet.bind(this));


    }

    handleOutletInUseSet(value: CharacteristicValue) {
        const newValue = value as boolean;
        this.log.info(`Triggered SET On OutletInUseSet ${newValue}`);
          
       // const device = this.toon.connection.toonstatus.deviceConfigInfo.device.find(device => device.devUUID === this.devUuid);
    
     //   return currentValue;
    }

    async handleOutletInUseGet():Promise<CharacteristicValue> { 
       // this.log.info('Triggered GET On OutletInUseGet');
        
        const response = await this.toon.connection.getToonDevice(this.devUuid);
        const isOn = response.currentState !== 0;
        
        return isOn; 
    } 

    handleOnSet(value: CharacteristicValue) {
        const newValue = value as boolean;
        this.log.info(`Triggered SET On handleOnSet ${newValue}`);
          
        this.toon.connection.setToonDeviceOn (this.devUuid, newValue);
    }

    async handleOnGet():Promise<CharacteristicValue> { 
       // this.log.info('Triggered GET On handleOnGet');

        const response = await this.toon.connection.getToonDevice(this.devUuid);
        const isOn = response.currentState !== 0;
      
        return isOn; 
    } 
} 