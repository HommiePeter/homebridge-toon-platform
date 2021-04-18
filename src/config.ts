export default interface ToonConfig {
    accessory: "Toon";
    name: string;
  
    // Agreement Index is used to select the correct address if a user has different addresses.
    agreementIndex?: number;
  
    // API token from https://api.toon.eu/toonapi-accesstoken?tenant_id=eneco&client_id=<consumer_key>
    apiToken: string;
    
    // Switch to indicate if available connected Hue lights should be imported into the Toon-platform
    switch_hue: boolean;
   
    // Switch to indicate if available connected smoke sensors should be imported into the Toon-platform
    switch_smoke: boolean;
    
    // Switch to indicate if available connected wall plugs should be imported into the Toon-platform
    switch_wallplug: boolean;
   
  }