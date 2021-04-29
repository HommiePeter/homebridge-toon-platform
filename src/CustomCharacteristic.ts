import {API, Characteristic, CharacteristicProps, Formats, Perms, WithUUID} from 'homebridge';

export class CustomCharacteristic {

  private api: API;
  public characteristic: { [key: string]: WithUUID< { new(): Characteristic }> } = {};

  constructor(api: API) {
    this.api = api;

    this.createCharacteristics('CurrentPowerConsumption', 'E863F10D-079E-48FF-8F27-9C2605A29F52', {
        format: Formats.UINT16,
        perms: [Perms.NOTIFY, Perms.PAIRED_READ],
        unit: "Watt",
        maxValue: 100000,
        minValue: 0,
        minStep: 1,
    }, 'Consumption');
   
    this.createCharacteristics('DailyPowerConsumption', 'E863F10C-079E-48FF-8F27-9C2605A29F52', {
        format: Formats.FLOAT,
        unit: "kWh",
        maxValue: 100000000000,
        minValue: 0,
        minStep: 0.001,
        perms: [Perms.READ, Perms.NOTIFY]
    }, 'Energy');
  }

  private createCharacteristics(key: string, uuid: string, props: CharacteristicProps, displayName: string = key) {
    this.characteristic[key] = class extends this.api.hap.Characteristic {
      static readonly UUID: string = uuid;

      constructor() {
        super(displayName, uuid, props);
        this.value = this.getDefaultValue();
      }
    };
  }

}