import { ToonStatus, ToonAgreement, ToonConnectedDevice,ToonConnectedDevices,DEV_TYPE_SmokeSensor } from "./ToonAPI-Definitions";
import { ToonConnection } from './ToonConnection';
import { ToonHomebridgePlatform } from './dynamic-platform';
import { ToonThermostat } from "./ToonThermostat";
import { PlatformConfig, Logger } from "homebridge";

export class Toon {
    public connection: ToonConnection;
    public thermostat!: ToonThermostat;
    public devicelist!: ToonConnectedDevices;
    private device!: ToonConnectedDevice;
    private log: Logger;

    constructor(
        public readonly Config: PlatformConfig, 
        public Toonplatform : ToonHomebridgePlatform ) 
    {
        this.connection = new ToonConnection (Config, Toonplatform.log);
        this.log = Toonplatform.log;

        this.log.info(`Toon: Connection was setup up`);

 //       this.connection.getToonStatus();
 //       this.thermostat = new ToonThermostat (Toonplatform.accessories, Config this.connection,  Toonplatform.log )
    }

    public async update_devicelist () {
       // await this.connection.getToonStatus();

        const NrSmokeDectectors = this.connection.toonstatus.smokeDetectors.device.length
        
        this.log.info(`Number of connected Smoke Detectors found is: ${NrSmokeDectectors}`);

        for ( let i=0; i < NrSmokeDectectors; i++) {
            this.device.devUuid = this.connection.toonstatus.smokeDetectors.device[i].devUuid;
            this.device.devType = DEV_TYPE_SmokeSensor;
  //          this.log.info (`Device Type = ${devType} and device DevUUID ${devUuid}`);
            this.devicelist.device.push(this.device);
        }
        // To DO
        // For toonstatus.deviceConfig ....
        //     if toonstatus.deviceConfig.Type containts -> DEV_HUE -> Add Lights to Dev list
        //     if toonstatus.deviceConfig.Type containts -> DEV_SMART -> Add SmartPlug to dev list

    }

    public show_devicelist() {
        const NrDevices = this.devicelist.device.length;

        for (let i=0; i < NrDevices; i++ ) {
          let DevUUID = this.devicelist.device[i].devUuid;
          let DevType = this.devicelist.device[i].devType;
          this.log.info (`Device Type = ${DevType} and device DevUUID ${DevUUID}`); 
        } 
    }
}
