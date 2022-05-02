/*global QUnit*/

sap.ui.define([
	"APAVE/Bu_Ordre_Create/controller/Main_VIEW.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Main_VIEW Controller");

	QUnit.test("I should test the Main_VIEW controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});