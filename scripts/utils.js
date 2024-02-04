const ModuleName = "enhancedcombathud-pf2e";

const AoOid = "NMWXHGWUcZGoLDKb"; //id of Attack of Opportunity id
const SBid = "jM72TjJ965jocBV8"; //id of SHield Block

function replacewords(text, words = {}){
	let localtext = text;
	
	for (let word of Object.keys(words)) {
		localtext = localtext.replace("{" + word + "}", words[word]);
	}
		
	return localtext;
}

async function getTooltipDetails(item) {
	let description, footerText, itemType, category, subtitle, subtitlecolor, range, area, ammunitionType, attackbonus, save, target, actarget, duration, damage, level, spellschool, featType, specialAbilityType, weaponproperties, descriptors, role;
	let actor, abilities, actordetails;
	let title = "";
	let propertiesLabel;
	let properties = [];

	let details = [];
	
	if (!item || !item.system) return;

	actor = item.parent;
	abilities = actor?.system.abilities;
	actordetails = actor?.system.details;
	
	title = item.name;
	description = item.system?.description.value ? item.system?.description.value : item.system?.description;
	footerText = item.system?.description?.short;
	itemType = item.type;
	category = item.system.category;
	range = item.system?.range;
	area = item.system?.area;
	ammunitionType = item.system?.ammunitionType;
	attackbonus = item.system?.attackBonus;
	save = item.system?.save;
	target = item.system?.target;
	actarget = item.system?.actionTarget;
	duration = item.system?.duration;
	damage = item.system?.damage;
	level = item.system?.level;
	spellschool = item.system?.school;
	featType = item.system?.details?.category;
	specialAbilityType = item.system?.details?.specialAbilityType;
	weaponproperties = item.system?.properties;
	descriptors = item.system?.descriptors;
	role = item.system?.role;
	
	//sub title
	switch (itemType) {
		case "spell":
			subtitle = game.i18n.localize(CONFIG.SFRPG.spellSchools[spellschool]);
			break;
		case "feat":
			if (specialAbilityType && specialAbilityType != "none") {
				subtitle = CONFIG.SFRPG.specialAbilityTypes[specialAbilityType];
			}
			break;
		default:
			if (!isNaN(level)) {
				subtitle = game.i18n.localize("SFRPG.LevelLabelText") + " " + level;
				
				if (itemType == "spell") {
					subtitlecolor = levelColor(level*4);
				}
				else {
					subtitlecolor = levelColor(level);
				}
			}
			else {
				if (role) {
					subtitle = game.i18n.localize(CONFIG.SFRPG.starshipRoleNames[role]);
				}
				else {
					if (itemType != "base") {
						subtitle = CONFIG.SFRPG.itemTypes[itemType];
					}
					else {
						if (item.flags[ModuleName].subtitle) {
							subtitle = game.i18n.localize(item.flags[ModuleName].subtitle);
						}
					}
				}
			}
			break;
	}
	
	//properties
	properties = [];
	switch (itemType) {
		case "weapon":
			propertiesLabel = game.i18n.localize("SFRPG.Items.Weapon.Properties");
			properties = Object.keys(weaponproperties).filter(key => weaponproperties[key]).map(key => {return {label : CONFIG.SFRPG.weaponProperties[key]}});
			break;
		case "spell":
			propertiesLabel = game.i18n.localize("SFRPG.Descriptors.Descriptors");
			properties = Object.keys(descriptors).filter(key => descriptors[key]).map(key => {return {label : CONFIG.SFRPG.descriptors[key]}});
			break;
	}

	//details
	if (range && range.units && range.units != "none") {
		let valuetext = range.units;
		
		if (range.value) {
			valuetext = range.value + " " + valuetext;
		}
		else {
			valuetext = firstUpper(valuetext);
		}
		
		details.push({
			label: "SFRPG.Items.Activation.Range",
			value: valuetext,
		});
	}
	
	if (area) {
		if (area.shape && area.total && area.units) {
			details.push({
				label: "SFRPG.Items.Activation.Area",
				value: `${area.total}${area.units} ${firstUpper(area.shape)} ${area.effect ? firstUpper(area.effect) : ""}`,
			});
		}
	}
	
	if (damage?.parts.length) {
		let damageparts = damage.parts.map(part => {return{formula : part.formula, types : part.types}});
		
		for (const part of damageparts) {
			const roll = new Roll(part.formula, {actor, abilities, details : actordetails});
			
			await roll.evaluate();
			
			part.formulaReduced = roll.formula;
		}
		
		let label;
		if (!damageparts.find(part => part.types?.healing)) {
			label = "SFRPG.Damage.Title";
		}
		else {
			label  = "SFRPG.HealingTypesHealing";
		}
		
		details.push({
			label: label,
			value: damageparts.map(part => part.formulaReduced + " " +Object.keys(part.types).filter(key => part.types[key]).map(key => damageIcon(key)).join("<br>")),
		});
	}
	
	if (attackbonus) {
		let attackbonustext = attackbonus;
		
		if (attackbonus > 0) {
			attackbonustext = "+" + attackbonustext;
		}
		
		details.push({
			label: "SFRPG.Items.Action.AttackRollBonus",
			value: attackbonustext,
		});
	}
	
	if (target?.value) {
		details.push({
			label: "SFRPG.Items.Activation.Target",
			value: target.value,
		});
	}
	
	if (duration?.value) {
		let durationtext = duration.value;
		
		if (durationtext && durationtext.includes("@")) {
			const roll = new Roll(durationtext, {actor, details : actordetails});
			
			await roll.evaluate();
			
			durationtext = roll.total;
		}
		
		if (duration.units != "text" && duration.units) {
			durationtext = durationtext + " " + CONFIG.SFRPG.effectDurationTypes[duration.units];
		}
		
		details.push({
			label: "SFRPG.Items.Activation.Duration",
			value: durationtext,
		});
	}
	
	if (ammunitionType && ammunitionType != "none") {
		details.push({
			label: "SFRPG.WeaponPropertiesAmmunition",
			value: CONFIG.SFRPG.ammunitionTypes[ammunitionType],
		});
	}
	
	if (save?.type && save?.dc) {
		const roll = new Roll(save.dc, {actor, item, abilities});
		
		await roll.evaluate();
		
		let dc = roll.total;
		
		details.push({
			label: "SFRPG.Save",
			value: `DC ${dc} ${CONFIG.SFRPG.saves[save.type]} ${CONFIG.SFRPG.saveDescriptors[save.descriptor]}`,
		});	
	}
	
	if (actarget) {
		details.push({
			label: ModuleName + ".Titles.Against",
			value: actarget.toUpperCase(),
		});
	}

	if (description) description = await TextEditor.enrichHTML(description);

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
		default:
			return [];
	}
}

