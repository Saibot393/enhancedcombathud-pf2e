import {openNewInput} from "./popupInput.js";

const ModuleName = "enhancedcombathud-pf2e";

const settingActionSpace = {
	PF2EECHActionItems : 6,
	PF2EECHFreeActionItems : 0,
	PF2EECHReActionItems : 0
};

const AoOids = ["NMWXHGWUcZGoLDKb", "hmShTfPOcTaKgbf4", "hmShTfPOcTaKgbf4"]; //id of Attack of Opportunity id
const SBid = "jM72TjJ965jocBV8"; //id of Shield Block

function replacewords(text, words = {}){
	let localtext = text;
	
	for (let word of Object.keys(words)) {
		localtext = localtext.replace("{" + word + "}", words[word]);
	}
		
	return localtext;
}

async function getTooltipDetails(item) {
	let title, description, subtitle, subtitlecolor, details, properties , propertiesLabel, footerText;
	
	const actor = item.actor;
			
	if (item.system.identification?.status == "unidentified" && game.user.isGM) {
		title = item.system.identification.unidentified.name;
		description = item.system.identification.unidentified.data.description.value;
		subtitle = game.i18n.localize("PF2E.identification.Unidentified");
	}
	else {
		const dynamicstate = item.getFlag && item.getFlag(ModuleName, "dynamicstate");
		
		const system = dynamicstate ? dynamicstate.system({actor}) : item.system;
		
		title = dynamicstate ? dynamicstate.name({actor}) : item.name;
		description = await TextEditor.enrichHTML(system.description.value);
		subtitle = system.traits.rarity ? game.i18n.localize("PF2E.Trait" + firstUpper(system.traits.rarity)) : "";
		subtitlecolor = system.traits.rarity ? `var(--color-rarity-${system.traits.rarity})` : "";
		properties = system.traits.value?.map((trait) => {return {label : trait.toUpperCase()}});
		propertiesLabel = properties?.length ? game.i18n.localize("PF2E.TraitsLabel") : "";
		
		details = [];
		
		let actionGlyph = actionGlyphofItem(dynamicstate ? {system} : item);
		if (actionGlyph) {
			title = `${title} <span class=\"action-glyph\">${actionGlyph}</span>`;
		}
		
		if (item.type == "melee") {
			details.push({
				label: game.i18n.localize("PF2E.Roll.Type"),
				value: item.isMelee ? game.i18n.localize("PF2E.NPCAttackMelee") : game.i18n.localize("PF2E.NPCAttackRanged")
			});
		}
		
		if (item.system.target?.value) {
			details.push({
				label: game.i18n.localize("PF2E.SpellTargetLabel"),
				value: item.system.target?.value
			});
		}
		
		if (item.system.category && item.type == "action") {
			let actionicon = categoryIcon(item.system.category);
			
			details.push({
				label: game.i18n.localize("PF2E.Category"),
				value: game.i18n.localize("PF2E.Item.Action.Category." + firstUpper(item.system.category)) + (actionicon.length ? ` <i class="${actionicon.join(" ")}"></i>` : "")
			});
		}
		
		let range;
		if (item.type == "weapon" || item.type == "shield") {
			if (item.system.rangelabel) {
				range = item.system.rangelabel;
			}
			else {
				if (item.system.range) {
					range = replacewords(game.i18n.localize("PF2E.WeaponRangeN"), {range : item.system.range});
				}
				else {
					range = replacewords(game.i18n.localize("PF2E.Item.Weapon.NoRangeMelee"));
				}
			}
		}
		else {
			if (item.system.range) {
				range = item.system.range;
				
				if (range && range.hasOwnProperty("value")) {
					range = range.value;
				}
			}
		}
		if (range) {
			details.push({
				label: game.i18n.localize("PF2E.TraitRange"),
				value: range
			});
		}
		
		if (item.system.area) {
			details.push({
				label: game.i18n.localize("PF2E.AreaLabel"),
				value: replacewords(game.i18n.localize("PF2E.WeaponRangeN"), {range : item.system.area.value}) + " " + game.i18n.localize("PF2E.AreaType" + firstUpper(item.system.area.type))
			});
		}
		
		if (item.type == "weapon") {
			let value = item.system.attackValue;
			
			if (!value) {
				let action = item.actor?.system.actions.find(action => action.slug == item.system.slug);
				if (action?.variants?.length) {
					value = action.variants[0].label;
				}
			}
			
			if (value) {
				details.push({
					label: game.i18n.localize("PF2E.TraitAttack"),
					value: value
				});
			}
		}
		
		if (item.system.acBonus) {
			details.push({
				label: game.i18n.localize("PF2E.ArmorArmorLabel"),
				value: item.system.acBonus
			});
		}
		
		if (item.type == "shield") {
			if (item.system.hasOwnProperty("hardness")) {
				details.push({
					label: game.i18n.localize("PF2E.HardnessLabel"),
					value: item.system.hardness
				});
			}
			
			if (item.system.hp?.hasOwnProperty("brokenThreshold")) {
				details.push({
					label: game.i18n.localize("PF2E.Item.Physical.BrokenThreshold.Label"),
					value: item.system.hp.brokenThreshold
				});
			}
		}
		
		let damageentry;
		if (item.type == "spell") {
			let entries = [];
			for (let key of Object.keys(item.system.damage)) {
				let type = item.system.damage[key].type || item.system.damage[key].kind;
				
				if (!type && item.system.damage[key].kinds) {
					type = Object.values(item.system.damage[key].kinds).find(value => damageIcon(value).length);
				}
				
				entries.push(`${item.system.damage[key].formula} ${damagecategoryIcon(item.system.damage[key].category)} <i class="${damageIcon(type).join(" ")}"></i>`)
			}
			damageentry = entries.join("<br>");
		}
		else {
			if (item.system.damage) {
				let type = item.system.damage.damageType || item.system.damage.kind;
				
				let formula = item.system.damage.dice && item.system.damage.die ? `${item.system.damage.dice}${item.system.damage.die}` : item.system.damage.formula;
				
				damageentry = `${formula} ${damagecategoryIcon(item.system.damage.category)} <i class="${damageIcon(type).join(" ")}"></i>`
			}
		}
		if (damageentry) {
			details.push({
				label: game.i18n.localize("PF2E.DamageLabel"),
				value: damageentry
			});
		}
		
		if (item.system.duration?.value || item.system.duration?.sustained) {
			let symbol = "";
			if (item.system.duration?.sustained) {
				symbol = `<i class="fa-solid fa-s"></i> `;
			}
			
			details.push({
				label: game.i18n.localize("PF2E.Time.Duration"),
				value: symbol + item.system.duration.value
			});
		}
		
		if (item.system.defense?.save?.statistic) {
			details.push({
				label: game.i18n.localize("PF2E.Item.Spell.Defense.Label"),
				value: game.i18n.localize("PF2E.Saves" + firstUpper(item.system.defense.save.statistic))
			});
		}
		
		if (game.user.isGM) {
			footerText = await TextEditor.enrichHTML(item.system.description.gm);
		}
	}

	return { title, description, subtitle, subtitlecolor, details, properties , propertiesLabel, footerText };
}

