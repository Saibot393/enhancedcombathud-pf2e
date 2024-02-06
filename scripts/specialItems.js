import { ModuleName, settingActionSpace, firstUpper } from "./utils.js";

const ItemReplacementID = "_argonUI_";

const settingActionIDs = {
	PF2EECHActionItems : {
		"administerFirstAid"	: "MHLuKy4nQO2Z4Am1",
		"balance"				: "M76ycLAqHoAgbcej",
		"commandAnAnimal"		: "q9nbyIF0PEBqMtYe",
		"concealAnObject"		: "qVNVSmsgpKFGk9hV",
		"createADiversion"		: "GkmbTGfg8KcgynOA",
		"demoralize"			: "2u915NdUyQan6uKF",
		"disableDevice"			: "cYdz2grcOcRt4jk6",
		"disarm"				: "Dt6B1slsBy8ipJu9",
		//"escape"				: "SkZAQRkLLkmBQNB9",
		"feint"					: "QNAVeNKtHA0EUw4X",
		"forceOpen"				: "SjmKHgI7a5Z9JzBx",
		"grapple"				: "PMbdMWc2QroouFGD",
		"hide"					: "XMcnh4cSI32tljXa",
		"highJump"				: "2HJ4yuEFY1Cast4h",
		"longJump"				: "JUvAvruz7yRQXfz2",
		"palmAnObject"			: "ijZ0DDFpMkWqaShd",
		"perform"				: "EEDElIyin4z60PXx",
		"pickALock"				: "2EE4aF4SZpYf0R6H",
		"request"				: "DCb62iCBrJXy0Ik6",
		"seek"					: "BlAOM2X92SI6HMtJ",
		"senseMotive"			: "1xRFPTFtWtGJ9ELw",
		"shove"					: "7blmbDrQFNfdT731",
		"sneak"					: "VMozDqMMuK5kpoX4",
		"steal"					: "RDXXE7wMrSPCLv5k",
		"trip"					: "ge56Lu1xXVFYUnLP",
		"tumbleThrough"			: "21WIfSu7Xd7uKqV8"
	}
}

const settingActionIMGs = {
	PF2EECHActionItems : {
		"administerFirstAid"	: `modules/${ModuleName}/icons/first-aid-kit.svg`,
		"balance"				: `modules/${ModuleName}/icons/tightrope.svg`,
		"commandAnAnimal"		: `icons/svg/pawprint.svg`,
		"concealAnObject"		: `modules/${ModuleName}/icons/magic-hat.svg`,
		"createADiversion"		: `modules/${ModuleName}/icons/firework-rocket.svg`,
		"demoralize"			: `modules/${ModuleName}/icons/tear-tracks.svg`,
		"disableDevice"			: `modules/${ModuleName}/icons/tinker.svg`,
		"disarm"				: `modules/${ModuleName}/icons/drop-weapon.svg`,
		//"escape"				: "SkZAQRkLLkmBQNB9",
		"feint"					: `modules/${ModuleName}/icons/fence.svg`,
		"forceOpen"				: `modules/${ModuleName}/icons/crowbar.svg`,
		"grapple"				: `modules/${ModuleName}/icons/grab.svg`,
		"hide"					: `modules/enhancedcombathud/icons/cloak-dagger.webp`,
		"highJump"				: `modules/${ModuleName}/icons/jump-across.svg`,
		"longJump"				: `modules/${ModuleName}/icons/jump-across.svg`,
		"palmAnObject"			: `modules/${ModuleName}/icons/palm.svg`,
		"perform"				: `modules/${ModuleName}/icons/drama-masks.svg`,
		"pickALock"				: `modules/${ModuleName}/icons/lockpicks.svg`,
		"request"				: `modules/${ModuleName}/icons/open-palm.svg`,
		"seek"					: `icons/svg/eye.svg`,
		"senseMotive"			: `modules/${ModuleName}/icons/psychic-waves.svg`,
		"shove"					: `modules/enhancedcombathud/icons/shield-bash.webp`,
		"sneak"					: `modules/${ModuleName}/icons/ninja-mask.svg`,
		"steal"					: `modules/${ModuleName}/icons/snatch.svg`,
		"trip"					: `modules/${ModuleName}/icons/tripwire.svg`,
		"tumbleThrough"			: `modules/${ModuleName}/icons/run.svg`
	}
}