function firstUpper(string) {
	return string[0].toUpperCase() + string.substr(1);
}

function activationCost(item) {
	let glyphs = [];
		
	if (item.system.time) {
		if (["1", "2", "3"].find(time => item.system.time.value.includes(time))) {
			glyphs.push(item.system.time.value);
		}
		
		if (item.system.time.value == "reaction") {
			glyphs.push("R");
		}
		
		if (item.system.time.value == "free") {
			glyphs.push("F");
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
			glyphs.push("F");
		}
		
		if (glyphText.includes("1") || glyphText.toUpperCase().includes("A")) {
			glyphs.push("1");
		}
		
		if (glyphText.includes("2") || glyphText.toUpperCase().includes("D")) {
			glyphs.push("2");
		}
		
		if (glyphText.includes("3") || glyphText.toUpperCase().includes("T")) {
			glyphs.push("3");
		}
		
		if (glyphText.toUpperCase().includes("R")) {
			glyphs.push("R");
		}
	}
	
	if (glyphs.length == 0) {
		//assume one action by default
		glyphs = ["1"];
	}
	
	return glyphs;
}

function actionGlyphs(actionType) {
	switch(actionType) {
		case "action":
			return ["1", "2", "3"];
			break;
		case "freeaction":
			return ["F"];
			break;
		case "reaction":
			return ["R"];
			break;
		default:
			return [];
			break;
	}
}	

function hasAoO(actor) {
	return Boolean(actor.items.find(item => item.flags?.core?.sourceId?.includes(AoOid)));
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

function spelluseAction(spell, spellGroup, level) {
	return () => {
		console.log(spell, spellGroup);
		if (spell && spellGroup) {
			spellGroup.cast(spell, {consume : true, rank : level});
			
			return true;
		}
		
		return false;
	}
}

export { replacewords, getTooltipDetails, ModuleName, damageIcon, firstUpper, activationCost, actionGlyphs, hasAoO, hasSB, MAPtext, spelluseAction}