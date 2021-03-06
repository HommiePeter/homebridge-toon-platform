
import { API, Characteristic, DynamicPlatformPlugin, Service, HAP, Logger, PlatformAccessory, PlatformConfig } from "homebridge";
import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import { ToonStatus, ToonAgreement, DEV_TYPE_Thermostat } from "./ToonAPI-Definitions"
import { ToonAPI } from "./ToonObject";
import { ToonAccessory} from "./ToonAccessorry";
import {CustomCharacteristic} from './CustomCharacteristics';

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

interface Registered {
  UUID: string;
}


export class ToonHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly Cust_Characteristic : CustomCharacteristic;

// this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];
  public readonly registered_accessories: PlatformAccessory[] = [];
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

    this.Cust_Characteristic = new CustomCharacteristic(this.api);

  // TO DO ONDERSTAAND VERWIJDEREN
    this.toonconfig.switch_hue= false;

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
        
        if (this.toonconfig.refreshRate == undefined)  {
          setInterval(() => { this.discoverDevices() }, 300000);
          this.log.info(`Using default valies to set Toon status RefreshRate to ${this.toonconfig.refreshRate} milli secconds`)
          // Default value for Toon is 300 seconds other wise time outs (limit rate errrors) will occur
        } else {
          setInterval(() => { this.discoverDevices() }, this.toonconfig.refreshRate);
          this.log.info(`Using plugin config data to set Toon status RefreshRate to ${this.toonconfig.refreshRate} milli secconds`)
        }        
     });
  }
  
  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(restored_accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', restored_accessory.displayName);

    restored_accessory.reachable = true;

    let restored = restored_accessory;
    let devType = restored_accessory.context.device.devType;
    let devUuid  = restored_accessory.context.device.devUuid;
      
    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.registered_accessories.push(restored);
   
    if (devType == DEV_TYPE_Thermostat ) {
        new ToonAccessory(this, restored_accessory, devType, devUuid, this.toon, true);
    } else { 
      this.accessories.push(restored_accessory);
    }
  }

  async discoverDevices() {

    this.toon.connection.getToonStatus();
    
    this.toon.update_devicelist();

    const Nrdevices = this.toon.devicelist.length;

    for ( let i=0; i < Nrdevices; i++) {

      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address
      const device = this.toon.devicelist[i];
      const uuid = this.toon.devicelist[i].devUuid;

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this.registered_accessories.find(accessory => accessory.UUID === uuid);    

      if (existingAccessory) {
 
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

        // create a new accessory
        const accessory = new this.api.platformAccessory(device.devName, uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        accessory.context.device = device;

        // create the accessory handler for the newly create accessory
        // this is imported from `platformAccessory.ts`
        new ToonAccessory(this, accessory, device.devType, device.devUuid, this.toon, true);
        
        let registered = accessory;
        this.registered_accessories.push(registered);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  } 

  removeAccessory(device : any) {
    // we don't have any special identifiers, we just remove all our accessories

    this.log.info("Removing all accessories");

    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.accessories);
    this.accessories.splice(0, this.accessories.length); // clear out the array
  }
}
