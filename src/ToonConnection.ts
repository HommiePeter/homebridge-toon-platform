
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
  ToonAuthorize,
  ToonAuthorizeLegacy,
  ToonStatus
} from "./ToonAPI-Definitions";

export default class ToonConnection {
    private agreement?: ToonAgreement;
    private toonStatus?: ToonStatus;
    private agreementIndex: number;
     
    private token?: string;
    private resultjson!: string;

    constructor(
      private config: PlatformConfig,
      private log: Logging,
    /*  private onUpdate: (toonStatus: ToonStatus) => void */
    ) {
      this.token = config.apiToken;
  
      // Index selecting the agreement, if a user has multiple agreements (due to moving, etc.).
      this.agreementIndex = this.config.agreementIndex
        ? this.config.agreementIndex
        : 0;
  
      this.initialize().then(() => {
        setInterval(this.getToonStatus, 10000);
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

      const response = await fetch (url, { 
          method: 'put', 
          body: JSON.stringify(body), 
          headers: this.getHeader
      });

      // Awaiting response.json()
      const result = await response.json();
  
      // Return response data 
      return result;
      
      /*
      const result = await request({
        url,
        method: "PUT",
        headers: this.getHeader(),
        body: JSON.stringify(body)
      }); 
  
      return JSON.parse(result); 
      */
    }
  
    private async toonGETRequest(url: string) {
      if (this.token === undefined) {
        throw Error("GET not authorized");
      }

      const fetch = require('node-fetch');

      this.log.info(`GET URL: ${url}`);
      this.log.info(`GET Headers: ${this.getHeader}`);
      
      try {
        const response = await fetch( url, {
            headers: this.getHeader
        })
        this.log.info(`Status: ${response.status}`);
        this.log.info(`StatusText: ${response.statusText}`);
        return await response.json();
      }
      catch(err) {
        this.log.info(`Oeps GET went wrong ${err}`) // Maybe present some error/failure UI to the user here
      };
    
      // Awaiting response.json()
      //const result = await response.json();
  
      // Return response data 
    // return result;
      /*
      return await request({
        url,
        method: "GET",
        headers: this.getHeader(),
        json: true
      }); */
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
          const {
            street,
            houseNumber,
            postalCode,
            city,
            heatingType
          } = agreements[agreementIndex];
  
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
    /*
        if (toonStatus.thermostatInfo) {
          this.toonStatus = toonStatus;
          this.onUpdate(this.toonStatus);
        } */
      }; 
 
  }