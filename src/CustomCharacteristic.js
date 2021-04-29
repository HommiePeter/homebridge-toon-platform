
var Service, Characteristic;
var Util = require('util');

//Initialize
module.exports = function (homebridge) {
	Service= homebridge.Service;
	Characteristic= this.Characteristic;
	

    //var CustomCharacteristic = {};

	CurrentPowerConsumption = function() {
		Characteristic.call(this, 'Consumption', CurrentPowerConsumption.UUID);
		this.setProps({
			format: Characteristic.Formats.UINT32,
			unit: "Watt",
			maxValue: 100000,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	CurrentPowerConsumption.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52';
	Util.inherits(CurrentPowerConsumption, Characteristic);

	DailyPowerConsumption = function () {
        Characteristic.call(this, 'Energy', DailyPowerConsumption.UUID);
		this.setProps({
			format: Characteristic.Formats.FLOAT,
			unit: "kWh",
			maxValue: 100000000000,
			minValue: 0,
			minStep: 0.001,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	DailyPowerConsumption.UUID = 'E863F10C-079E-48FF-8F27-9C2605A29F52'
	Util.inherits(DailyPowerConsumption, Characteristic);

	PowerMeterService = function (displayName, subtype) {
		Service.call(this, displayName, PowerMeterService.UUID, subtype);
		
		this.addCharacteristic(CustomCharacteristic.CurrentPowerConsumption);
		this.addCharacteristic(CustomCharacteristic.DailyPowerConsumption);
		this.addCharacteristic(CustomCharacteristic.ResetTotal);

	};	
	PowerMeterService.UUID = '00000001-0000-1777-8000-775D67EC4377'
	Util.inherits(PowerMeterService, Service);

	ResetTotal = function () {
		Characteristic.call(this, 'Reset', 'E863F112-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.UINT32,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	};
	//CustomCharacteristic.ResetTotal.UUID = 'E863F112-079E-48FF-8F27-9C2605A29F52'
	Util.inherits(ResetTotal, Characteristic);


//eturn CustomCharacteristic;

}
