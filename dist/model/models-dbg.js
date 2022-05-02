sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		resetUIConfig: function () {
			var oUIConfig = this.getOwnerComponent().getModel("UIConfig");
			var sJSONPath = jQuery.sap.getModulePath("com.aymax.apave.sd.BureauOrdre.BureauOrdreModify", "/model/UIConfig.json");
			oUIConfig.loadData(sJSONPath, false);
		}

	};
});