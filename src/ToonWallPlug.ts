import { DeviceConfigInfo, DeviceStatusInfo, ToonStatus } from './ToonAPI-Definitions';
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
                this.service.setCharacteristic(this.platform.Characteristic.OutletInUse, this.wallplug_status?.isConnected);
            } else {
                this.service.updateCharacteristic(this.platform.Characteristic.OutletInUse, this.wallplug_status?.isConnected);
            }
        } else {
            this.log.info(`Plug Wall or Status with DEVUUID ${devUuid} not found`);
        }
        
        this.service.getCharacteristic(this.platform.Characteristic.On)
       // .onGet(this.handleOnGet.bind(this))
        .onSet(this.handleOnSet.bind(this));
    }

    async handleOnSet(value: CharacteristicValue) {
        const newValue = value as boolean;
        this.log.debug(`Triggered SET On Outlet ${newValue}`);
          
       // const device = this.toon.connection.toonstatus.deviceConfigInfo.device.find(device => device.devUUID === this.devUuid);
    
     //   return currentValue;
    }

 /*   handleOnGet():Promise<CharacteristicValue> { 
        this.log.debug('Triggered GET On Outlet');
        const device = this.toon.connection.toonstatus.deviceConfigInfo.device.find(device => device.devUUID === this.devUuid);
      //  const response = await this.toon.connection.getDeviceConfig(this.devUuid);
      //  const isOn = response.state.status !== 0;
      //  const isOn;
        return device; 
    } */

} 