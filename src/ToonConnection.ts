
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

import {
  API_URL,
  BASE_URL,
  ThermostatInfo,
  Token,
  ToonAgreement,
  ToonStatus
} from "./ToonAPI-Definitions";

export class ToonConnection {
    private agreement?: ToonAgreement; 
    private toonStatus?: ToonStatus;
    private agreementIndex: number;
     
    private token?: string;
    private resultjson!: string;

    constructor(
      private config: PlatformConfig,
      private log: Logging,
    /*  private toonstatus: ToonStatus,
      private agreement: ToonAgreement */
      private onUpdate: (toonStatus: ToonStatus) => void 
    ) {
      this.token = config.apiToken;
  
      // Index selecting the agreement, if a user has multiple agreements (due to moving, etc.).
      this.agreementIndex = this.config.agreementIndex
        ? this.config.agreementIndex
        : 0;
  
      this.initialize().then(() => {
            setInterval(this.getToonStatus, 10000);
            this.log("interval is set based on toon status")
        });
    }
  
    private async initialize() {
      this.agreement = await this.getAgreementData();
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
          'method': 'put', 
          'body': JSON.stringify(body), 
          'headers': this.getHeader
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
        return await response.json();
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
    private getToonStatus = async () => {
        if (!this.agreement) {
          throw Error("Requested status but there is no agreement.");
        }
    
        let toonStatus: ToonStatus = await this.toonGETRequest(
          `${API_URL}${this.agreement.agreementId}/status`
        );
        
        this.log.info(`getToonStatus: thermostatInfo ${toonStatus.thermostatInfo}`);
/*
        if (toonStatus.thermostatInfo) { 
          this.toonStatus = toonStatus;
          this.onUpdate(this.toonStatus);
        } */
      }; 
      private async setToonTemperature(temperature: number) {
        if (!this.agreement) {
          throw Error("Setting temperature but there is no agreement.");
        }
    
        if (!this.toonStatus) {
          throw Error("Setting temperature but there is no status information.");
        }
    
        this.log(`Setting Toon Temperature to ${temperature / 100}`);
    
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
    
        this.log(`Successfully set Toon Temperature to ${temperature / 100}`);
    
        this.toonStatus.thermostatInfo = newThermostatInfo;
        this.onUpdate(this.toonStatus);
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
        return this.toonStatus
          ? this.toonStatus.thermostatInfo.burnerInfo
          : undefined;
      }
    
      public getCurrentTemperature() {
        return this.toonStatus
          ? this.toonStatus.thermostatInfo.currentDisplayTemp / 100
          : undefined;
      }
    
      public getCurrentSetpoint() {
        return this.toonStatus
          ? this.toonStatus.thermostatInfo.currentSetpoint / 100
          : undefined;
      }
  }