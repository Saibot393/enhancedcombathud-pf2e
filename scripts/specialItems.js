import { ModuleName } from "./utils.js";

const ItemReplacementID = "_argonUI_";

const defaultActionsIDs = {
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

var defaultActions = {};

var PF2EECHActionItems = {};
var PF2EECHFreeActionItems = {};
var PF2EECHReActionItems = {};

async function registerPF2EECHSItems () {
	PF2EECHActionItems = {
		groupflags : {
			actiontype : "action"
		},
		DropProne : {//conditional
			img: `icons/svg/down.svg`,
			id: "HYNhdaPtF1QmQbR3"
		},
		Stand : {//conditional
			img: `icons/svg/up.svg`,
			id: "OdIUybJ3ddfL7wzj"
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
		},
		Sustain : {
			img: `modules/${ModuleName}/icons/meditation.svg`,
			id: "3f5DMFu8fPiqHpRg"
		}
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

	//some preparation
	for (let itemset of [PF2EECHActionItems, PF2EECHFreeActionItems, PF2EECHReActionItems]) {
		for (let itemkey of Object.keys(itemset)) {
			if (itemkey != "groupflags") {
				if (!itemset[itemkey].flags) {
					itemset[itemkey].flags = {};
				}
				
				itemset[itemkey].flags[ModuleName] = {...itemset.groupflags, ...itemset[itemkey].flags[ModuleName], specialaction : true};
				
				let abilityItem = await fromUuid("Compendium.pf2e.actionspf2e.Item." + itemset[itemkey].id);
				if (abilityItem) {
					if (!itemset[itemkey].system) {
						itemset[itemkey].system = {};
					}
					
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
		replacement.system.description = connectedItem.system.description.value;
		replacement.img = connectedItem.img;
		replacement.system.traits = connectedItem.system.traits;
		replacement.system.item = connectedItem;
	}
	else {
		
	}
	
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

async function getDefaultActions() {
	if (Object.keys(defaultActions).length) {//compendium already loaded
		return defaultActions;
	}
	
	for (key of Object.keys(defaultActionsIDs)) {
		defaultActions[key] = await fromUuid("Compendium.pf2e.actionspf2e.Item" + defaultActionsIDs[key]);
	}
	
	return await getDefaultActions();
}

async function getTitlesDefaultActions() {
	let actions = await getDefaultActions();
	
	let titled = {};
	
	for (key of Object.keys(actions)) {
		titled[key] = actions[key].name;
	}
	
	return titled;
}

function executefunction(key, options) {
	game.pf2e.actions[key](options);
}

export {registerPF2EECHSItems, PF2EECHActionItems, PF2EECHFreeActionItems, PF2EECHReActionItems, itemfromRule}