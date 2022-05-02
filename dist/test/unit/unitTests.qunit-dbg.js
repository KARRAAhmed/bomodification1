/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"APAVE/Bu_Ordre_Create/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});