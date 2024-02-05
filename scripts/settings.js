import { ModuleName, settingActionSpace, replacewords } from "./utils.js";
import { getSettingActionTitles } from "./specialItems.js";

const defaultECH = ["seek", "hide", "none", "none", "none", "none"];

Hooks.once("init", async () => {  // game.settings.get(cModuleName, "")
	//Settings
	//client
	for (let key of Object.keys(settingActionSpace)) {
		for (let i = 1; i <= settingActionSpace[key]; i++) {
			game.settings.register(ModuleName, key + i, {
				name: game.i18n.localize(replacewords(`${ModuleName}.Settings.ECHAction.name`, {n:i})),
				hint: game.i18n.localize(replacewords(`${ModuleName}.Settings.ECHAction.descrp`, {n:i})),
				scope: "client",
				config: true,
				type: String,
				choices : await getSettingActionTitles(key),
				requiresReload : true,
				default: defaultECH[i-1]
			});
		}
	}
	 
});