sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/m/MessagePopover",
	"sap/m/MessageItem",
	"sap/ui/core/Core",
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType",
	"sap/m/UploadCollectionItem",
	"sap/m/MessageBox"
], function (Fragment, MessagePopover, MessageItem, Core, Message, MessageType, UploadCollectionItem, MessageBox) {
	"use strict";

	var PjHandlerModule = {
		onBeforeUploadStarts: function (oEvent) {
			var sNewDocRef = this.sNewDocId;
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

			var oModel = this.getView().getModel();

			oModel.refreshSecurityToken();

			var oHeaders = oModel.oHeaders;

			var sToken = oHeaders["x-csrf-token"];

			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({

				name: "x-csrf-token",

				value: sToken

			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);
			var oCustomerHeaderDocId = new sap.m.UploadCollectionParameter({

				name: "slug",

				value: "Zrefde=" + sNewDocRef

			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderDocId);

		},
		onUploadComplete: function (oEvent) {
			var oUploadCollection = this.getView().byId("pjUploader");
			if (oUploadCollection._aFileUploadersForPendingUpload.length === 0) {
				this.getOwnerComponent().getEventBus().publish("BoChannel", "uploadComplete");
			}
		},
		uploadFilesFromPC: async function (sDocRef) {
			this.sNewDocId = sDocRef;
			var oUploadCollection = this.getView().byId("pjUploader");
			oUploadCollection.upload();
			this.pjUpdateHdler.refreshPjs.apply(this)
		},
		refreshPjs: function () {

			var that = this,
				sZrefDe = this.getView().getBindingContext().getProperty("Zrefde"),
				sPjRequestUrl = "/Document_entrantSet('" + sZrefDe + "')/ToPiecesJointes";

			this.getView().byId("pjUploader").setBusy(true);

			var dataModel = this.getView().getModel("piecesJointesModel");
			if (dataModel) {
				dataModel.setData(null);
				dataModel.updateBindings(true);
			}

			that.getOwnerComponent().getModel().read(sPjRequestUrl, {
				success: function (oResponse) {
					that.getView().getModel("piecesJointesModel").setData(oResponse.results);
					that.getView().byId("pjUploader").setBusy(false);
				},
				error: function (oResponse) {
					that.getView().byId("pjUploader").setBusy(false);
				}
			});

		},
		getPjs: async function (sDocRef) {
			var that = this,
				sPjRequestUrl = "/Document_entrantSet('" + sDocRef + "')/ToPiecesJointes";

			this.getView().byId("pjUploader").setBusy(true);
			return new Promise((resolve, reject) => {
				that.getOwnerComponent().getModel().read(sPjRequestUrl, {
					success: function (oResponse) {
						that.getView().getModel("piecesJointesModel").setData(oResponse.results);
						that.getView().getModel("piecesJointesModel").refresh();
						that.getView().byId("pjUploader").setBusy(false);
						resolve();
					},
					error: function (oResponse) {
						reject(oResponse);
						that.getView().byId("pjUploader").setBusy(false);
					}
				});
			});
		},
		upDateFilesFromPc: function (sDocRef) {
			this.sNewDocId = sDocRef;
			var aInitialPjs = this.getView().getModel("piecesJointesModel").getData();
			/*Were going to update === delete + create*/
			var oUploadCollection = this.getView().byId("pjUploader");
			oUploadCollection.upload();
		},
		onPjDelete: async function (oEvent) {
			var that = this;
			var sFileName = oEvent.getSource().getFileName(),
				sZrefDe = this.getView().getBindingContext().getProperty("Zrefde");
			await this.pjUpdateHdler.confirmDeletePj.apply(this, [oEvent.getSource().getFileName()]);

			this.getView().byId("pjUploader").setBusy(true);
			this.getOwnerComponent().getModel().callFunction("/deleteDePjs", {
				method: "POST",
				urlParameters: {
					"file_name": sFileName,
					"Zrefde": sZrefDe
				},

				success: function (oResponse) {
					that.getView().byId("pjUploader").setBusy(false);
					that.pjUpdateHdler.refreshPjs.apply(that)
				},
				error: function (oResponse) {
					that.getView().byId("pjUploader").setBusy(false);
				}
			});
		},
		confirmDeletePj: async function () {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var that = this;
			return new Promise(function (resolve, reject) {
				MessageBox.confirm(i18n.getText("ConfirmDelete"), {
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					actions: [i18n.getText("Oui"), i18n.getText("Non")],
					onClose: (function (sAction) {
						if (sAction === "Oui") {
							resolve();
						} else {
							reject();
						}
					})
				});
			});
		},
		deletePjs: async function () {
			var sFilesNames = this.aPjsToDelete.join(";");
			var sZrefDe = this.getView().getBindingContext().getProperty("Zrefde");
			var oMyModel = this.getOwnerComponent().getModel();
			return new Promise((resolve, reject) => {
				if (this.aPjsToDelete.length > 0) {
					oMyModel.callFunction("/deleteDePjs", {
						method: "POST",
						urlParameters: {
							"file_name": sFilesNames,
							"Zrefde": sZrefDe
						},

						success: function (oResponse) {
							resolve(true);
						},
						error: function (oResponse) {
							reject(false);
						}
					});
				} else {
					resolve(true);
				}

			});
		}
	};
	return PjHandlerModule;
});