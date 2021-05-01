
import {Logger,PlatformConfig } from "homebridge";
import {ToonHomebridgePlatform } from "./ToonPlatform";
import {API_URL, ThermostatInfo, DeviceConfigInfo, ToonAgreement, 
       ToonStatus, ToonConnectedDevices, ToonConnectedDevice, 
       DEV_TYPE_HueLight, DEV_TYPE_SmartPlug } from "./ToonAPI-Definitions";

export class ToonConnection {
    public agreement?: ToonAgreement; 
    public toonstatus! : ToonStatus; 
    public devicelist! : ToonConnectedDevices;
    private device!: ToonConnectedDevice;  
    private agreementIndex: number;
    private log: Logger;
    private token?: string;
    
    constructor(
      private config: PlatformConfig,
      private platform : ToonHomebridgePlatform,
    ) {
        this.token = config.apiToken;
        this.log = this.platform.log;

        // Index selecting the agreement, if a user has multiple agreements (due to moving, etc.).
        this.agreementIndex = this.config.agreementIndex
         ? this.config.agreementIndex
         : 0;
       
        this.initialize();
    }
  
    private async initialize() {
        this.log.info("ToonConnection.initialize: getAgreementData");
        this.agreement = await this.getAgreementData();
      
        await this.getToonStatus();
        if ((this.toonstatus.smokeDetectors) && (this.config.switch_smoke)) {
            const NrSmokeDectectors = this.toonstatus.smokeDetectors.device.length  
            this.log.info(`ToonConnection.initialize: Number of connected Smoke Detectors found is: ${NrSmokeDectectors}`);
        } else {
            this.log.info(`ToonConnection.initialize: No Smoke detectors imported from ToonStatus`);
        }

        if (this.toonstatus.deviceConfigInfo) {
            if (this.config.switch_hue) {
                const HueLights = this.toonstatus.deviceConfigInfo.device.filter(device => device.devType.search(DEV_TYPE_HueLight) != -1);
                const NrHueLigts = HueLights.length;
                this.log.info(`ToonConnection.initialize: Number of connected Hue lights found is: ${NrHueLigts}`);
            } else {
              this.log.info(`ToonConnection.initialize: No Hue Lights imported from ToonStatus`); 
            } 
            if (this.config.switch_wallplug) {
                const SmartPlugs = this.toonstatus.deviceConfigInfo.device.filter( device => device.devType.search(DEV_TYPE_SmartPlug) != -1);
                const NrSmartPlugs = SmartPlugs.length;
                this.log.info(`ToonConnection.initialize: Number of connected Wall Plugs found is: ${NrSmartPlugs}`);
            } else {
                this.log.info(`ToonConnection.initialize: No Wall plugs imported from ToonStatus`);
            }
        } else {
            this.log.info(`ToonConnection.initialize: Other devices reported in ToonStatus`);
        }
    }
  
    private getHeader() {
      return {
        Authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
        "cache-control": "no-cache"
      };
    }
  
    private async toonPUTRequest(url: string, body: any) {
      if (this.token === undefined) {
        throw Error("PUT not authorized");
      }
      const fetch = require('node-fetch');

      try {
        const response = await fetch (url, { 
          'method': 'PUT', 
          'body': JSON.stringify(body), 
          'headers': this.getHeader()
        })
        return await response.json();
      }
      catch(err) {
        this.log.info(`Oeps PUT went wrong ${err}`) // Maybe present some error/failure UI to the user here
      };
      
    }
  
    private async toonGETRequest(url: string) {
      if (this.token === undefined) {
        throw Error("GET not authorized");
      }
      const fetch = require('node-fetch');
      
      try {
        const response = await fetch( url, {
            'method': 'GET',
            'headers': this.getHeader()
        })
        return response.json();
      }
      catch(err) {
        this.log.info(`Oeps GET went wrong ${err}`) // Maybe present some error/failure UI to the user here
      };
    } 
  
    private async getAgreementData() {
      this.log.info("Getting agreement...");
  
      let agreements: ToonAgreement[] = await this.toonGETRequest(
        `${API_URL}agreements`
      );

      if (this.agreementIndex < agreements.length) {
        this.log.info(`Currently selected agreementIndex: ${this.agreementIndex}`);
        const { street, houseNumber, postalCode, city, heatingType } = agreements[this.agreementIndex];
        this.log.info(`Agreement selected for: ${street} ${houseNumber} ${postalCode} ${city} ${heatingType}`);
        return agreements[this.agreementIndex];

      } else {
        for (const agreementIndex in agreements) {
          const {street,houseNumber,postalCode,city,heatingType } = agreements[agreementIndex];

          this.log.info(
            `agreementIndex: [${agreementIndex}]: ${street} ${houseNumber} ${postalCode} ${city} ${heatingType}`
          );
        }
  
        throw new Error(
          "Incorrect agreementIndex selected, is your config valid?"
        );
      }
    }
    
