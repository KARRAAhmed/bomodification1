sap.ui.define([
	'sap/base/util/deepExtend',
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	'sap/m/Token',
	'sap/ui/model/FilterOperator',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"com/aymax/apave/sd/BureauOrdre/BureauOrdreModify/model/formatter",
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/ValueState",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	"sap/ui/core/Core",
	"./Utils/MessagesPopOverHandler",
	"sap/m/MessageItem",
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType",
	"./Utils/PjUpdate",
	"../model/models"
], function (deepExtend, Fragment, Filter, Token, FilterOperator, Controller, JSONModel, MessageToast, MessageBox, formatter,
	syncStyleClass, ValueState, Dialog, DialogType, Button, ButtonType, Text, Core, MessagesPopOverHandler, MessageItem, Message,
	MessageType, PjUpdate, models) {
	"use strict";

	return Controller.extend("com.aymax.apave.sd.BureauOrdre.BureauOrdreModify.controller.Main_VIEW", {
		formatter: formatter,
		MsgPopOverHdler: MessagesPopOverHandler,
		pjUpdateHdler: PjUpdate,
		/*Function init should only contain initialisation action
		 */
		onInit: async function () {

			var complete_url = window.location.href;
			//	var complete_url =
			//	"https://vm-devqas-01.k2udssr2mqxubk2kj4pez0misf.ax.internal.cloudapp.net:44300/sap/bc/ui2/flp#ZBureauDordre-manage?Zrefde=06172021";

			var params = complete_url.split("#")[1].split("?");
			if (params) {
				var param_value = params[1].split("=");
				$.sap.refdoc = param_value[1];
			}

			this._wizard = this.byId("CreateProductWizard");
			this._oNavContainer = this.byId("wizardNavContainer");

			this._oWizardContentPage = this.byId("wizardContentPage");
			// $.sap.gv_de = '';
			$.sap.scat_ch = false;
			$.sap.stype_ch = false;

			this.aPjsToDelete = [];

			/*Setting the UIConfig init model */
			models.resetUIConfig.bind(this)()
			var geturl = "/Document_entrantSet('" + $.sap.refdoc + "')";
			/*Setting screen to busy mode*/
			this.getView().setBusy(true);
			/*Getting Main Data*/

			let oMainData = await this.bindMainData(geturl);

			$.sap.docStatus = oMainData.Zstatid;

			this.setUIConfig(oMainData);

			//get Employee list and bind it to the combobox in the table
			await this.bindEmplyeComboBox();

			//get services
			await this.bindServices();

			/*Pj Handling*/
			await this.initAttachedFiles(oMainData);

			/*MessagePopOverHandling*/
			this.initMessageManager();
			/*Setting screen to normal mode*/
			this.getView().setBusy(false);
		},
		initMessageManager: function () {
			this._MessageManager = Core.getMessageManager();
			this.getView().setModel(this._MessageManager.getMessageModel(), "Messages");
		},
		initAttachedFiles: async function (oMainData) {
			// this.getView().byId("pjUploader").setUploadUrl("/sap/opu/odata/sap/ZSDGW_OFFICE_ORDER_APP_SRV/Pieces_jointes");
			this.getView().setModel(new JSONModel({
				"items": [],
				"busy": false
			}), "piecesJointesModel");
			await this.pjUpdateHdler.getPjs.apply(this, [$.sap.refdoc]);
			if (oMainData) {
				this.setPJUIConfig(oMainData);
			}
		},
		bindServices: async function () {
			var service_url = "/Document_entrantSet('" + $.sap.refdoc + "')/DOC_SERVICESSet";
			this.getOwnerComponent().getModel().read(service_url, {
				success: function (oData, response) {
					//Accessing the table from the fragment by it's Id	
					var oTable = this.byId("idProductsTable");
					this.getOwnerComponent().getModel("De_services_model").setData(oData.results);
					oTable.setModel(this.getOwnerComponent().getModel("De_services_model"));
					var oTemplate = oTable.getBindingInfo("items").template;

					oTable.bindAggregation("items", {
						path: "/",
						template: oTemplate
					});
					this.updateEmployeComboEnability(oData.results, oTable);

				}.bind(this),
				error: function (oError) {}
			});
		},
		bindEmplyeComboBox: async function () {
			var oCombobox = this.byId("MultiBoxCategorie");
			this.getOwnerComponent().getModel().read("/EmployeesSet", {
				success: function (oData, response) {
					this.getOwnerComponent().getModel("employee_model").setData(oData.results);
					oCombobox.setModel(this.getOwnerComponent().getModel("employee_model"));
					oCombobox.bindAggregation("items", "/",
						function (id, context) {
							var oItemSelectTemplate = new sap.ui.core.Item({
								key: encodeURI(context.getProperty("Zemp")),
								text: context.getProperty("Zlibemp")
							});
							return oItemSelectTemplate;
						}
					);
				}.bind(this),
				error: function (oError) {}
			});
		},
		bindMainData: async function (sUrl) {
			var that = this;
			return new Promise((resolve, reject) => {
				that.getOwnerComponent().getModel().read(sUrl, {
					success: function (oData) {
						$.sap.doc = oData;
						$.sap.gv_de = oData.Zlibcat;
						// var oViewBindingPath = "/Document_entrantSet('80612021')";
						var oViewBindingPath = "/Document_entrantSet('" + $.sap.refdoc + "')";

						var oViewContext = that.getOwnerComponent().getModel().getContext(oViewBindingPath);
						that.getView().setBindingContext(oViewContext);
						//sous Catégorie
						var ssCategorie = that.getView().byId("subCategoryId");
						var gv_categorie = oData.Zrefcat;
						var gv_scategorie = oData.Zscatref;
						var gv_ss_categorie_label = oData.Zscatref;
						that.getOwnerComponent().getModel().read("/CATEGORYSet('" + gv_categorie + "')/SUB_CATEGORYSet", {
							success: function (oData, response) {
								that.getOwnerComponent().getModel("SubCategorie_model").setData(oData.results);
								ssCategorie.setModel(that.getOwnerComponent().getModel("SubCategorie_model"));
								ssCategorie.bindAggregation("items", "/",
									function (id, context) {
										var oItemSelectTemplate = new sap.ui.core.Item({
											key: encodeURI(context.getProperty("Scatref")),
											text: context.getProperty("Libscat")
										});
										return oItemSelectTemplate;
									}

								);
								ssCategorie.setSelectedKey(gv_ss_categorie_label);

							}.bind(that),
							error: function (oError) {}
						});

						// type d'objet 
						var ssTypeObjet = that.getView().byId("typeObjetId");
						var gv_ss_TypeObjet_REF = oData.Zreftypobj;
						that.getOwnerComponent().getModel().read("/SUB_CATEGORYSet('" + gv_scategorie + "')/SubCategory_TO_TYPEOBJECT", {
							success: function (oData, response) {
								that.getOwnerComponent().getModel("Objet_type_model").setData(oData.results);
								$.sap.obj_typ = oData.results;
								ssTypeObjet.setModel(that.getOwnerComponent().getModel("Objet_type_model"));
								ssTypeObjet.bindAggregation("items", "/",
									function (id, context) {
										var oItemSelectTemplate = new sap.ui.core.Item({
											key: encodeURI(context.getProperty("Reftypobj")),
											text: context.getProperty("Libtypobj")
										});
										return oItemSelectTemplate;
									}
								);
								ssTypeObjet.setSelectedKey(gv_ss_TypeObjet_REF);
							}.bind(that),
							error: function (oError) {}
						});
						resolve(oData);
					},
					error: function (oResponse) {
						reject(oResponse);
					}
				});
			});
		},
		setPJUIConfig: function (oData) {
			if (oData.Zstatid === "002") {
				this.getView().byId("pjUploader").getToolbar().getContent()[2].setEnabled(false);
				this.getView().byId("pjUploader").getItems().forEach(oPj => oPj.setEnableDelete(false));
			}
			if (oData.Zstatid === "005") {
				this.getView().byId("pjUploader").getToolbar().getContent()[2].setEnabled(true);
			}
		},
		setUIConfig: function (oData) {
			if (oData.Zstatid === "002") {
				this.getView().byId("typeObjetId").setEditable(false);
				this.getView().byId("subCategoryId").setEditable(false);
				this.getView().byId("addServiceBt").setEnabled(false);
				// this.getView().byId("pjUploader").setUploadEnabled(false);

			}
			if (oData.Zstatid === "005") {
				this.getView().byId("com").setEditable(true);
				// add by ahmed le 27/08
				this.getView().byId("typeObjetId").setEditable(false);
				this.getView().byId("subCategoryId").setEditable(false);
				this.getView().byId("addServiceBt").setEnabled(false);
				// this.getView().byId("pjUploader").setUploadEnabled(true);
			}
		},
		updateEmployeComboEnability: function (oData, oTable) {
			/*	var sPiloteIndex = oData.findIndex(oDataItem => oDataItem.Ztypepilote === true);
				if (sPiloteIndex > -1) {
					var bHasTypePilote = oData[sPiloteIndex].Ztypepilote;
					if (bHasTypePilote) {
						oTable.getItems()[sPiloteIndex].getCells()[3].setEnabled(!bHasTypePilote);
					}
				}*/
			// 31/08 add by ahmed
			var tPiloteIndex = [];
			var sPiloteIndex;
			oData.forEach((serv, index) => serv.Ztypepilote === true ? tPiloteIndex.push(index) : null)
				//	var sPiloteIndex = oData.findIndex(oDataItem => oDataItem.Ztypepilote === true);
			if (tPiloteIndex.length > 0) {
				for (let i = 0; i < tPiloteIndex.length; i++) {
					sPiloteIndex = tPiloteIndex[i];
					if (sPiloteIndex > -1) {
						var bHasTypePilote = oData[sPiloteIndex].Ztypepilote;
						if (bHasTypePilote) {
							// 01/09 add by ahmed
							if ($.sap.docStatus !== '001' && $.sap.docStatus !== '006') {
								oTable.getItems()[sPiloteIndex].getCells()[3].setEnabled(!bHasTypePilote);
								oTable.getItems()[sPiloteIndex].getCells()[0].setEnabled(!bHasTypePilote);
							}
						}
					}
				}
			}

		},
		/*	onAfterRendering: function () {
				var ssCategorie = this.getView().byId("subCategoryId");
				var gv_doc_id = $.sap.gv_de;

			},*/
		handleWizardUpdate: async function (evt) {
			var that = this;
			if (this.checkInputsErrors()) {
				/*Showing errors in messagePopOver*/
				this.MsgPopOverHdler.ToglleMessagePopOver.apply(this);

			} else {
				var bDocIsChanged = this.prepareDataForSave().bDocIsChanged;
				if (bDocIsChanged == true) {

					this.getView().setBusy(true);
					var oNewDocData = this.prepareDataForSave().oNewDocData;

					let bDeUpdateIsSuccessful = await this.sendAndHandleDeUpdateRequest(oNewDocData);
					if (bDeUpdateIsSuccessful) {

						this.sendAndHandleServicesUpdateRequest();
						this.pjUpdateHdler.uploadFilesFromPC.apply(this, [oNewDocData.Zrefde]);
						// await this.initAttachedFiles();
						that.pjUpdateHdler.refreshPjs.apply(that)

						this.getView().setBusy(false);
						var sSuccesMsg = "Le document " + $.sap.refdoc + " est modifié";
						MessageToast.show(sSuccesMsg);

					} else {
						this.getView().setBusy(false);
						var sSuccesMsg = "Error while updating record - " + err.response.statusText;
						MessageToast.show(sSuccesMsg);
					}
				}
			}
		},
		refreshServicesTables: function () {
			var oTable = this.byId("idProductsTable");
			var service_url = "/Document_entrantSet('" + $.sap.refdoc + "')/DOC_SERVICESSet";
			this.getOwnerComponent().getModel().read(service_url, {
				success: function (oData, response) {
					//Accessing the table from the fragment by it's Id	

					this.getOwnerComponent().getModel("De_services_model").setData(oData.results);
					oTable.setModel(this.getOwnerComponent().getModel("De_services_model"));
					var oTemplate = oTable.getBindingInfo("items").template;

					oTable.bindAggregation("items", {
						path: "/",
						template: oTemplate
					});
					oTable.setBusy(false);

				}.bind(this),
				error: function (oError) {
					oTable.setBusy(false);
					MessageToast.show("Refresh services tables")
				}
			});
		},
		fnUpdateServiceCallback: function (bRequestSuccess) {
			if (bRequestSuccess) {
				/*Refreshing the binding by sending new request to backend*/
				/*At least service table*/
				this.refreshServicesTables();
			}
		},
		deleteService: function (sServiceRef, sZcserv) {
			var oTable = this.byId("idProductsTable");
			oTable.setBusy(true);
			var oMyModel = this.getOwnerComponent().getModel();
			var sDeleteRequestUrL = "/DOC_SERVICESSet(Zcserv='" + sZcserv + "',Zrefde='" + sServiceRef + "')";

			return new Promise((resolve, reject) => {
				oMyModel.remove(sDeleteRequestUrL, {
					success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (oResponse) {
						reject(oResponse);
					}
				});
			});
		},
		handlesuggestionItemSelected: function (oEvent) {
			//	debugger;
			var sObject = oEvent.getParameters().selectedItem.getBindingContext().getObject();
			if (sObject) {
				var sClientName = sObject.ClientName;
				var sContactclient = sObject.Contactclient;
				var sKUNNR = sObject.Kunnr;
				this.getView().byId("Client").setValue(sClientName);
				this.getView().byId("Client").setValue(sKUNNR);
				this.getView().byId("CC").setValue(sContactclient);
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oEvent.getSource().getId()]);
				oEvent.getSource().setValueState("None");
			}

		},
		onSuggest: function (oEvent) {
			var client = oEvent.getSource();
			var clientValue = client.getValue();
			var oItemTemplateClient = client.getBindingInfo("suggestionItems").template;
			var oFiltersClient = [new sap.ui.model.Filter("Expediteur", sap.ui.model.FilterOperator.EQ, clientValue)];
			client.bindAggregation("suggestionItems", {
				path: "/ClientSet",
				template: oItemTemplateClient,
				filters: oFiltersClient
			});
		},
		//on change categorie we get List of sous categorie et nature d'objet
		onChangeCategorieFilter: function (evt) {
			$.sap.cat_ch = true;
			//	$.sap.stype_ch = true;
			var ssCategorie = this.getView().byId("subCategoryId");
			var ssTypeObjet = this.getView().byId("typeObjetId");
			var categoryId = evt.getSource().getSelectedKey();
			if (categoryId) {
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [evt.getSource().getId()]);
				evt.getSource().setValueState("None");
			}
			// delete the model and key
			this.getView().getModel("SubCategorie_model").setData(null);
			ssCategorie.setSelectedKey();
			this.getView().getModel("Objet_type_model").setData(null);
			ssTypeObjet.setSelectedKey();
			ssCategorie.setValue("");
			ssTypeObjet.setValue("");
			this.getOwnerComponent().getModel().read("/CATEGORYSet('" + categoryId + "')/SUB_CATEGORYSet", {
				success: function (oData, response) {
					this.getOwnerComponent().getModel("SubCategorie_model").setData(oData.results);
					ssCategorie.setModel(this.getOwnerComponent().getModel("SubCategorie_model"));
					ssCategorie.bindAggregation("items", "/",
						function (id, context) {
							var oItemSelectTemplate = new sap.ui.core.Item({
								key: encodeURI(context.getProperty("Scatref")),
								text: context.getProperty("Libscat")
							});
							return oItemSelectTemplate;
						}
					);

				}.bind(this),
				error: function (oError) {}
			});
			// this.getOwnerComponent().getModel().read("/CATEGORYSet('" + categoryId + "')/Object_TYPESet", {
			// 	success: function (oData, response) {
			// 		this.getOwnerComponent().getModel("Objet_type_model").setData(oData.results);
			// 		$.sap.obj_typ = oData.results;
			// 		ssTypeObjet.setModel(this.getOwnerComponent().getModel("Objet_type_model"));
			// 		ssTypeObjet.bindAggregation("items", "/",
			// 			function (id, context) {
			// 				var oItemSelectTemplate = new sap.ui.core.Item({
			// 					key: encodeURI(context.getProperty("Scatref")),
			// 					text: context.getProperty("Libtypobj")
			// 				});
			// 				return oItemSelectTemplate;
			// 			}
			// 		);

			// 	}.bind(this),
			// 	error: function (oError) {}
			// });
		},
		handleTableSelectDialogPress: function (oEvent) {
			//get services
			this.getOwnerComponent().getModel().read("/ServicesSet", {
				success: function (oData, response) {
					//Accessing the table from the fragment by it's Id	
					var selected_service = this.getView().getModel("De_services_model").getData();
					var all_services = oData.results;
					var service_to_table = [];
					for (var i = all_services.length - 1; i >= 0; i--) {
						for (var j = 0; j < selected_service.length; j++) {
							if (all_services[i] && (all_services[i].Zcserv === selected_service[j].Zcserv)) {
								all_services.splice(i, 1);
							}
						}
					}
					var oTable = this.byId("myDialog");
					this.getOwnerComponent().getModel("services_model").setData(all_services);
					oTable.setModel(this.getOwnerComponent().getModel("services_model"));
					var oTemplate = oTable.getBindingInfo("items").template;

					oTable.bindAggregation("items", {
						path: "/",
						template: oTemplate
					});

				}.bind(this),
				error: function (oError) {}
			});
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "com.aymax.apave.sd.BureauOrdre.BureauOrdreModify.fragment.ListService",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._pDialog.then(function (oDialog) {
				this._configDialog(oButton, oDialog);
				oDialog.open();
			}.bind(this));
		},

		_configDialog: function (oButton, oDialog) {
			// Set draggable property
			var bDraggable = oButton.data("draggable");
			oDialog.setDraggable(bDraggable == "true");

			// Set resizable property
			var bResizable = oButton.data("resizable");
			oDialog.setResizable(bResizable == "true");

			// Multi-select if required
			var bMultiSelect = !!oButton.data("multi");
			oDialog.setMultiSelect(bMultiSelect);

			// Remember selections if required
			var bRemember = !!oButton.data("remember");
			oDialog.setRememberSelections(bRemember);

			var sResponsivePadding = oButton.data("responsivePadding");
			var sResponsiveStyleClasses =
				"sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";

			if (sResponsivePadding) {
				oDialog.addStyleClass(sResponsiveStyleClasses);
			} else {
				oDialog.removeStyleClass(sResponsiveStyleClasses);
			}

			// Set custom text for the confirmation button
			var sCustomConfirmButtonText = oButton.data("confirmButtonText");
			oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
		},

		handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Zlibserv", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleClose: function (oEvent) {

			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts && aContexts.length) {
				var selected_service = this.getView().getModel("De_services_model").getData();
				for (var z = 0; z < aContexts.length; z++) {
					var service = {};
					service.Zcserv = aContexts[z].getObject().Zcserv;
					service.Zlibserv = aContexts[z].getObject().Zlibserv;
					service.Zrefde = $.sap.doc.Zrefde;
					service.Ztypepilote = false;
					service.Ztypeselection = true;
					service.Zemployee = "";
					service.New = true;
					selected_service.push(service);

				}
				this.getView().getModel("De_services_model").setData(selected_service);
			}

		},
		onAfterRendering: function () {
			var that = this;
			// this.getView().byId("pjUploader").getToolbar().getTitleControl().setBusy(true);
			// this.getView().byId("pjUploader").destroyItems();
			// this.getView().byId("pjUploader").getToolbar().getTitleControl().setText(this.getOwnerComponent().getModel("i18n").getProperty(
			// "Coverphoto"));
			// this.getView().byId("pjUploader").getToolbar().getTitleControl().setBusy(false);
			this.getView().byId("CreateProductWizard")._getNextButton().setText(this.getOwnerComponent().getModel("i18n").getProperty(
				"AffecterServices"));
			//Handle onAfaterRedering of the service table
			var oTable = this.getView().byId('idProductsTable');
			oTable.addEventDelegate({
				onAfterRendering: function (evt) {
					var aFilter = "";
					var oList = "";
					//get Table Items
					var aItems = oTable.getItems();
					for (var i = 0; i < aItems.length; i++) {
						//get the service of the Item and add it to the filter
						var oService = aItems[i].getBindingContext().getProperty("Zcserv");
						var sEmplyee = aItems[i].getBindingContext().getProperty("Zemployee");
						aFilter = [new sap.ui.model.Filter("Zcserv", sap.ui.model.FilterOperator.EQ, oService)];
						//get the list of the employees
						oList = aItems[i].getCells()[3];
						//Filter on the list
						var oBinding = oList.getBinding("items");
						oBinding.filter(aFilter);
						oList.setSelectedKeys(sEmplyee.split(","));
					}
				}
			});
		},
		onEmployeAfterSelection: function (oEvent) {
			var oMultiBox = oEvent.getSource(),
				sEmployeesToUpdate = oMultiBox.getSelectedKeys().filter(e => e).join(",");
			/*Find witch services i m updating  by service key*/
			var sService = oMultiBox.getParent().getBindingContext().getProperty("Zcserv"),
				aServices = this.getView().getModel("De_services_model").getData();
			var oServiceToUpdateIndex = aServices.findIndex((oService) => oService.Zcserv === sService);
			this.getView().getModel("De_services_model").getData()[oServiceToUpdateIndex].Zemployee = sEmployeesToUpdate;
			if (sEmployeesToUpdate !== "")
			{
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, ["selection_msg"]);
			}

		},
		checkInputsErrors: function () {
			var bErrorsExists = false;
			this.checkWizardStepOneErrors();
			this.checkWizardStepTwoErrors();

			var aErrorMsgs = this._MessageManager.getMessageModel().getData().filter(oMsg => oMsg.type === MessageType.Error);

			if (aErrorMsgs.length > 0) {
				bErrorsExists = true;
			}
			return bErrorsExists;
		},
		checkWizardStepOneErrors: function () {
			this.checkMandatoryFieldById("CategoryId");
			this.checkMandatoryFieldById("subCategoryId");
			this.checkMandatoryFieldById("natureRecId");
			var ssCategorie = this.getView().byId("subCategoryId");
			if (ssCategorie.getSelectedItem().getText() !== 'AUTRES') {
				this.checkMandatoryFieldById("typeObjetId");
			}
			// this.checkMandatoryFieldById("typeObjetId");
			this.checkMandatoryFieldById("Ex");
		},
		checkWizardStepTwoErrors: function () {
			this.checkAtLeastOnePiloteIsSelected();
			this.checkAtLeastOneSelectionIsSelected();
		},
		checkAtLeastOnePiloteIsSelected: function () {
			var oErrorMsg = {};
			var bPiloteServiceSelected = false;
			var oTable = this.getView().byId("idProductsTable");
			for (var i = 0; i < oTable.getItems().length; i++) {
				var oContext = oTable.getItems()[i].getBindingContext().getObject();
				if (oContext.Ztypepilote && oContext.Zemployee !== '') {
					bPiloteServiceSelected = true;
					//delete oErrorMsg ; 
					this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oTable.getId()]);
					break;
				}
			}
			if (!bPiloteServiceSelected) {
				var that = this;
				oErrorMsg = {
					sMsgTitle: "Service Pilote",
					sMsgType: MessageType.Error,
					sAddText: "Un Service Pilote doit être selectionnné",
					sTarget: oTable.getId(),
					oProcessor: that.getView().getModel(),
					code: "SecondStep"
				};
				that.MsgPopOverHdler.addMessageWithTarget.apply(this, [oErrorMsg])
			}
		},
		checkAtLeastOneSelectionIsSelected: function () {
				debugger;
			var that = this,
				oErrorMsg = {},
				oTable = this.getView().byId("idProductsTable"),
				sPiloteIndex = -1;
			for (var i = 0; i < oTable.getItems().length; i++) {
				var oContext = oTable.getItems()[i].getBindingContext().getObject();
				if (oContext.Ztypeselection) {
					sPiloteIndex = i;
					var aPiloteEmployees = oTable.getItems()[sPiloteIndex].getBindingContext().getObject().Zemployee;
					//var bAtleastOneEmployeeIsSelected = aPiloteEmployees.length > 0;
					if (aPiloteEmployees === "") {
						oErrorMsg = {
							sMsgTitle: "Service Seléction : Employés",
							sMsgType: MessageType.Error,
							sAddText: "Un Service Seléction doit être avoir au moins un employé",
							sTarget: "selection_msg",
							oProcessor: that.getView().getModel(),
							code: "SecondStep"
						};
						that.MsgPopOverHdler.addMessageWithTarget.apply(this, [oErrorMsg]);
						oTable.getItems()[sPiloteIndex].getCells()[3].setValueState("Error");
					}
				}
			}
		},
		checkMandatoryFieldById: function (sId) {
			var that = this;
			var oErrorMsg = {};
			var oInput = this.getView().byId(sId);
			if (oInput.getEnabled()) {
				var sInputType = oInput.getMetadata().getName();
				switch (sInputType) {
				case "sap.m.ComboBox":
					var sSelectedValue = oInput.getSelectedKey() || oInput.getValue();
					if (!sSelectedValue) {
						oErrorMsg = {
							sMsgTitle: oInput.getParent().getLabel().getText(),
							sMsgType: MessageType.Error,
							sAddText: "Ce Champs est obligatoire",
							sTarget: oInput.getId(),
							oProcessor: that.getView().getModel(),
							code: "FirstStep"
						};
						that.MsgPopOverHdler.addMessageWithTarget.apply(this, [oErrorMsg])
					}
					// 
					break;
				case "sap.m.Input":
					var sValue = oInput.getValue();
					if (!sValue) {
						oErrorMsg = {
							sMsgTitle: oInput.getParent().getLabel().getText(),
							sMsgType: MessageType.Error,
							sAddText: "Ce Champs est obligatoire",
							sTarget: oInput.getId(),
							oProcessor: that.getView().getModel(),
							code: "FirstStep"
						};
						that.MsgPopOverHdler.addMessageWithTarget.apply(this, [oErrorMsg])
						break;
					}
				default:
					// code block
				}
			}

		},
		onChangeSubCategorie: function (oEvent) {
			$.sap.stype_ch = true;
			var ssTypeObjet = this.getView().byId("typeObjetId");
			var sSubCategoryId = oEvent.getSource().getSelectedKey();
			if (sSubCategoryId) {
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oEvent.getSource().getId()]);
				oEvent.getSource().setValueState("None");
			}
			this.getView().getModel("Objet_type_model").setData(null);
			ssTypeObjet.setSelectedKey();
			ssTypeObjet.setValue("");
			this.getOwnerComponent().getModel().read("/SUB_CATEGORYSet('" + sSubCategoryId + "')/SubCategory_TO_TYPEOBJECT", {
				success: function (oData, response) {
					this.getOwnerComponent().getModel("Objet_type_model").setData(oData.results);
					$.sap.obj_typ = oData.results;
					ssTypeObjet.setModel(this.getOwnerComponent().getModel("Objet_type_model"));
					ssTypeObjet.bindAggregation("items", "/",
						function (id, context) {
							var oItemSelectTemplate = new sap.ui.core.Item({
								key: encodeURI(context.getProperty("Scatref")),
								text: context.getProperty("Libtypobj")
							});
							return oItemSelectTemplate;
						}
					);

				}.bind(this),
				error: function (oError) {}
			});
		},
		onChangeNatureRec: function (oEvent) {
			var sNatureRec = oEvent.getSource().getSelectedKey();
			if (sNatureRec) {
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oEvent.getSource().getId()]);
				oEvent.getSource().setValueState("None");
			}
		},
		onChangeTypeObj: function (oEvent) {
			var sTypeObj = oEvent.getSource().getSelectedKey();
			if (sTypeObj) {
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oEvent.getSource().getId()]);
				oEvent.getSource().setValueState("None");
			}
		},
		addCreatedDocSuccesMsg: function (sCreatedId) {

			var oProcessor = this.getView().getModel();
			this._MessageManager.addMessages(
				new Message({
					message: "Succès de création",
					type: MessageType.Success,
					additionalText: "le Document " + sCreatedId + " a éte crée avec succès",
					target: sCreatedId,
					processor: oProcessor,
					code: "DocCreated"
				})
			);
			this.getView().byId("messagePopoverBtn").setBusy(true);
			setTimeout(function () {
				this.getView().byId("messagePopoverBtn").firePress();
			}.bind(this), 100);
			this.getView().byId("messagePopoverBtn").setBusy(false);
			this.getView().byId("CreateProductWizard").goToStep(this.getView().byId("FirstStep"));

		},
		prepareDataForSave: function () {
			var that = this;
			var update = true;
			var oDe = this.getView()._getBindingContext().getObject();
			var ObjectUpdate = {};
			ObjectUpdate.Zrefde = oDe.Zrefde;
			ObjectUpdate.Zstatde = oDe.Zstatde;
			var sCategorie = this.getView().byId("CategoryId");
			if (sCategorie.getSelectedKey() === '') {
				ObjectUpdate.Zrefcat = oDe.Zrefcat;
				ObjectUpdate.Zlibcat = oDe.Zlibcat;
			} else {
				ObjectUpdate.Zrefcat = sCategorie.getSelectedKey();
				ObjectUpdate.Zlibcat = sCategorie._getSelectedItemText();
			}
			var ssCategorie = this.getView().byId("subCategoryId");
			if (ssCategorie.getSelectedKey() === '') {
				ObjectUpdate.Zscatref = oDe.Zscatref;
				ObjectUpdate.Zlibscat = oDe.Zlibscat;
				if ($.sap.cat_ch === true) {
					ObjectUpdate.Zscatref = "";
					ObjectUpdate.Zlibscat = "";
				}
			} else {
				ObjectUpdate.Zscatref = ssCategorie.getSelectedKey();
				ObjectUpdate.Zlibscat = ssCategorie._getSelectedItemText();
			}

			var ssTypeObjet = this.getView().byId("typeObjetId");
			if (ssTypeObjet.getSelectedKey() === '') {
				ObjectUpdate.Zreftypobj = oDe.Zreftypobj;
				ObjectUpdate.Zlibtypobj = oDe.Zlibtypobj;
				if ($.sap.stype_ch === true) {
					ObjectUpdate.Zreftypobj = "";
					ObjectUpdate.Zlibtypobj = "";
				}
			} else {
				ObjectUpdate.Zreftypobj = ssTypeObjet.getSelectedKey();
				ObjectUpdate.Zlibtypobj = ssTypeObjet._getSelectedItemText();
				for (var k = 0; k < $.sap.obj_typ.length; k++) {
					if ($.sap.obj_typ[k].Libtypobj == ObjectUpdate.Zlibtypobj) {
						ObjectUpdate.Zreftypobj = $.sap.obj_typ[k].Reftypobj;
					}

				}
			}
			if (ObjectUpdate.Zlibscat !== "") {
				$.sap.cat_ch = false;
			}
			if (ObjectUpdate.Zlibtypobj !== "") {
				$.sap.stype_ch = false;
			}

			var ssNatureRec = this.getView().byId("natureRecId");

			if (ssNatureRec.getSelectedKey() === '') {
				ObjectUpdate.Zrefnr = oDe.Zrefnr;
				ObjectUpdate.ZlibNr = oDe.ZlibNr;
			} else {

				ObjectUpdate.Zrefnr = ssNatureRec.getSelectedKey();
				ObjectUpdate.ZlibNr = ssNatureRec._getSelectedItemText();

			}
			/*Date D'arrive handling in case empty*/
			var sDataArriveValue = this.byId("D1").getDateValue() ? this.byId("D1").getDateValue().toLocaleDateString() : "";
			var sDataArrive = "";
			if (sDataArriveValue.length > 0) {
				sDataArrive = sDataArriveValue.substr(6) +
					sDataArriveValue.substr(3, 2) +
					sDataArriveValue.substr(0, 2);
			}
			ObjectUpdate.Zdar = sDataArrive;

			/*Date D'emission handling in case empty*/
			var sDateEmissionValue = this.byId("D2").getDateValue() ? this.byId("D2").getDateValue().toLocaleDateString() : "";
			var sDataEmission = "";
			if (sDateEmissionValue.length > 0) {
				sDataEmission = sDateEmissionValue.substr(6) +
					sDateEmissionValue.substr(3, 2) +
					sDateEmissionValue.substr(0, 2);
			}
			ObjectUpdate.Zdem = sDataEmission;
			/*if (this.byId("D2").getDateValue()) {
				ObjectUpdate.Zdem = this.byId("D2").getDateValue().toLocaleDateString().substr(6) + this.byId("D2").getDateValue().toLocaleDateString()
					.substr(3, 2) + this.byId("D2").getDateValue().toLocaleDateString().substr(0, 2);
			}*/

			/*Date D'echeance handling in case empty*/
			var sDateEcheanceValue = this.byId("D3").getDateValue() ? this.byId("D3").getDateValue().toLocaleDateString() : "";
			var sDataEcheance = "";
			if (sDateEcheanceValue.length > 0) {
				sDataEcheance = sDateEcheanceValue.substr(6) +
					sDateEcheanceValue.substr(3, 2) +
					sDateEcheanceValue.substr(0, 2);
			}
			ObjectUpdate.Zdec = sDataEcheance;

			/*Date D'Expédition handling in case empty*/
			var sDateExpeditionValue = this.byId("D4").getDateValue() ? this.byId("D4").getDateValue().toLocaleDateString() : "";
			var sDateExpedition = "";
			if (sDateExpeditionValue.length > 0) {
				sDateExpedition = sDateExpeditionValue.substr(6) +
					sDateExpeditionValue.substr(3, 2) +
					sDateExpeditionValue.substr(0, 2);
			}
			ObjectUpdate.Zdexp = sDateExpedition;

			// ObjectUpdate.Zdec = this.byId("D3").getDateValue().toLocaleDateString().substr(6) + this.byId("D3").getDateValue().toLocaleDateString()
			// 	.substr(3, 2) + this.byId("D3").getDateValue().toLocaleDateString().substr(0, 2);

			if (this.byId("Zdi").getSelected() === true) {
				ObjectUpdate.Zdi = "X";
			} else {
				ObjectUpdate.Zdi = "";
			}
			if (this.byId("Zdu").getSelected() === true) {
				ObjectUpdate.Zdu = "X";
			} else {
				ObjectUpdate.Zdu = "";
			}
			if (this.byId("Zdc").getSelected() === true) {
				ObjectUpdate.Zdc = "X";
			} else {
				ObjectUpdate.Zdc = "";
			}
			ObjectUpdate.Zcom = oDe.Zcom;

			// expéditeur id="Ex"
			ObjectUpdate.Zlibclient = oDe.Zlibclient;
			// client id="Client"
			ObjectUpdate.Zclient = oDe.Zclient;
			// Montant 
			ObjectUpdate.Amount = oDe.Amount;
			// Institution de paie
			ObjectUpdate.InstitutionDePaie = oDe.InstitutionDePaie;
			// Ref Exp
			ObjectUpdate.RefExp = oDe.RefExp;
			// Ref APAVE
			ObjectUpdate.RefApave = oDe.RefApave;
			ObjectUpdate.RefPpaie = oDe.RefPpaie;
			//Pour le compte de 
			ObjectUpdate.ZcomptId = oDe.ZcomptId;

			//Nature de reglement
			ObjectUpdate.ZrefNreg = oDe.ZrefNreg;
			return {
				bDocIsChanged: update,
				oNewDocData: ObjectUpdate
			};
		},
		sendAndHandleDeUpdateRequest: async function (oNewPayLoad) {
			return new Promise((reslove, reject) => {
				var updateurl = "/Document_entrantSet('" + oNewPayLoad.Zrefde + "')";
				this.getOwnerComponent().getModel().update(updateurl, oNewPayLoad, {
					success: function (oData, oResponse) {

						// that.pjUpdateHdler.uploadFilesFromPC.apply(that, [ObjectUpdate.Zrefde]);
						// that.pjUpdateHdler.getPjs.apply(that, [ObjectUpdate.Zrefde]);

						// var sSuccesMsg = "Record Updated Successfully...";
						// MessageToast.show(sSuccesMsg);
						reslove(true);
					},
					error: function (err, oResponse) {
						// var sSuccesMsg = "Error while updating record - " + err.response.statusText;
						// MessageToast.show(sSuccesMsg);
						reject(false);
					}
				});
			});
		},
		sendAndHandleServicesUpdateRequest: async function () {
			$.sap.doc.selected_service = this.getView().getModel("De_services_model").getData();
			var aSelectedServices = $.sap.doc.selected_service;
			for (var x = 0; x < aSelectedServices.length; x++) {
				var service = {};
				service.Zcserv = aSelectedServices[x].Zcserv;
				service.Zrefde = aSelectedServices[x].Zrefde;
				service.Zlibserv = aSelectedServices[x].Zlibserv;
				service.Ztypepilote = aSelectedServices[x].Ztypepilote;
				service.Zemployee = aSelectedServices[x].Zemployee;
				service.Ztypeselection = aSelectedServices[x].Ztypeselection;
				var updateurlServ = "/DOC_SERVICESSet(Zcserv='" + service.Zcserv + "',Zrefde='" + $.sap.doc.Zrefde + "')";
				if (aSelectedServices[x].hasOwnProperty("New")) {
					if (service.Ztypepilote || service.Ztypeselection) {
						this.getOwnerComponent().getModel().create("/DOC_SERVICESSet", service);
						this.refreshServicesTables();
					}
				} else if (!service.Ztypepilote && !service.Ztypeselection) {
					/*Here were going to delete the line*/
					this.deleteService($.sap.doc.Zrefde, service.Zcserv)
						.then(oSucces => that.fnUpdateServiceCallback(true))
						.catch(oError => that.fnUpdateServiceCallback(false));

				} else {
					this.getOwnerComponent().getModel().update(updateurlServ, service);
					this.refreshServicesTables();
				}
			}
		},
		onPiloteSelected: function (oEvent) {
			var selectedService = oEvent.getSource().getBindingContext().getObject().Zcserv;
			var employeComponent = this.getView().byId("MultiBoxCategorie");
			var oTable = this.getView().byId("idProductsTable");
			if (oEvent.getParameter("selected")) {
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oTable.getId()]);
				for (var i = 0; i < oTable.getItems().length; i++) {
					var oItem = oTable.getItems()[i];
					if (oItem.getBindingContext().getObject().Zcserv === selectedService) {
						oItem.getCells()[1].setEnabled(false);
						oItem.getCells()[1].setSelected(false);
						oItem.getCells()[3].setEnabled(true);
					}
				}
			} else {
				for (var j = 0; j < oTable.getItems().length; j++) {
					var oItem1 = oTable.getItems()[j];
					if (oItem1.getBindingContext().getObject().Zcserv === selectedService) {
						oItem1.getCells()[1].setEnabled(true);
						oItem1.getCells()[3].setEnabled(false);
					}
				}
			}
		},
		onServiceSelectionSelected: function (oEvent) {

			if (oEvent.getParameter("selected")) {
				oEvent.getSource().getParent().getCells()[3].setEnabled(true);

			} else {
				oEvent.getSource().getParent().getCells()[3].setEnabled(false);

			}
		},

	});
});