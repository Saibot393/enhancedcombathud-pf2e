import { ModuleName, settingActionSpace, firstUpper } from "./utils.js";
import {openNewInput} from "./popupInput.js";

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

const settingActionNameReplace = {
	PF2EECHActionItems : {
		"administerFirstAid"	: "administer-first-aid",
		"commandAnAnimal"		: "command-an-animal",
		"concealAnObject"		: "conceal-an-object",
		"createADiversion"		: "create-a-diversion",
		"disableDevice"			: "disable-device",
		"forceOpen"				: "force-open",
		"highJump"				: "high-jump",
		"longJump"				: "long-jump",
		"palmAnObject"			: "palm-an-object",
		"pickALock"				: "pick-a-lock",
		"senseMotive"			: "sense-motive",
		"tumbleThrough"			: "tumble-through"
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
		"feint"					: `modules/${ModuleName}/icons/fencer.svg`,
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

const trainedactions = ["maneuver-in-flight", "squeeze", "decipher-writing", "identify-magic", "learn-a-spell", "disarm", "identify-alchemy", "feint", "treat-disease", "treat-poison", "create-forgery", "track", "disable-device", "pick-a-lock"]

var defaultActions = {};

var PF2EECHActionItems = {};
var PF2EECHFreeActionItems = {};
var PF2EECHReActionItems = {};

var baseitem = {};
var baseaction = {};

async function registerPF2EECHSItems () {
	
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
									return game.i18n.localize(game.pf2e.actions.get("stand").name);//baseitem.ProneDropStand.prone?.name;
								}
								else {
									return game.i18n.localize(game.pf2e.actions.get("drop-prone").name);//baseitem.ProneDropStand.notprone?.name;
								}
							}
						},
						system : (options) => {
							let actor = options.actor;
							let action;
							
							if (actor) {
								if (actor.hasCondition("prone")) {
									action = game.pf2e.actions.get("stand");
								}
								else {
									action = game.pf2e.actions.get("drop-prone");
								}
							}
							
							return systemfromaction(action);
						}
					},
					onclick : async (options) => {
						let actor = options.actor;
						
						if (actor) {
							await actor.toggleCondition("prone");
							
							return true;
						}
					},
					onrclick : async (options) => {
						let actor = options.actor;
						
						if (actor) {
							if (actor.hasCondition("prone")) {
								return (await fromUuid("Compendium.pf2e.actionspf2e.Item.OdIUybJ3ddfL7wzj")).sheet.render(true);
							}
							else {
								return (await fromUuid("Compendium.pf2e.actionspf2e.Item.HYNhdaPtF1QmQbR3")).sheet.render(true);
							}
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
			flags : {
				[ModuleName] : {
					onclick : async (options) => {
						if (ui.ARGON?.components?.movement && !ui.ARGON?.components?.movement?.isstep) {
							let actor = options.actor;
						
							if (actor) {
								game.pf2e.actions.get("step").toActionVariant({actors : actor}).toMessage();
							}
							
							ui.ARGON?.components?.movement.addstep();
							
							return true;
						}
					}
				}
			},
			img: `modules/${ModuleName}/icons/walk.svg`,
			id: "UHpkTuCtyaPqiCAB",
			action: "step"
		},
		TakeCover : {
			flags : {
				[ModuleName] : {
					onclick : async (options) => {
						let actor = options.actor;
						
						if (actor) {
							if (game.settings.get(ModuleName, "usetakecover")) {
								game.pf2e.actions.get("take-cover").toActionVariant({actors : actor}).use({event : options.event});
							}
							else {
								game.pf2e.actions.get("take-cover").toActionVariant({actors : actor}).toMessage()
							}
							return true;
						}
					}
				}
			},
			img: `modules/${ModuleName}/icons/armor-upgrade.svg`,
			id: "ust1jJSCZQUhBZIz",
			action: "take-cover"
		},
		ready : {
			img: `modules/${ModuleName}/icons/sands-of-time.svg`,
			id: "dLgAMt3TbkmLkUqE",
			action: "ready"
		},
		escape : {//conditional
			flags : {
				[ModuleName] : {
					enabled : (options) => {
						let actor = options.actor;
						
						if (actor) {
							if (actor.hasCondition("grabbed") || actor.hasCondition("immobilized") || actor.hasCondition("restrained")) {
								return true;
							}
						}
					}
				}
			},
			img: `modules/${ModuleName}/icons/breaking-chain.svg`,
			id: "SkZAQRkLLkmBQNB9",
			action: "escape"
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
		aid : {
			flags : {
				[ModuleName] : {
					onclick : async (options) => {
						let actor = options.actor;
						
						if (actor) {
							let skilloptions = {};
							const skills = {perception : actor.perception, ...actor.skills};
							for (let key of Object.keys(skills)) {
								skilloptions[key] = {label : skills[key].label}
							}
							
							let skill = await openNewInput("choice", game.i18n.localize(game.pf2e.actions.get("aid").name), `${game.i18n.localize("PF2E.SkillLabel")}: `, {defaultValue : "perception", options : skilloptions});
							
							if (skill) {
								game.pf2e.actions.get("aid").toActionVariant({actors : actor}).use({statistic : skill, event : event});
								
								return true;
							}
						}
					}
				}
			},
			img: `modules/${ModuleName}/icons/thumb-up.svg`,
			id: "HCl3pzVefiv9ZKQW",
			action: "aid"
		},
		ArrestorGrab : {
			flags : {
				[ModuleName] : {
					dynamicstate : {
						img : (options) => {
							let actor = options.actor;
							
							if (actor) {
								if (actor.system.attributes.speed.otherSpeeds.find(speed => speed.type == "fly")) {
									return `icons/svg/angel.svg`;
								}
								else {
									return `modules/${ModuleName}/icons/grab.svg`;
								}
							}
						},
						name : (options) => {
							let actor = options.actor;
							
							if (actor) {
								if (actor.system.attributes.speed.otherSpeeds.find(speed => speed.type == "fly")) {
									return game.i18n.localize(game.pf2e.actions.get("arrest-a-fall").name);
								}
								else {
									return game.i18n.localize(game.pf2e.actions.get("grab-an-edge").name);
								}
							}
						},
						system : (options) => {
							let actor = options.actor;
							let action;
							
							if (actor) {
								if (actor.system.attributes.speed.otherSpeeds.find(speed => speed.type == "fly")) {
									action = game.pf2e.actions.get("arrest-a-fall");
								}
								else {
									action = game.pf2e.actions.get("grab-an-edge");
								}
							}
							
							return systemfromaction(action);
						}
					},
					onclick : async (options) => {
						let actor = options.actor;
						
						if (actor) {
							if (actor.system.attributes.speed.otherSpeeds.find(speed => speed.type == "fly")) {
								//game.pf2e.actions.get("arrest-a-fall").toMessage();
								game.pf2e.actions.get("arrest-a-fall").toActionVariant().use({event : options.event})
								return true;
							}
							else {
								//game.pf2e.actions.get("grab-an-edge").toMessage();
								game.pf2e.actions.get("grab-an-edge").toActionVariant().use({event : options.event})
								return true;
							}
						}
					},
					onrclick : async (options) => {
						let actor = options.actor;
						
						if (actor) {
							if (actor.system.attributes.speed.otherSpeeds.find(speed => speed.type == "fly")) {
								return (await fromUuid("Compendium.pf2e.actionspf2e.Item.qm7xptMSozAinnPS")).sheet.render(true);
							}
							else {
								return (await fromUuid("Compendium.pf2e.actionspf2e.Item.3yoajuKjwHZ9ApUY")).sheet.render(true);
							}
						}
					},
					updateonclick : true
				}
			}
		}
		/*
		ready : {
			img: `modules/${ModuleName}/icons/sands-of-time.svg`,
			id: "dLgAMt3TbkmLkUqE"
		}
		*/
	}
	
	let ItemSets = {PF2EECHActionItems, PF2EECHFreeActionItems, PF2EECHReActionItems}

	//some preparation
	for (let setkey of Object.keys(ItemSets)) {
		let itemset = ItemSets[setkey];
	
		for (let i = 1; i <= settingActionSpace[setkey]; i++) {
			let chosenoption = game.settings.get(ModuleName, setkey + i);
			
			if (settingActionIDs[setkey]) {
				itemset[chosenoption] = {
					id : settingActionIDs[setkey][chosenoption],
					img : settingActionIMGs[setkey][chosenoption],
					action : settingActionNameReplace[setkey][chosenoption] ?? chosenoption
				}
			}
			
			console.log(itemset[chosenoption]);
			console.log(settingActionIDs[setkey][chosenoption]);
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
				
				//let abilityItem = await fromUuid("Compendium.pf2e.actionspf2e.Item." + itemset[itemkey].id);
				let actionitem = game.pf2e.actions.get(itemset[itemkey].action);
				if (actionitem) {
					itemset[itemkey].name = game.i18n.localize(actionitem.name);
					itemset[itemkey].system = systemfromaction(actionitem);
					
					if (!itemset[itemkey].flags[ModuleName].onclick) {
						itemset[itemkey].flags[ModuleName].onclick = async (options) => {
							let actor = options.actor;
							
							if (actor) {
								let settings = {actors : actor};
								
								let options;
								
								switch (itemkey) {
									case "perform" :
										options = ["acting", "comedy", "dance", "keyboards", "oratory", "percussion", "singing", "strings", "winds"];
										break;
									case "administerFirstAid":
										options = ["stabilize", "stop-bleeding"];
										break;
								}
								
								if (options) {
									let optionsinfo = {};
									
									for (let key of options) {
										optionsinfo[key] = {label : key};
									}
									
									let name = (await getSettingActionTitles(setkey))[itemkey];
									
									let variant = await openNewInput("choice", name, `${name}: `, {defaultValue : options[0], options : optionsinfo});
									
									if (!variant) return;
									settings.variant = variant; 

									settings.event = options.event;
								}
								
								if (game.pf2e.actions[itemkey]) {
									game.pf2e.actions[itemkey](settings);
									return true;
								}
								
								if (game.pf2e.actions.get(itemkey)) {
									game.pf2e.actions.get(itemkey).toActionVariant().use(settings);
									return true;
								}
							}
						}
					}
					
					let referid = itemset[itemkey].id;
					
					if (!itemset[itemkey].flags[ModuleName].onrclick) {
						itemset[itemkey].flags[ModuleName].onrclick = async (options) => {
							let abilityItem = await fromUuid("Compendium.pf2e.actionspf2e.Item." + referid);
							abilityItem?.sheet.render(true);
						}
					}
				}
				
				if (!itemset[itemkey].type) {
					itemset[itemkey].type = "action";
				}
				
				if (!itemset[itemkey].system.traits?.value) {
					itemset[itemkey].system.traits = {value : []};
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
		
		replacement.system.description = {value : sourceitem.system.description.value};
		replacement.img = sourceitem.img;
		replacement.system.traits = sourceitem.system.traits;
		replacement.system.item = sourceitem;
	}
	
	replacement.system.updateID = connectedItem.id;
	
	if (rule.toggleable) {
		replacement.flags = {
			[ModuleName] : {
				toggleable : rule.toggleable && !rule.alwaysActive,
				onclick : () => {if (connectedItem) {
					rule.actor.toggleRollOption(rule.domain, rule.option, connectedItem.id, !connectedItem.rules[ruleIndex].value);
				}},
				active : () => {return connectedItem.rules[ruleIndex].value},
				toggleoptions : rule.suboptions.map((option) => {return {value : option.value, name : game.i18n.localize(option.label)}}),
				onchange : (value) => {if (connectedItem) {
					console.log(rule.domain, rule.option, connectedItem.id, connectedItem.rules[ruleIndex].value, value);
					rule.actor.toggleRollOption(rule.domain, rule.option, connectedItem.id, connectedItem.rules[ruleIndex].value, value)
				}},
				selectvalue : () => {return rule.suboptions?.find(option => option.selected).value}
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

function skillactionkeys(skill) {
	return Array.from(game.pf2e.actions.keys()).filter(key => game.pf2e.actions.get(key).statistic == skill || (game.pf2e.actions.get(key).statistic?.length && game.pf2e.actions.get(key).statistic.includes(skill)))
}

function systemfromaction(action) {
	if (!action) return {};
	
	return {
		description : {value : game.i18n.localize(action.description)},
		traits : {value : action.traits},
		slug : action.slug,
		statistic : action.statistic,
		actionType : {value : Number.isNumeric(action.glyph) ? "action" : action.glyph},
		actions : {value : Number.isNumeric(action.glyph) ? Number(action.glyph) : ""}
	};
}

export {registerPF2EECHSItems, PF2EECHActionItems, PF2EECHFreeActionItems, PF2EECHReActionItems, trainedactions, itemfromRule, getSettingActionOptions, getSettingActionTitles}
