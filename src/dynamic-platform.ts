import http, {IncomingMessage, Server, ServerResponse} from "http";
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

/*import { ToonStatus } from './ToonAPI-Definitions'; */ 

import { ToonConnection } from './ToonConnection'; 

/* import { ToonThermostat } from "./ToonThermostat" */

import { ToonStatus, ThermostatInfo, ToonAgreement } from "./ToonAPI-Definitions"

const PLUGIN_NAME = "homebridge-toon-platform";
const PLATFORM_NAME = "Toon-Platform";

/*
 * IMPORTANT NOTICE
 *
 * One thing you need to take care of is, that you never ever ever import anything directly from the "homebridge" module (or the "hap-nodejs" module).
 * The above import block may seem like, that we do exactly that, but actually those imports are only used for types and interfaces
 * and will disappear once the code is compiled to Javascript.
 * In fact you can check that by running `npm run build` and opening the compiled Javascript file in the `dist` folder.
 * You will notice that the file does not contain a `... = require("homebridge");` statement anywhere in the code.
 *
 * The contents of the above import statement MUST ONLY be used for type annotation or accessing things like CONST ENUMS,
 * which is a special case as they get replaced by the actual value and do not remain as a reference in the compiled code.
 * Meaning normal enums are bad, const enums can be used.
 *
 * You MUST NOT import anything else which remains as a reference in the code, as this will result in
 * a `... = require("homebridge");` to be compiled into the final Javascript code.
 * This typically leads to unexpected behavior at runtime, as in many cases it won't be able to find the module
 * or will import another instance of homebridge causing collisions.
 *
 * To mitigate this the {@link API | Homebridge API} exposes the whole suite of HAP-NodeJS inside the `hap` property
 * of the api object, which can be acquired for example in the initializer function. This reference can be stored
 * like this for example and used to access all exported variables and classes from HAP-NodeJS.
 */
let hap: HAP;
let Accessory: typeof PlatformAccessory;
var Service: any, Characteristic: any;

export = (api: API) => {
  hap = api.hap;
  Accessory = api.platformAccessory;
  Service = api.hap.Service;
  Characteristic = api.hap.Characteristic
  api.registerPlatform(PLATFORM_NAME, ToonPlatform);
};

class ToonPlatform implements DynamicPlatformPlugin {
  Thermostat! : ToonThermostat;

  private readonly log: Logging;
  private readonly config: PlatformConfig;
  private readonly api: API;
  
  private requestServer?: Server;
  private readonly accessories: PlatformAccessory[] = [];
 
  private toonstatus!: ToonStatus;
  private agreement! :ToonAgreement;

  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;
    
    // probably parse config or something here
    log.info("Toon-Platform: Reading config");
    this.config = config;

  /*  this.connection = new ToonConnection(this.config, this.log, this.toonstatus, this.agreement);

  /*  this.connection = new ToonConnection(this.config, this.log ); */

    this.api = api;
    log.info("Example platform finished initializing!");

    /*
     * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
     * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
     * after this event was fired, in order to ensure they weren't added to homebridge already.
     * This event can also be used to start discovery of new accessories.
     */
    api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      log.info("Example platform 'didFinishLaunching'");

      // The idea of this plugin is that we open a http service which exposes api calls to add or remove accessories
      this.log ("Toon-Platform : Start Add Thermostat");
      this.addThermostat();
    });
  }

  /*
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory): void {
    this.log("Configuring accessory %s", accessory.displayName);

    accessory.on(PlatformAccessoryEvent.IDENTIFY, () => {
      this.log("%s identified!", accessory.displayName);
    });

    accessory.getService(hap.Service.Thermostat)!
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.log.info("%s Light was set to: " + value);
        callback();
      });

    this.accessories.push(accessory);
  }

  // --------------------------- CUSTOM METHODS ---------------------------

  addThermostat() {
    if (this.Thermostat !== undefined) {
      this.log.info("addThermostat: Thermostat already existing");
      return;
    }
    this.log.info("addThermostat: Adding accessory Thermostat");

    const accessory = new Accessory( "Toon Thermostaat", hap.uuid.generate("Toon Thermostaat") );
   
    this.log.info("addThermostat: Added accessory Thermostat");

    this.log.info("addThermostat: Setup new Toon Thermostat");

    this.Thermostat = new ToonThermostat(accessory, this.config, this.log);

    this.log.info("addThermostat: new Toon Thermostat was Setup");

    this.log.info("addThermostat: registerPlaformAccessories")

    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
  }
  /* Original
  addAccessory(name: string) {
    this.log.info("Adding new accessory with name %s", name);

    // uuid must be generated from a unique but not changing data source, name should not be used in the most cases. But works in this specific example.
    const uuid = hap.uuid.generate(name);
    const accessory = new Accessory(name, uuid);

    accessory.addService(hap.Service.Lightbulb, "Test Light");

    this.configureAccessory(accessory); // abusing the configureAccessory here

    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
  } */

  removeAccessories() {
    // we don't have any special identifiers, we just remove all our accessories

    this.log.info("Removing all accessories");

    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.accessories);
    this.accessories.splice(0, this.accessories.length); // clear out the array
  }

  /*
  createHttpService() {
    this.requestServer = http.createServer(this.handleRequest.bind(this));
    this.requestServer.listen(18081, () => this.log.info("Http server listening on 18081..."));
  } */

  /*
  private handleRequest(request: IncomingMessage, response: ServerResponse) {
    if (request.url === "/add") {
      this.addAccessory(new Date().toISOString());
    } else if (request.url === "/remove") {
      this.removeAccessories();
    } 

    response.writeHead(204); // 204 No content
    response.end();
  } */

  // ----------------------------------------------------------------------

}

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