function levelColor(level) {
					//blue -> green -> violet -> red -> orange
	const colors = ["#1d91de", "#198f17", "#981cb8", "#ab260c", "#c29810"];
	
	if (level >= 21) {
		return "#000000";
	}
	
	if (level <= 0) {
		return "#8c4c0b";
	}
	
	return colors[Math.floor(level/5)];
}

function damageIcon(damageType) {
	let iconclass = [];
	
	if (!damageType) return iconclass;
	
	switch (damageType.toLowerCase()) {
		case "acid":
			return ["fa-solid", "fa-flask"];
		case "bludgeoning":
			return ["fa-solid", "fa-hammer"];
		case "cold":
			return ["fa-solid", "fa-snowflake"];
		case "electricity":
			return ["fa-solid", "fa-bolt"];
		case "fire":
			return ["fa-solid", "fa-fire"];
		case "vitality":
			return ["fa-solid", "fa-sun"];
		case "void":
			return ["fa-solid", "fa-skull"];
		case "piercing":
			return ["fa-solid", "fa-bow-arrow"];
		case "slashing":
			return ["fa-solid", "fa-axe"];
		case "sonic":
			return ["fa-solid", "fa-waveform-lines"];
		case "spirit":
			return ["fa-solid", "fa-ghost"];
		case "mental":
			return ["fa-solid", "fa-brain"];
		case "poison":
			return ["fa-solid", "fa-spider"];
		case "blood":
			return ["fa-solid", "fa-droplet"];
		case "precision":
			return ["fa-solid", "fa-crosshairs"];
		case "healing":
			return ["fa-solid", "fa-heart"]
		default:
			return [];
	}
}

