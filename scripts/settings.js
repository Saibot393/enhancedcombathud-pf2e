import { ModuleName, settingActionSpace, replacewords } from "./utils.js";
import { getSettingActionTitles } from "./specialItems.js";

const defaultECH = ["seek", "hide", "none", "none", "none", "none"];

Hooks.once("init", async () => {  // game.settings.get(cModuleName, "")
	//Settings
	//client
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
	
	game.settings.register(ModuleName, "directStaffuse", {
		name: game.i18n.localize(`${ModuleName}.Settings.directStaffuse.name`),
		hint: game.i18n.localize(`${ModuleName}.Settings.directStaffuse.descrp`),
		scope: "client",
		config: true,
		type: Boolean,
		requiresReload : true,
		default: false
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
});