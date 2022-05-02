sap.ui.define([], function () {
	"use strict";

	return {

		ServiceFormatter: function (sValue) {

			if (sValue !== "") {
				return true;

			} else {
				return false;
			}
		},
		refFormatter: function (sValue) {
			if (sValue) {
				var sId = sValue.substring(0, 4);
				var sYear = sValue.substring(4, sValue.length);
				return sId + "/" + sYear;
			}
			return sValue;

		},
		CheckFormatter: function (sValue) {

			if (sValue === "X") {
				return true;

			} else {
				return false;
			}
		},
		Dateformater: function (sValue) {
			if (sValue !== null) {
				if (sValue !== "") {
					if (sValue !== "0 ") {
						if (sValue.length > 8)
					{	return sValue.substring(0, 4) + '-' + sValue.substring(4, 6) + '-' + sValue.substring(6, 8) + "  " + sValue.substring(8, 10) + ":" +
							sValue.substring(10, 12);}
							else{
								return sValue.substring(0, 4) + '-' + sValue.substring(4, 6) + '-' + sValue.substring(6, 8) ;

							}
					} else {
						return "";
					}
				} else {
					return "";

				}
			}
		}

	};

});