function categoryIcon(category) {
	let iconclass = [];
	
	if (!category) return iconclass;
	
	switch (category.toLowerCase()) {
		case "interaction":
			return ["fa-solid", "fa-hand"];
		case "defensive":
			return ["fa-solid", "fa-circle-dot"];
		case "offensive":
			return ["fa-solid", "fa-swords"];
		case "familiar":
			return ["fa-solid", "fa-cat"];
		default:
			return [];
	}
}

function damagecategoryIcon(category) {
	switch (category) {
		case "persistent": return `<i class="fa-solid fa-hourglass"></i>`;
		case "precision": return `<i class="fa-solid fa-crosshair"></i>`;
		case "splash": return `<i class="fa-solid fa-burst"></i>`;
		default : return "";
	}
}

function firstUpper(string) {
	if (string.length == 0) return string;
	
	return string[0].toUpperCase() + string.substr(1);
}

function actioninfo(item) {
	let action = {actionType : {}, actions : {}};
	
	if (item.type == "weapon" || item.type == "shield") {
		action.actionType.value = "action";
		action.actions.value = 1;
	}
	else {
		if (item.system.actionType?.value) {
			action.actionType.value = item.system.actionType.value;
			action.actions.value = item.system.actions.value;
		}
		else {
			if (item.system.time) {
				if (["1", "2", "3"].find(time => item.system.time.value.includes(time))) {
					action.actionType.value = "action";
					action.actions.value = Number(["1", "2", "3"].find(time => item.system.time.value.includes(time)));
				}
				
				if (item.system.time.value == "reaction") {
					action.actionType.value = "reaction";
				}
				
				if (item.system.time.value == "free") {
					action.actionType.value = "free";
				}
			}
			else {
				let dom = $((new DOMParser).parseFromString(item.system.description.value, "text/html"));
				let actionGlyphs = dom.find("span.action-glyph");
				let glyphText = "";
				for (let i = 0; i < actionGlyphs.length; i++) {
					glyphText = glyphText + actionGlyphs[i].innerHTML;
				}
				
				if (glyphText.toUpperCase().includes("F")) {
					action.actionType.value = "free";
				}
				
				for (let keys of [["1", "A"], ["2", "D"], ["3", "T"]]) {
					if (glyphText.includes(keys[0]) || glyphText.toUpperCase().includes(keys[1])) {
						action.actionType.value = "action";
						action.actions.value = Number(keys[0]);
					}
				}
				
				if (glyphText.toUpperCase().includes("R")) {
					action.actionType.value = "reaction";
				}
			}
		}
	}
	
	if (!action.actionType.value) {
		//assume one action by default
		action.actionType.value = "action";
		action.actions.value = 1;
	}
	
	return action;
}

function actionGlyphs(actionType, number = 0) {
	switch(actionType) {
		case "action":
			return ["1", "2", "3"][number-1];
			break;
		case "free":
			return "F";
			break;
		case "reaction":
			return "R";
			break;
		case "passive":
			return "◇";
		default:
			return [];
			break;
	}
}	

function actionGlyphofItem(item) {
	if (item.system.actionType?.value) {
		return actionGlyphs(item.system.actionType.value, item.system.actions.value);
	}
	
	let actionInfo = actioninfo(item);
	
	if (actionInfo) {
		return actionGlyphs(actionInfo.actionType.value, actionInfo.actions.value);
	}
}

function hasAoO(actor) {
	return Boolean(actor.items.find(item => AoOids.find(id => item.flags?.core?.sourceId?.includes(id))));
}

