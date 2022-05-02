sap.ui.define(["sap/base/util/deepExtend","sap/ui/core/Fragment","sap/ui/model/Filter","sap/m/Token","sap/ui/model/FilterOperator","sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/m/MessageToast","sap/m/MessageBox","com/aymax/apave/sd/BureauOrdre/BureauOrdreModify/model/formatter","sap/ui/core/syncStyleClass","sap/ui/core/ValueState","sap/m/Dialog","sap/m/DialogType","sap/m/Button","sap/m/ButtonType","sap/m/Text","sap/ui/core/Core","./Utils/MessagesPopOverHandler","sap/m/MessageItem","sap/ui/core/message/Message","sap/ui/core/MessageType","./Utils/PjUpdate","../model/models"],function(e,t,s,r,a,i,o,n,d,g,l,c,p,u,h,f,b,v,y,m,S,I,C,M){"use strict";return i.extend("com.aymax.apave.sd.BureauOrdre.BureauOrdreModify.controller.Main_VIEW",{formatter:g,MsgPopOverHdler:y,pjUpdateHdler:C,onInit:async function(){var e=window.location.href;var t=e.split("#")[1].split("?");if(t){var s=t[1].split("=");$.sap.refdoc=s[1]}this._wizard=this.byId("CreateProductWizard");this._oNavContainer=this.byId("wizardNavContainer");this._oWizardContentPage=this.byId("wizardContentPage");$.sap.scat_ch=false;$.sap.stype_ch=false;this.aPjsToDelete=[];M.resetUIConfig.bind(this)();var r="/Document_entrantSet('"+$.sap.refdoc+"')";this.getView().setBusy(true);let a=await this.bindMainData(r);$.sap.docStatus=a.Zstatid;this.setUIConfig(a);await this.bindEmplyeComboBox();await this.bindServices();await this.initAttachedFiles(a);this.initMessageManager();this.getView().setBusy(false)},initMessageManager:function(){this._MessageManager=v.getMessageManager();this.getView().setModel(this._MessageManager.getMessageModel(),"Messages")},initAttachedFiles:async function(e){this.getView().setModel(new o({items:[],busy:false}),"piecesJointesModel");await this.pjUpdateHdler.getPjs.apply(this,[$.sap.refdoc]);if(e){this.setPJUIConfig(e)}},bindServices:async function(){var e="/Document_entrantSet('"+$.sap.refdoc+"')/DOC_SERVICESSet";this.getOwnerComponent().getModel().read(e,{success:function(e,t){var s=this.byId("idProductsTable");this.getOwnerComponent().getModel("De_services_model").setData(e.results);s.setModel(this.getOwnerComponent().getModel("De_services_model"));var r=s.getBindingInfo("items").template;s.bindAggregation("items",{path:"/",template:r});this.updateEmployeComboEnability(e.results,s)}.bind(this),error:function(e){}})},bindEmplyeComboBox:async function(){var e=this.byId("MultiBoxCategorie");this.getOwnerComponent().getModel().read("/EmployeesSet",{success:function(t,s){this.getOwnerComponent().getModel("employee_model").setData(t.results);e.setModel(this.getOwnerComponent().getModel("employee_model"));e.bindAggregation("items","/",function(e,t){var s=new sap.ui.core.Item({key:encodeURI(t.getProperty("Zemp")),text:t.getProperty("Zlibemp")});return s})}.bind(this),error:function(e){}})},bindMainData:async function(e){var t=this;return new Promise((s,r)=>{t.getOwnerComponent().getModel().read(e,{success:function(e){$.sap.doc=e;$.sap.gv_de=e.Zlibcat;var r="/Document_entrantSet('"+$.sap.refdoc+"')";var a=t.getOwnerComponent().getModel().getContext(r);t.getView().setBindingContext(a);var i=t.getView().byId("subCategoryId");var o=e.Zrefcat;var n=e.Zscatref;var d=e.Zscatref;t.getOwnerComponent().getModel().read("/CATEGORYSet('"+o+"')/SUB_CATEGORYSet",{success:function(e,s){t.getOwnerComponent().getModel("SubCategorie_model").setData(e.results);i.setModel(t.getOwnerComponent().getModel("SubCategorie_model"));i.bindAggregation("items","/",function(e,t){var s=new sap.ui.core.Item({key:encodeURI(t.getProperty("Scatref")),text:t.getProperty("Libscat")});return s});i.setSelectedKey(d)}.bind(t),error:function(e){}});var g=t.getView().byId("typeObjetId");var l=e.Zreftypobj;t.getOwnerComponent().getModel().read("/SUB_CATEGORYSet('"+n+"')/SubCategory_TO_TYPEOBJECT",{success:function(e,s){t.getOwnerComponent().getModel("Objet_type_model").setData(e.results);$.sap.obj_typ=e.results;g.setModel(t.getOwnerComponent().getModel("Objet_type_model"));g.bindAggregation("items","/",function(e,t){var s=new sap.ui.core.Item({key:encodeURI(t.getProperty("Reftypobj")),text:t.getProperty("Libtypobj")});return s});g.setSelectedKey(l)}.bind(t),error:function(e){}});s(e)},error:function(e){r(e)}})})},setPJUIConfig:function(e){if(e.Zstatid==="002"){this.getView().byId("pjUploader").getToolbar().getContent()[2].setEnabled(false);this.getView().byId("pjUploader").getItems().forEach(e=>e.setEnableDelete(false))}if(e.Zstatid==="005"){this.getView().byId("pjUploader").getToolbar().getContent()[2].setEnabled(true)}},setUIConfig:function(e){if(e.Zstatid==="002"){this.getView().byId("typeObjetId").setEditable(false);this.getView().byId("subCategoryId").setEditable(false);this.getView().byId("addServiceBt").setEnabled(false)}if(e.Zstatid==="005"){this.getView().byId("com").setEditable(true);this.getView().byId("typeObjetId").setEditable(false);this.getView().byId("subCategoryId").setEditable(false);this.getView().byId("addServiceBt").setEnabled(false)}},updateEmployeComboEnability:function(e,t){var s=[];var r;e.forEach((e,t)=>e.Ztypepilote===true?s.push(t):null);if(s.length>0){for(let i=0;i<s.length;i++){r=s[i];if(r>-1){var a=e[r].Ztypepilote;if(a){if($.sap.docStatus!=="001"&&$.sap.docStatus!=="006"){t.getItems()[r].getCells()[3].setEnabled(!a);t.getItems()[r].getCells()[0].setEnabled(!a)}}}}}},handleWizardUpdate:async function(e){var t=this;if(this.checkInputsErrors()){this.MsgPopOverHdler.ToglleMessagePopOver.apply(this)}else{var s=this.prepareDataForSave().bDocIsChanged;if(s==true){this.getView().setBusy(true);var r=this.prepareDataForSave().oNewDocData;let e=await this.sendAndHandleDeUpdateRequest(r);if(e){this.sendAndHandleServicesUpdateRequest();this.pjUpdateHdler.uploadFilesFromPC.apply(this,[r.Zrefde]);t.pjUpdateHdler.refreshPjs.apply(t);this.getView().setBusy(false);var a="Le document "+$.sap.refdoc+" est modifié";n.show(a)}else{this.getView().setBusy(false);var a="Error while updating record - "+err.response.statusText;n.show(a)}}}},refreshServicesTables:function(){var e=this.byId("idProductsTable");var t="/Document_entrantSet('"+$.sap.refdoc+"')/DOC_SERVICESSet";this.getOwnerComponent().getModel().read(t,{success:function(t,s){this.getOwnerComponent().getModel("De_services_model").setData(t.results);e.setModel(this.getOwnerComponent().getModel("De_services_model"));var r=e.getBindingInfo("items").template;e.bindAggregation("items",{path:"/",template:r});e.setBusy(false)}.bind(this),error:function(t){e.setBusy(false);n.show("Refresh services tables")}})},fnUpdateServiceCallback:function(e){if(e){this.refreshServicesTables()}},deleteService:function(e,t){var s=this.byId("idProductsTable");s.setBusy(true);var r=this.getOwnerComponent().getModel();var a="/DOC_SERVICESSet(Zcserv='"+t+"',Zrefde='"+e+"')";return new Promise((e,t)=>{r.remove(a,{success:function(t){e(t)},error:function(e){t(e)}})})},handlesuggestionItemSelected:function(e){var t=e.getParameters().selectedItem.getBindingContext().getObject();if(t){var s=t.ClientName;var r=t.Contactclient;var a=t.Kunnr;this.getView().byId("Client").setValue(s);this.getView().byId("Client").setValue(a);this.getView().byId("CC").setValue(r);this.MsgPopOverHdler.removeMsgWithTarget.apply(this,[e.getSource().getId()]);e.getSource().setValueState("None")}},onSuggest:function(e){var t=e.getSource();var s=t.getValue();var r=t.getBindingInfo("suggestionItems").template;var a=[new sap.ui.model.Filter("Expediteur",sap.ui.model.FilterOperator.EQ,s)];t.bindAggregation("suggestionItems",{path:"/ClientSet",template:r,filters:a})},onChangeCategorieFilter:function(e){$.sap.cat_ch=true;var t=this.getView().byId("subCategoryId");var s=this.getView().byId("typeObjetId");var r=e.getSource().getSelectedKey();if(r){this.MsgPopOverHdler.removeMsgWithTarget.apply(this,[e.getSource().getId()]);e.getSource().setValueState("None")}this.getView().getModel("SubCategorie_model").setData(null);t.setSelectedKey();this.getView().getModel("Objet_type_model").setData(null);s.setSelectedKey();t.setValue("");s.setValue("");this.getOwnerComponent().getModel().read("/CATEGORYSet('"+r+"')/SUB_CATEGORYSet",{success:function(e,s){this.getOwnerComponent().getModel("SubCategorie_model").setData(e.results);t.setModel(this.getOwnerComponent().getModel("SubCategorie_model"));t.bindAggregation("items","/",function(e,t){var s=new sap.ui.core.Item({key:encodeURI(t.getProperty("Scatref")),text:t.getProperty("Libscat")});return s})}.bind(this),error:function(e){}})},handleTableSelectDialogPress:function(e){this.getOwnerComponent().getModel().read("/ServicesSet",{success:function(e,t){var s=this.getView().getModel("De_services_model").getData();var r=e.results;var a=[];for(var i=r.length-1;i>=0;i--){for(var o=0;o<s.length;o++){if(r[i]&&r[i].Zcserv===s[o].Zcserv){r.splice(i,1)}}}var n=this.byId("myDialog");this.getOwnerComponent().getModel("services_model").setData(r);n.setModel(this.getOwnerComponent().getModel("services_model"));var d=n.getBindingInfo("items").template;n.bindAggregation("items",{path:"/",template:d})}.bind(this),error:function(e){}});var s=e.getSource(),r=this.getView();if(!this._pDialog){this._pDialog=t.load({id:r.getId(),name:"com.aymax.apave.sd.BureauOrdre.BureauOrdreModify.fragment.ListService",controller:this}).then(function(e){r.addDependent(e);return e})}this._pDialog.then(function(e){this._configDialog(s,e);e.open()}.bind(this))},_configDialog:function(e,t){var s=e.data("draggable");t.setDraggable(s=="true");var r=e.data("resizable");t.setResizable(r=="true");var a=!!e.data("multi");t.setMultiSelect(a);var i=!!e.data("remember");t.setRememberSelections(i);var o=e.data("responsivePadding");var n="sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";if(o){t.addStyleClass(n)}else{t.removeStyleClass(n)}var d=e.data("confirmButtonText");t.setConfirmButtonText(d);l("sapUiSizeCompact",this.getView(),t)},handleSearch:function(e){var t=e.getParameter("value");var r=new s("Zlibserv",a.Contains,t);var i=e.getSource().getBinding("items");i.filter([r])},handleClose:function(e){var t=e.getSource().getBinding("items");t.filter([]);var s=e.getParameter("selectedContexts");if(s&&s.length){var r=this.getView().getModel("De_services_model").getData();for(var a=0;a<s.length;a++){var i={};i.Zcserv=s[a].getObject().Zcserv;i.Zlibserv=s[a].getObject().Zlibserv;i.Zrefde=$.sap.doc.Zrefde;i.Ztypepilote=false;i.Ztypeselection=true;i.Zemployee="";i.New=true;r.push(i)}this.getView().getModel("De_services_model").setData(r)}},onAfterRendering:function(){var e=this;this.getView().byId("CreateProductWizard")._getNextButton().setText(this.getOwnerComponent().getModel("i18n").getProperty("AffecterServices"));var t=this.getView().byId("idProductsTable");t.addEventDelegate({onAfterRendering:function(e){var s="";var r="";var a=t.getItems();for(var i=0;i<a.length;i++){var o=a[i].getBindingContext().getProperty("Zcserv");var n=a[i].getBindingContext().getProperty("Zemployee");s=[new sap.ui.model.Filter("Zcserv",sap.ui.model.FilterOperator.EQ,o)];r=a[i].getCells()[3];var d=r.getBinding("items");d.filter(s);r.setSelectedKeys(n.split(","))}}})},onEmployeAfterSelection:function(e){var t=e.getSource(),s=t.getSelectedKeys().filter(e=>e).join(",");var r=t.getParent().getBindingContext().getProperty("Zcserv"),a=this.getView().getModel("De_services_model").getData();var i=a.findIndex(e=>e.Zcserv===r);this.getView().getModel("De_services_model").getData()[i].Zemployee=s;if(s!==""){this.MsgPopOverHdler.removeMsgWithTarget.apply(this,["selection_msg"])}},checkInputsErrors:function(){var e=false;this.checkWizardStepOneErrors();this.checkWizardStepTwoErrors();var t=this._MessageManager.getMessageModel().getData().filter(e=>e.type===I.Error);if(t.length>0){e=true}return e},checkWizardStepOneErrors:function(){this.checkMandatoryFieldById("CategoryId");this.checkMandatoryFieldById("subCategoryId");this.checkMandatoryFieldById("natureRecId");var e=this.getView().byId("subCategoryId");if(e.getSelectedItem().getText()!=="AUTRES"){this.checkMandatoryFieldById("typeObjetId")}this.checkMandatoryFieldById("Ex")},checkWizardStepTwoErrors:function(){this.checkAtLeastOnePiloteIsSelected();this.checkAtLeastOneSelectionIsSelected()},checkAtLeastOnePiloteIsSelected:function(){var e={};var t=false;var s=this.getView().byId("idProductsTable");for(var r=0;r<s.getItems().length;r++){var a=s.getItems()[r].getBindingContext().getObject();if(a.Ztypepilote&&a.Zemployee!==""){t=true;this.MsgPopOverHdler.removeMsgWithTarget.apply(this,[s.getId()]);break}}if(!t){var i=this;e={sMsgTitle:"Service Pilote",sMsgType:I.Error,sAddText:"Un Service Pilote doit être selectionnné",sTarget:s.getId(),oProcessor:i.getView().getModel(),code:"SecondStep"};i.MsgPopOverHdler.addMessageWithTarget.apply(this,[e])}},checkAtLeastOneSelectionIsSelected:function(){debugger;var e=this,t={},s=this.getView().byId("idProductsTable"),r=-1;for(var a=0;a<s.getItems().length;a++){var i=s.getItems()[a].getBindingContext().getObject();if(i.Ztypeselection){r=a;var o=s.getItems()[r].getBindingContext().getObject().Zemployee;if(o===""){t={sMsgTitle:"Service Seléction : Employés",sMsgType:I.Error,sAddText:"Un Service Seléction doit être avoir au moins un employé",sTarget:"selection_msg",oProcessor:e.getView().getModel(),code:"SecondStep"};e.MsgPopOverHdler.addMessageWithTarget.apply(this,[t]);s.getItems()[r].getCells()[3].setValueState("Error")}}}},checkMandatoryFieldById:function(e){var t=this;var s={};var r=this.getView().byId(e);if(r.getEnabled()){var a=r.getMetadata().getName();switch(a){case"sap.m.ComboBox":var i=r.getSelectedKey()||r.getValue();if(!i){s={sMsgTitle:r.getParent().getLabel().getText(),sMsgType:I.Error,sAddText:"Ce Champs est obligatoire",sTarget:r.getId(),oProcessor:t.getView().getModel(),code:"FirstStep"};t.MsgPopOverHdler.addMessageWithTarget.apply(this,[s])}break;case"sap.m.Input":var o=r.getValue();if(!o){s={sMsgTitle:r.getParent().getLabel().getText(),sMsgType:I.Error,sAddText:"Ce Champs est obligatoire",sTarget:r.getId(),oProcessor:t.getView().getModel(),code:"FirstStep"};t.MsgPopOverHdler.addMessageWithTarget.apply(this,[s]);break}default:}}},onChangeSubCategorie:function(e){$.sap.stype_ch=true;var t=this.getView().byId("typeObjetId");var s=e.getSource().getSelectedKey();if(s){this.MsgPopOverHdler.removeMsgWithTarget.apply(this,[e.getSource().getId()]);e.getSource().setValueState("None")}this.getView().getModel("Objet_type_model").setData(null);t.setSelectedKey();t.setValue("");this.getOwnerComponent().getModel().read("/SUB_CATEGORYSet('"+s+"')/SubCategory_TO_TYPEOBJECT",{success:function(e,s){this.getOwnerComponent().getModel("Objet_type_model").setData(e.results);$.sap.obj_typ=e.results;t.setModel(this.getOwnerComponent().getModel("Objet_type_model"));t.bindAggregation("items","/",function(e,t){var s=new sap.ui.core.Item({key:encodeURI(t.getProperty("Scatref")),text:t.getProperty("Libtypobj")});return s})}.bind(this),error:function(e){}})},onChangeNatureRec:function(e){var t=e.getSource().getSelectedKey();if(t){this.MsgPopOverHdler.removeMsgWithTarget.apply(this,[e.getSource().getId()]);e.getSource().setValueState("None")}},onChangeTypeObj:function(e){var t=e.getSource().getSelectedKey();if(t){this.MsgPopOverHdler.removeMsgWithTarget.apply(this,[e.getSource().getId()]);e.getSource().setValueState("None")}},addCreatedDocSuccesMsg:function(e){var t=this.getView().getModel();this._MessageManager.addMessages(new S({message:"Succès de création",type:I.Success,additionalText:"le Document "+e+" a éte crée avec succès",target:e,processor:t,code:"DocCreated"}));this.getView().byId("messagePopoverBtn").setBusy(true);setTimeout(function(){this.getView().byId("messagePopoverBtn").firePress()}.bind(this),100);this.getView().byId("messagePopoverBtn").setBusy(false);this.getView().byId("CreateProductWizard").goToStep(this.getView().byId("FirstStep"))},prepareDataForSave:function(){var e=this;var t=true;var s=this.getView()._getBindingContext().getObject();var r={};r.Zrefde=s.Zrefde;r.Zstatde=s.Zstatde;var a=this.getView().byId("CategoryId");if(a.getSelectedKey()===""){r.Zrefcat=s.Zrefcat;r.Zlibcat=s.Zlibcat}else{r.Zrefcat=a.getSelectedKey();r.Zlibcat=a._getSelectedItemText()}var i=this.getView().byId("subCategoryId");if(i.getSelectedKey()===""){r.Zscatref=s.Zscatref;r.Zlibscat=s.Zlibscat;if($.sap.cat_ch===true){r.Zscatref="";r.Zlibscat=""}}else{r.Zscatref=i.getSelectedKey();r.Zlibscat=i._getSelectedItemText()}var o=this.getView().byId("typeObjetId");if(o.getSelectedKey()===""){r.Zreftypobj=s.Zreftypobj;r.Zlibtypobj=s.Zlibtypobj;if($.sap.stype_ch===true){r.Zreftypobj="";r.Zlibtypobj=""}}else{r.Zreftypobj=o.getSelectedKey();r.Zlibtypobj=o._getSelectedItemText();for(var n=0;n<$.sap.obj_typ.length;n++){if($.sap.obj_typ[n].Libtypobj==r.Zlibtypobj){r.Zreftypobj=$.sap.obj_typ[n].Reftypobj}}}if(r.Zlibscat!==""){$.sap.cat_ch=false}if(r.Zlibtypobj!==""){$.sap.stype_ch=false}var d=this.getView().byId("natureRecId");if(d.getSelectedKey()===""){r.Zrefnr=s.Zrefnr;r.ZlibNr=s.ZlibNr}else{r.Zrefnr=d.getSelectedKey();r.ZlibNr=d._getSelectedItemText()}var g=this.byId("D1").getDateValue()?this.byId("D1").getDateValue().toLocaleDateString():"";var l="";if(g.length>0){l=g.substr(6)+g.substr(3,2)+g.substr(0,2)}r.Zdar=l;var c=this.byId("D2").getDateValue()?this.byId("D2").getDateValue().toLocaleDateString():"";var p="";if(c.length>0){p=c.substr(6)+c.substr(3,2)+c.substr(0,2)}r.Zdem=p;var u=this.byId("D3").getDateValue()?this.byId("D3").getDateValue().toLocaleDateString():"";var h="";if(u.length>0){h=u.substr(6)+u.substr(3,2)+u.substr(0,2)}r.Zdec=h;var f=this.byId("D4").getDateValue()?this.byId("D4").getDateValue().toLocaleDateString():"";var b="";if(f.length>0){b=f.substr(6)+f.substr(3,2)+f.substr(0,2)}r.Zdexp=b;if(this.byId("Zdi").getSelected()===true){r.Zdi="X"}else{r.Zdi=""}if(this.byId("Zdu").getSelected()===true){r.Zdu="X"}else{r.Zdu=""}if(this.byId("Zdc").getSelected()===true){r.Zdc="X"}else{r.Zdc=""}r.Zcom=s.Zcom;r.Zlibclient=s.Zlibclient;r.Zclient=s.Zclient;r.Amount=s.Amount;r.InstitutionDePaie=s.InstitutionDePaie;r.RefExp=s.RefExp;r.RefApave=s.RefApave;r.RefPpaie=s.RefPpaie;r.ZcomptId=s.ZcomptId;r.ZrefNreg=s.ZrefNreg;return{bDocIsChanged:t,oNewDocData:r}},sendAndHandleDeUpdateRequest:async function(e){return new Promise((t,s)=>{var r="/Document_entrantSet('"+e.Zrefde+"')";this.getOwnerComponent().getModel().update(r,e,{success:function(e,s){t(true)},error:function(e,t){s(false)}})})},sendAndHandleServicesUpdateRequest:async function(){$.sap.doc.selected_service=this.getView().getModel("De_services_model").getData();var e=$.sap.doc.selected_service;for(var t=0;t<e.length;t++){var s={};s.Zcserv=e[t].Zcserv;s.Zrefde=e[t].Zrefde;s.Zlibserv=e[t].Zlibserv;s.Ztypepilote=e[t].Ztypepilote;s.Zemployee=e[t].Zemployee;s.Ztypeselection=e[t].Ztypeselection;var r="/DOC_SERVICESSet(Zcserv='"+s.Zcserv+"',Zrefde='"+$.sap.doc.Zrefde+"')";if(e[t].hasOwnProperty("New")){if(s.Ztypepilote||s.Ztypeselection){this.getOwnerComponent().getModel().create("/DOC_SERVICESSet",s);this.refreshServicesTables()}}else if(!s.Ztypepilote&&!s.Ztypeselection){this.deleteService($.sap.doc.Zrefde,s.Zcserv).then(e=>that.fnUpdateServiceCallback(true)).catch(e=>that.fnUpdateServiceCallback(false))}else{this.getOwnerComponent().getModel().update(r,s);this.refreshServicesTables()}}},onPiloteSelected:function(e){var t=e.getSource().getBindingContext().getObject().Zcserv;var s=this.getView().byId("MultiBoxCategorie");var r=this.getView().byId("idProductsTable");if(e.getParameter("selected")){this.MsgPopOverHdler.removeMsgWithTarget.apply(this,[r.getId()]);for(var a=0;a<r.getItems().length;a++){var i=r.getItems()[a];if(i.getBindingContext().getObject().Zcserv===t){i.getCells()[1].setEnabled(false);i.getCells()[1].setSelected(false);i.getCells()[3].setEnabled(true)}}}else{for(var o=0;o<r.getItems().length;o++){var n=r.getItems()[o];if(n.getBindingContext().getObject().Zcserv===t){n.getCells()[1].setEnabled(true);n.getCells()[3].setEnabled(false)}}}},onServiceSelectionSelected:function(e){if(e.getParameter("selected")){e.getSource().getParent().getCells()[3].setEnabled(true)}else{e.getSource().getParent().getCells()[3].setEnabled(false)}}})});