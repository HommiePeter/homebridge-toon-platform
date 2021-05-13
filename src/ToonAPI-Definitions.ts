export const BASE_URL = "https://api.toon.eu/";
export const API_URL = `${BASE_URL}toon/v3/`;

export const DEV_TYPE_SmokeSensor = "smoke";
export const DEV_TYPE_HueLight = "hue_light-";
export const DEV_TYPE_SmartPlug = "FGWP";
export const DEV_TYPE_Thermostat = "Thermo"; 

export interface ToonAgreement {
  agreementId: number;
  agreementIdChecksum: string;
  street: string;
  houseNumber: number;
  postalCode: string;
  city: string;
  heatingType: string;
  displayCommonName: string;
  displayHardwareVersion: string;
  displaySoftwareVersion: string;
  isToonSolar: boolean;
  isToonly: false;
}

export interface ToonStatus {
    thermostatStates: ThermostatStates;
    thermostatInfo: ThermostatInfo;
    smokeDetectors: SmokeDevices;
    deviceConfigInfo: Configinfo;
    deviceStatusInfo: Statusinfo;
}

export interface ThermostatInfo {
  currentDisplayTemp: number;
  currentSetpoint: number;
  programState: number;
  activeState: number;
  nextProgram: number;
  nextState: number;
  nextTime: number;
  nextSetpoint: number;
  errorFound: number;
  boilerModuleConnected: number;
  burnerInfo: string;
  otCommError: string;
  currentModulationLevel: number;
}

export interface ThermostatStates {
  state: Array<ThermostatState> 
}

export interface ThermostatState { 
  id: number,
  tempValue: number,
  dhw: number,
}

export interface SmokeDevices {
    device: Array<SmokeDetector>;
}

export interface Configinfo {
  device : Array<DeviceConfigInfo>,
}

export interface Statusinfo {
  device: Array<DeviceStatusInfo>,
}
   
export interface SmokeDetector {
     intAddr: string; 
     devUuid: string; 
     name: string; 
     type: string; 
     connected: boolean;
     lastConnectedChange: number; 
     batteryLevel: number;
     sensitivityLevel: number;
}

export interface ToonConnectedDevices {
  device : Array<ToonConnectedDevice>;
}

export interface ToonConnectedDevice {
  devUuid: string;
  devType: string;
}

export interface DeviceConfigInfo {
  devUUID: string,
  devType: string, 
  name: string,
  flowGraphUuid: string, 
  quantityGraphUuid: string,
  position: number,
  inSwitchAll: boolean,
  inSwitchSchedule: boolean,
  switchLocked: boolean,
  usageCapable: boolean,
  currentState: number,
  rgbColor: string,
  zwuuid : string,
}

export interface DeviceStatusInfo {
  devUUID:string,
  name: string,
  currentUsage: number,
  dayUsage: number,
  avgUsage: number,
  currentState: number,
  isConnected: boolean,
  networkHealthState: number,
  rgbColor:number,
}