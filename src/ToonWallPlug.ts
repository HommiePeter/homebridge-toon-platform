import { DeviceConfigInfo, DeviceStatusInfo, ToonStatus } from './ToonAPI-Definitions';
import { ToonAPI } from  './ToonObject';
import { ToonHomebridgePlatform } from './ToonPlatform';
import { CharacteristicValue, Service, Logger, PlatformAccessory } from 'homebridge';


export class ToonWallPlug {
    private service: Service;
    private wallplug?: DeviceConfigInfo;
    private wallplug_status?:DeviceStatusInfo;
    private log : Logger;
    
    constructor(
        private readonly platform: ToonHomebridgePlatform,
        private readonly accessory: PlatformAccessory,
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
                this.service.setCharacteristic(this.platform.Characteristic.Name, this.wallplug.name);
                this.service.setCharacteristic(this.platform.Characteristic.On, this.wallplug_status.currentState);
                
                this.service.addCharacteristic(this.platform.Cust_Characteristic.characteristic.CurrentPowerConsumption)
                this.service.addCharacteristic(this.platform.Cust_Characteristic.characteristic.DailyPowerConsumption)
                this.service.setCharacteristic(this.platform.Cust_Characteristic.characteristic.CurrentPowerConsumption,this.wallplug_status.currentUsage);
                this.service.setCharacteristic(this.platform.Cust_Characteristic.characteristic.DailyPowerConsumption,this.wallplug_status.dayUsage);
          
                if (this.wallplug_status.currentUsage !== 0) {
                    this.service.setCharacteristic(this.platform.Characteristic.OutletInUse, 1);   
                } else {
                    this.service.setCharacteristic(this.platform.Characteristic.OutletInUse, 0);  
                }
            } else {
               this.service.setCharacteristic(this.platform.Cust_Characteristic.characteristic.CurrentPowerConsumption,this.wallplug_status.currentUsage);
               this.service.setCharacteristic(this.platform.Cust_Characteristic.characteristic.DailyPowerConsumption,this.wallplug_status.dayUsage);
                
               if (this.wallplug_status.currentUsage !== 0) {
                    this.service.updateCharacteristic(this.platform.Characteristic.OutletInUse, 1);   
                } else {
                    this.service.updateCharacteristic(this.platform.Characteristic.OutletInUse, 0);  
                }

                this.service.updateCharacteristic(this.platform.Characteristic.On, this.wallplug_status.currentState);
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
        
        const response = await this.toon.connection.getToonDeviceStatus(this.devUuid);
        if (response) {
            let inUse = response.currentUsage !== 0;
            return inUse; 
        } else {  
            let inUse = false;
            return inUse;
        }   
    } 

    handleOnSet(value: CharacteristicValue) {
        const newValue = value as boolean;
        this.log.info(`Triggered SET On ${newValue} for ${this.devUuid};`);  
        this.toon.connection.setToonDeviceOn (this.devUuid, newValue);
    }

    async handleOnGet():Promise<CharacteristicValue> { 
        this.log.info(`Triggered GET Onfor ${this.devUuid}`);
        const response = await this.toon.connection.getToonDevice(this.devUuid);
        const isOn = response.currentState !== 0;
        this.log.info(`Triggered GET Onfor ${this.devUuid}, with isOn ${isOn}`);
        return isOn; 
    } 
} 