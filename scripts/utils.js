import {openNewInput} from "./popupInput.js";

const ModuleName = "enhancedcombathud-pf2e";

const settingActionSpace = {
	PF2EECHActionItems : 6,
	PF2EECHFreeActionItems : 0,
	PF2EECHReActionItems : 0
};

const tabnames = {
	character : "PF2E.TabCharacterLabel",
	actions : "PF2E.TabActionsLabel",
	inventory : "PF2E.TabInventoryLabel",
	spellcasting : "PF2E.TabSpellbookLabel",
	crafting : "PF2E.TabCraftingLabel",
	proficiencies : "PF2E.TabSkillsLabel",
	feats : "PF2E.Item.Feat.Plural",
	effects : "PF2E.Item.Effect.Plural",
	biography : "PF2E.Biography"
}

// A little bit of future-proofing, can hasFeat function will look for id or array of ids. Slug names seemed appropriate for now.
const featIds = {
	"reactive-strike": ["NMWXHGWUcZGoLDKb", "hmShTfPOcTaKgbf4", "OqU6QXkMrZqToEEi"],
	"shield-block": "jM72TjJ965jocBV8",
	"reactive-shield": "w8Ycgeq2zfyshtoS"
};

const sorttypes = ["none", "alpha", "level", "action", "rarity"];
const sortdirections = ["up", "down"];

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
		description = await TextEditor.enrichHTML(system.description.value)//, {async : true, processVisibility : false, rollData : {actor : item.actor, item : item}, secrets : true});
		subtitle = system.traits.rarity ? game.i18n.localize("PF2E.Trait" + firstUpper(system.traits.rarity)) : "";
		if (system?.level?.hasOwnProperty("value")) {
			subtitle = subtitle + ` ${replacewords(game.i18n.localize("PF2E.LevelN"), {level : item.system.level.value})}`;
		}
		subtitlecolor = system.traits.rarity ? `var(--color-rarity-${system.traits.rarity})` : "";
		properties = traitsofItem(item);
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
		
		if (system.target?.value) {
			details.push({
				label: game.i18n.localize("PF2E.SpellTargetLabel"),
				value: system.target?.value
			});
		}
		
		if (system.category && item.type == "action") {
			let actionicon = categoryIcon(system.category);
			
			details.push({
				label: game.i18n.localize("PF2E.Category"),
				value: game.i18n.localize("PF2E.Item.Ability.Category." + firstUpper(system.category)) + (actionicon.length ? ` <i class="${actionicon.join(" ")}"></i>` : "")
			});
		}
		
		let range;
		if (item.type == "weapon" || item.type == "shield") {
			if (system.rangelabel) {
				range = system.rangelabel;
			}
			else {
				if (system.range) {
					range = replacewords(game.i18n.localize("PF2E.WeaponRangeN"), {range : system.range});
				}
				else {
					range = replacewords(game.i18n.localize("PF2E.Item.Weapon.NoRangeMelee"));
				}
			}
		}
		else {
			if (system.range) {
				range = system.range;
				
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
		
		if (system.area) {
			details.push({
				label: game.i18n.localize("PF2E.Area.Label"),
				value: replacewords(game.i18n.localize("PF2E.WeaponRangeN"), {range : system.area.value}) + " " + game.i18n.localize("PF2E.Area.Shape." + system.area.type)
			});
		}
		
		let Attackvalue = system.attackValue;
		if (!Attackvalue) {
			let action = item.actor?.system.actions.find(action => action.slug == system.slug);
			if (action?.variants?.length) {
				Attackvalue = action.variants[0].label;
			}
			
			if (!Attackvalue && item.type == "melee") {
				Attackvalue = system?.bonus?.value
			}
		}
		if (Attackvalue || (Attackvalue === 0)) {
			details.push({
				label: game.i18n.localize("PF2E.TraitAttack"),
				value: `${Attackvalue > 0 ? "+" : ""}${Number(Attackvalue)}`
			});
			
			let mapValues = [MAPtext(item, 1), MAPtext(item, 2)].filter(map => map).map(map => map.split(" ")[1]);
			if (mapValues.length == 2) {
				details.push({
					label: game.i18n.localize("PF2E.MAPAbbreviationLabel").split(" ")[0],
					value: mapValues.join("/")
				});
			}
		}
		
		if (system.acBonus) {
			details.push({
				label: game.i18n.localize("PF2E.ArmorArmorLabel"),
				value: system.acBonus
			});
		}
		
		if (item.type == "shield") {
			if (system.hasOwnProperty("hardness")) {
				details.push({
					label: game.i18n.localize("PF2E.HardnessLabel"),
					value: system.hardness
				});
			}
			
			if (system.hp?.hasOwnProperty("brokenThreshold")) {
				details.push({
					label: game.i18n.localize("PF2E.Item.Physical.BrokenThreshold.Label"),
					value: system.hp.brokenThreshold
				});
			}
		}
		
		let damageentry;
		if (item.type == "spell" || item.type == "melee") {
			let damages = item.type == "spell" ? system.damage : system.damageRolls
			let entries = [];
			for (let key of Object.keys(damages)) {
				let type = damages[key].type || damages[key].kind || damages[key].damageType;
				
				let formula = damages[key].formula || damages[key].damage
				
				if (!type && damages[key].kinds) {
					type = Object.values(damages[key].kinds).find(value => damageIcon(value).length);
				}
				
				entries.push(`${formula} ${damagecategoryIcon(damages[key].category)} <i class="${damageIcon(type).join(" ")}"></i>`)
			}
			damageentry = entries.join("<br>");
		}
		else {
			if (system.damage) {
				let type = system.damage.damageType || system.damage.kind;
				
				let formula = system.damage.dice && system.damage.die ? `${system.damage.dice}${system.damage.die}` : system.damage.formula;
				
				damageentry = `${formula} ${damagecategoryIcon(system.damage.category)} <i class="${damageIcon(type).join(" ")}"></i>`
			}
		}
		if (damageentry) {
			details.push({
				label: game.i18n.localize("PF2E.DamageLabel"),
				value: damageentry
			});
		}
		
		if (system.duration?.value || system.duration?.sustained) {
			let symbol = "";
			if (system.duration?.sustained) {
				symbol = `<i class="fa-solid fa-s"></i> `;
			}
			
			details.push({
				label: game.i18n.localize("PF2E.Time.Duration"),
				value: symbol + system.duration.value
			});
		}
		
		if (system.defense?.save?.statistic) {
			details.push({
				label: game.i18n.localize("PF2E.Item.Spell.Defense.Label"),
				value: game.i18n.localize("PF2E.Saves" + firstUpper(system.defense.save.statistic))
			});
		}
		
		if (game.user.isGM) {
			footerText = await TextEditor.enrichHTML(system.description.gm);
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

function sheettabbutton(tab) {
	switch (tab) {
		case "character":
			return ["fa-solid", "fa-address-card"];
		case "actions":
			return ["fa-solid", "fa-diamond"];
		case "inventory":
			return ["fa-solid", "fa-box-open"];
		case "spellcasting":
			return ["fa-solid", "fa-wand-magic-sparkles"];
		case "crafting":
			return ["fa-solid", "fa-hammer"];
		case "proficiencies":
			return ["fa-solid", "fa-hand-paper"];
		case "feats":
			return ["fa-solid", "fa-medal"];
		case "effects":
			return ["fa-solid", "fa-person-rays"];
		case "biography":
			return ["fa-solid", "fa-book-reader"];
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
	if (!string.length) return string;
	
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

/**
 * Checks if the actor has any of the specified feats.
 *
 * @param {Object} actor - The actor to check for feats.
 * @param {string|string[]} featNames - The name or names of the feats to check for. This can be a single string or an array of strings.
 *
 * @returns {boolean} Returns true if the actor has any of the specified feats, otherwise returns false.
 *
 * @example
 * // Check if the actor has the "Shield Block" feat
 * let hasShieldBlock = hasFeat(actor, "Shield Block");
 *
 * @example
 * // Check if the actor has either the "Shield Block" or "Reactive Shield" feat
 * let hasShieldFeats = hasFeat(actor, ["Shield Block", "Reactive Shield"]);
 */
function hasFeats(actor, featNames) {
	let featNamearray = Array.isArray(featNames) ? featNames : [featNames];
	
	return featNamearray.some(featName => {
		let featIDarray = Array.isArray(featIds[featName]) ? featIds[featName] : [featIds[featName]];
		
		return Boolean(actor.items.find(item => featIDarray.some(id => item.flags?.core?.sourceId?.includes(id))));
	});
}

function MAPtext(item, MAP = 0) {
	let action = connectedsettingAction(item);
	
	let variant = action?.variants[MAP];
	
	if (action && variant) {
		let mapString = variant.label?.substring(
			variant.label.indexOf("(") + 1, 
			variant.label.lastIndexOf(")")
		);
		
		return mapString;
	}
	else {
		let penaltyLevel = 5;
		
		if (item?.system?.traits?.value?.includes("agile")) {
			penaltyLevel = 4;
		}
		
		let penalty = -MAP * penaltyLevel;
		
		return replacewords(game.i18n.localize("PF2E.MAPAbbreviationLabel"), {penalty : penalty});
	}
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
				
				let heightenedto = await openNewInput("choice", game.i18n.localize("PF2E.CastLabel"), game.i18n.localize("PF2E.SpellLevelLabel"), {defaultValue : level,options : castoptions});
				
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
	if (item) {
		let actor = item.actor;
		
		if (actor) {
			if (item.system?.slug) {
				action = actor.system.actions.find(action => action.slug == item.system.slug && action.item == item);
				
				if (!action) {
					action = actor.system.actions.find(action => action.slug == item.system.slug);
				}
			}
			else {
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
		}
	}
	
	return action;
}

function itemcanbetwoHanded(item) {
	if (item) {
		let action = connectedsettingAction(item);
		
		if (action?.auxiliaryActions?.find(action => action.annotation == "grip")) {
			return true;
		}
	}
	
	return false;
}

function itemfilter(item, settings = {}) {
	if (Array.isArray(item)) {
		return item.filter(item => itemfilter(item, settings));
	}
	
	if (item) {
		if (["consumable", "equipment"].includes(item.type)) {
			switch (item.system?.usage?.type) {
				case "worn":
				case "attached":
					return (item.system.equipped?.inSlot || item.system.equipped?.handsHeld > 0);
					break;
				case "carried":
					return true;
					break;
				case "held":
					return true;
					break;
			}
		}
	}
	
	return true;
}

function actionfilter(action, settings = {actiontype : "", classonly : false, notclass : false, notAoO : false, includeFeats : false}) {
	if (!action) return;
	
	if (action.filter) {
		return action.filter(action => actionfilter(action, settings));
	}
	
	if (action.type != "action" && !(settings.includeFeats && action.type == "feat")) {
		return false;
	}
	if (settings.actiontype) {
		if (action.system.actionType?.value != settings.actiontype) {return false;}
	}
	if (settings.classonly) {
		if (!isClassFeature(action)) {return false;}
	}
	if (settings.notclass) {
		if (isClassFeature(action)) {return false;}
	}
	if (settings.notAoO) {
		let sourceID = connectedItem(action)?.getFlag("core", "sourceId");
		if (hasFeats(action.actor, "reactive-strike")) {return false;}
	}
	
	return true;
}

function sortfunction(type, direction) {
	let directionfactor = 0;
	
	switch (direction) {
		case "<":
		case "up":
			directionfactor = 1;
			break;
		case ">":
		case "down":
			directionfactor = -1;
			break;
	}
	
	switch (type) {
		case "alpha":
			return (itema, itemb) => {
				if (itema.name < itemb.name) return -directionfactor;
				if (itema.name > itemb.name) return directionfactor;
				return 0;
			}
		case "level":
			return (itema, itemb) => {
				if (itema.level < itemb.level) return -directionfactor;
				if (itema.level > itemb.level) return directionfactor;	
				return 0;
			}
		case "action":
			return (itema, itemb) => {
				let actioninfoa = actioninfo(itema);
				let actioninfob = actioninfo(itemb);
				if (actioninfoa.actionType.value == actioninfob.actionType.value) {
					if (actioninfoa.actions.value < actioninfoa.actions.value) return -directionfactor;
					if (actioninfoa.actions.value > actioninfoa.actions.value) return directionfactor;	
				}
				return 0;
			}
		case "rarity":
			return (itema, itemb) => {
				const rarities = ["common", "uncommon", "rare", "unique"];
				if (rarities.indexOf(itema.rarity) < rarities.indexOf(itemb.rarity)) return -directionfactor;
				if (rarities.indexOf(itema.rarity) > rarities.indexOf(itemb.rarity)) return directionfactor;	
				return 0;
			}
		case "infused":
			return (itema, itemb) => {
				let aisinfused = itema.system?.traits.value?.includes("infused");
				let bisinfused = itemb.system?.traits.value?.includes("infused");
				if (aisinfused && !bisinfused) return -directionfactor;
				if (!aisinfused && bisinfused) return directionfactor;	
				return 0;
			}
		default:
			return (itema, itemb) => {return 0};
	}
}

function traitsofItem(item) {
	let traits = item.system.traits.value?.map((trait) => {return {id : trait}});
	
	let action = connectedsettingAction(item);
	
	if (action) {
		let actionTraits = action.traits.map(trait => {
			return {
				id : trait.name,
				label : trait.label
			}
		});
		
		actionTraits = actionTraits.concat(action.additionalEffects?.map((trait) => {
			return {
				id : trait.tag,
				label : trait.label
			}
		}));
		
		actionTraits = actionTraits.filter(trait => trait);
		
		actionTraits = actionTraits.filter(trait => !traits.find(includedtrait => includedtrait.id == trait.id));
		
		traits = traits.concat(actionTraits);
	}
	
	return traits;
}

function connectedPassives(item) {
	let actor = item?.actor;
	
	if (actor) {
		let traits = traitsofItem(item);
		
		let passives = traits.map(trait => actor.items.find(i => i.name == trait?.label)).filter(passive => passive);
		
		return passives;
	}
}

async function toggleFavourite(item) {
	await item.setFlag(ModuleName, "isFavourite", !isFavourite(item));
}

function isFavourite(item, classbydefault = true) {
	let favourite = item.getFlag && item.getFlag(ModuleName, "isFavourite");
	
	if (classbydefault && favourite == undefined) favourite = isClassFeature(item);
	
	return favourite;
	
	return false;
}

export { ModuleName, settingActionSpace, sorttypes, sortdirections, tabnames, replacewords, getTooltipDetails, actionGlyphofItem, damageIcon, firstUpper, actioninfo, actionGlyphs, sheettabbutton, hasFeats, MAPtext, spelluseAction, itemconnectedAction, isClassFeature, connectedItem, connectedsettingAction, itemcanbetwoHanded, itemfilter, actionfilter, sortfunction, connectedPassives, toggleFavourite, isFavourite}