var defaultActions = {};

var PF2EECHActionItems = {};
var PF2EECHFreeActionItems = {};
var PF2EECHReActionItems = {};

var baseitem = {}

async function registerPF2EECHSItems () {
	baseitem.ProneDropStand = {
		prone : (await fromUuid("Compendium.pf2e.actionspf2e.Item.OdIUybJ3ddfL7wzj")),
		notprone : (await fromUuid("Compendium.pf2e.actionspf2e.Item.HYNhdaPtF1QmQbR3"))
	};
	
	PF2EECHActionItems = {
		groupflags : {
			actiontype : "action"
		},
		ProneDropStand : {
			flags : {
				[ModuleName] : {
					dynamicstate : {
						img : (options) => {
							let actor = options.actor;
							
							if (actor) {
								if (actor.hasCondition("prone")) {
									return `icons/svg/up.svg`;
								}
								else {
									return `icons/svg/down.svg`;
								}
							}
						},
						name : (options) => {
							let actor = options.actor;
							
							if (actor) {
								if (actor.hasCondition("prone")) {
									return baseitem.ProneDropStand.prone?.name;
								}
								else {
									return baseitem.ProneDropStand.notprone?.name;
								}
							}
						},
						description : (options) => {
							let actor = options.actor;
							
							if (actor) {
								if (actor.hasCondition("prone")) {
									return baseitem.ProneDropStand.prone?.system.description;
								}
								else {
									return baseitem.ProneDropStand.notprone?.system.description;
								}
							}
						}
					},
					onclick : async (options) => {
						let actor = options.actor;
						
						if (actor) {
							await actor.toggleCondition("prone");
							
							return true;
						}
					},
					updateonclick : true
				}
			}
		},
		/*
		Seek : {
			img: `icons/svg/eye.svg`,
			id: "BlAOM2X92SI6HMtJ"
		},
		SenseMotive : {
			img: `modules/${ModuleName}/icons/psychic-waves.svg`,
			id: "1xRFPTFtWtGJ9ELw"
		},
		*/
		Step : {
			img: `modules/${ModuleName}/icons/walk.svg`,
			id: "UHpkTuCtyaPqiCAB"
		},
		TakeCover : {
			img: `modules/${ModuleName}/icons/armor-upgrade.svg`,
			id: "ust1jJSCZQUhBZIz"
		},
		Ready : {
			img: `modules/${ModuleName}/icons/sands-of-time.svg`,
			id: "dLgAMt3TbkmLkUqE"
		},
		Escape : {//conditional
			img: `modules/${ModuleName}/icons/breaking-chain.svg`,
			id: "SkZAQRkLLkmBQNB9"
		}
		/*
		Sustain : {
			img: `modules/${ModuleName}/icons/meditation.svg`,
			id: "3f5DMFu8fPiqHpRg"
		}
		*/
	}
	
	PF2EECHFreeActionItems = {
		groupflags : {
			actiontype : "freeaction"
		}
	}
	
	PF2EECHReActionItems = {
		groupflags : {
			actiontype : "reaction"
		},
		Aid : {
			img: `modules/${ModuleName}/icons/thumb-up.svg`,
			id: "HCl3pzVefiv9ZKQW"
		},
		Ready : {
			img: `modules/${ModuleName}/icons/sands-of-time.svg`,
			id: "dLgAMt3TbkmLkUqE"
		}
	}
	
	let ItemSets = {PF2EECHActionItems, PF2EECHFreeActionItems, PF2EECHReActionItems}

	//some preparation
	for (let setkey of Object.keys(ItemSets)) {
		let itemset = ItemSets[setkey];
	
		for (let i = 1; i <= settingActionSpace[setkey]; i++) {
			let chosenoption = game.settings.get(ModuleName, setkey + i);
			
			if (settingActionIDs[setkey] && settingActionIDs[setkey][chosenoption]) {
				itemset[chosenoption] = {
					id : settingActionIDs[setkey][chosenoption],
					img : settingActionIMGs[setkey][chosenoption]
				}
			}
		}
		
		for (let itemkey of Object.keys(itemset)) {
			if (itemkey != "groupflags") {
				if (!itemset[itemkey].flags) {
					itemset[itemkey].flags = {};
				}
				
				itemset[itemkey].flags[ModuleName] = {...itemset.groupflags, ...itemset[itemkey].flags[ModuleName], specialaction : true};
				
				if (!itemset[itemkey].system) {
					itemset[itemkey].system = {};
				}
				
				let abilityItem = await fromUuid("Compendium.pf2e.actionspf2e.Item." + itemset[itemkey].id);
				if (abilityItem) {
					itemset[itemkey].name = abilityItem.name;
					itemset[itemkey].system.description = {value : abilityItem.system.description.value};
					itemset[itemkey].system.actions = {value : abilityItem.system.actions.value}
				}
				
				if (!itemset[itemkey].type) {
					itemset[itemkey].type = "base";
				}
				
				if (!itemset[itemkey].system.traits) {
					itemset[itemkey].system.traits = [];
				}
				
				if (!itemset[itemkey].name) {
					itemset[itemkey].name = itemkey;
				}
				
				if (!itemset[itemkey].system.description) {
					itemset[itemkey].system.description = {};
				}
			}
		}
		
		delete itemset.groupflags;
	}
}

