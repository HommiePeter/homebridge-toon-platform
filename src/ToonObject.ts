import { DEV_TYPE_SmokeSensor, DEV_TYPE_HueLight, DEV_TYPE_SmartPlug, DEV_TYPE_Thermostat } from "./ToonAPI-Definitions";
import { ToonConnection } from './ToonConnection';
import { ToonHomebridgePlatform } from './ToonPlatform';
import { PlatformConfig, Logger } from "homebridge";


interface ConnectedDevice {
    devUuid: string;
    devType: string;
    devName: string;
}

export class ToonAPI {
    public connection: ToonConnection;
    public devicelist: ConnectedDevice[] = [];
    private log: Logger;
    private toonconfig: PlatformConfig;
    
    constructor(
        public readonly config: PlatformConfig, 
        public Toonplatform : ToonHomebridgePlatform ) 
    {
        this.toonconfig = config;
        this.connection = new ToonConnection (this.toonconfig, Toonplatform);
        this.log = Toonplatform.log;
        this.log.info(`Toon: Connection was setup up`);
    }
  
    public async update_devicelist () {
        var devUuid: string;
        var devName: string;
        var devType: string;


        devUuid = this.Toonplatform.api.hap.uuid.generate("Toon Thermostaat");

        const existingDevice = this.devicelist.find(device => device.devUuid === devUuid);

        if (existingDevice) {
            // Thermostaat al in de devicelist er hoeft niets te gebeuren
        }else{
            devName = "Toon Thermostaat";
            devType = DEV_TYPE_Thermostat;
            this.devicelist.push({devUuid, devType, devName });
        }

        if ((this.connection.toonstatus.smokeDetectors) && (this.config.switch_smoke)) {
            const NrSmokeDectectors = this.connection.toonstatus.smokeDetectors.device.length

            for ( let i=0; i < NrSmokeDectectors; i++) {
                devUuid = this.connection.toonstatus.smokeDetectors.device[i].devUuid;
                devName = this.connection.toonstatus.smokeDetectors.device[i].name;
                devType = DEV_TYPE_SmokeSensor;
        
                const existingDevice = this.devicelist.find(device => device.devUuid === devUuid);
        
                if (existingDevice) {
                    // the device already exists
                } else {
                    this.devicelist.push({devUuid, devType, devName });
                }
            }
        }
        
        if (this.connection.toonstatus.deviceConfigInfo){
            const NrDeviceConfig = this.connection.toonstatus.deviceConfigInfo.device.length

            for ( let i=0; i < NrDeviceConfig; i++) {
                devUuid = this.connection.toonstatus.deviceConfigInfo.device[i].devUUID;
                devName = this.connection.toonstatus.deviceConfigInfo.device[i].name;

                const existingDevice = this.devicelist.find(device => device.devUuid === devUuid);

                if (existingDevice) {
                    // the device already exists
                } else {
                    if (this.connection.toonstatus.deviceConfigInfo.device[i].devType.search(DEV_TYPE_HueLight) != -1 ) 
                    {
                // device config is a Philips Hue light
                        if (this.config.switch_hue) {
                            devType = DEV_TYPE_HueLight;
                            this.devicelist.push({devUuid, devType, devName });
                        }
                    } else {
                        if (this.connection.toonstatus.deviceConfigInfo.device[i].devType.search(DEV_TYPE_SmartPlug) != -1 ) {
                        // device config is not a Philips Hue light but a Fibaro Smart WallPlug
                            if (this.config.switch_wallplug) {
                                devType = DEV_TYPE_SmartPlug;
                                this.devicelist.push({devUuid, devType, devName });
                            }
                        } else {
                            /// device config is not a Philips Hue light and not a Fibaro Smart WallPlug
                        /// do nothing
                        }
                    }
                }
            }
        }   
    }

    public show_devicelist() {
        const NrDevices = this.devicelist.length;

        for (let i=0; i < NrDevices; i++ ) {
          let DevUUID = this.devicelist[i].devUuid;
          let DevType = this.devicelist[i].devType;
          this.log.info (`Device Type = ${DevType} and device DevUUID ${DevUUID}`); 
        } 
    }
}