function hasSB(actor) {
	return Boolean(actor.items.find(item => item.flags?.core?.sourceId?.includes(SBid)));
}

function MAPtext(item, MAP = 0) {
	let penaltyLevel = 5;
	
	if (item?.system.traits?.value?.includes("agile")) {
		penaltyLevel = 4;
	}
	
	let penalty = -MAP * penaltyLevel;
	
	return replacewords(game.i18n.localize("PF2E.MAPAbbreviationLabel"), {penalty : penalty});
}

function spelluseAction(spell, level, heightenlevel = 0) {
	return async () => {
		if (spell) {
			if (heightenlevel > level) {
				let castoptions = {};
				
				let spellgroup = spell.spellcasting;
				
				for (let i = level; i <= heightenlevel; i++) {
					let ordinal;
					switch (i) {
						case 1:
							ordinal = game.i18n.localize("PF2E.OrdinalSuffixes.one");
							break;
						case 2:
							ordinal = game.i18n.localize("PF2E.OrdinalSuffixes.two");
							break;
						case 3:
							ordinal = game.i18n.localize("PF2E.OrdinalSuffixes.few");
							break;
						default:
							ordinal = game.i18n.localize("PF2E.OrdinalSuffixes.many");
							break;
					}
					
					castoptions[i] = {label : `${i}${ordinal} ${game.i18n.localize("PF2E.Item.Spell.Rank.Label")} [${spellgroup.system.slots["slot" + i].value}/${spellgroup.system.slots["slot" + i].max}]`};
				}
				
				let heightenedto = await openNewInput("choice", game.i18n.localize("PF2E.CastLabel"), game.i18n.localize("PF2E.SpellLevelLabel.CastingItemCreateDialog"), {defaultValue : level,options : castoptions});
				
				spell.spellcasting.cast(spell, {consume : true, rank : Number(heightenedto)});
			}
			else {
				spell.spellcasting.cast(spell, {consume : true, rank : level});
			}
			
			return true;
		}
		
		return false;
	}
}

function itemconnectedAction(item) {
	if (item && item.actor) {
		return item.actor.system.actions.find(action => action.item == item);
	}
	
	return null;
}

function isClassFeature(item) {
	let checkitem = item;
	
	if (item.type == "action") {
		checkitem = connectedItem(item);
	}
	
	return checkitem?.system.category == "classfeature";
}

function connectedItem(action) {
	if (action.getFlag("pf2e", "grantedBy")) {
		return action.actor.items.get(action.getFlag("pf2e", "grantedBy").id);
	}
	
	return null;
}

function connectedsettingAction(item) {
	let action;
	let actor = item.actor;
	
	if (item.system.slug) {
		action = actor.system.actions.find(action => action.slug == item.system.slug);
	}
	
	if (!action) {
		action = actor.system.actions.find(action => action.item == item);
	}
	
	if (!action && item.type == "melee") {
		action = actor.system.actions.find(action => action.slug == item.name.toLowerCase());
	}
	
	if (item.getFlag(ModuleName, "thrown") || item.getFlag(ModuleName, "combination-melee")) {
		if (action?.altUsages?.length) {
			action = action.altUsages[0];
		}
		else {
			if (item.getFlag(ModuleName, "thrown")) {
				action = actor.system.actions.find(action => action.slug == item.name.toLowerCase() && action.options.includes("ranged"));
			}
			if (item.getFlag(ModuleName, "combination-melee")) {
				action = actor.system.actions.find(action => action.slug == item.name.toLowerCase() && action.options.includes("melee"));
			}
		}
	}
	
	return action;
}

function itemcanbetwoHanded(item) {
	let action = connectedsettingAction(item);
	
	if (action?.auxiliaryActions?.find(action => action.annotation == "grip") {
		return true;
	}
	
	return false;
}

export { ModuleName, settingActionSpace, replacewords, getTooltipDetails, damageIcon, firstUpper, actioninfo, actionGlyphs, hasAoO, hasSB, MAPtext, spelluseAction, itemconnectedAction, isClassFeature, connectedItem, connectedsettingAction, itemcanbetwoHanded}