function itemfromRule(rule) {
	let replacement = {};
	
	let connectedItem = rule.item;
	
	let ruleIndex = connectedItem.rules.indexOf(rule);
	
	replacement.type = "base";
	
	replacement.system = {traits : []};

	replacement.name = rule.label;
	
	if (connectedItem) {
		let sourceitem = connectedItem;
		
		if (connectedItem.type == "action") {
			if (connectedItem.getFlag("pf2e", "grantedBy")?.id) {
				sourceitem = connectedItem.actor.items.get(connectedItem.getFlag("pf2e", "grantedBy").id);
			}
			if (!sourceitem) {
				sourceitem = connectedItem;
			}
		}
		
		replacement.system.description = sourceitem.system.description.value;
		replacement.img = sourceitem.img;
		replacement.system.traits = sourceitem.system.traits;
		replacement.system.item = sourceitem;
	}
	
	replacement.system.updateID = connectedItem.id;
	
	if (rule.toggleable) {
		replacement.flags = {
			[ModuleName] : {
				toggleable : rule.toggleable,
				onclick : () => {if (connectedItem) {
					rule.actor.toggleRollOption(rule.domain, rule.option, connectedItem.id, !connectedItem.rules[ruleIndex].value);
				}},
				active : () => {return connectedItem.rules[ruleIndex].value}
			}
		}
	}
	
	return replacement;
	//return Item.create(replacement);;
}

async function getSettingActionOptions(category) {
	if (Object.keys(settingActionIDs[category]).length) {//compendium already loaded
		return settingActionIDs[category];
	}
	
	for (let key of Object.keys(settingActionIDs[category])) {
		settingActionIDs[category][key] = (await fromUuid("Compendium.pf2e.actionspf2e.Item." + settingActionIDs[category][key]));
	}
	
	return await getSettingActionOptions();
}

async function getSettingActionTitles(category) {
	let titled = {};
	
	titled["none"] = "";
	
	for (let key of Object.keys(settingActionIDs[category])) {
		titled[key] = game.i18n.localize(`PF2E.Actions.${firstUpper(key)}.Title`);;
	}
	
	return titled;
}

function executefunction(key, options) {
	game.pf2e.actions[key](options);
}

export {registerPF2EECHSItems, PF2EECHActionItems, PF2EECHFreeActionItems, PF2EECHReActionItems, itemfromRule, getSettingActionOptions, getSettingActionTitles}