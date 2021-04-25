var Service, Characteristic
//var sprintf = require("sprintf-js").sprintf;
var inherits = require('util').inherits;
//var correctingInterval = require('correcting-interval');

//Initialize
module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
//	UUIDGen = homebridge.hap.uuid;
//	FakeGatoHistoryService = require('fakegato-history')(homebridge);

    var CustomCharacteristic = {};

	CurrentPowerConsumption = function () {
//		Characteristic.call(this, 'Consumption', CustomCharacteristic.CurrentPowerConsumption.UUID);
		Characteristic.call(this, 'Consumption', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.UINT16,
			unit: "Watt",
			maxValue: 100000,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	CurrentPowerConsumption.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52';
	inherits(CurrentPowerConsumption, Characteristic);

	DailyConsumption = function () {
//		Characteristic.call(this, 'Energy', CustomCharacteristic.DailyConsumption.UUID);
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
//	CustomCharacteristic.DailyConsumption.UUID = 'E863F10C-079E-48FF-8F27-9C2605A29F52';
	inherits(DailyConsumption, Characteristic);

	ResetTotal = function () {
		Characteristic.call(this, 'Reset', 'E863F112-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.UINT32,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	};
	//CustomCharacteristic.ResetTotal.UUID = 'E863F112-079E-48FF-8F27-9C2605A29F52';
	inherits(ResetTotal, Characteristic);

	PowerMeterService = function (displayName, subtype) {
		Service.call(this, displayName, '00000001-0000-1777-8000-775D67EC4377', subtype);
		this.addCharacteristic(PowerConsumption);
		this.addCharacteristic(DailyConsumption);
		this.addCharacteristic(ResetTotal);
	};	inherits(PowerMeterService, Service);

   // return CustomCharacteristic;

}
