
import {
  API,
  APIEvent,
  CharacteristicEventTypes,
  CharacteristicSetCallback,
  CharacteristicValue,
  Characteristic,
  DynamicPlatformPlugin,
  Service,
  HAP,
  Logger,
  PlatformAccessory,
  PlatformAccessoryEvent,
  PlatformConfig,
} from "homebridge";

import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import { ToonThermostat } from "./ToonThermostat"
import { ToonStatus, ThermostatInfo, ToonAgreement } from "./ToonAPI-Definitions"
import { ToonAPI } from "./ToonObject";
import { ToonAccessory} from "./ToonAccessorry";


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


export class ToonHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

// this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];
  public readonly toon : ToonAPI;
  public toonconfig: PlatformConfig;  
  private toonstatus!: ToonStatus;
  private agreement!: ToonAgreement; 

  constructor (
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.toonconfig = this.config; 

    this.log.info('Finished initializing Toon platform:', this.toonconfig.name);
  
    this.toon = new ToonAPI(this.toonconfig, this);
  
    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.

        /*
     * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
     * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
     * after this event was fired, in order to ensure they weren't added to homebridge already.
     * This event can also be used to start discovery of new accessories.
     */
    this.api.on('didFinishLaunching', () => {
      this.log.info('Executed didFinishLaunching callback');
      
  //    this.discoverDevices(); tijdelijk uitgezet
      setInterval(() => {
        this.discoverDevices()
      }, 10000);
    });

  }
  
  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
   configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    accessory.reachable = true;
    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  async discoverDevices() {
    this.log.info ("discoverDevices: update devicelist");
    this.toon.connection.getToonStatus();

    this.toon.update_devicelist();
    this.toon.update_showlist();
  //  this.log.info("discover & update-devices: Update Thermostat")
  //  this.toon.thermostat.onUpdate;

   // this.toon.connection.getToonStatus();

    const Nrdevices = this.toon.devicelist.length;

    // loop over the discovered devices and register each one if it has not already been registered
    for ( let i=0; i < Nrdevices; i++) {

      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address
      const device = this.toon.devicelist[i];

      const uuid = this.toon.devicelist[i].devUuid;

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        // the accessory already exists
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        existingAccessory.context.device = device;

        new ToonAccessory(this, existingAccessory, device.devType, device.devUuid, this.toon, false);
        this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`

        // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
        // remove platform accessories when no longer present
        // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
        // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
      } else {
        // the accessory does not yet exist, so we need to create it
        this.log.info('Adding new accessory:', device.devName, device.devType);

        // create a new accessory
        const accessory = new this.api.platformAccessory(device.devName, uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        accessory.context.device = device;

        // create the accessory handler for the newly create accessory
        // this is imported from `platformAccessory.ts`
        new ToonAccessory(this, accessory, device.devType, device.devUuid, this.toon, true);

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  } 

  // --------------------------- CUSTOM METHODS ---------------------------

/* Nog oude code bekijken wat er mee moet 
  addThermostat() {
    if (this.Thermostat !== undefined) {
      this.log.info("addThermostat: Thermostat already existing");
      return;
    }
    this.log.info("addThermostat: Adding accessory Thermostat");

    const accessory = new Accessory( "Toon Thermostaat", hap.uuid.generate("Toon Thermostaat") );
   
    this.log.info("addThermostat: Added accessory Thermostat");

    this.log.info("addThermostat: Setup new Toon Thermostat");

    this.Thermostat = new ToonThermostat(accessory, this.config, this.Service, this.log);

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

  removeAccessory(device : any) {
    // we don't have any special identifiers, we just remove all our accessories

    this.log.info("Removing all accessories");

    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.accessories);
    this.accessories.splice(0, this.accessories.length); // clear out the array
  }
}
