var PowerService, Characteristic
var inherits = require('util').inherits;

var CustomCharacteristic = {};

//Initialize
module.exports = function (homebridge) {
	PowerService = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;

    var CustomCharacteristic = {};

	CustomCharacteristic.CurrentPowerConsumption = function () {
		Characteristic.call(this, 'Consumption', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
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
	inherits(CustomCharacteristic.CurrentPowerConsumption, Characteristic);

	CustomCharacteristic.DailyPowerConsumption = function () {
        Characteristic.call(this, 'Energy', 'E863F10C-079E-48FF-8F27-9C2605A29F52');
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
	inherits(CustomCharacteristic.DailyPowerConsumption, Characteristic);

	CustomCharacteristic.ResetTotal = function () {
		Characteristic.call(this, 'Reset', 'E863F112-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.UINT32,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.ResetTotal, Characteristic);

	PowerMeterService = function (displayName, subtype) {
		PowerService.call(this, displayName, '00000001-0000-1777-8000-775D67EC4377', subtype);
		this.addCharacteristic(CustomCharacteristic.CurrentPowerConsumption);
		this.addCharacteristic(CustomCharacteristic.DailyPowerConsumption);
		this.addCharacteristic(CustomCharacteristic.ResetTotal);
	};	inherits(PowerMeterService, Service);

return CustomCharacteristic;

}
