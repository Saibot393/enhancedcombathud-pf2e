import { ModuleName, settingActionSpace, tabnames, replacewords } from "./utils.js";
import { getSettingActionTitles } from "./specialItems.js";

const defaultECH = ["seek", "hide", "none", "none", "none", "none"];

Hooks.once("init", async () => {  // game.settings.get(cModuleName, "")
	//Settings
	//client
	game.settings.register(ModuleName, "sheetbuttontab", {
		name: game.i18n.localize(`${ModuleName}.Settings.sheetbuttontab.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.sheetbuttontab.descrp`),
		scope: "client",
		config: true,
		type: String,
		choices: tabnames,
		default: Object.keys(tabnames)[0],
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "rollinitiative", {
		name: game.i18n.localize(`${ModuleName}.Settings.rollinitiative.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.rollinitiative.descrp`),
		scope: "client",
		config: true,
		type: String,
		choices: {
			"choiceroll": game.i18n.localize(`${ModuleName}.Settings.rollinitiative.options.choiceroll`),
			"quickroll": game.i18n.localize(`${ModuleName}.Settings.rollinitiative.options.quickroll`)
		},
		default: "choiceroll",
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "showpartybutton", {
		name: game.i18n.localize(`${ModuleName}.Settings.showpartybutton.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.showpartybutton.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: true,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "showfamiliarmaster", {
		name: game.i18n.localize(`${ModuleName}.Settings.showfamiliarmaster.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.showfamiliarmaster.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: true,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "showquicksaves", {
		name: game.i18n.localize(`${ModuleName}.Settings.showquicksaves.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.showquicksaves.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "shownpctraits", {
		name: game.i18n.localize(`${ModuleName}.Settings.shownpctraits.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.shownpctraits.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: true,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "panondblclick", {
		name: game.i18n.localize(`${ModuleName}.Settings.panondblclick.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.panondblclick.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		requiresReload : true,
		default: true
	});
	
	game.settings.register(ModuleName, "reversesaveskilllore", {
		name: game.i18n.localize(`${ModuleName}.Settings.reversesaveskilllore.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.reversesaveskilllore.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "filtertrainedactions", {
		name: game.i18n.localize(`${ModuleName}.Settings.filtertrainedactions.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.filtertrainedactions.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: true,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "showtrainedrankletter", {
		name: game.i18n.localize(`${ModuleName}.Settings.showtrainedrankletter.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.showtrainedrankletter.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "skillrankiconscale", {
		name: game.i18n.localize(`${ModuleName}.Settings.skillrankiconscale.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.skillrankiconscale.descrp`),
		scope: "client",
		config: true,
		type: Number,
		range: {
			min: 0.5,
			max: 2,
			step: 0.05
		},
		default: 1,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "weaponsetscount", {
		name: game.i18n.localize(`${ModuleName}.Settings.weaponsetscount.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.weaponsetscount.descrp`),
		scope: "client",
		config: true,
		type: Number,
		range: {
			min: 1,
			max: 9,
			step: 1
		},
		default: 3,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "onlyonespellrank", {
		name: game.i18n.localize(`${ModuleName}.Settings.onlyonespellrank.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.onlyonespellrank.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: false
	});
	
	game.settings.register(ModuleName, "directStaffuse", {
		name: game.i18n.localize(`${ModuleName}.Settings.directStaffuse.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.directStaffuse.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "showactionrequirements", {
		name: game.i18n.localize(`${ModuleName}.Settings.showactionrequirements.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.showactionrequirements.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "consumableswap", {
		name: game.i18n.localize(`${ModuleName}.Settings.consumableswap.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.consumableswap.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: true,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "reduceAoO", {
		name: game.i18n.localize(`${ModuleName}.Settings.reduceAoO.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.reduceAoO.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "usetakecover", {
		name: game.i18n.localize(`${ModuleName}.Settings.usetakecover.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.usetakecover.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: true
	});
	
	for (let key of Object.keys(settingActionSpace)) {
		for (let i = 1; i <= settingActionSpace[key]; i++) {
			game.settings.register(ModuleName, key + i, {
				name: game.i18n.localize(replacewords(`${ModuleName}.Settings.ECHAction.name${i}`)),
				//hint: game.i18n.localize(replacewords(`${ModuleName}.Settings.ECHAction.descrp`, {n:i})),
				scope: "client",
				config: true,
				type: String,
				choices : await getSettingActionTitles(key),
				requiresReload : true,
				default: defaultECH[i-1]
			});
		}
	}
	
	game.settings.register(ModuleName, "macropanel", {
		name: game.i18n.localize(`${ModuleName}.Settings.macropanel.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.macropanel.descrp`),
		scope: "client",
		config: false,
		type: Boolean,
		default: false,
		onChange: () => {ui.ARGON?.render()}
	});	
	
	game.settings.register(ModuleName, "macrobuttons", {
		name: game.i18n.localize(`${ModuleName}.Settings.macrobuttons.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.macrobuttons.descrp`),
		scope: "client",
		config: true,
		type: Number,
		range: {
			min: 0,
			max: 10,
			step: 2
		},
		default: 0,
		onChange: () => {ui.ARGON?.render()}
	});

	game.settings.register(ModuleName, "consumableuse", {
		name: game.i18n.localize(`${ModuleName}.Settings.consumableuse.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.consumableuse.descrp`),
		scope: "client",
		config: true,
		type: String,
		choices : {
			"consume" : game.i18n.localize(`${ModuleName}.Settings.consumableuse.options.consume`),
			"chat" : game.i18n.localize(`${ModuleName}.Settings.consumableuse.options.chat`),
			"consumechat" : game.i18n.localize(`${ModuleName}.Settings.consumableuse.options.consumechat`)
		},
		default: "consume"
	});
	
	game.settings.register(ModuleName, "onitemiconscale", {
		name: game.i18n.localize(`${ModuleName}.Settings.onitemiconscale.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.onitemiconscale.descrp`),
		scope: "client",
		config: true,
		type: Number,
		range: {
			min: 0.5,
			max: 3,
			step: 0.05
		},
		default: 1,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "iconshadow", {
		name: game.i18n.localize(`${ModuleName}.Settings.iconshadow.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.iconshadow.descrp`),
		scope: "client",
		config: true,
		type: Number,
		range: {
			min: 0,
			max: 1,
			step: 0.05
		},
		default: 0.3,
		onChange: () => {ui.ARGON?.render()}
	});
	
	game.settings.register(ModuleName, "showpassives", {
		name: game.i18n.localize(`${ModuleName}.Settings.showpassives.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.showpassives.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: true,
		requiresReload : true
	});
	
	game.settings.register(ModuleName, "showmacrocategory", {
		name: game.i18n.localize(`${ModuleName}.Settings.showmacrocategory.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.showmacrocategory.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
		requiresReload : true
	});
	
	//internal saves
	game.settings.register(ModuleName, "lockedmacros", {
		scope: "client",
		config: false,
		type: Object,
		default: {}
		//onChange: () => {ui.ARGON?.render()}
	});
});