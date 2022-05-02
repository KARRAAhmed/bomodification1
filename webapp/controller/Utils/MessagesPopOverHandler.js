sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/m/MessagePopover",
	"sap/m/MessageItem",
	"sap/ui/core/Core",
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType"
], function (Fragment, MessagePopover, MessageItem, Core, Message, MessageType) {
	"use strict";

	var MsgHandlerModule = {
		/*Message popOver handling*/
		handleMessagePopoverPress: function (oEvent) {
			if (!this.oMP) {
				this.MsgPopOverHdler.createMessagePopOver.apply(this);
			}
			this.oMP.toggle(oEvent.getSource());
		},
		createMessagePopOver: function () {
			var that = this;
			this.oMP = new MessagePopover({
				activeTitlePress: function (oEvent) {
					var oItem = oEvent.getParameter("item");
					var oMessage = oItem.getBindingContext("Messages").getObject();
					if (oMessage.code === "DocCreated") {

						/*
						var sNewDocId = oMessage.target;
						there you go, you have the new doc id 
						use it to nav to other apps
						*/
					} else {
						if (oMessage.code !== "SecondStep") {
							var oControl = that.getView().byId(oMessage.target);
							oControl.setValueState("Error");
						}
						that.MsgPopOverHdler.navigateToWizardStep.apply(that, [oMessage]);
					}

				},
				items: {
					path: "Messages>/",
					template: new MessageItem({
						title: "{Messages>message}",
						subtitle: "{Messages>additionalText}",
						type: "{Messages>type}",
						description: "{Messages>description}",
						groupName: {
							parts: [{
								path: "Messages>"
							}],
							formatter: this.MsgPopOverHdler.getGroupName
						},
						activeTitle: true
					})
				}
			});

			this.oMP._oMessageView.setGroupItems(true);
			this.getView().byId("messagePopoverBtn").addDependent(this.oMP);

		},
		navigateToWizardStep: function (oMsg) {
			this.getView().byId("CreateProductWizard").goToStep(this.getView().byId(oMsg.code));
			this.oMP.close();
		},
		getGroupName: function (oMsg) {
			var sGroupeName = "";
			switch (oMsg.code) {
			case "FirstStep":
				sGroupeName = "CREATION";
				break;
			case "SecondStep":
				sGroupeName = "AFFECTATION";
				break;
			default:
				// code block
			}
			return sGroupeName;
		},
		addMessageWithTarget: function (oMsgToAdd) {
			this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oMsgToAdd.sTarget]);
			this._MessageManager.addMessages(
				new Message({
					message: oMsgToAdd.sMsgTitle,
					type: oMsgToAdd.sMsgType,
					description: oMsgToAdd.sMsgDescription,
					additionalText: oMsgToAdd.sAddText,
					target: oMsgToAdd.sTarget,
					processor: oMsgToAdd.oProcessor,
					code: oMsgToAdd.code
				})
			);
		},
		removeMsgWithTarget: function (sTarget) {
			this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
				if (oMessage.target === sTarget) {
					this._MessageManager.removeMessages(oMessage);
				}
			}.bind(this));
		},
		removeAllMsgsByType: function (sType) {
			this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
				if (oMessage.type === sType) {
					this._MessageManager.removeMessages(oMessage);
				}
			}.bind(this));
		},
		ToglleMessagePopOver: function () {
			this.getView().byId("messagePopoverBtn").setBusy(true);
			setTimeout(function () {
				this.getView().byId("messagePopoverBtn").firePress();
			}.bind(this), 100);
			this.getView().byId("messagePopoverBtn").setBusy(false);
		}

	};
	return MsgHandlerModule;
});