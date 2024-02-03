import { ModuleName } from "./utils.js";

Hooks.once("init", () => {  // game.settings.get(cModuleName, "")
  //Settings
  //client
  game.settings.register(ModuleName, "CheckWeaponSets", {
	name: game.i18n.localize(ModuleName+".Settings.CheckWeaponSets.name"),
	hint: game.i18n.localize(ModuleName+".Settings.CheckWeaponSets.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: true
  });
  
  game.settings.register(ModuleName, "ShowSwiftActions", {
	name: game.i18n.localize(ModuleName+".Settings.ShowSwiftActions.name"),
	hint: game.i18n.localize(ModuleName+".Settings.ShowSwiftActions.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: true,
	onChange: () => {ui.ARGON.render()}
  });
  
  game.settings.register(ModuleName, "ShowFullActions", {
	name: game.i18n.localize(ModuleName+".Settings.ShowFullActions.name"),
	hint: game.i18n.localize(ModuleName+".Settings.ShowFullActions.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: true,
	onChange: () => {ui.ARGON.render()}
  });
  
  game.settings.register(ModuleName, "Showintegratedweapons", {
	name: game.i18n.localize(ModuleName+".Settings.Showintegratedweapons.name"),
	hint: game.i18n.localize(ModuleName+".Settings.Showintegratedweapons.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: false,
	onChange: () => {ui.ARGON.render()}
  });
  
  game.settings.register(ModuleName, "allowallItemsinItemslots", {
	name: game.i18n.localize(ModuleName+".Settings.allowallItemsinItemslots.name"),
	hint: game.i18n.localize(ModuleName+".Settings.allowallItemsinItemslots.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: false
  });
  
  game.settings.register(ModuleName, "HealthBarWidthScale", {
	name: game.i18n.localize(ModuleName+".Settings.HealthBarWidthScale.name"),
	hint: game.i18n.localize(ModuleName+".Settings.HealthBarWidthScale.descrp"),
	scope: "client",
	config: true,
	type: Number,
	range: {
		min: 0.1,
		max: 2,
		step: 0.01
	},
	default: 1,
	onChange: () => {ui.ARGON.render()}
  });
  
  game.settings.register(ModuleName, "HealthBarHeightScale", {
	name: game.i18n.localize(ModuleName+".Settings.HealthBarHeightScale.name"),
	hint: game.i18n.localize(ModuleName+".Settings.HealthBarHeightScale.descrp"),
	scope: "client",
	config: true,
	type: Number,
	range: {
		min: 0.1,
		max: 2,
		step: 0.01
	},
	default: 1,
	onChange: () => {ui.ARGON.render()}
  });
  
  game.settings.register(ModuleName, "ShowSystemStatus", {
	name: game.i18n.localize(ModuleName+".Settings.ShowSystemStatus.name"),
	hint: game.i18n.localize(ModuleName+".Settings.ShowSystemStatus.descrp"),
	scope: "client",
	config: true,
	type: String,
	choices: {
		"never": game.i18n.localize("enhancedcombathud-sfrpg.Settings.ShowSystemStatus.options.never"),
		"engineer": game.i18n.localize("enhancedcombathud-sfrpg.Settings.ShowSystemStatus.options.engineer"),
		"engineer,captain": game.i18n.localize("enhancedcombathud-sfrpg.Settings.ShowSystemStatus.options.engineercaptain"),
		"always": game.i18n.localize("enhancedcombathud-sfrpg.Settings.ShowSystemStatus.options.always"),
	},
	default: "engineer"
  });
  
  game.settings.register(ModuleName, "ShowWeaponStatus", {
	name: game.i18n.localize(ModuleName+".Settings.ShowWeaponStatus.name"),
	hint: game.i18n.localize(ModuleName+".Settings.ShowWeaponStatus.descrp"),
	scope: "client",
	config: true,
	type: String,
	choices: {
		"never": game.i18n.localize("enhancedcombathud-sfrpg.Settings.ShowWeaponStatus.options.never"),
		"engineer,gunner": game.i18n.localize("enhancedcombathud-sfrpg.Settings.ShowWeaponStatus.options.engineergunner"),
		"engineer,gunner,captain": game.i18n.localize("enhancedcombathud-sfrpg.Settings.ShowWeaponStatus.options.engineergunnercaptain"),
		"always": game.i18n.localize("enhancedcombathud-sfrpg.Settings.ShowWeaponStatus.options.always"),
	},
	default: "engineer,gunner"
  });
  
  game.settings.register(ModuleName, "OwnSpellSlotConsume", {
	name: game.i18n.localize(ModuleName+".Settings.OwnSpellSlotConsume.name"),
	hint: game.i18n.localize(ModuleName+".Settings.OwnSpellSlotConsume.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: true
  });
});