    public getToonStatus = async () => {        
        
        if (!this.agreement) {
          throw Error("Requested status but there is no agreement.");
        }
    
        let status: ToonStatus = await this.toonGETRequest(
          `${API_URL}${this.agreement.agreementId}/status`
        );

        this.toonstatus = status;
        this.log.debug("getToonStatus: Toon status data is retrieved");
    // TO DO: Moet nog uitbreiden met actuele infor
        
      }; 

      public async setToonTemperature(temperature: number) {
        if (!this.agreement) {
          throw Error("Setting temperature but there is no agreement.");
        }
    
        if (!this.toonstatus) {
          throw Error("Setting temperature but there is no status information.");
        }
    
        this.log.info(`Setting Toon Temperature to ${temperature / 100}`);
    
        let currentThermostatInfo: ThermostatInfo = await this.toonGETRequest(
          `${API_URL}${this.agreement.agreementId}/thermostat`
        );
    
        const payload = {
          ...currentThermostatInfo,
          currentSetpoint: temperature,
          activeState: -1,
          programState: 2
        };
    
        const newThermostatInfo = await this.toonPUTRequest(
          `${API_URL}${this.agreement.agreementId}/thermostat`,
          payload
        );
    
        this.log.info(`Successfully set Toon Temperature to ${temperature / 100}`);
    
        this.toonstatus.thermostatInfo = newThermostatInfo;
      }
    
      public async setTemperature(temperature: number) {
        const destination_temperature = Math.round(
          (Math.round(temperature * 2) / 2) * 100
        );
    
        await this.setToonTemperature(destination_temperature);
      }
    
      public getDisplayCommonName() {
        return this.agreement ? this.agreement.displayCommonName : "-";
      }
    
      public getHardwareVersion() {
        return this.agreement ? this.agreement.displayHardwareVersion : "-";
      }
    
      public getSoftwareVersion() {
        return this.agreement ? this.agreement.displaySoftwareVersion : "-";
      }
    
      public getBurnerInfo() {
        return this.toonstatus
          ? this.toonstatus.thermostatInfo.burnerInfo
          : undefined;
      }
    
      public getCurrentTemperature() {
        return this.toonstatus
          ? this.toonstatus.thermostatInfo.currentDisplayTemp / 100
          : undefined;
      }
    
      public getCurrentSetpoint() {
        return this.toonstatus
          ? this.toonstatus.thermostatInfo.currentSetpoint / 100
          : undefined;
      }

      public async setToonDeviceOn(devUuid: string, switched_on: boolean) {

        if (!this.agreement) {
          throw Error("Setting Device, but there is no agreement.");
        }
    
        if (!this.toonstatus) {
          throw Error("Setting Device, but there is no status information.");
        }
        const device = this.toonstatus.deviceConfigInfo.device.find(device => device.devUUID === devUuid)
        
        if(!device) {
            throw Error (`Device with DevUuid ${devUuid} was not found in Toonstatus`)
        }  
    
        let currentDeviceInfo: DeviceConfigInfo = await this.toonGETRequest(
          `${API_URL}${this.agreement.agreementId}/devices/${devUuid}`
        );
    
        if (currentDeviceInfo.currentState == 1) {     
            currentDeviceInfo.currentState = 0;
            this.log.info(`Setting Device ${device.name} to Off`);
            switched_on = false;
        } else {
            currentDeviceInfo.currentState = 1;
            switched_on = true;   
            this.log.info(`Setting Device ${device.name} to On`);    
        }
        
        const payload = {
          ...currentDeviceInfo
        };
    
        const newDeviceInfo = await this.toonPUTRequest(
          `${API_URL}${this.agreement.agreementId}/devices/${devUuid}`,
          payload
        );
        
        //Updating also internal ToonStatus data
        const DeviceNr = this.toonstatus.deviceStatusInfo.device.findIndex(device => device.devUUID === devUuid)
        this.toonstatus.deviceStatusInfo.device[DeviceNr]= newDeviceInfo; 
        
        return switched_on;

      }

      public async getToonDevice(devUuid: string) {

        if (!this.agreement) {
          throw Error("Setting Device, but there is no agreement.");
        }
    
        if (!this.toonstatus) {
          throw Error("Setting Device, but there is no status information.");
        }
        const device = this.toonstatus.deviceConfigInfo.device.find(device => device.devUUID === devUuid)
        
        if(!device) {
            throw Error (`Device with DevUuid ${devUuid} was not found in ToonStatus`)
        }
    
        let currentDeviceInfo: DeviceConfigInfo = await this.toonGETRequest(
          `${API_URL}${this.agreement.agreementId}/device/${devUuid}`
        );

        return currentDeviceInfo;
      }

      public async getToonDeviceStatus(devUuid: string) {

        if (!this.agreement) {
          throw Error("Setting Device, but there is no agreement.");
        }
    
        if (!this.toonstatus) {
          throw Error("Setting Device, but there is no status information.");
        }
        const deviceStatus = this.toonstatus.deviceStatusInfo.device.find(device => device.devUUID === devUuid)
        
        if(!deviceStatus) {
            throw Error (`Device with DevUuid ${devUuid} was not found in ToonStatus`)
        }

        return deviceStatus;
      }
  }