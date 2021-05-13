
This plugin enables homebridge to communicate with Toon and its connected devices via HomeKit.

npm install -g homebridge-toon-platform

Configuration

The configuration file consists of the following options to configure
    {
    "platforms": [
        {
            "name": "<Put your Toons name>",
            "apiToken": "<Put your API token from Eneco here>",
            "switch_hue": false,
            "switch_smoke": <true or false> ,
            "switch_wallplug": <true or false>,
            "AgreementIndex": <number> ,
            "refreshRate": <number>, 300000,
            "platform": "Toon-Platform"
        },
      ], 
    }

API TOKEN:
To make the plugin work you need to obtain a consumer_key from developer.toon.eu The following should be added to the homebridge config.json:

An API token which is valid for 10 years can be obtained via https://api.toon.eu/toonapi-accesstoken?tenant_id=eneco&client_id=<consumer_key>

SWITCHES:
The config identifies 3 diffent swithes that can be set to make connected devices to your Toon visible in Apple Homekit. Switches can be set true of false. (Only Hue Lights are defaulted to false). False results in not importing connected devices / True results in importing (if any) connected devices

- switch_hue -> make connected Philips Hue lights visible in HomeKit (since Philips HUE bij default can be make available to Home Kit this is still work to do )

- switch_smoke -> make connected Fibaro smoke detectors available in HomeKit, with BatteryLevel indicator. The action on the EVENT SMOKE_DETECTED is still work to do. 

- switch_wallplug -> make connected Fibaro Wallplugs available in HomeKit, with Actuel Power Consumption and Daily Power Consumption as custom characteristics available in the EVE App. 


AGREEMENT SELECTION:
The plugin automatically selects the first agreement in the list, however if agreement selection is necessary, add the following config parameter. "AgreementIndex": <NUMBER>. Default this numbus is 0. 

The plugin automatically lists the available options in the Homebridge log.

REFRESH RATE
Although events are handeld directly, retrieving consumption data from Eneco's service is done at an interval. Default this interval is set to 300 seconds (300.000 msecs) to aviod limit rate errors in your Homebridge setup. Limit rate erros with lead to up losing the ability to retrieve consumption data and switch connected devices for a certain time. You can customize the interval to your liking by specifing a interval period in msecs at <NUMBER>

TO DO:
- Smoke Detectors: Implement an actions when Toon Smoke detectors detect smoke or during a Test Alarm
- Hue lights: Complete implementation still needs to be done
- ThermoStat: Implement the other comsumption indicators as custom charateristics to be visible in de EVE App. 