import {registerPF2EECHSItems, PF2EECHActionItems, PF2EECHFreeActionItems, PF2EECHReActionItems, trainedactions, itemfromRule} from "./specialItems.js";
import {replacewords, ModuleName, sorttypes, sortdirections, getTooltipDetails, actionGlyphofItem, damageIcon, firstUpper, actioninfo, hasFeats, MAPtext, actionGlyphs, spelluseAction, itemconnectedAction, isClassFeature, connectedItem, connectedsettingAction, itemcanbetwoHanded, tabnames, sheettabbutton, itemfilter, actionfilter, sortfunction, connectedPassives, toggleFavourite, isFavourite} from "./utils.js";
import {openNewInput} from "./popupInput.js";                                                                                                                                                                                    
import {elementalBlastProxy} from "./proxyfake.js";  
import {createItemMacro} from "./macro.js";

import {updateActionEffect} from "./compatibility/effects.js";                                                                                                                                                                      

const defaultIcons = ["systems/pf2e/icons/actions/FreeAction.webp", "systems/pf2e/icons/actions/OneAction.webp", "systems/pf2e/icons/actions/OneThreeActions.webp", "systems/pf2e/icons/actions/OneTwoActions.webp", "systems/pf2e/icons/actions/Passive.webp", "systems/pf2e/icons/actions/Reaction.webp", "systems/pf2e/icons/actions/ThreeActions.webp", "systems/pf2e/icons/actions/TwoActions.webp", "systems/pf2e/icons/actions/TwoThreeActions.webp", "icons/sundries/books/book-red-exclamation.webp"]

const maxactions = 3;
const maxreactions = 1;

const hpblue = "rgb(10, 200, 255)";
const hpred = "rgb(255 10 10)";
const hporange = "rgb(255 127 0)";
const hpyellow = "rgb(255 255 0)";
const hpgreen = "rgb(0 255 100)";

/* EXPERIMENTAL code to add custom colors
Hooks.once("argonDefaultColor", (defaultColors) => {
	defaultColors.colors.movement.test123 = { background: "#c85f5aFF", boxShadow: "#dc736eCC" };
	//ui.ARGON.setColorSettings();
	
	//document.styleSheets
	//document.styleSheets[1].addRule(".extended-combat-hud .movement-hud .movement-spaces .movement-space.test-movement", "background-color: var(--ech-movement-dangerMovement-background); box-shadow: 0px 0px 10px 0px var(--ech-movement-dangerMovement-boxShadow);")
	//ui.ARGON.setColorSettings()
	//game.settings.get("enhancedcombathud", "echThemeData")
	
	//problem 635:  const json = await this.getThemeJson(theme.theme);
});	

//for config
Hooks.once("init", () => {
	Hooks.call("argonDefaultColor", defaultTheme);
});
*/
const timeout = async ms => new Promise(res => setTimeout(res, ms));

const favourableTypes = ["weapon", "shield", "consumable", "feat", "action"];

function createToggleIcons(toggles, options = {}) {
	const iconsize = options.hasOwnProperty("iconsize") ? options.iconsize : 30;
	
	const iconpanel = document.createElement("div");
	for (let direction of ["top", "bottom", "left", "right"]) {
		if (options.hasOwnProperty(direction + "offset")) iconpanel.style[direction] = `${options[direction + "offset"]}px`;
	}
	if (options.align) iconpanel.style.alignSelf = options.align;
	
	iconpanel.style.position = "absolute";
	//iconpanel.style.width = `${iconsize}px`;
	iconpanel.style.width = "auto";
	//iconpanel.style.height = `${toggles.length * iconsize}px`;
	iconpanel.style.height = "auto";
	iconpanel.style.backgroundColor = `rgba(0, 0, 0, ${game.settings.get(ModuleName, "iconshadow")})`;
	iconpanel.style.display = "flex";
	iconpanel.style.flexDirection = "column";
	iconpanel.style.alignItems = "center";
	iconpanel.style.justifyContent = "center";
	/*
	if (toggles.find(toggle => !toggle.showalways)) {
		iconpanel.classList.add("specialAction");
		iconpanel.style.visibility = "hidden";
	}
	*/
	
	for (let toggle of toggles) {
		let icon;
		if (toggle.iconclass) {
			icon = document.createElement("i");
			icon.classList.add("icon", ...toggle.iconclass);
			icon.style.fontSize = `${iconsize*0.75}px`;
			if (toggle.greyed) {
				icon.style.filter = "invert(0.6)"; //for white icon
			}
		}
		if (toggle.iconsource) {
			icon = document.createElement("div");
			icon.style.backgroundImage = `url(${toggle.iconsource})`;
			icon.style.backgroundSize = "cover";
			icon.style.filter = "invert(1)"; //for white icon
			if (toggle.greyed) {
				icon.style.filter = "invert(0.4)"; //for white icon
			}
		}
		if (toggle.text) {
			icon = document.createElement("div");
			icon.classList.add("action-glyph");
			icon.innerHTML = toggle.text;
			icon.style.fontColor = "white"; //for white icon
			icon.style.fontSize = `${iconsize*0.75}px`;
			if (toggle.greyed) {
				icon.style.fontColor = "grey"; //for white icon
			}
		}
		
		if (icon) {
			if (toggle.tooltip) icon.setAttribute("data-tooltip", toggle.tooltip);
			
			if (!toggle.showalways) {
				icon.classList.add("specialAction");
				//icon.style.visibility = "hidden";
				icon.style.display = "none";
			}
			
			icon.onclick = (event) => {
				toggle.onclick(event);
			}
			if (toggle.onrclick) {
				icon.oncontextmenu = (event) => {
					toggle.onrclick(event);
				}
			}
			icon.style.height = `${iconsize}px`;
			icon.style.width = `${iconsize}px`;
			icon.style.textShadow = "0 0 10px rgba(0,0,0,0)";
			icon.style.textAlign = "center";
			
			iconpanel.appendChild(icon);
		}
		else {
			console.log(toggle);
			console.log(toggles);
		}
	}
	
	return iconpanel;	
}

//ammend Hooks
Hooks.once("ready", async () => {
	if (game.settings.get(ModuleName, "lockedmacros")) {//remove in later version
		await game.user.setFlag(ModuleName, "lockedmacros", game.settings.get(ModuleName, "lockedmacros"));
		
		game.settings.set(ModuleName, "lockedmacros", null)
	}
	
	if (!game.user.getFlag(ModuleName, "lockedmacros")) {
		game.user.setFlag(ModuleName, "lockedmacros", {});
	}
});

Hooks.on("updateItem", (item) => {
	const PF2EDailies = "pf2e-dailies";
	if (ui.ARGON && item.parent == ui.ARGON?.components.portrait?.actor) {
		if (item.type == "condition") {
			ui.ARGON.components.portrait.render();
		}
		if (item.type == "consumable" && item.system.category == "ammo") {
			for (const itemButton of ui.ARGON.itemButtons) {
				if (itemButton.item?.ammo == item) {
					itemButton.render();
				}
			}
		}
		/*
		if (item.type == "spellcastingEntry") {
			let staffid;
			
			if (game.modules.get(PF2EDailies)?.active) {	
				staffid = item.staff?.id;
			}
			
			if (staffid) {
				for (const itemButton of ui.ARGON.itemButtons) {
					if (itemButton.item?.id == staffid || item.spells?.get(itemButton.item?.id)) {
						console.log(itemButton);
						itemButton.render();
					}
				}
			}
		}
		*/
		if (item.rules?.length) {
			for (const itemButton of ui.ARGON.itemButtons) {
				if (itemButton.item?.system?.updateID == item.id) {
					itemButton.render();
				}
			}
		}
		if (item.type == "action") {
			ui.ARGON.itemButtons.filter(button => button.isWeaponSet).forEach(button => button.render());
		}
	}
});

Hooks.on("updateActor", (actor, change) => {
	const PF2EDailies = "pf2e-dailies";
	if (change?.flags && change?.flags[PF2EDailies]?.extra?.staffData) {
		let staffid;
		
		if (game.modules.get(PF2EDailies)?.active) {	
			staffid = actor?.flags[PF2EDailies]?.extra?.staffData?.staffId;
		}
		
		if (staffid) {
			for (const itemButton of ui.ARGON.itemButtons) {
				if (itemButton.item?.id == staffid) {
					itemButton.render();
				}
			}
		}
	}
});

Hooks.on("createCombatant", (combatant) => {
	if (ui.ARGON?._actor?.id == combatant?.actorId) {
		ui.ARGON.render();
	}
});

function useAction(actionType, actions = 1, context = {}) {
	if (!ui.ARGON.enabled) return false;
	
	let used = actions;
	
	if (isNaN(used)) {
		used = 1;
	}
	
	switch (actionType) {
		case "action":
			ui.ARGON.components.main[0].currentActions = ui.ARGON.components.main[0].currentActions - used;
			break;
		case "free":
			break;
		case "reaction":
			ui.ARGON.components.main[1].currentActions = ui.ARGON.components.main[2].currentActions - used;
			break;
	}
	
	if (!context.actualmovement) {
		if (!game.settings.get(ModuleName, "allowmovementsplit")) {
			ui.ARGON.components.movement.breakMovement();
		}
	}
	
	return used;
}

Hooks.once("init", async () => {
	game.modules.get(ModuleName).api = {
		useAction
	}
	
	let oldBind = CONFIG.ARGON.CORE.CoreHUD.prototype.bind;
	
	async function newBind (target) {
		if (target && !target.isOwner) return;
		
		let call = oldBind.bind(this);
		
		return await call(target);
	}
	
	CONFIG.ARGON.CORE.CoreHUD.prototype.bind = newBind;
});

Hooks.on("argonInit", async (CoreHUD) => {
    const ARGON = CoreHUD.ARGON;

	await registerPF2EECHSItems();
	
	CoreHUD._actionSave = {action : {}, reaction : {}};
	CoreHUD._movementSave = {};
	
	function buttify(items, type = "full") {
		let buttons = items.map(item => new PF2EItemButton({item : item, inActionPanel : true}));
		
		if (type == "reduced") {
			let reducedButtons = [];
			
			for (let i = 0; i < buttons.length; i = i + 2) {
				let button1 = buttons[i];
				let button2 = buttons[i+1] || new PF2ESpecialActionButton(null);
				
				reducedButtons.push(new PF2ESplitButton(button1, button2));
			}
			
			buttons = reducedButtons;
		}
		
		return buttons;
	}
  
    class PF2EPortraitPanel extends ARGON.PORTRAIT.PortraitPanel {
		constructor(...args) {
			super(...args);
		}
		
		get description() {
			switch(this.actor.type) {
				case "character":
					let classname = this.actor.system.details.class?.name;
					
					if (!classname) {
						classname = "";
					}
					
					let ancestryname = this.actor.system.details.ancestry?.name;
					
					if (!ancestryname) {
						ancestryname = "";
					}
					
					return `${game.i18n.localize("PF2E.CharacterLevelLabel")} ${this.actor.system.details.level.value} ${classname} (${ancestryname})`;
					break;
				case "npc":
					let status = "";
					
					if (this.actor.isWeak) {
						status = game.i18n.localize("PF2E.NPC.Adjustment.WeakLabel")
					}
					
					if (this.actor.isElite) {
						status = game.i18n.localize("PF2E.NPC.Adjustment.EliteLabel")
					}
					
					if (status) {
						status = `(${status})`;
					}
				
					return `${game.i18n.localize("PF2E.CharacterLevelLabel")} ${this.actor.system.details.level.value} ${status}`;
					break;
				case "familiar":
					let master = game.actors.get(this.actor.system.master?.id);
					
					if (master) {
						return replacewords(game.i18n.localize("PF2E.Actor.Familiar.Blurb"), {master : master.name});
					}
					break;
			}
		}

		get isDead() {
			return this.actor.isDead;
		}

		get isDying() {
			return this.actor.hasCondition("dying");
		}
		
		async _onDeathSave(event) {
			this.actor.rollRecovery();
		}
		
		async _getButtons() {
			return [
				{
					id: "roll-initiative",
					icon: "fas fa-dice-d20",
					label: "Roll Initiative",
					onClick: (event) => {
						if (this.actor.combatant) {
							this.actor.rollInitiative({ rerollInitiative: true, createCombatants: true });
						}
						else {
							switch(game.settings.get(ModuleName, "rollinitiative")) {
								case "choiceroll":
									let tokens = this.actor.getActiveTokens();
									
									if (tokens.length) {
										canvas.tokens.toggleCombat(!Boolean(this.actor.combatant), null, {token : tokens[0]})
									}
									break;
								case "quickroll":
									this.actor.rollInitiative({ rerollInitiative: true, createCombatants: true });
									break;
							}
						}
					}
				},
				{
					id: "open-sheet",
					icon: sheettabbutton(game.settings.get(ModuleName, "sheetbuttontab")).join(" "),
					label: replacewords(game.i18n.localize(ModuleName + ".Titles.opensheetat"), {tab : game.i18n.localize(tabnames[game.settings.get(ModuleName, "sheetbuttontab")])}),
					onClick: async (event) => {
						await this.actor.sheet.render(true);
						
						if (!this.actor.sheet.rendered) {
							await timeout(50); //give time to render
						}
						
						if (this.actor.sheet.rendered) {
							this.actor.sheet.activateTab(game.settings.get(ModuleName, "sheetbuttontab"))
						}
					}
				},
				{
					id: "toggle-minimize",
					icon: "fas fa-caret-down",
					label: "Minimize",
					onClick: (event) => ui.ARGON.toggleMinimize()
				}
			];
		}

		async getStatBlocks() {
			const ACText = game.i18n.localize("PF2E.ArmorClassShortLabel");
			
			const DCText = game.i18n.localize("PF2E.Check.DC.Unspecific");

			const hppercent = this.actor.system.attributes.hp.value/this.actor.system.attributes.hp.max;
			const useStamina = (game.settings.get("pf2e", "staminaVariant") && (this.actor.system.attributes.hp.sp?.value > 0));
			
			const HPText = 	useStamina ?
							game.i18n.localize("PF2E.StaminaPointsHeader").split(" ").map(text => text[0]).join("")
							:
							game.i18n.localize("PF2E.HitPointsShortLabel");
			
			const hpColor = useStamina ?
							this.actor.system.attributes.hp.temp ? hpblue : hpyellow
							: 
							(this.actor.system.attributes.hp.temp ? hpblue : (hppercent <= 0.5 ? (hppercent <= 0.1 ?  hpred : hporange) : hpgreen));
							
			const hpMax = 	useStamina ?
							this.actor.system.attributes.hp.sp?.max
							:
							this.actor.system.attributes.hp.max + (this.actor.system.attributes.hp.tempmax ?? 0);
							
			const hpValue = useStamina ?
							this.actor.system.attributes.hp.sp?.value + (this.actor.system.attributes.hp.temp ?? 0)
							:
							this.actor.system.attributes.hp.value + (this.actor.system.attributes.hp.temp ?? 0);
							
			const tempMax = this.actor.system.attributes.hp.tempmax;
			
			const hpMaxColor = 	useStamina ?
								hpyellow
								:
								tempMax ? (tempMax > 0 ? "rgb(222 91 255)" : "#ffb000") : "rgb(255 255 255)";

			let blocks = [
				[
					{
						text: `${hpValue}`,
						color: hpColor,
						id: "HPvalue"
					},
					{
						text: `/`,
					},
					{
						text: `${hpMax}`,
						color: hpMaxColor,
					},
					{
						text: HPText,
						id: "HPtext",
					},
				],
				[
					{
						text: ACText,
						id : "ac"
					},
					{
						text: this.actor.system.attributes.ac.value,
						color: "var(--ech-movement-baseMovement-background)",
						id: "ACvalue"
					},
				]
			];
			
			const spellDC = Math.max(...(await Promise.all(this.actor.items.filter(item => item.type == 'spellcastingEntry').map(group => group.getSpellData()))).map(info => info.statistic.dc.value));
			
			/*
			for (let spellgroup of this.actor.items.filter(item => item.type == 'spellcastingEntry')) {
				let info = await spellgroup.getSpellData();
				
				if (info.statistic.dc.value > spellDC) {
					spellDC = info.statistic.dc.value;
				}
			}
			*/
			
			if (spellDC > 0 && (!this.actor.system.attributes.classDC?.dc || (spellDC >= this.actor.system.attributes.classDC?.dc))) {
				if (this.actor.system.attributes.classDC?.dc) {
					blocks.push([
						{
							text: DCText,
						},
						{
							text: spellDC,
							color: "var(--ech-movement-baseMovement-background)",
							id: "SpellDCvalue"
						}
					]);
				}
			}
			else {
				if (this.actor.system.attributes.classDC?.dc) {
					blocks.push([
						{
							text: DCText,
						},
						{
							text: this.actor.system.attributes.classDC?.dc,
							color: "var(--ech-movement-baseMovement-background)",
							id: "ClassDCvalue"
						}
					]);
				}
			}
			
			return blocks;
		}
		
		get template() {
			return `/modules/${ModuleName}/templates/PortraitPanel.hbs`;
		}
		
		async _renderInner() {
			await super._renderInner();
			
			this.element.ondblclick = () => {
				if (game.settings.get(ModuleName, "panondblclick")) {				
					let target = canvas.tokens.placeables.find(token => token.actor == this.actor);
							
					if (target) {
						let panTarget = target.center;
						
						canvas.animatePan(panTarget);
					}
				}
			}
			this.element.oncontextmenu = (event) => {
				if (!event.target?.classList.contains("portrait-hud-image")) return;
				
				if (this.actor.sheet.rendered) {
					this.actor.sheet.close();
				}
				else {
					this.actor.sheet.render(true);
				}
			};
			
			//armor open
			let acBlock = this.element.querySelector("#ac")?.parentElement;
			
			if (acBlock) {
				acBlock.oncontextmenu = () => {
					let armor = this.actor.items.find(item => item.type == "armor" && item.system.equipped?.carryType == "worn" && item.system.equipped?.inSlot);
					
					if (armor) {
						armor.sheet.render(true);
					}
				}
			}
			
			if (this.actor.system.resources.heroPoints?.max) {//Hero Points
				let max = this.actor.system.resources.heroPoints.max;
				let value = this.actor.system.resources.heroPoints.value;
				
				let heroPoints = document.createElement("div");
				heroPoints.classList.add("dots");
				heroPoints.style.zIndex = "1";
				heroPoints.style.position = "absolute";
				heroPoints.style.top = "0";
				heroPoints.style.right = "0";
				heroPoints.onclick = () => {this.actor.update({system : {resources : {heroPoints : {value : Math.min(value + 1, max)}}}})};
				heroPoints.ondblclick = (event) => {event.stopPropagation()};
				heroPoints.oncontextmenu = () => {event.preventDefault(); event.stopPropagation(); this.actor.update({system : {resources : {heroPoints : {value : Math.max(value - 1, 0)}}}})};
				
				let heroSpan = document.createElement("span");
				heroSpan.classList.add("adjust-hero-points");
				if (value == 1) {
					heroSpan.setAttribute("data-tooltip", replacewords(game.i18n.localize("PF2E.HeroPointRatio.One"), {value : value, max : max}));
				}
				else {
					heroSpan.setAttribute("data-tooltip", replacewords(game.i18n.localize("PF2E.HeroPointRatio.Many"), {value : value, max : max}));
				}
				heroSpan.style.fontSize = "20px";
				
				for (let i = 1; i <= max; i++) {
					let icon = document.createElement("i");
					
					if (i <= value) {
						icon.classList.add("fa-solid", "fa-hospital-symbol");
					}
					else {
						icon.classList.add("fa-regular", "fa-circle");
					}
					icon.style.margin = "5px";
					icon.style.marginLeft = "0px";
					
					heroSpan.appendChild(icon);
				}
				
				heroPoints.appendChild(heroSpan);
				this.element.appendChild(heroPoints);
			}
			
			if (this.isDying) {//death overlay
				let max = this.actor.system.attributes?.dying?.max;
				let value = this.actor.system.attributes?.dying?.value;
				
				let dying = this.element.querySelector("div.death-saves");
				dying.style.display = "flex";
				dying.style.justifyContent = "center";
				dying.style.flexDirection = "column";
				
				let dyingcount = document.createElement("div");
				dyingcount.classList.add("dots");
				dyingcount.style.zIndex = "1";
				dyingcount.style.marginTop = "5px"
				dyingcount.onclick = () => {this.actor.increaseCondition("dying")};
				dyingcount.ondblclick = (event) => {event.stopPropagation()};
				dyingcount.oncontextmenu = () => {event.preventDefault(); event.stopPropagation(); this.actor.decreaseCondition("dying")};
				dyingcount.setAttribute("data-tooltip", game.i18n.localize("PF2E.ConditionTypeDying"));
				
				let dyingspan = document.createElement("span");
				dyingspan.classList.add("pips");
				dyingspan.style.fontSize = "20px";
				
				for (let i = 1; i <= max; i++) {
					let icon = document.createElement("i");
					
					if (value == max) {
						icon.classList.add("fa-solid", "fa-skull");
					}
					else {
						if (i <= value) {
							icon.classList.add("fa-solid", "fa-circle-x");
						}
						else {
							icon.classList.add("fa-regular", "fa-circle");
						}
					}
					icon.style.margin = "5px";
					icon.style.marginLeft = "0px";
					
					dyingspan.appendChild(icon);
				}
				
				dyingcount.appendChild(dyingspan);
				
				dying.appendChild(dyingcount);
			}
			
			if (this.actor.system.attributes.shield?.raised) {//raised shield
				let shieldIcon = document.createElement("i");
				shieldIcon.classList.add("fa-solid", "fa-shield");
				shieldIcon.setAttribute("data-tooltip", game.i18n.localize("TYPES.Item.shield"));
				
				this.element.querySelector("#ACvalue").appendChild(shieldIcon);
			}
			
			//hp and temp hp box
			let hpbox = this.element.querySelector("#HPtext").parentElement;
			let mainHPbox;
			if (hpbox) {
				let hpvaluebox = hpbox.querySelector("#HPvalue");
				let hptextbox = hpbox.querySelector("#HPtext");
				
				let mainHPbox = document.createElement("div");
				mainHPbox.style.zIndex = "2";
				
				let tempHPbox = document.createElement("div");
				tempHPbox.classList.add("portrait-stat-block");
				tempHPbox.style.display = "none";
				
				let tempHPvalue = document.createElement("input");
				tempHPvalue.type = "number";
				tempHPvalue.style.color = hpblue;
				tempHPvalue.style.width = "30px";
				tempHPvalue.onfocus = () => {tempHPvalue.select()};
				
				let tempHPtext = document.createElement("span");
				tempHPtext.innerText = game.i18n.localize("PF2E.TempHitPointsShortLabel");
				
				tempHPbox.appendChild(tempHPvalue);
				tempHPbox.appendChild(tempHPtext);
				
				let spHPbox;
				let spHPvalue;
				if (game.settings.get("pf2e", "staminaVariant") && this.actor.system.attributes.hp.sp) {
					spHPbox = document.createElement("div");
					spHPbox.classList.add("portrait-stat-block");
					spHPbox.style.display = "none";
					
					spHPvalue = document.createElement("input");
					spHPvalue.type = "number";
					spHPvalue.style.color = hpyellow;
					spHPvalue.style.width = "30px";
					spHPvalue.onfocus = () => {spHPvalue.select()};
					
					let spHPdash = document.createElement("span");
					spHPdash.innerHTML = "/";
					
					let spHPmax = document.createElement("span");
					spHPmax.style.color = hpyellow;
					spHPmax.innerHTML = this.actor.system.attributes.hp.sp.max;
					
					let spHPtext = document.createElement("span");
					spHPtext.innerText = game.i18n.localize("PF2E.StaminaPointsHeader").split(" ").map(text => text[0]).join("");
					
					spHPbox.appendChild(spHPvalue);
					spHPbox.appendChild(spHPdash);
					spHPbox.appendChild(spHPmax);
					spHPbox.appendChild(spHPtext);
				}
				
				let currentHPvalue = document.createElement("input");
				currentHPvalue.type = "number";
				currentHPvalue.style.display = "none";
				currentHPvalue.style.width = "30px";
				currentHPvalue.onfocus = () => {currentHPvalue.select()};
				currentHPvalue.onchange = () => {
					const hppercent = currentHPvalue.value/this.actor.system.attributes.hp.max;
					
					currentHPvalue.style.color = hppercent <= 0.5 ? (hppercent <= 0.1 ?  hpred : hporange) : hpgreen;
				}
				
				hpbox.prepend(currentHPvalue);
				
				mainHPbox.onmouseenter = () => {
					tempHPbox.style.display = "";
					if (game.settings.get("pf2e", "staminaVariant") && this.actor.system.attributes.hp.sp) spHPbox.style.display = "";
					currentHPvalue.style.display = "";
					hpvaluebox.style.display = "none";
					hptextbox.innerHTML = game.i18n.localize("PF2E.HitPointsShortLabel")
					
					tempHPvalue.value = this.actor.system.attributes.hp.temp;
					if (game.settings.get("pf2e", "staminaVariant") && this.actor.system.attributes.hp.sp) spHPvalue.value = this.actor.system.attributes.hp.sp.value;
					currentHPvalue.value = this.actor.system.attributes.hp.value;
					
					currentHPvalue.onchange();
				}
				
				mainHPbox.onmouseleave = async () => {
					tempHPbox.style.display = "none";
					if (game.settings.get("pf2e", "staminaVariant") && this.actor.system.attributes.hp.sp) spHPbox.style.display = "none";
					currentHPvalue.style.display = "none";
					hpvaluebox.style.display = "";
					
					if (tempHPvalue.value != this.actor.system.attributes.hp.temp || currentHPvalue.value != this.actor.system.attributes.hp.value || (game.settings.get("pf2e", "staminaVariant") && spHPvalue.value != this.actor.system.attributes.hp.sp.value)) {
						let update = {system : {attributes : {hp : {temp : tempHPvalue.value, value : currentHPvalue.value}}}};
						
						if (game.settings.get("pf2e", "staminaVariant") && this.actor.system.attributes.hp.sp) {
							update.system.attributes.hp.sp = {value : spHPvalue.value};
						}
						
						await this.actor.update(update);
					}
					
					const useStamina = (game.settings.get("pf2e", "staminaVariant") && (this.actor.system.attributes.hp.sp?.value > 0));
					hptextbox.innerHTML = 	useStamina ?
											game.i18n.localize("PF2E.StaminaPointsHeader").split(" ").map(text => text[0]).join("")
											:
											game.i18n.localize("PF2E.HitPointsShortLabel");
				}
				
				mainHPbox.appendChild(tempHPbox);
				if (game.settings.get("pf2e", "staminaVariant") && this.actor.system.attributes.hp.sp) mainHPbox.appendChild(spHPbox);
				mainHPbox.appendChild(hpbox);
				this.element.prepend(mainHPbox);
			}
			
			const spellDCElement = this.element.querySelector("#SpellDCvalue");
			
			if (spellDCElement) {//spell DC
				let description = (await Promise.all(this.actor.items.filter(item => item.type == 'spellcastingEntry').map(group => group.getSpellData()))).find(info => info.statistic.dc.value == spellDCElement.innerHTML)?.statistic.dc.breakdown;
				
				let spellicon = document.createElement("i");
				spellicon.classList.add("fa-solid", "fa-book");
				if (description) {
					spellicon.setAttribute("data-tooltip", description);
				}
				
				spellDCElement.innerHTML = spellDCElement.innerHTML + " ";
				spellDCElement.appendChild(spellicon);
			}
			
			if (game.settings.get(ModuleName, "rollinitiative") == "choiceroll") {//initiative
				if (!this.isDying && !this.isDead) {
					if (this.actor.inCombat && this.actor.combatant && (this.actor.combatant.initiative == null)) {
						let initiativeBox = document.createElement("div");
						initiativeBox.style.position = "absolute";
						initiativeBox.style.width = "100%";
						initiativeBox.style.height = "60%";
						initiativeBox.style.left = "0";
						initiativeBox.style.top = "20%";
						initiativeBox.style.display = "flex";
						initiativeBox.style.flexDirection = "column";
						initiativeBox.style.alignItems = "center";
						initiativeBox.style.justifyContent = "center";
						initiativeBox.style.backgroundColor = "rgb(0,0,0,0.5)";
						initiativeBox.style.zIndex = 100;
						
						let initiativedice = document.createElement("i");
						initiativedice.classList.add("fa-solid", "fa-dice-d20");
						initiativedice.style.fontSize = "100px";
						initiativedice.setAttribute("data-tooltip", game.i18n.localize("PF2E.InitiativeLabel"));
						initiativedice.onclick = async () => {
							await this.actor.rollInitiative();
							this.render();
						}
						
						let skillselect = document.createElement("select");
						skillselect.style.width = "50%";
						skillselect.style.height = "40px";
						skillselect.style.color = "white";
						skillselect.style.fontSize = "25px";
						skillselect.style.backdropFilter = "var(--ech-blur-amount)";
						skillselect.style.backgroundColor = "rgba(0,0,0,.3)";
						skillselect.style.marginTop = "30px";
						skillselect.onchange = (value) => {
							this.actor.update({system : {initiative : {statistic : value.srcElement.value}}});
						}
						
						const skills = {perception : this.actor.perception, ...this.actor.skills};
						for (let key of Object.keys(skills)) {
							if (!skills[key].lore) {
								let skilloption = document.createElement("option");
								skilloption.text = skills[key].label;
								skilloption.value = key;

								skilloption.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
								skilloption.style.width = "100%";
								skilloption.style.height = "20px";
								skilloption.style.backgroundColor = "grey";
								//skilloption.style.fontSize = "25px";
								skilloption.selected = key == this.actor.system.initiative.statistic;
								
								skillselect.appendChild(skilloption);
							}
						}
						
						initiativeBox.appendChild(initiativedice);
						initiativeBox.appendChild(skillselect);
						
						this.element.appendChild(initiativeBox);
					}
				}
			}
			
			if (game.settings.get(ModuleName, "showquicksaves")) {
				let savesdiv = document.createElement("div");
				savesdiv.style.display = "flex";
				savesdiv.style.flexDirection = "column";
				savesdiv.style.position = "absolute";
				savesdiv.style.top = "50%";
				savesdiv.style.left = 0;
				savesdiv.style.transform = "translate(0, -50%)";
				
				const savesbuttonsize = "30";
				
				let savefortitude = document.createElement("i");
				savefortitude.classList.add("fa-solid", "fa-heart");
				savefortitude.style.fontSize = `${savesbuttonsize}px`;
				savefortitude.style.color = "red";
				savefortitude.style.textShadow = "0 0 10px rgba(0,0,0,.9)";
				savefortitude.style.zIndex = 1;
				savefortitude.setAttribute("data-tooltip", this.actor.saves.fortitude.label)
				savefortitude.onclick = (event) => {this.actor.saves.fortitude.check.roll({event : event})};
				
				let savereflex = document.createElement("i");
				savereflex.classList.add("fa-solid", "fa-bolt");
				savereflex.style.fontSize = `${savesbuttonsize}px`;
				savereflex.style.color = "gold";
				savereflex.style.textShadow = "0 0 10px rgba(0,0,0,.9)";
				savereflex.style.zIndex = 1;
				savereflex.setAttribute("data-tooltip", this.actor.saves.reflex.label)
				savereflex.onclick = (event) => {this.actor.saves.reflex.check.roll({event : event})};
				
				let savewill = document.createElement("i");
				savewill.classList.add("fa-solid", "fa-brain");
				savewill.style.fontSize = `${savesbuttonsize}px`;
				savewill.style.color = "royalblue";
				savewill.style.textShadow = "0 0 10px rgba(0,0,0,.9)";
				savewill.style.zIndex = 1;
				savewill.setAttribute("data-tooltip", this.actor.saves.will.label)
				savewill.onclick = (event) => {this.actor.saves.will.check.roll({event : event})};
				
				savesdiv.appendChild(savefortitude);
				savesdiv.appendChild(savereflex);
				savesdiv.appendChild(savewill);
				
				this.element.appendChild(savesdiv);
			}
			
			//circle buttons
			const circlebuttonsize = "60";
			
			let circlediv = document.createElement("div");
			circlediv.style.display = "flex";
			circlediv.style.flexDirection = "column";
			circlediv.style.position = "absolute";
			circlediv.style.top = "50%";
			circlediv.style.right = 0;
			circlediv.style.transform = "translate(0, -50%)";
			
			this.element.appendChild(circlediv);
			
			let connected = [];
			if (this.actor.parties.size > 0 && game.settings.get(ModuleName, "showpartybutton")) {
				connected.push(Array.from(this.actor.parties)[0]);
			}
			if (game.settings.get(ModuleName, "showfamiliarmaster")) {
				connected.push(this.actor.familiar);
				connected.push(this.actor.master);
			}
			connected = connected.filter(actor => actor);
			
			for (let actor of connected) {
				let connectbutton = document.createElement("div");
				connectbutton.style.width = `${circlebuttonsize}px`;
				connectbutton.style.height = `${circlebuttonsize}px`;
				connectbutton.style.backgroundColor = "var(--ech-portrait-base-background)";
				//partybutton.style.borderColor = "var(--ech-portrait-base-border)";
				connectbutton.style.border = "solid 5px"
				connectbutton.style.backgroundImage = `url(${actor.img})`;
				connectbutton.style.backgroundSize = "cover"
				connectbutton.style.borderRadius = "50%";
				connectbutton.style.backgroundPosition = "center";
				connectbutton.style.zIndex = 1;
				
				let title = "";
				let tryclickswitch = false;
				switch (actor) {
					case this.actor.familiar:
						tryclickswitch = true;
						title = game.i18n.localize("PF2E.Familiar.Familiar");
						break;
					case this.actor.master:
						tryclickswitch = true;
						title = game.i18n.localize("PF2E.Familiar.Master");
						break;
				}
				connectbutton.setAttribute("data-tooltip", `${title}${title ? ": " : ""}${actor.name}`);
				
				let openaction = () => {
					if (actor.sheet.rendered) {
						actor.sheet.close();
					}
					else {
						actor.sheet.render(true);
					}
				}
				
				let switchaction;
				if (tryclickswitch) {
					switchaction = () => {
						let token = canvas.tokens.placeables.find(token => token.isOwner && token.actor == actor);
						if (token) {
							canvas.tokens.selectObjects(token);
						}
						else {
							openaction();
						}
					}
				}
				
				connectbutton.onclick = (event) => {switchaction ? switchaction() : openaction()};
				connectbutton.oncontextmenu = (event) => {event.preventDefault(); openaction()};
				
				circlediv.appendChild(connectbutton);
			}
			
			if (game.settings.get(ModuleName, "shownpctraits") && this.actor.system.traits?.value?.length) {//traits
				if (this.actor.type == "npc") {
					const height = 23;
					let traitbox = document.createElement("div");
					traitbox.style.position = "absolute";
					traitbox.style.top = 0;
					traitbox.style.left = 0;
					traitbox.style.width = "100%";
					traitbox.style.height = `${height}px`;
					traitbox.style.background = "rgba(65, 75, 85, 0.9)";
					traitbox.style.zIndex = "1";
					traitbox.style.overflowX = "auto";
					traitbox.style.overflowY = "hidden";
					traitbox.onmousewheel = (event) => {traitbox.scrollLeft = traitbox.scrollLeft + event.deltaY/3}
					
					let traits = this.actor.system.traits.value.filter(value => CONFIG.PF2E.creatureTraits[value]);
					
					for (let trait of traits) {
						let traitspan = document.createElement("span");
						traitspan.style.backgroundColor = "var(--ech-buttons-base-background)";
						traitspan.style.borderColor = "var(--ech-buttons-base-border)";
						traitspan.style.color = "var(--ech-buttons-base-color)";
						traitspan.style.borderRadius = "0.25rem";
						traitspan.style.paddingTop = "0.35em";
						traitspan.style.paddingRight = "0.65em";
						traitspan.style.paddingBottom = "0.35em";
						traitspan.style.paddingLeft = "0.65em";
						traitspan.style.fontSize = "1rem";
						traitspan.style.marginRight = "0.2rem";
						
						traitspan.innerHTML = game.i18n.localize(CONFIG.PF2E.creatureTraits[trait]);
						if (CONFIG.PF2E.traitsDescriptions[trait]) {
							traitspan.setAttribute("data-tooltip", game.i18n.localize(CONFIG.PF2E.traitsDescriptions[trait]));
						}
						else {
							traitspan.setAttribute("data-tooltip", trait.toUpperCase());
						}
						
						traitbox.appendChild(traitspan);
					}
					
					this.element.prepend(traitbox);
					if (!game.settings.get("enhancedcombathud", "playerDetailsBottom")) {
						this.element.querySelector(".portrait-stat-block.player-details").style.top = `${height}px`;
					}
				}
			}
		}
	}
	
	class PF2EDrawerButton extends ARGON.DRAWER.DrawerButton {
		constructor (buttons, starthidden = false) {
			super(buttons);
			this._starthidden = starthidden;
		}
		
		get starthidden() {
			return this._starthidden;
		}
		
		async activateListeners(html) {
			await super.activateListeners(html);
			for (const button of this._buttons) {
				if (!button.interactive) continue;
				const index = this._buttons.indexOf(button);
				const el = this.element.querySelector(`span[data-index="${index}"]`);
				if (!el) continue;
				el.onclick = (e) => {
					if (this.interceptDialogs) ui.ARGON.interceptNextDialog(e.currentTarget.closest(".ability"))
					button.onClick(e);
				}
				if (button.onRClick) {
					el.oncontextmenu = (e) => {
						e.preventDefault();
						if (this.interceptDialogs) ui.ARGON.interceptNextDialog(e.currentTarget.closest(".ability"))
						button.onRClick(e);
					}
				}
			}
			this.setTextAlign();
		}
		
		async _renderInner() {
			await super._renderInner();
			
			if (this.starthidden) {
				this.element.style.display = "none";
			}
		}
	}
	
	class PF2EDrawerPanel extends ARGON.DRAWER.DrawerPanel {
		constructor(...args) {
			super(...args);
		}

		get categories() {
			let returncategories = [];
			
			const saves = this.actor.saves;
			const skills = {perception : this.actor.perception, ...this.actor.skills};
			const addSkillActions = [["treatWounds", {
				name : fromUuidSync("Compendium.pf2e.actionspf2e.Item.1kGNdIIhuglAjIp9").name,
				slug : "treat-wounds",
				section : "skill",
				statistic : "medicine",
				trait : ["exploration", "healing", "manipulate"],
				use : () => {game.pf2e.actions.treatWounds({actors : this.actor})}
			}]];
			const skillactions = /*Array.from(game.pf2e.actions).concat(*/Array.from(game.pf2e.actions.entries()).concat(addSkillActions).map(entry => entry[1]);
			
			const savesButtons = Object.keys(saves).map(saveKey => {
				const save = saves[saveKey];
				
				let valueLabel = `<span style="margin: 0 1rem">${save.mod >= 0 ? "+" : ""}${save.mod}</span>`;
				
				let rankicon = "";
				if (!this.actor.type == "npc" && game.settings.get(ModuleName, "showtrainedrankletter")) {
					rankicon = `<i class="fa-solid fa-${game.i18n.localize("PF2E.ProficiencyLevel" + save.rank).toLowerCase()[0]}" data-tooltip="${game.i18n.localize("PF2E.ProficiencyLevel" + save.rank)}" style="font-size:${game.settings.get(ModuleName, "skillrankiconscale")}rem"></i> `;
				}
				
				let labelcolornumber = save.rank;
				if (this.actor.type == "npc") {
					let cleanedvalue = save.mod - this.actor.system.abilities[this.actor.system?.saves[saveKey]?.attribute]?.mod;
					if (!game.settings.get("pf2e", "proficiencyVariant")) {
						cleanedvalue = cleanedvalue - this.actor.level;
					}
					labelcolornumber = Math.min(Math.max(Math.floor(cleanedvalue/2),0), 4);
				}
				
				let nameLabel = `<span style="padding-left : 5px;padding-right : 5px;text-align: center; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 2px;background-color: var(--color-proficiency-${game.i18n.localize("PF2E.ProficiencyLevel" + labelcolornumber).toLowerCase()})">${save.label} ${rankicon}</span>`;
				
				let roll = (event) => {
					save.check.roll({event : event})
				}
					
				return new ARGON.DRAWER.DrawerButton([
					{
						label: nameLabel,
						onClick: roll
					},
					{
						label: valueLabel,
						onClick: roll,
						style: "display: flex; justify-content: flex-end;"
					}
				]);
			});
			
			
			let skillsButtons = []; 
			Object.keys(skills).forEach(skillKey => {
				const skill = skills[skillKey];
				
				if (this.actor.type == "npc") {
					if (!(skill.slug == "perception" || skill.proficient)) return; //this skill has not been set for this npcs
				}
				
				if (!skill.lore) {
					let valueLabel = `<span style="margin: 0 1rem">${skill.mod >= 0 ? "+" : ""}${skill.mod}</span>`;
					
					let rankicon = "";
					if (!this.actor.type == "npc" && game.settings.get(ModuleName, "showtrainedrankletter")) {
						rankicon = `<i class="fa-solid fa-${game.i18n.localize("PF2E.ProficiencyLevel" + skill.rank).toLowerCase()[0]}" data-tooltip="${game.i18n.localize("PF2E.ProficiencyLevel" + skill.rank)}" style="font-size:${game.settings.get(ModuleName, "skillrankiconscale")}rem"></i> `;
					}
					
					let labelcolornumber = skill.rank;
					if (this.actor.type == "npc") {
						let cleanedvalue = skill.mod - this.actor.system.abilities[skill.attribute]?.mod;
						if (!game.settings.get("pf2e", "proficiencyVariant")) {
							cleanedvalue = cleanedvalue - this.actor.level;
						}
						labelcolornumber = Math.min(Math.max(Math.floor(cleanedvalue/2),0), 4);
					}
					
					let nameLabel = `<span class="${skillKey}-skill" style="padding-left : 5px;padding-right : 5px;text-align: center; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 2px;background-color: var(--color-proficiency-${game.i18n.localize("PF2E.ProficiencyLevel" + labelcolornumber).toLowerCase()})">${skill.label} ${rankicon}</span>`;
					
					let roll = (event) => {
						skill.check.roll({event : event})
					}
					
					let unfold = (event) => {
						let unfolded = false;
						
						this.element.querySelectorAll(`.${skillKey}-action`).forEach(element => {
							let actionelement = element.parentElement.parentElement;
							
							if (actionelement.style.display == "none") {
								actionelement.style.display = "grid";
								unfolded = true;
							}
							else {
								actionelement.style.display = "none";
							}
						})
						
						let unfoldbutton = this.element.querySelector(`.${skillKey}-unfold`);
						if (unfolded) {
							unfoldbutton.style.transform = `rotate(90deg)`;
						}
						else {
							unfoldbutton.style.transform = `rotate(0deg)`;
						}
					}
					
					let entrydata = [
						{
							label: this.actor.system.initiative?.statistic == skillKey ? `<i class="fa-solid fa-circle" data-tooltip="${game.i18n.localize("PF2E.InitiativeLabel")}"></i>` : `<i class="fa-regular fa-circle" data-tooltip="${game.i18n.localize("PF2E.InitiativeLabel")}"></i>`,
							onClick: async () => {
								this.actor.update({system : {initiative : {statistic : skillKey}}});
								this.element.querySelector(".fa-solid.fa-circle")?.classList.replace("fa-solid", "fa-regular");
								this.element.querySelector(`.${skillKey}-skill`)?.parentElement.parentElement.querySelector(".fa-circle.fa-circle")?.classList.replace("fa-regular", "fa-solid");
							},
							style: "display: flex; justify-content: flex-start;"
						},
						{
							label: nameLabel,
							onClick: roll,
							onRClick : unfold
						},
						{
						},
						{
						},
						{
							label: valueLabel,
							onClick: roll,
							style: "display: flex; justify-content: flex-end;"
						}
					];
					
					let localskillactions = skillactions.filter(action => action.statistic?.includes(skillKey));
					
					if (game.settings.get(ModuleName, "filtertrainedactions")) {
						localskillactions = localskillactions.filter(action => skill.rank > 0 || !trainedactions.includes(action.slug));
					}
					
					if (localskillactions.length) {
						entrydata[2] = {
							label: `<i class="${skillKey}-unfold fa-regular fa-circle-arrow-right" style="transform:rotate(0deg)"></i>`,
							onClick : unfold,
							style: "display: flex; justify-content: center;"
						}
					}
					
					let skillentries = [new PF2EDrawerButton(entrydata)];
					
					localskillactions.forEach(action => {
						let actiontitle = `<span class="${skillKey}-action">${game.i18n.localize(action.name)}</span>`;
						
						let actionGlyph = actionGlyphs("action", action.cost) || actionGlyphs(action.cost);
						if (actionGlyph) {
							actiontitle = `${actiontitle} <span class=\"action-glyph\">${actionGlyph}</span>`;
						}
						
						let roll = async (map, event) => {
							let settings = {actors : this.actor, multipleAttackPenalty : map, event : event, statistic : skillKey};
									
							let options;
									
							switch (action.slug) {
								case "perform" :
									options = ["acting", "comedy", "dance", "keyboards", "oratory", "percussion", "singing", "strings", "winds"];
									break;
								case "administer-first-aid":
									options = ["stabilize", "stop-bleeding"];
									break;
								case "create-a-diversion":
									options = ["distracting-words", "gesture", "trick"];
									break;
							}
									
							if (options) {
								let optionsinfo = {};
								for (let key of options) {
									optionsinfo[key] = {label : key};
								}
								let variant = await openNewInput("choice", game.i18n.localize(action.name), `${actiontitle}: `, {defaultValue : options[0], options : optionsinfo});
								
								if (!variant) return;
								settings.variant = variant; 
							}
							
							action.use(settings);
							if (Number.isNumeric(action.cost)) {
								useAction("action", action.cost);
							}
							else {
								useAction(action.cost);
							}
						}
						
						let hasMAP = action.traits?.includes("attack");
						
						skillentries.push(new PF2EDrawerButton([
							{
							},
							{
								label: actiontitle,
								onClick: (event) => {roll(0, event)},
								style: "display: flex; justify-content: center"
							},
							{
							},
							{
								label: hasMAP ? `<span>${MAPtext(action, 1)}</span>` : "",
								onClick: hasMAP ? (event) => {roll(1, event)} : undefined,
								style: hasMAP ? "display: flex; justify-content: center;border: var(--color-text-trait) solid 2px; color: var(--color-text-trait); background-color: var(--color-pf-secondary)" : ""
							},
							{
								label: hasMAP ? `<span>${MAPtext(action, 2)}</span>` : "",
								onClick: hasMAP ? (event) => {roll(2, event)} : undefined,
								style: hasMAP ? "display: flex; justify-content: center;border: var(--color-text-trait) solid 2px; color: var(--color-text-trait); background-color: var(--color-pf-secondary)" : ""
							}
						], true));
					});
					
					skillsButtons.push(...skillentries);
				}
			});
			skillsButtons = skillsButtons.filter(button => button);
			
			let loreButtons = Object.keys(skills).map(skillKey => {
				const lore = skills[skillKey];
				
				if (lore.lore) {
					let valueLabel = `<span style="margin: 0 1rem">${lore.mod >= 0 ? "+" : ""}${lore.mod}</span>`;
					
					let rankicon = "";
					if (game.settings.get(ModuleName, "showtrainedrankletter")) {
						rankicon = `<i class="fa-solid fa-${game.i18n.localize("PF2E.ProficiencyLevel" + lore.rank).toLowerCase()[0]}" data-tooltip="${game.i18n.localize("PF2E.ProficiencyLevel" + lore.rank)}" style="font-size:${game.settings.get(ModuleName, "skillrankiconscale")}rem"></i> `;
					}
					
					let nameLabel = `<span style="padding-left : 5px;padding-right : 5px;text-align: center; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 2px;background-color: var(--color-proficiency-${game.i18n.localize("PF2E.ProficiencyLevel" + lore.rank).toLowerCase()})">${lore.label} ${rankicon}</span>`;
					
					let roll = (event) => {
						lore.check.roll({event : event})
					}
					
					return new ARGON.DRAWER.DrawerButton([
						{
							label: nameLabel,
							onClick: roll
						},
						{
							label: valueLabel,
							onClick: roll,
							style: "display: flex; justify-content: flex-end;"
						},
					]);
				}
			}).filter(button => button);

			if (savesButtons.length) {
				returncategories.push({
					gridCols: "7fr 2fr",
					captions: [
						{
							label: game.i18n.localize("PF2E.SavesHeader"),
						},
						{
							label: "",//game.i18n.localize("PF2E.Roll.Roll"),
						},
					],
					buttons: savesButtons
				});
			}
			
			if (skillsButtons.length) {
				returncategories.push({
					gridCols: "1fr 7fr 1fr 3fr 3fr",
					captions: [
						{
							label: game.i18n.localize("PF2E.CoreSkillsHeader"),
						},
						{
							label: "",
						},
						{
							label: "",
						},
						{
							label: "",
						}
					],
					buttons: skillsButtons
				});
			}
			
			if (loreButtons.length) {
				returncategories.push({
					gridCols: "7fr 2fr",
					captions: [
						{
							label: game.i18n.localize("PF2E.LoreSkillsHeader"),
						},
						{
							label: "",
						}
					],
					buttons: loreButtons,
				});
			}
			
			if (game.settings.get(ModuleName, "reversesaveskilllore")) {
				returncategories.reverse();
			}
			
			return returncategories;
		}

		get title() {
			return `${game.i18n.localize("PF2E.SavesHeader")}, ${game.i18n.localize("PF2E.CoreSkillsHeader")} & ${game.i18n.localize("PF2E.LoreSkillsHeader")}`;
		}
		
		_expandPanel(index) {
			if(isNaN(index)) return;
			
			super._expandPanel(index);
			
			const scale = game.settings.get(ModuleName, "saveskilllorescale");
			
			if (scale != 1) {
				const element = this.element?.querySelector(`.ability-toggle .ability.ability-title[data-index="${index}"]`)?.parentElement?.parentElement;
				
				if (element) {
					const panel = element.querySelector(".collapsible-panel");
				
					const expanded = !["0px", ""].includes(element.querySelector(".collapsible-panel").style.maxHeight);
					
					if (expanded) {
						element.style.width = `${375 * scale}px`;
						panel.style.fontSize = `${16 * scale}px`;
					}
					else {
						element.style.width = "";
						panel.style.fontSize = `16px`;
					}
				}
			}
		}
	}
	
	class PF2ETooltips extends ARGON.CORE.Tooltip {
		constructor(...args) {
			super(...args);
			
			this.prepareTraithints();
		}
		
		get template() {
			return `/modules/${ModuleName}/templates/Tooltip.hbs`;
		}
		
		prepareTraithints() {
			let traits = this._tooltipData.properties;
			
			for(let trait of traits) {
				let localizationstring = trait.id?.split("-").map(string => firstUpper(string));
				let diceinfo = "";
				if (localizationstring?.length > 1) diceinfo = localizationstring.pop();
				
				if (!trait.label) {
					let namelocalization = "PF2E.Trait" + localizationstring.join("");
					let name = game.i18n.localize(namelocalization);
					
					if (namelocalization != name) {
						trait.label = [name, diceinfo].join(" ");
					}
					else {
						trait.label = trait.id.toUpperCase();
					}
				}
				
				let hintlocalization = "PF2E.TraitDescription" + localizationstring.join("");
				let hint = game.i18n.localize(hintlocalization);
				
				if (hintlocalization != hint) {
					trait.hint = hint;
				}
			}
		}
		
		async _renderInner() {
			await super._renderInner();
			
			this.element.style.zIndex = 9998;
		}
	}
  
    class PF2EActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
			
			if (!CoreHUD._actionSave[this.actionType][this.actor.id]) {
				CoreHUD._actionSave[this.actionType][this.actor.id] = {};
			}
			
			if (CoreHUD._actionSave[this.actionType][this.actor.id]._currentActions == undefined) {
				CoreHUD._actionSave[this.actionType][this.actor.id]._currentActions = this.maxActions;
			}
			
			this.__defineGetter__("_currentActions", () => {
				if (CoreHUD._actionSave[this.actionType].hasOwnProperty(this.actor.token?.id)) {
					return CoreHUD._actionSave[this.actionType][this.actor.token.id]?._currentActions || 0
				}
				
				return CoreHUD._actionSave[this.actionType][this.actor.id]?._currentActions || 0;
			});
			
			this.__defineSetter__("_currentActions", (value) => {
				if (this.actor.token) {
					if (!CoreHUD._actionSave[this.actionType][this.actor.token.id]) {
						CoreHUD._actionSave[this.actionType][this.actor.token.id] = {};
					}
					
					CoreHUD._actionSave[this.actionType][this.actor.token.id]._currentActions = value;
				}

				if (!CoreHUD._actionSave[this.actionType][this.actor.id]) {
					CoreHUD._actionSave[this.actionType][this.actor.id] = {};
				}
				
				CoreHUD._actionSave[this.actionType][this.actor.id]._currentActions = value;
			})
		}

		get label() {
			return "PF2E.ActionsActionsHeader";
		}
		
		get maxActions() {
			if (this.actor?.inCombat) {
				if (this.actor.hasCondition("quickened")) {
					return maxactions + 1;
				}
				else {
					return maxactions;
				}
			}
			else {
				return null;
			}
        }
		
		get currentActions() {
			return this._currentActions;
		}
		
		set currentActions(value) {
			this._currentActions = Math.min(Math.max(value, 0), this.maxActions);
			this.updateActionUse();
		}
		
		get actionType() {
			return "action";
		}
		
		get colorScheme() {
			return 0;
		}
		
		_onNewRound(combat) {
			for (let key of Object.keys(CoreHUD._actionSave[this.actionType])) {
				let change = 0;
				
				let actor = game.actors.get(key);
				
				if (actor) {
					let stunned = actor.items.find(i => i.system.slug == "stunned")?.system.value?.value || 0;
					let slowed = actor.items.find(i => i.system.slug == "slowed")?.system.value?.value || 0;
					let quickened = actor.hasCondition("quickened") ? 1 : 0;
					
					change = -Math.min(Math.max(stunned, slowed), maxactions + quickened) + quickened;
				}
				
				CoreHUD._actionSave[this.actionType][key]._currentActions = maxactions + change;
			}
			
			this.updateActionUse();
		}
		
		async _getButtons() {
			//a = canvas.tokens.controlled[0].actor
			//i = a.items.filter(i => i.name == "Rage" && i.type == "action")[0]
			//id = i.getFlag("pf2e", "grantedBy").id
			//g = a.items.get(id)
			//g.category == classfeature
			//e = await fromUuid(i.system.selfEffect.uuid)
			//a.createEmbeddedDocuments("Item", [e])
			
			let buttons = [];
			let specialActions = Object.values(PF2EECHActionItems);
			
			buttons.push(new PF2EItemButton({ parent : this, item: null, isWeaponSet : true, isPrimary: true}));
			buttons.push(new PF2EItemButton({ parent : this, item: null, isWeaponSet : true, isPrimary: false}));
			
			buttons.push(new PF2ESplitButton(new PF2EButtonPanelButton({parent : this, type: "toggle"}), new PF2ESpecialActionButton(specialActions[0])));
			
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "feat"}));
			
			buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[1]), new PF2ESpecialActionButton(specialActions[2])));
			
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "consumable"}));
			
			for (let i = 5; i < specialActions.length; i = i + 2) {
				let splititems = [null, null];
				
				if (specialActions[i]) {
					splititems[0] = specialActions[i];
				}
				if (specialActions[i+1]) {
					splititems[1] = specialActions[i+1];
				}
				buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(splititems[0]), new PF2ESpecialActionButton(splititems[1])));
			}
			
			for (let i = 0; i < game.settings.get(ModuleName, "macrobuttons"); i = i + 2) {
				buttons.push(new PF2ESplitButton(new PF2EMacroButton({parent : this, inActionPanel : true, index : i}), new PF2EMacroButton({parent : this, inActionPanel : true, index : i+1})));
			}
			
			buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[3]), new PF2ESpecialActionButton(specialActions[4])));
			
			let favourite = game.settings.get(ModuleName, "favouritesystem");
			
			if (favourite == "no") buttons.push(...actionfilter(this.actor.items, {actiontype : this.actionType, classonly : true, includeFeats : true}).map(item => new PF2EItemButton({item: item, inActionPanel: true})))
			else buttons.push(...buttify(this.actor.items.filter(item => actioninfo(item).actionType.value == this.actionType && isFavourite(item)), favourite));
			
			return buttons.filter(button => button.isvalid);
		}
		
		async _renderInner() {
			await super._renderInner();
			
			if (this.maxActions) {
				this.element.onclick = (event) => {
					if (event.target == this.element) {
						this.currentActions = this.currentActions + 1;
					}
				};
				this.element.oncontextmenu = () => {
					if (event.target == this.element) {
						this.currentActions = this.currentActions - 1;
					}
				};
			}
			
			this.updateActionUse();
		}
		
		get template() {
			return `/modules/${ModuleName}/templates/ActionPanel.hbs`;
		}
		
		updateActionUse() {
			const actionsContainer = this.element.querySelector(".actions-uses-container");
			if (this.maxActions === null || this.currentActions === null) {
				actionsContainer.innerHTML = "";
			}
			if (!actionsContainer) return;

			const childrenArray = Array.from(actionsContainer.children);

			let availableActions;
			switch (game.settings.get(ModuleName, "actionpipsstyle")) {
				case "CORE":
					if (childrenArray.length !== this.maxActions) {
						actionsContainer.innerHTML = "";
						for (let i = 0; i < this.maxActions; i++) {
							const action = document.createElement("div");
							action.classList.add("action-pip");
							actionsContainer.appendChild(action);
						}
					}

					availableActions = this.currentActions;
					for (const child of childrenArray) {
						child.classList.toggle("actions-used", availableActions <= 0);
						availableActions--;
					}
					break;
				case "PF2E":
					const pipsize = 35; //in px
					if (childrenArray.length !== this.maxActions) {
						actionsContainer.innerHTML = "";
						for (let i = 0; i < this.maxActions; i++) {
							const action = document.createElement("span");
							action.classList.add("action-glyph");
							action.innerText = "A";
							action.style.fontSize = `${pipsize}px`;
							action.style.transform = `translate(0, ${pipsize/2}px)`;
							action.style.marginLeft = "15px";
							action.style.marginRight = "15px";
							actionsContainer.appendChild(action);
						}
					}
				
					
					availableActions = this.currentActions;
					for (let i = 0;i < childrenArray.length; i++) {
						childrenArray[i].style.color = i < this.currentActions ? "var(--ech-mainAction-base-color)" : "#788291"
					}
					break;
			}
		}
    }
	
    class PF2EReActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
			
			if (!CoreHUD._actionSave[this.actionType][this.actor.id]) {
				CoreHUD._actionSave[this.actionType][this.actor.id] = {};
			}
			
			if (CoreHUD._actionSave[this.actionType][this.actor.id]._currentActions == undefined) {
				CoreHUD._actionSave[this.actionType][this.actor.id]._currentActions = this.maxActions;
			}
			
			this.__defineGetter__("_currentActions", () => {
				return CoreHUD._actionSave[this.actionType][this.actor.id]._currentActions;
			});
			
			this.__defineSetter__("_currentActions", (value) => {
				CoreHUD._actionSave[this.actionType][this.actor.id]._currentActions = value;
			})
		}

		get label() {
			return "PF2E.ActionsReactionsHeader";
		}
		
		get maxActions() {
			if (this.actor.inCombat) {
				return maxreactions;
			}
			else {
				return null;
			}
        }
		
		get currentActions() {
			return this._currentActions;
		}
		
		set currentActions(value) {
			this._currentActions = Math.min(Math.max(value, 0), this.maxActions);
			this.updateActionUse();
		}
		
		get actionType() {
			return "reaction";
		}
		
		get colorScheme() {
			return 1;
		}
		
		_onNewRound(combat) {
			for (let key of Object.keys(CoreHUD._actionSave[this.actionType])) {
				CoreHUD._actionSave[this.actionType][key]._currentActions = maxreactions;
			}
			this.updateActionUse();
		}
		
		async _getButtons() {
			let buttons = [];
			let specialActions = Object.values(PF2EECHReActionItems);
			
			buttons.push(new PF2EItemButton({ parent : this, item: null, isWeaponSet : true, isPrimary: true}));
			buttons.push(new PF2EItemButton({ parent : this, item: null, isWeaponSet : true, isPrimary: false}));
			if (game.settings.get(ModuleName, "reduceAoO")) {
				buttons = [new PF2ESplitButton(buttons[0], buttons[1])];
			}
			
			buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[0]), new PF2ESpecialActionButton(specialActions[1])));
			
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "feat"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "consumable"}));
			
			let favourite = game.settings.get(ModuleName, "favouritesystem");
			
			if (favourite == "no") buttons.push(...actionfilter(this.actor.items, {actiontype : this.actionType, classonly : true, includeFeats : true}).map(item => new PF2EItemButton({item: item, inActionPanel: true})))
			else buttons.push(...buttify(this.actor.items.filter(item => actioninfo(item).actionType.value == this.actionType && isFavourite(item)), favourite));
		
			return buttons.filter(button => button.isvalid);
		}
		
		async _renderInner() {
			await super._renderInner();
			
			if (this.maxActions) {
				this.element.onclick = (event) => {
					if (event.target == this.element) {
						this.currentActions = this.currentActions + 1;
					}
				};
				this.element.oncontextmenu = () => {
					if (event.target == this.element) {
						this.currentActions = this.currentActions - 1;
					}
				};
			}
			
			this.updateActionUse();
		}

		get template() {
			return `/modules/${ModuleName}/templates/ActionPanel.hbs`;
		}
		
		updateActionUse() {
			const actionsContainer = this.element.querySelector(".actions-uses-container");
			if (this.maxActions === null || this.currentActions === null) {
				actionsContainer.innerHTML = "";
			}
			if (!actionsContainer) return;

			const childrenArray = Array.from(actionsContainer.children);

			let availableActions;
			switch (game.settings.get(ModuleName, "actionpipsstyle")) {
				case "CORE":
					if (childrenArray.length !== this.maxActions) {
						actionsContainer.innerHTML = "";
						for (let i = 0; i < this.maxActions; i++) {
							const action = document.createElement("div");
							action.classList.add("action-pip");
							actionsContainer.appendChild(action);
						}
					}

					availableActions = this.currentActions;
					for (const child of childrenArray) {
						child.classList.toggle("actions-used", availableActions <= 0);
						availableActions--;
					}
					break;
				case "PF2E":
					const pipsize = 35; //in px
					if (childrenArray.length !== this.maxActions) {
						actionsContainer.innerHTML = "";
						for (let i = 0; i < this.maxActions; i++) {
							const action = document.createElement("span");
							action.classList.add("action-glyph");
							action.innerText = "R";
							action.style.fontSize = `${pipsize}px`;
							action.style.transform = `translate(0, ${pipsize/2}px)`;
							action.style.marginLeft = "15px";
							action.style.marginRight = "15px";
							actionsContainer.appendChild(action);
						}
					}
				
					
					availableActions = this.currentActions;
					for (let i = 0;i < childrenArray.length; i++) {
						childrenArray[i].style.color = i < this.currentActions ? "var(--ech-mainAction-base-color)" : "#788291"
					}
					break;
			}
		}
    }
	
	
    class PF2EFreeActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return "PF2E.ActionsFreeActionsHeader";
		}
		
		get actionType() {
			return "free";
		}
		
		get colorScheme() {
			return 2;
		}
		
		async _getButtons() {
			let buttons = [];
			let specialActions = Object.values(PF2EFreeActionPanel);
			
			//buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[0]), new PF2ESpecialActionButton(specialActions[1])));
			
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "feat"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "consumable"}));
			
			let favourite = game.settings.get(ModuleName, "favouritesystem");
			
			if (favourite == "no") buttons.push(...actionfilter(this.actor.items, {actiontype : this.actionType, classonly : true, includeFeats : true}).map(item => new PF2EItemButton({item: item, inActionPanel: true})))
			else buttons.push(...buttify(this.actor.items.filter(item => actioninfo(item).actionType.value == this.actionType && isFavourite(item)), favourite));
		
			return buttons.filter(button => button.isvalid);
		}
    }
	
    class PF2EPassiveActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return "PF2E.NPC.PassivesLabel";
		}
		
		get actionType() {
			return "passive";
		}
		
		get colorScheme() {
			return 3;
		}
		
		async _getButtons() {
			let buttons = [];
			
			//buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[0]), new PF2ESpecialActionButton(specialActions[1])));
			
			if (this.actor.type == "npc") {
				switch (game.settings.get(ModuleName, "shownpcpassives")) {
					case "panel" : 
						buttons.push(new PF2EButtonPanelButton({parent : this, type: "action"}));
						break;
					case "full" : 
					case "reduced" :
						let passives = this.actor.items.filter(item => (item.type == "action") && item.system.actionType?.value == this.actionType);
						
						buttons = buttons.concat(buttify(passives, game.settings.get(ModuleName, "shownpcpassives")));
						break;
				}
			}
			else {
				if (game.settings.get(ModuleName, "showfeatpassives")) {
					buttons.push(new PF2EButtonPanelButton({parent : this, type: "feat"}));
				}
			}
			
			let favourite = game.settings.get(ModuleName, "favouritesystem");
			
			if (favourite != "no") buttons.push(...buttify(this.actor.items.filter(item => actioninfo(item).actionType.value == this.actionType && isFavourite(item, false)), favourite));
			
			return buttons.filter(button => button.isvalid);
		}
    }
	
	class PF2EItemButton extends ARGON.MAIN.BUTTONS.ItemButton {
		constructor({item, isWeaponSet=false, isPrimary=false, inActionPanel=undefined, clickAction}) {
			super({item, isWeaponSet, isPrimary, inActionPanel});
			
			this._clickAction = clickAction;
		}

		get hasTooltip() {
			return true;
		}
		
		get tooltipCls() {
			return PF2ETooltips;
		}

		get targets() {
			return null;
		}
		
		get icon() {
			if (this.item?.system.identification?.status == "unidentified") {
				return this.item.system.identification.unidentified.img
			}
			
			if (defaultIcons.includes(this.item.img)) {
				if (this.item?.type == "action" || this.item?.type == "feat") {
					let replaceItem = connectedItem(this.item);
					
					if (replaceItem && !defaultIcons.includes(replaceItem.img)) {
						return replaceItem.img;
					}
				}
				
				if (this.item?.type == "feat") {
					let action = this.actor.system.actions?.find(action => action.slug == this.item.system.slug);
					
					if (action?.item && !defaultIcons.includes(action.item.img)) {
						return action.item.img;
					}
				}
				
				if (this.item?.system.selfEffect?.img && !defaultIcons.includes(this.item.system.selfEffect.img)) {
					return this.item.system.selfEffect.img;
				}
			}
			
			return super.icon;
		}
		
		get label() {
			if (this.item?.system.identification?.status == "unidentified") {
				return this.item.system.identification.unidentified.name
			}
			
			return super.label;
		}
		
		get actionType() {
			if (this.parent?.actionType) {
				return this.parent.actionType;
			}
			
			if (this.parent?.parent?.actionType) {
				return this.parent.parent.actionType
			}
		}
		
		get isvalid() {
			return  this.item || this._isWeaponSet;
		}
		
		async _onSetChange({sets, active}) {
			const activeSet = sets[active];
			
			if (activeSet) {
				//const item = this.isPrimary ? activeSet.primary : (activeSet.primary != activeSet.secondary ? activeSet.secondary : null);
				
				const item = this.isPrimary ? activeSet.primary : activeSet.secondary;
				this.setItem(item);    
			}
			
			if (this.isPrimary) {
				this.updatePartnerButton();
			}
		}
		
		get visible() {
			if (this.isWeaponSet) {
				if (!this.isPrimary) {
					if (this.item == this.partnerItem) {
						return false;
					}
					
					if (this.partnerItem?.system.equipped?.handsHeld == 2) {
						return false;
					}
				}
			}
			
			if (this.isWeaponSet && this.actionType !== "action") {
				if (this.item) {
					if (this.item.type === "shield") {
						return /*hasFeat(this.actor, "shield-block") ||*/ hasFeats(this.actor, ['reactive-strike', 'reactive-shield']);
					}
					
					if (this.item.type === "weapon") {
						if (!this.item.system.range) {
							return hasFeats(this.actor, 'reactive-strike');
						}
					}
					
					return false;
				}
			}
		
			return super.visible;
		}
		
		get partnerItem() {
			if (this.isWeaponSet) {
				if (this.parent?.button1 || this.parent?.button2) {
					return [this.parent.button1, this.parent.button2].find(button => button != this)?.item;
				}
				else {
					return this.parent?.buttons.find(button => button.isWeaponSet && button != this)?.item;
				}
			}
			
			return null;
		}
		
		get quantity() {
			switch (this.item?.type) {
				case "weapon":
					const PF2EDailies = "pf2e-dailies";
					if (game.modules.get(PF2EDailies)?.active) {
						let staffData = this.actor.flags[PF2EDailies]?.extra?.staffData;
						
						if (staffData) {
							if (staffData?.staffId == this.item.id) {
								return staffData.charges?.value;
							}
						}
					}
					
					if (this.item.reload && this.item.reload != "-") {
						if (this.item.ammo) {
							if (this.item.ammo.system.uses?.max) {
								if (this.item.ammo.system.uses.autoDestroy) {
									return this.item.ammo.system.uses.value + (this.item.ammo.system.quantity - 1) * this.item.ammo.system.uses.max;
								}
								else {
									return Math.max(this.item.ammo.system.uses.value, 1) + (this.item.ammo.system.quantity - 1) * this.item.ammo.system.uses.max;
								}
							}
							else {
								return this.item.ammo.system.quantity;
							}
						}
						else {
							return 0;
						}
					}
					
					if (this.item?.getFlag(ModuleName, "thrown")) {
						return this.item.system.quantity;
					}
					
					if (this.item?.system?.traits?.value?.includes("consumable")) {
						return this.item.quantity;
					}
					
					break;
				case "shield":
					if (this.item) {
						if (this.item?.isBroken) return 0;
						return this.item.system.hp?.value;
					}
					return null;
					break;
				case "spell":
					if (this.item.isCantrip) return null;
				
					let uses = 0;
					let hasuses = false;
					
					if (this.parent?.usecounts?.hasOwnProperty(this.item?.id)) {
						uses = uses + this.parent.usecounts[this.item.id]();
						hasuses = true;
					}
					
					if (this.item?.system.location?.uses?.max) {
						uses = uses + this.item?.system.location?.uses?.value;
						hasuses = true;
					}
					
					if (hasuses) {
						return uses;
					}
					else {
						return null;
					}
					break;
				case "equipment":
					return null;
				default :
					if (this.item?.system.uses?.max) {
						return this.item.system.uses.value + (this.item.system.quantity - 1) * this.item.system.uses.max;
					}
					else{
						if (this.item?.system.frequency?.max) {
							return this.item.system.frequency.value;
						}
						else {
							return this.item?.system.quantity;
						}
					}
					break;
			}
		}
		
		async getTooltipData() {
			if (this.panel?.visible) return null;
			const tooltipData = await getTooltipDetails(this.item);
			return tooltipData;
		}
		
		async hidetooltip() {
			if (!this._tooltip) return;
			this._tooltip._destroy();
			this._tooltip = null;
		}
		
		updatePartnerButton() {
			if (this.isWeaponSet) {
				if (this.parent) {
					if (this.parent.buttons) {
						return this.parent.buttons.find(button => button != this && button.isWeaponSet)?.render();
					}
					
					if (this.parent.button1 && this.parent.button2) {
						return [this.parent.button1, this.parent.button2].find(button => button != this && button.isWeaponSet)?.render();
					}
				}
			}
		}
		
		//staves pannel, requires PF2E dailies
		updateItem(item) {
			if (!this.panel) return;
			this.panel.updateItem(item);
		}
		
		get buttonPanelContainer() {
			return ui.ARGON.buttonPanelContainer;
		}
		
		async staffSpells() {
			const PF2EDailies = "pf2e-dailies";
			
			if (this.item?.system.traits?.value.includes("staff")) {
				if (game.modules.get(PF2EDailies)?.active) {
					//let spellgroup = this.actor.items.filter(item => item.type == "spellcastingEntry").find(item => item.getFlag(PF2EDailies, "staff")?.staveID == this.item.id);
					let spellgroup = this.actor.flags[PF2EDailies]?.extra?.staffData;
						
					if (spellgroup?.staffId == this.item.id) {
						let spellCategorie = {};
						
						spellCategorie.label = this.item.name;
						spellCategorie.uses = () => {
							let value = spellgroup.charges?.value;
							let max = spellgroup.charges?.max;
							
							if (!max || max < value) {
								max = value;
							}
							
							return {
							max : max,
							value : value
						}}
						let virtualCategory = this.item.actor?.spellcasting.collections.get(this.item.id + "-casting");

						if (virtualCategory) {
							spellCategorie.buttons = spellgroup.spells.map(spell => virtualCategory.get(spell._id)).map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, spell.system.level.value)}));
						}
						
						return [spellCategorie];
					}
				}
			}
			
			return null;
		}
		
		async _getPanel() {
			if (this.item?.system.traits?.value.includes("staff")) {
				let staffSpells = await this.staffSpells();
				
				if (staffSpells?.length) {
					return new PF2EAccordionPanel({accordionPanelCategories: staffSpells.map(data => new PF2EAccordionPanelCategory(data)) });
				}
			}
			return null;
		}
		
		//

		async _onLeftClick(event, options = {MAP : 0}) {
			if (event.target.classList.contains("specialAction") && !options.specialAction) return;

			var used = false;
			
			if (this._clickAction) {//use button action
				used = this._clickAction();
			}
			else {
				if (this.item) {
					if (this.item.flags.hasOwnProperty(ModuleName) && this.item.flags[ModuleName].onclick) {//custom on clicks
						used = await this.item.flags[ModuleName].onclick(options);
					}
					else {
						if (this.panel && game.settings.get(ModuleName, "directStaffuse")) {//panel action
							this.panel.toggle()
						}
						else {
							let action = connectedsettingAction(this.item);
							
							if (!action) {
								if (this.actor.type == "npc" && (this.item.type == "weapon" || this.item.type == "shield")) {//find melee item
									let meleeitem = this.actor.items.find(item => item.flags?.pf2e?.linkedWeapon == this.item.id);
									
									if (meleeitem) {
										action = connectedsettingAction(meleeitem);
									}
								}
							}
							
							if (action) {//default actions
								let variant = action.variants[options.MAP];
								
								if (!variant) {
									variant = action.variants[0];
								}
								
								if (await variant?.roll({event : event})) {
									used = true;
								}
							}
							else {
								if (this.item.consume) {//consume actions
									if (game.settings.get(ModuleName, "consumableuse").includes("consume")) {
										this.item.consume();
									}
									
									if (game.settings.get(ModuleName, "consumableuse").includes("chat")) {
										this.item.toChat();
									}
						
									used = true;
								}
								else {
									if (this.item.system.selfEffect?.uuid) {//effect actions
										this.actor.createEmbeddedDocuments("Item", [await fromUuid(this.item.system.selfEffect.uuid)]);
										used = true;
									}
									else {//give up and let PF2E handle it
										this.item.toChat();
										used = true;
									}
									
									if (used) {//consume frequency charges by hand
										if (this.item?.system.frequency?.max) {
											return this.item.update({system : {frequency : {value : Math.max(this.item.system.frequency.value - 1, 0)}}});
										}
									}
								}
							}
						}
					}
				}
			}
			
			if (used) {
				let action = actioninfo(this.item);
				
				if (this.isWeaponSet) {
					action.actionType.value = this.actionType;
				}
				
				useAction(action?.actionType?.value, action?.actions?.value);
			}
		}
		
		async _onRightClick(event) {
			if (event.target.classList.contains("specialAction")) return;
			
			if (this.item?.sheet) {
				this.item?.sheet?.render(true);
			}
			else {
				if (this.item?.system?.item?.sheet) {
					this.item.system.item.sheet.render(true);
				}
			}
		}
		
		async _onTooltipMouseEnter(event, locked = false) {
			await super._onTooltipMouseEnter(event, locked);
			if (this.element.querySelector(".specialAction")) {
				if (this.element.querySelector(".titleoverride")) {
					let element = this.element.querySelector("span.action-element-title") || this.element.querySelector("span.feature-element-title");
					
					if (element) element.style.visibility = "hidden"; 
				}
				for (const specialelement of this.element.querySelectorAll(".specialAction")) {
					//specialelement.style.visibility = "";
					specialelement.style.display = "";
				}
			}
		}

		async _onTooltipMouseLeave(event) {
			await super._onTooltipMouseLeave(event);
			
			if (this.element.querySelector(".specialAction")) {
				if (this.element.querySelector(".titleoverride")) {
					let element = this.element.querySelector("span.action-element-title") || this.element.querySelector("span.feature-element-title");
					
					if (element) element.style.visibility = ""; 
				}
				for (const specialelement of this.element.querySelectorAll(".specialAction")) {
					//specialelement.style.visibility = "hidden";
					specialelement.style.display = "none";
				}
			}
		}
		
		async _renderInner() {
			const iconsize = 30 * game.settings.get(ModuleName, "onitemiconscale");
			let topoffset = 1;
					
			if (!this.visible) {//fix for potential bug
				this.element.style.display = "none";
				return;
			}
			await super._renderInner();
			
			if (this.isWeaponSet && this.isPrimary) {
				if (this.panel) {
					this.panel.element.remove();
				}
				
				this.panel = await this._getPanel();
				
				if (this.panel) {
					this.panel._parent = this;
					this.buttonPanelContainer.appendChild(this.panel.element);
					await this.panel.render();
				}
			}
			
			if (this.item?.flags && this.item.flags[ModuleName]) {
				if (this.item.flags[ModuleName].toggleable && this.item.flags[ModuleName].active && !this.item.flags[ModuleName].active()) {
					this.element.style.filter = "grayscale(1)";
				}
				else {
					this.element.style.filter = "";
				}
				
				if (this.item.flags[ModuleName].toggleoptions?.length) {
					let optionselect = document.createElement("select");
					optionselect.classList.add("specialAction");
					//optionselect.classList.add("titleoverride");
					
					for (let ruleoption of this.item.flags[ModuleName].toggleoptions) {
						let option = document.createElement("option");
						option.text = ruleoption.name;
						option.value = ruleoption.value;

						option.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
						option.style.width = "200px";
						option.style.height = "20px";
						option.style.backgroundColor = "grey";
						option.style.fontSize = "12px";
						option.selected = ruleoption.value == this.item.flags[ModuleName].selectvalue;
						
						optionselect.appendChild(option);
					}
					
					optionselect.style.position = "absolute";
					//optionselect.style.bottom = "0";
					optionselect.style.top = "0";
					optionselect.style.left = "0";
					optionselect.style.width = `100%`;
					optionselect.style.height = `40px`;
					topoffset = topoffset + 40;
					optionselect.style.color = "#c8c8c8";
					optionselect.style.backdropFilter = "var(--ech-blur-amount)";
					optionselect.style.backgroundColor = "rgba(0,0,0,.3)";
					optionselect.style.textShadow = "0 0 10px rgba(0,0,0,.9)";
					optionselect.style.borderColor = "inherit";
					//optionselect.style.visibility = "hidden";
					optionselect.style.display = "none";
					
					optionselect.onchange = (event) => {this.item.flags[ModuleName].onchange(event.target.value)};
					
					this.element.appendChild(optionselect);
				}
			}
			
			let toggles = [];
			
			if (!this.isWeaponSet && this.item && game.settings.get(ModuleName, "favouritesystem") != "no") {
				let addFavourite = (isFavourite(this.item) || !this.inActionPanel) && (favourableTypes.includes(this.item.type));

				if (addFavourite) {
					let toggleData = {
						iconclass : isFavourite(this.item) ? ["fa-solid", "fa-star"] : ["fa-regular", "fa-star"],
						onclick : async () => {
							await toggleFavourite(this.item);
							ui.ARGON?.render();
						},
						tooltip : game.i18n.localize(ModuleName + ".Titles.favourite")
					};

					toggles.push(toggleData);
				}
			}
			
			if (!this.isWeaponSet && game.settings.get(ModuleName, "showactionrequirements")) {
				let toggleData = {
					text : actionGlyphofItem(this.item),
					showalways : true
				};	

				toggles.push(toggleData);
			}
			
			if (this.isWeaponSet && !(this.panel && game.settings.get(ModuleName, "directStaffuse"))) {
				const MAPActions = [{MAP : 1}, {MAP : 2}];
				if (this.item && (this.item.type == "weapon" || this.item.type == "shield" || this.item.type == "melee" || (this.actor.system.actions.find(action => action.slug == this.item.system.slug)?.variants?.length == 3)) && this.actionType == "action") {
					this.element.querySelector("span").id = "maintitle";
					
					for (let i = 0; i < MAPActions.length; i++) {
						let Action = MAPActions[i];
						let ActionTitle = document.createElement("span");
						ActionTitle.classList.add("specialAction");
						ActionTitle.classList.add("titleoverride");
						ActionTitle.classList.add("action-element-title");
						ActionTitle.innerHTML = MAPtext(this.item, Action.MAP);
						ActionTitle.onclick = (event) => {event.stopPropagation(); event.preventDefault(); this._onLeftClick(event, {MAP : Action.MAP, specialAction : true})};
						//ActionTitle.style.visibility = "hidden";
						ActionTitle.style.display = "none";
						
						ActionTitle.style.width = `${100/MAPActions.length}%`;
						ActionTitle.style.left = `${i * 100/MAPActions.length}%`;
						
						ActionTitle.onmouseenter = () => {ActionTitle.style.filter = "brightness(66%)"}
						ActionTitle.onmouseleave = () => {ActionTitle.style.filter = ""}
						
						this.element.appendChild(ActionTitle);
					}
				}
				
				if (this.item?.requiresAmmo) {
					if (game.modules.get("pf2e-ranged-combat")?.active && game.settings.get(ModuleName, "rangedammoswapmacro")) {
						let toggleData = {
							iconclass : ["fa-solid", "fa-repeat"],
							onclick : () => {
								game.pf2eRangedCombat.switchAmmunition();
							},
							tooltip : `${(await fromUuid("Compendium.pf2e-ranged-combat.macros.Item.K9jrrGLnMF23WKET")).name} (${this.item.ammo ? this.item.ammo?.name : "-"})`
						};	

						toggles.push(toggleData);
					}
					else {
						let ammoSelect = document.createElement("select");
						//ammoSelect.classList.add("action-element-title");
						ammoSelect.classList.add("specialAction");
						
						for (let ammo of [{name : "", id : ""},...this.actor.items.filter(item => item.isAmmo)]) {
							let option = document.createElement("option");
							option.text = ammo.name;
							option.value = ammo.id;

							option.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
							option.style.width = "200px";
							option.style.height = "20px";
							option.style.backgroundColor = "grey";
							option.style.fontSize = "12px";
							option.selected = this.item.system.selectedAmmoId == ammo.id;
							
							ammoSelect.appendChild(option);
						}
						
						ammoSelect.style.position = "absolute";
						ammoSelect.style.top = "0";
						ammoSelect.style.left = "50%";
						ammoSelect.style.width = `${100/2}%`;
						ammoSelect.style.height = `25px`;
						topoffset = topoffset + 25;
						ammoSelect.style.color = "#c8c8c8";
						ammoSelect.style.backdropFilter = "var(--ech-blur-amount)";
						ammoSelect.style.backgroundColor = "rgba(0,0,0,.3)";
						ammoSelect.style.textShadow = "0 0 10px rgba(0,0,0,.9)";
						ammoSelect.style.borderColor = "inherit";
						//ammoSelect.style.visibility = "hidden";
						ammoSelect.style.display = "none";
						
						ammoSelect.onchange = () => {this.item.update({system : {selectedAmmoId : ammoSelect.value}})};
						
						this.element.appendChild(ammoSelect);
					}
				}

				if (this.item?.type === "shield" && (this.actionType === "action" || (this.actionType === "reaction" && hasFeats(this.actor,"reactive-shield")))) {
					let toggleData = {
						iconclass : ["fa-solid", "fa-shield"],
						greyed : this.actor.system.attributes.shield?.raised,//!this.item.isRaised,
						onclick : async () => {
							await game.pf2e.actions.raiseAShield({actors : this.actor});
							useAction(this.actionType);
						},
						tooltip : (await fromUuid("Compendium.pf2e.actionspf2e.Item.xjGwis0uaC2305pm")).name
					};	

					toggles.push(toggleData);
				}
				
				let toggleoptions = ["versatile", "modular"];
				
				for (let togglekey of toggleoptions) {
					if (this.item?.system.traits.toggles) {
						let toggle = this.item.system.traits.toggles[togglekey];
						
						if (toggle.options.length) {
							let options = [null, ...toggle.options];
							
							let current = toggle.selection;
							let currentid = options.indexOf(current);
							let next = options[(currentid + 1)%options.length];
							
							if (current == null) {
								current = this.item.system.damage.damageType;
							}
							
							let toggleData = {
								iconclass : damageIcon(current),
								onclick : () => {
									if (togglekey == "modular") useAction("action");
									this.item.update({system : {traits : {toggles : {[togglekey] : {selection : next}}}}})
								},
								tooltip : game.i18n.localize("PF2E.Trait" + firstUpper(togglekey))
							};
							
							toggles.push(toggleData);
						}
					}
				}
				
				if (this.item?.isThrowable && !this.item?.system?.traits?.value?.includes("consumable")) {
					let isthrown = this.item.getFlag(ModuleName, "thrown");
					
					let toggleData = {
						iconsource : "systems/pf2e/icons/mdi/thrown.svg",
						greyed : !isthrown,
						onclick : () => {this.item.setFlag(ModuleName, "thrown", !isthrown)},
						tooltip : game.i18n.localize("PF2E.TraitThrown")
					};	

					toggles.push(toggleData);
				}
				
				if (this.item?.system?.traits.value?.includes("combination")) {
					let ismelee = this.item.getFlag(ModuleName, "combination-melee");
					
					let toggleData = {
						onclick : () => {this.item.setFlag(ModuleName, "combination-melee", !ismelee)}
					};	
					
					if (ismelee) {
						toggleData.iconsource = "systems/pf2e/icons/mdi/sword.svg";
					}
					else {
						toggleData.iconclass = ["fa-solid", "fa-gun"];
					}

					toggles.push(toggleData);
				}
				
				if (game.modules.get("pf2e-ranged-combat")?.active) {
					let itemaction = itemconnectedAction(this.item);
					
					let reload = itemaction?.auxiliaryActions?.find(action => action.action == "interact" && action.label == game.i18n.localize("pf2e-ranged-combat.ammunitionSystem.actions.names.reload"));
					
					let unload = itemaction?.auxiliaryActions?.find(action => action.action == "interact" && action.label == game.i18n.localize("pf2e-ranged-combat.ammunitionSystem.actions.names.unload"));
					
					if (reload) {
						let toggleData = {
							iconclass : ["fa-solid", "fa-rotate-right"],
							onclick : () => {reload.execute(); useAction("action", reload.actions)},
							tooltip : game.i18n.localize(reload.label)
						};	

						toggles.push(toggleData);
					}
					
					if (unload) {
						let toggleData = {
							iconclass : ["fa-solid", "fa-arrow-up-from-bracket"],
							onclick : () => {unload.execute(); useAction("action", unload.actions)},
							tooltip : game.i18n.localize(unload.label)
						};	

						toggles.push(toggleData);
					}
				}
				
				if (this.panel) {
					if (!game.settings.get(ModuleName, "directStaffuse")) {
						let toggleData = {
							iconclass : ["fa-solid", "fa-wand-magic-sparkles"],
							onclick : async () => {await this.hidetooltip(); this.panel.toggle()},
							tooltip : game.i18n.localize("PF2E.Item.Spell.Plural")
						};	

						toggles.push(toggleData);
					}
				}
				
				if (this.isPrimary && itemcanbetwoHanded(this.item) && this.actionType == "action") {
					let changegripaction = connectedsettingAction(this.item)?.auxiliaryActions?.find(action => action.annotation == "grip");
					
					let toggleData = {
						iconclass : ["fa-solid", `fa-${this.item.system.equipped.handsHeld}`],
						onclick : async () => {
							useAction(this.actionType, changegripaction.actions);
							
							await changegripaction?.execute();
							
							this.updatePartnerButton();
						},
						tooltip : changegripaction?.label || ""
					};	

					toggles.push(toggleData);
				}
			}
			
			if (this.item?.system.frequency?.max > this.item?.system.frequency?.value) {
				let toggleData = {
					iconclass : ["fa-solid", "fa-rotate-right"],
					onclick : () => {this.item.update({system : {frequency : {value : this.item.system.frequency.max}}});},
					tooltip : game.i18n.localize(`${game.i18n.localize("PF2E.Frequency.per")} ${game.i18n.localize("PF2E.Duration." + this.item.system.frequency.per)}`)
				};	

				toggles.push(toggleData);
			}
			
			if (this.item?.isElementalBlast) {
				let toggleData
				
				toggleData = {
					iconclass : this.item.getFlag(ModuleName, "ranged") ? ["fa-regular", "fa-meteor"] : ["fa-solid", "fa-hand"],
					onclick : () => {this.item.setFlag(ModuleName, "ranged", !this.item.getFlag(ModuleName, "ranged")); this.render();},
					tooltip : this.item.getFlag(ModuleName, "ranged") ? game.i18n.localize("PF2E.NPCAttackRanged") : game.i18n.localize("PF2E.NPCAttackMelee")
				};

				toggles.push(toggleData);
				
				toggleData = {
					iconclass : damageIcon(this.item.system.damage.damageType),
					onclick : () => {this.item.setFlag(ModuleName, "damageType", (this.item.getFlag(ModuleName, "damageType") + 1)); this.render();},
					tooltip : game.i18n.localize("PF2E.Trait" + firstUpper(this.item.system.damage.damageType))
				};	

				toggles.push(toggleData);
			}
			
			if (this.item?.type == "spell") {
				if (this.item.system.duration?.sustained) {
					let toggleData = {
						iconclass : ["fa-solid", "fa-s"],
						tooltip : game.i18n.localize("PF2E.Item.Spell.Sustained.Label"),
						showalways : true
					};	

					toggles.push(toggleData);
				}
				
				if (this.item.system.location?.signature && !this.item.spellcasting?.system.prepared?.flexible) {
					let toggleData = {
						iconclass : ["fa-solid", "fa-star"],
						tooltip : game.i18n.localize("PF2E.ToggleSignatureSpellTitle").split(" ").slice(1).join(" "),
						showalways : true
					};	

					toggles.push(toggleData);
				}
			}
			
			if (this.item?.isInvested) {
				let toggleData = {
					iconclass : ["fa-solid", "fa-gem"],
					tooltip : game.i18n.localize("PF2E.InvestedLabel")
				};	

				toggles.push(toggleData);
			}
			
			if (game.settings.get(ModuleName, "consumableswap")) {
				if (!this.isWeaponSet && this.item.system.usage?.type == "held") {
					let toggleData = {
						iconclass : ["fa-solid", "fa-hand"],
						tooltip : game.i18n.localize(ModuleName + ".Titles.swapin"),
						onclick : async () => {
							if (await ui.ARGON?.components?.weaponSets?.swapinitem(this.item)) {
								useAction("action");
							}
						}
					};	

					toggles.push(toggleData);
				}
			}
			
			this.element.appendChild(createToggleIcons(toggles, {iconsize : iconsize, rightoffset : 0, topoffset : topoffset}));
			
			if (game.settings.get(ModuleName, "showconnectedpassives")) {
				if (["weapon", "shield", "action", "melee"].includes(this.item.type)) {
					let passives = connectedPassives(this.item);
					
					let passiveToggles = passives.map(passive => {
						return {
							iconsource : passive.img,
							tooltip : passive.name,
							onclick : () => (passive.toChat()),
							onrclick : () => (passive.sheet?.render(true))
						}
					});
					
					this.element.appendChild(createToggleIcons(passiveToggles, {iconsize : iconsize, leftoffset : 0, align : "center"}));
				}
			}
		}
	}
	
	
	class PF2ESpecialActionButton extends ARGON.MAIN.BUTTONS.ActionButton {
        constructor(specialItem) {
			super();
			
			if (specialItem) {
				this.item = new CONFIG.Item.documentClass(specialItem, {
					parent: this.actor,
				});
			}
		}

		get label() {
			if (!this.enabled) {
				return "";
			}
			
			let dynamicstate = this.item?.getFlag(ModuleName, "dynamicstate");
			
			if (dynamicstate) {
				if (dynamicstate.name) {
					return dynamicstate.name({actor : this.actor});
				}
			}
			
			return this.item?.name;
		}

		get icon() {
			if (!this.enabled) {
				return "";
			}
			
			let dynamicstate = this.item?.getFlag(ModuleName, "dynamicstate");
			
			if (dynamicstate) {
				if (dynamicstate.img) {
					return dynamicstate.img({actor : this.actor});
				}
			}
			
			return this.item?.img;
		}
		
		get isvalid() {
			return true;
		}

		get hasTooltip() {
			return this.enabled;
		}
		
		get tooltipCls() {
			return PF2ETooltips;
		}

		get colorScheme() {
			return this.parent.colorScheme;
		}
		
		get actionType() {
			return this.parent.actionType;
		}
		
		get enabled() {
			if (this.item?.getFlag(ModuleName, "enabled")) {
				if (!this.item.getFlag(ModuleName, "enabled")({actor : this.actor})) {
					return false;
				}
			}	
			
			return this.item;
		}

		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.item);
			return tooltipData;
		}
		
		async getData() {
			if (!this.visible) return {};
			const quantity = this.quantity;
			
			return {
			  ...(await super.getData()),
			  quantity: quantity,
			  hasQuantity: Number.isNumeric(quantity)
			}
		}
		
		get template() {
			return `/modules/${ModuleName}/templates/ActionButton.hbs`;
		}

		async _onLeftClick(event) {
			if (this.item) {
				if (!this.enabled) {
					return;
				}
				
				var used = false;
				
				const item = this.item;
				
				let onclick = item.getFlag(ModuleName, "onclick");
				if (onclick) {
					used = await onclick({actor : this.actor, event : event});
				}
				else {
					used = true;
				}
				
				if (used) {
					let number = 1;
					if (this.actionType == "action") {
						let system = item.system;
						if (item.getFlag(ModuleName, "dynamicstate")) {
							system = item.getFlag(ModuleName, "dynamicstate").system({actor : this.actor});
						}
						number = system.actions?.value;
					}
					
					useAction(this.actionType, number);
				}
				
				if (item.getFlag(ModuleName, "updateonclick")) {
					this.render();
				}
			}
		}
		
		async _onRightClick(event) {
			if (!this.enabled) {
				return;
			}
			
			if (this.item?.getFlag(ModuleName, "onrclick")) {
				this.item?.getFlag(ModuleName, "onrclick")({actor : this.actor})
			}
		}
    }
	
	class PF2EMacroButton extends ARGON.MAIN.BUTTONS.MacroButton {
		constructor (args) {
			super(args);
			this._index = args.index;
			
			this.updateMacro();
		}
		
		get index() {
			return this._index;
		}	
		
		get macro() {
			return this._macro;
		}
		
		get label() {
			return this.macro?.name || "";
		}

		get icon() {
			return this.macro?.img ?? `modules/${ModuleName}/icons/square.svg`;
		}
		
		get visible() {
			return true;
		}
		
		get isvalid() {
			return true;
		}

		get hasTooltip() {
			return false;
		}

		get colorScheme() {
			return this.parent?.colorScheme;
		}
		
		get actionType() {
			return this.parent.actionType;
		}
		
		get macroUuid() {
			if (this.macroLocked) {
				return this.lockedMacro;
			}
			else {
				return (this.actor.getFlag(ModuleName, "setmacros") || {})[this.index];
			}
		}
		
		get lockedMacro() {
			return game.user.getFlag(ModuleName, "lockedmacros")[this.index];
		}
		
		get macroLocked() {
			return Boolean(this.lockedMacro)
		}
		
		async unlockMacro(render = true) {
			await game.user.setFlag(ModuleName, "lockedmacros", {[this.index] : ""});
			
			this.updateMacro(render);
		}
		
		async lockMacro(render = true) {
			await game.user.setFlag(ModuleName, "lockedmacros", {[this.index] : this.macroUuid});
			
			this.updateMacro(render);
		}
		
		async toggleMacroLock(render = true) {
			if (this.macroLocked) {
				await this.unlockMacro(render);
			}
			else {
				await this.lockMacro(render);
			}
		}
		
		async setMacro(uuid, render = true) {
			let macro = await fromUuid(uuid);
			
			if (macro || uuid == "") {
				this._macro = macro;
				
				if (this.macroLocked) {
					await game.user.setFlag(ModuleName, "lockedmacros", {[this.index] : uuid})
				}
				else {
					/*
					let setmacros = this.actor.getFlag(ModuleName, "setmacros") || {};
					
					setmacros[this.index] = uuid;
					*/
					
					await this.actor.setFlag(ModuleName, "setmacros", {[this.index] : uuid});
				}
			}
			else {
				this._macro = null;
			}
			
			if (render) await this.parent?.parent?.render();
		}
		
		async updateMacro(render = true) {
			this._macro = (await fromUuid(this.macroUuid)) || null;
			
			if (render) this.render();
		}
		
		async _onMouseEnter(event, locked = false) {
			await super._onTooltipMouseEnter(event, locked);
			
			if (this.element.querySelector(".specialAction")) {
				if (this.element.querySelector(".titleoverride")) {
					let element = this.element.querySelector("span.action-element-title") || this.element.querySelector("span.feature-element-title");
					
					if (element) element.style.visibility = "hidden"; 
				}
				for (const specialelement of this.element.querySelectorAll(".specialAction")) {
					//specialelement.style.visibility = "";
					specialelement.style.display = "";
				}
			}
		}

		async _onMouseLeave(event) {
			await super._onTooltipMouseLeave(event);
			
			if (this.element.querySelector(".specialAction")) {
				if (this.element.querySelector(".titleoverride")) {
					let element = this.element.querySelector("span.action-element-title") || this.element.querySelector("span.feature-element-title");
					
					if (element) element.style.visibility = ""; 
				}
				for (const specialelement of this.element.querySelectorAll(".specialAction")) {
					//specialelement.style.visibility = "hidden";
					specialelement.style.display = "none";
				}
			}
		}
		
		async _onDrop(event) {
			try {      
				event.preventDefault();
				event.stopPropagation();
				const data = JSON.parse(event.dataTransfer.getData("text/plain"));
				if (data.type == "Macro") {
					this.setMacro(data.uuid);
				}
				else {
					let macro = await createItemMacro(await fromUuid(data.uuid));
					
					this.setMacro(macro.uuid)
				}
			} catch (error) {
		  
			}
		}
		
		async _onLeftClick(event) {
			if (event.target.classList.contains("specialAction")) return;
			
			if (event.shiftKey) {
				this.setMacro("");
			}
			else {
				if (this.macro) {
					let result = await this.macro.execute({actor : this.actor});
					
					if (result && result[ModuleName]) {
						if (result[ModuleName].useActions) {
							useAction(result[ModuleName].useActions.type, result[ModuleName].useActions.actions);
						}
					}
				}
			}
		}
		
		async _onRightClick(event) {
			if (!this.macro || event.shiftKey) {
				ui.macros.renderPopout(true);
			}
			else {
				this.macro?.sheet.render(true);
			}
		}
		
		activateListeners(html) {
			super.activateListeners(html);
			
			this.element.ondrop = this._onDrop.bind(this);
		}
		
		async _renderInner() {
			await super._renderInner();
			
			const iconsize = 30 * game.settings.get(ModuleName, "onitemiconscale");
			
			if (!this.macro && this.visible) {//fix a bug?
				this.element.style.display = "flex";
				this.element.style.background =  "var(--ech-mainAction-base-background) center no-repeat"
				this.element.style.color = "var(--ech-mainAction-base-color)";
				this.element.style.border = "1px solid var(--ech-mainAction-base-border)";
				
				let span = this.element.querySelector(".feature-element-title");
				if (span) span.style.visibility = "hidden";
			}
			
			let toggles = [];
			
			let toggleData = {
				iconclass : this.macroLocked ? ["fa-solid", "fa-lock"] : ["fa-solid", "fa-lock-open"],
				tooltip : this.macroLocked ? game.i18n.localize(ModuleName + ".Titles.macrolocked") : game.i18n.localize(ModuleName + ".Titles.macrounlocked"),
				onclick : async () => {
					this.toggleMacroLock();
				}
			};	

			toggles.push(toggleData);
			
			this.element.appendChild(createToggleIcons(toggles, {iconsize : iconsize, rightoffset : 0, topoffset : 0}));
		}
	}
  
    class PF2EButtonPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
		constructor({parent, type, color, item}) {
			super();
			this.type = type;
			this._parent = parent;
			
			this.replacementItem = item;
			
			this._sorttype = sorttypes[0],
			this._sortdirection = sortdirections[0];
		}

		get colorScheme() {
			return this.parent.colorScheme;
		}

		get label() {
			if (this.replacementItem) {
				return this.replacementItem.name;
			}
			
			switch (this.type) {
				case "feat": return "PF2E.Item.Action.Plural";
				case "toggle": return "PF2E.TogglesLabel";
				default : return "PF2E.Item." + firstUpper(this.type) + ".Plural";
			}
		}
		
		get hasTooltip() {
			return this.replacementItem;
		}
		
		get tooltipCls() {
			return PF2ETooltips;
		}
		
		get sorttype() {
			return this._sorttype;
		}
		
		get sortdirection() {
			return this._sortdirection;
		}

		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.replacementItem);
			return tooltipData;
		}

		get icon() {
			if (this.replacementItem?.img) {
				return this.replacementItem.img;
			}
			
			switch (this.type) {
				case "toggle" : return `modules/${ModuleName}/icons/checklist.svg`;
				case "spell": return "modules/enhancedcombathud/icons/svg/spell-book.svg";
				case "feat": return "modules/enhancedcombathud/icons/svg/mighty-force.svg";
				case "consumable": return "modules/enhancedcombathud/icons/svg/drink-me.svg";
				case "action": return "modules/enhancedcombathud/icons/svg/mighty-force.svg";
			}
		}
		
		get actionType() {
			return this.parent.actionType;
		}
		
		get validitems() {
			let items = [];
				
			switch (this.type) {
				case "toggle":
					items = this.actor.rules.filter(rule => rule.toggleable).map(rule => itemfromRule(rule));
					break;
				case "feat":
					items = this.actor.items.filter(item => (item.type == this.type || item.type == "action") && item.system.actionType?.value == this.actionType)
					
					if (this.actionType != "passive" && game.settings.get(ModuleName, "favouritesystem") == "no") {
						items = items.filter(item => !isClassFeature(item));
					}
					break;
				case "consumable":
					let consumeitems = this.actor.items.filter(item => item.type == this.type);
					
					if (game.settings.get(ModuleName, "consumablesweaponsinpanel")) {
						consumeitems = consumeitems.concat(this.actor.items.filter(item => item.type == "weapon" && item.system?.traits?.value?.includes("consumable")));
					}
					
					consumeitems = consumeitems.filter(item => actioninfo(item).actionType.value == this.actionType);
					
					items = consumeitems;
					break;
				default:
					items = this.actor.items.filter(item => item.type == this.type);
					
					items = items.filter(item => actioninfo(item).actionType.value == this.actionType);
					break;
			}
			
			if (game.settings.get(ModuleName, "favouritesystem") != "no") {
				items = items.filter(item => !isFavourite(item));
			}
			
			return items;
		}
		
		get isvalid() {
			return this.validitems.length;
		}
		
		sortedSpells() {//this is a mess, look away
			let entries = this.actor.items.filter(entry => entry.type == "spellcastingEntry");
			
			let prepared = entries.filter(entry => entry.system.prepared.value == "prepared" && !entry.system.prepared.flexible);
			let flexible = entries.filter(entry => entry.system.prepared.value == "prepared" && entry.system.prepared.flexible);
			let spontaneous = entries.filter(entry => entry.system.prepared.value == "spontaneous");
			let innate = entries.filter(entry => entry.system.prepared.value == "innate");
			let focus = entries.filter(entry => entry.system.prepared.value == "focus");

			let usecounts = {};

			let spellCategories = [];
			
			let addcantrips = [];
			
			let isvalidspell = (spell, level, isisgnature = false) => {
				if (actioninfo(spell).actionType.value != this.actionType) {
					return false;
				}
				
				let spelllevel = spell.system.level?.value;
				
				if (!isisgnature && spell.system.location.hasOwnProperty("heightenedLevel") && !spell.isCantrip) {
					spelllevel = spell.system.location.heightenedLevel;
				}
				
				if (level == 0) {
					return spell.isCantrip;
				}
				else {
					if (level == undefined) {
						return !spell.isCantrip
					}
					else {
						if (!spelllevel || (spelllevel == undefined)) return true;
						
						if (isisgnature) {
							return !spell.isCantrip && spelllevel <= level;
						}
						else {
							return !spell.isCantrip && spelllevel == level;
						}
					}
				}
			}
			
			let addusecounts = (usecountbuffer) => {
				for (let key of Object.keys(usecountbuffer)) {
					
					usecounts[key] = () => {return (usecounts[key] ? usecounts[key]() : 0) + usecountbuffer[key]()};
				}
			}
			
			if (focus.length) {
				let buttons = [];
				
				for (let group of focus) {
					buttons = buttons.concat(group.spells.filter(spell => isvalidspell(spell)).map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, spell.system.level?.value)})));
					
					addcantrips = addcantrips.concat(group.spells.filter(spell => isvalidspell(spell, 0)).map((spell) => {return {spell, group}}));
				}
				
				spellCategories.push({
					label: game.i18n.localize("PF2E.TraitFocus"),
					buttons: buttons,
					uses: () => {return {
						max : this.actor.system.resources.focus.max,
						value : this.actor.system.resources.focus.value
					}}
				});
			}
			
			let signaturespells = [];
			for (let group of spontaneous) {
				signaturespells = signaturespells.concat(group.spells.filter(spell => spell.system.location.signature).map((spell) => {return {spell, group}}));
			}
			
			for (let i = 0; i <= 11; i++) {
				usecounts = {};
				
				let uses;
				
				if (i == 0) {
					uses = {max: Infinity, value : Infinity}
				}
				else {
					uses = () => {
						let max = 0;
						let value = 0;
						
						for (let group of spontaneous) {
							max = max + group.system.slots["slot" + i]?.max;
							value = value + group.system.slots["slot" + i]?.value;
						}
						
						for (let group of flexible) {
							max = max + group.system.slots["slot" + i]?.max;
							value = value + group.system.slots["slot" + i]?.value;
						}
						
						return {
							max: max, 
							value: value
						}
					}
				}
				
				let spellbuttons = [];
				
				if (i == 0) {
					spellbuttons = spellbuttons.concat(addcantrips.map(spell => new PF2EItemButton({item : spell.spell, clickAction : spelluseAction(spell.spell, i)})));
				}
				
				for (let group of spontaneous) {
					let spells = group.spells.filter(spell => isvalidspell(spell, i));
					
					spells = spells.filter(spell => !signaturespells.find(signaturespell => signaturespell.spell == spell && signaturespell.group == group));
					
					spellbuttons = spellbuttons.concat(spells.map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, i)})));
					
					//signaturespells = signaturespells.concat(spells.filter(spell => spell.system.location.signature).map((spell) => {return {spell, group, level : i}}));
				}
				let addsignaturebuttons = signaturespells.filter(spell => isvalidspell(spell.spell, i, true)).map(spell => new PF2EItemButton({item : spell.spell, clickAction : spelluseAction(spell.spell, i)}));
				
				for (let group of innate) {
					spellbuttons = spellbuttons.concat(group.spells.filter(spell => isvalidspell(spell, i)).map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, i)})));	
				}
				
				for (let group of prepared) {
					let ids = Object.values(group.system.slots["slot"+i].prepared).map(slot => slot.id);
					
					if (i > 0) {
						let usecountbuffer = {};
						
						ids.forEach((id) => {usecountbuffer[id] = () => {return Object.values(group.system.slots["slot"+i].prepared).filter(prep => prep.id == id && !prep.expended).length}});
						
						addusecounts(usecountbuffer);
					}
					
					spellbuttons = spellbuttons.concat(group.spells.filter(spell => ids.includes(spell.id)).filter(spell => isvalidspell(spell, i == 0 ? 0  : undefined)).map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, i)})));
				}
				
				for (let group of flexible) {
					let spells;
					
					if (i == 0) {
						spells = group.spells.filter(spell => spell.isCantrip && Object.values(group.system.slots.slot0.prepared).find(slot => slot.id == spell.id))
					}
					else {
						spells = group.spells.filter(spell => spell.system.location.signature);
					}
					
					spellbuttons = spellbuttons.concat(spells.filter(spell => isvalidspell(spell, i)).map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, i, i == 0 ? 0 : group.highestRank)})));	
				}
				
				if (spontaneous.find(group => group.highestRank >= i)) {
					spellbuttons = spellbuttons.concat(addsignaturebuttons);
				}	
				
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
				
				spellCategories.push({
					label: i == 0 ? game.i18n.localize("PF2E.TraitCantrip") : `${i}${ordinal} ${game.i18n.localize("PF2E.Item.Spell.Rank.Label")}`,
					buttons: spellbuttons,
					uses: uses,
					level: i,
					usecounts: usecounts
				});
			}
			
			return spellCategories.filter(category => category.buttons.length > 0);
		}
  
		async _getPanel() {
			switch (this.type) {
				case "spell":
					return new PF2EAccordionPanel({id: this.id, accordionPanelCategories: this.sortedSpells().map(data => new PF2EAccordionPanelCategory(data)) });
					break;
				default:
					return new PF2EButtonPanel({id: this.id, buttons: this.validitems.map(item => new PF2EItemButton({item}))});
					break;
			}
		}
		
		async activateListeners(html) {
			//await super.activateListeners(html);
			this.element.onclick = this._onLeftClick.bind(this);
			this.element.onmouseenter = this._onMouseEnter.bind(this);
			this.element.onmouseleave = this._onMouseLeave.bind(this);
		}
		
		async _onMouseEnter(event, locked = false) {
			if (this.element.querySelector(".specialAction")) {
				for (const specialelement of this.element.querySelectorAll(".specialAction")) {
					//specialelement.style.visibility = "";
					specialelement.style.display = "";
				}
			}
		}

		async _onMouseLeave(event) {
			if (this.element.querySelector(".specialAction")) {
				for (const specialelement of this.element.querySelectorAll(".specialAction")) {
					//specialelement.style.visibility = "hidden";
					specialelement.style.display = "none";
				}
			}
		}
		
		async _onLeftClick(event) {
			if (event.target.classList.contains("specialAction")) return;
			
			await super._onClick(event);
		}
		
		async _renderInner() {
			await super._renderInner();
			
			await this._renderToggles();
		}
		
		async _renderToggles() {
			for (const specialelement of this.element.querySelectorAll(".specialAction")) {
				specialelement.remove();
			}
			
			const iconsize = 30 * game.settings.get(ModuleName, "onitemiconscale");
			
			let toggles = [];
			
			if (this.type != "spell") {
				let toggleData = {
					tooltip : replacewords(game.i18n.localize(ModuleName + ".Titles.sort.name"), {type : game.i18n.localize(ModuleName + ".Titles.sort.type." + this.sorttype), direction : game.i18n.localize(ModuleName + ".Titles.sort.direction." + this.sortdirection)}),
					onclick : async () => {
						await this.increaseSortType();
					},
					onrclick : async () => {
						await this.toggleSortDirection();
					}
				};

				switch(this.sorttype) {
					case "none":
						toggleData.iconclass = ["fa-solid", "fa-sort"];
						break;
					case "alpha":
						toggleData.iconclass = this.sortdirection == sortdirections[0] ? ["fa-solid", "fa-arrow-down-a-z"] : ["fa-solid", "fa-arrow-down-z-a"];
						break;
					case "level":
						toggleData.iconclass = this.sortdirection == sortdirections[0] ? ["fa-solid", "fa-arrow-down-1-9"] : ["fa-solid", "fa-arrow-down-9-1"];
						break;
					case "action":
						toggleData.text = "1";
						break;
					case "rarity":
						toggleData.iconclass = ["fa-solid", "fa-star"];
						break;
					case "infused":
						toggleData.iconclass = ["fa-solid", "fa-flask"];
						break;
				}

				toggles.push(toggleData);
			}
			
			this.element.appendChild(createToggleIcons(toggles, {iconsize : iconsize, rightoffset : 0, topoffset : 0}));
		}
		
		async increaseSortType() {
			let localsorttypes = [...sorttypes];
			
			if (this.panel._buttons.find(button => button.item.system?.traits.value?.includes("infused"))) {
				localsorttypes.push("infused");
			}
			
			let newindex = localsorttypes.indexOf(this.sorttype) + 1;
			
			if (localsorttypes[newindex] == "action" && this.actionType != localsorttypes[newindex]) {
				newindex = newindex + 1;
			}
			
			newindex = newindex % localsorttypes.length;
			
			this._sorttype = localsorttypes[newindex];

			await this.panel.sortbuttons(sortfunction(this.sorttype, this.sortdirection));
			
			await this._renderToggles();
		}	
		
		async toggleSortDirection() {
			this._sortdirection = sortdirections[(sortdirections.indexOf(this._sortdirection) + 1) % sortdirections.length];

			await this.panel.sortbuttons(sortfunction(this.sorttype, this.sortdirection));
			
			await this._renderToggles();
		}
    }
	
	class PF2EAccordionPanel extends ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel {
		async toggleDefaults() {
			this._subPanels[0]?.toggle(true);
			this._subPanels[1]?.toggle(true);
		}
		
		get actionType() {
			return this.parent?.actionType;
		}		
		
		closesubpanels(exception = [], noTransition = false) {
			let openpanels = this._subPanels.filter(panel => panel.visible && !exception.includes(panel));
			
			openpanels.forEach(panel => panel.toggle(false, noTransition));
		}
	}
	
	class PF2EAccordionPanelCategory extends ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory {
		constructor({label, uses = {}, buttons, level, usecounts}) {
			super({label, uses, buttons});
			
			this._level = level;
			
			this._usecounts = usecounts;
		}
		
		toggle(toggle, noTransition = false) {
			if (game.settings.get(ModuleName, "onlyonespellrank")) {
				this.parent?.closesubpanels([this], noTransition);
			}
			
			super.toggle(toggle, noTransition);
		}
		
		get buttonMultipliers() {
			return [2, 3, 4, 5, 7];
		}
		
		get actionType() {
			return this.parent?.actionType;
		}
		
		get level() {
			return this._level;
		}
		
		get usecounts() {
			return this._usecounts;
		}
	}
	
	class PF2EButtonPanel extends ARGON.MAIN.BUTTON_PANELS.ButtonPanel {
		get actionType() {
			return this.parent?.actionType;
		}
		
		async sortbuttons(sortfunction) {
			this._buttons = this._buttons.sort((a,b) => sortfunction(a.item, b.item));
			
			this.render();
		}
	}
	
	class PF2ESplitButton extends ARGON.MAIN.BUTTONS.SplitButton {
		get isvalid() {
			return this.button1?.isvalid || this.button2?.isvalid;
		}
		
		get actionType() {
			return this.parent?.actionType;
		}
		
		get colorScheme() {
			return this.parent.colorScheme;
		}
	}
	
	class PF2EMovementHud extends ARGON.MovementHud {
		constructor (...args) {
			super(...args);
			
			//this might be ugly but it works and does so without tanking the performance
			//necessary to prevent movement resets on on move
			const defaults = {
				_movementUsed : 0,
				_prevUsepoint : 0,
				_speedtype : "land",
				_tempmaxspeed : {},
				_actionsused : 0,
				_freeAction : 0,
				_isstep : false
			}
			
			if (!CoreHUD._movementSave[this.actor.id]) {
				CoreHUD._movementSave[this.actor.id] = {};
			}
			
			for (let key of Object.keys(defaults)) {
				if (CoreHUD._movementSave[this.actor.id][key] == undefined) {
					CoreHUD._movementSave[this.actor.id][key] = defaults[key];
				}
				
				this.__defineGetter__(key, () => {
					return CoreHUD._movementSave[this.actor.id][key];
					//return this["_" + key];
				});
				
				this.__defineSetter__(key, (value) => {
					//this["_" + key] = value;
					
					CoreHUD._movementSave[this.actor.id][key] = value;
				})
			}

			/*
			this._movementUsed = 0;
			this._prevUsepoint = 0;
			this._speedtype = "land";
			this._tempmaxspeed = {};
			this._actionsused = 0; //increases by one after one full movement segment was used
			this._freeAction = 0;
			this._isstep = false;
			*/
		}

		get visible() {
			return game.combat?.started;
		}
		
		get movementtype() {
			const movementselect = this.element.querySelector("#movementselect");
			
			if (movementselect) {
				return movementselect.value;
			}
			else {
				return "land"
			}
		}
		
		get movementUsed() {
			return this._movementUsed;
		}
		
		get movementUsedthisAction() {
			return this._movementUsed - this._prevUsepoint;
		}
		
		set movementUsed(value) {
			if (value >= 0) {
				let max = this.movementMax;
				
				if (max > 0) {
					const prevUsed = this._movementUsed;
					
					this._movementUsed = value;
					
					let usedactions = Math.ceil((this._movementUsed-this._prevUsepoint)/max) - Math.ceil((prevUsed-this._prevUsepoint)/max);
					
					this.useActions(usedactions);
					
					if (this._movementUsed-this._prevUsepoint >= max) {
						this.resettempspeed();
						
						this._prevUsepoint = this._movementUsed - ((this._movementUsed - this._prevUsepoint)%max);
					}
					else {
						if (this._movementUsed <= this._prevUsepoint) {
							this._movementUsed = this._prevUsepoint;
							
							if (prevUsed > this._prevUsepoint) {
								//don't consume action twice, give free action
								this._freeAction = 1;
							}
						}
					}
					
					//this.updateMovement();
				}
			}
		}
		
		_onNewRound(combat) {
			for (let key of Object.keys(CoreHUD._movementSave)) {
				CoreHUD._movementSave[key]._movementUsed = 0;
				CoreHUD._movementSave[key]._prevUsepoint = 0;
				CoreHUD._movementSave[key]._tempmaxspeed = {};
				CoreHUD._movementSave[key]._actionsused = 0;
				CoreHUD._movementSave[key]._freeAction = 0;
				CoreHUD._movementSave[key]._isstep = false;
			}
			super._onNewRound(combat);
	    }
		
		async breakMovement() {
			let max = this.movementMax;
			
			this.resettempspeed();
						
			this._prevUsepoint = this._movementUsed - ((this._movementUsed - this._prevUsepoint)%max);
			
			this.updateMovement();
		}
		
		async resettempspeed(forcerender) {
			const render = Object.keys(this._tempmaxspeed).length || this._isstep || forcerender;
			this._prevUsepoint = this._movementUsed;
			this._freeAction = 0;
			this._isstep = false;
			this._tempmaxspeed = {};
			
			if (render) {
				this.render();
			}
		}
		
		get speedtype() {
			return this._speedtype;
		}
		
		set speedtype(value) {
			this._speedtype = value;
			
			this.render(true);
		}
		
		get typemaxspeed() {
			let typeinfo = this.actor.system.attributes.speed.otherSpeeds.find(speed => speed.type == this.speedtype);
			
			if (this.speedtype == "land") {
				if (this.actor.hasCondition("prone")) {
					return 5;
				}
				typeinfo = this.actor.system.attributes.speed;
			}
			
			if (!typeinfo) {//fallback to default land
				return 0;
			}
			else {
				return typeinfo.total;
			}
		}
		
		get tempmaxspeed() {
			return this._tempmaxspeed[this.speedtype];
		}
		
		get maxspeed() {
			if (this.isimmobilized) {
				return 0;
			}
			
			if (this.isstep) {
				return 5;
			}
			
			if (this.typemaxspeed) {
				return this.typemaxspeed;
			}
			
			if (this.tempmaxspeed) {
				return this.tempmaxspeed; 
			}
			
			return 0;
		}
		
		get movementMax() {
			return this.maxspeed/canvas.scene.dimensions.distance;
		}
		
		get isimmobilized() {
			return this.actor.hasCondition("immobilized");
		}
		
		get isstep() {
			return this._isstep;
		}
		
		get requiredroll() {
			if (this.maxspeed == 0) {
				switch(this.speedtype) {
					case "swim":
						return async () => {
							let title = game.i18n.localize(`PF2E.Actor.Speed.Type.${firstUpper(this.speedtype)}`) + " " + game.i18n.localize("PF2E.Check.DC.Unspecific");
							
							let dc = Number(await openNewInput("number", title, `${title}:`));
							
							await game.pf2e.actions.swim({
								actors : canvas.tokens.controlled[0].actor, 
								difficultyClass: dc,
								callback: (result) => {
									this.preuseaction();
									
									const landspeed = this.actor.system.attributes.speed.value;
								
									const outcome = result.outcome;
									
									let newspeed = 0;
									
									switch(outcome) {
										case "criticalFailure":
											break;
										case "failure":
											break;
										case "success":
											newspeed = 5 + 5 * Math.floor(landspeed/20);
											break;
										case "criticalSuccess":
											newspeed = 10 + 5 * Math.floor(landspeed/20);
											break;
									}
									
									this._tempmaxspeed = {[this.speedtype] : newspeed};
									this._isstep = false;
									
									this._prevUsepoint = this._movementUsed;
									
									this.render();
								}
							});
						}
						break;
					case "climb":
						return async () => {
							let title = game.i18n.localize(`PF2E.Actor.Speed.Type.${firstUpper(this.speedtype)}`) + " " + game.i18n.localize("PF2E.Check.DC.Unspecific");
							
							let dc = Number(await openNewInput("number", title, `${title}:`));
							
							await game.pf2e.actions.climb({
								actors : canvas.tokens.controlled[0].actor, 
								difficultyClass: dc,
								callback: (result) => {
									this.preuseaction();
									
									const landspeed = this.actor.system.attributes.speed.value;
									
									const ourcome = result.outcome;
									
									let newspeed = 0;
									
									switch(ourcome) {
										case "criticalFailure":
											break;
										case "failure":
											break;
										case "success":
											newspeed = Math.max(5, 5 * Math.floor(landspeed/20));
											break;
										case "criticalSuccess":
											newspeed = 5 + 5 * Math.floor(landspeed/20);
											break;
									}
									
									this._tempmaxspeed = {[this.speedtype] : newspeed};
									this._isstep = false;
									
									this._prevUsepoint = this._movementUsed;
									
									this.render();
								}
							});
						}
						break;
				}
			}
			
			return null;
		}
		
		get movementColor() {
			const movementColors = [/*"test-movement",*/ "base-movement", "dash-movement", "danger-movement"];
			
			let segment = this._actionsused;
			
			if (this.movementUsedthisAction == 0 && !this.hasfreeaction()) {
				segment = segment + 1;
			}
			
			return movementColors[Math.min(Math.max(segment-1, 0), movementColors.length - 1)]
		}
		
		async useActions(value) {
			if (value > 0) {
				let free = Math.max(this._freeAction, 0);
				
				let use = Math.max(value - free, 0);
				
				this._actionsused = this._actionsused + use;
				
				this._freeAction = Math.max(this._freeAction - value, 0)
				
				if (use > 0) {
					this.updateMovement();
					
					useAction("action", use, {actualmovement : true});
				}
			}
		}
		
		async preuseaction() {
			if (this._freeAction == 0) {
				this._freeAction = 1;
				
				this._actionsused = this._actionsused + 1;
			}
		}
		
		hasfreeaction() {
			return this._freeAction > 0;
		}
		
		async addstep() {
			this._isstep = true;
			
			this._prevUsepoint = this._movementUsed;
			
			this._tempmaxspeed = {};
			
			this.preuseaction();
			
			this.render();
		}
		
		updateMovement() {
			if (!game.combat?.started) this.movementUsed = 0;
			
			const max = this.maxspeed;
			
			const movementColor = this.movementColor;

			const disabledBars = Math.min(Math.max((this.movementUsedthisAction) || 0, 0), max);

			const barsNumber = Math.min(Math.max(this.movementMax - disabledBars, 0), max);

			const barsContainer = this.element.querySelector(".movement-spaces");

			let newHtml = "";
			for (let i = 0; i < barsNumber; i++) {
			  newHtml += `<div class="movement-space  ${movementColor}"></div>`;
			}
			for (let i = 0; i < disabledBars; i++) {
			  newHtml += `<div class="movement-space"></div>`;
			}
			this.element.querySelector(".movement-current").innerText = barsNumber;
			this.element.querySelector(".movement-max").innerText = (this._prevUsepoint + this.movementMax);
			barsContainer.innerHTML = newHtml;
		}
		
		onTokenUpdate(updates, context) {
			if (updates.x === undefined && updates.y === undefined) return;
			const ray = new Ray({ x: this.token.x, y: this.token.y }, { x: updates.x ?? this.token.x, y: updates.y ?? this.token.y });
			const segments = [{ ray }];
			const distance = Math.floor(
				canvas.grid.measureDistances(segments, { gridSpaces: true }) /
				canvas.dimensions.distance
			);
			if (context?.isUndo) {
				this.movementUsed -= distance;
			}
			else {
				this.movementUsed += distance;
			}
			this.updateMovement();
		}
		
		async _renderInner() {
			await super._renderInner();
			
			if (this.isimmobilized) {
					let chainicon = document.createElement("i");
					chainicon.setAttribute("data-tooltip", `${game.i18n.localize("PF2E.ConditionTypeImmobilized")}`);
					chainicon.classList.add("fa-solid", "fa-link", "movement-space");
					chainicon.style.fontSize = "2.7rem";
					chainicon.style.top = "125px";
					chainicon.style.position = "absolute";
					
					this.element.prepend(chainicon);
			}
			else {
				let roll = this.requiredroll;
				if (roll) {
					let rollicon = document.createElement("i");
					rollicon.setAttribute("data-tooltip", `${game.i18n.localize("PF2E.Roll.Roll")} ${game.i18n.localize("PF2E.Check.Label")}`);
					rollicon.classList.add("fa-solid", "fa-dice-d20", "movement-space");
					rollicon.style.fontSize = "2.7rem";
					rollicon.style.top = "125px";
					rollicon.style.position = "absolute";
					
					rollicon.onclick = roll;
					
					this.element.prepend(rollicon);
				}
			}
				
			const movementselect = document.createElement("select");
			movementselect.id = "movementselect";
			movementselect.style.width = "100%";
			movementselect.style.height = "40px";
			movementselect.style.color = "white";
			movementselect.style.backdropFilter = "var(--ech-blur-amount)";
			movementselect.style.backgroundColor = "rgba(0,0,0,.3)";
			movementselect.onchange = (value) => {
				this.speedtype = value.srcElement.value;
			}
			
			let movementtypes = [this.actor.system.attributes.speed.type];
			
			movementtypes = movementtypes.concat(this.actor.system.attributes.speed.otherSpeeds.map(speed => speed.type));
			
			let rollmovements = [];
			
			for (let check of ["swim", "climb"]) {
				if (!movementtypes.includes(check)) {
					movementtypes.push(check);
					rollmovements.push(check);
				}
			}
			
			for (const movementtype of movementtypes) {
				const typeoption = document.createElement("option");
				typeoption.value = movementtype;
				typeoption.innerHTML = game.i18n.localize(`PF2E.Actor.Speed.Type.${firstUpper(movementtype)}`);
				typeoption.selected = (movementtype == this.speedtype);
				typeoption.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
				typeoption.style.width = "200px";
				typeoption.style.height = "20px";
				typeoption.style.backgroundColor = "grey";
				typeoption.style.fontSize = "15px";
				typeoption.style.backdropFilter = "var(--ech-blur-amount)";
				typeoption.style.backgroundColor = "rgba(0,0,0,.3)";
				
				movementselect.appendChild(typeoption);
			}
			
			this.element.appendChild(movementselect);
		}
	}
	
	class PF2EButtonHud extends ARGON.ButtonHud {
		constructor (...args) {
			super(...args);
		}

		get visible() {
			return !game.combat?.started;
		}

		async _getButtons() {
			let buttons = [
				{
					label: "PF2E.Action.RestForTheNight.Label",
					onClick: (event) => game.pf2e.actions.restForTheNight({actors : this.actor}),
					icon: "fas fa-bed"
				}
			];
			
			if (this.actor.system.resources?.focus?.max) {
				buttons.push({
					label: ModuleName + ".Titles.refocus",
					onClick: (event) => {
						let value = Math.min(this.actor.system.resources.focus.max - this.actor.system.resources.focus.value, 1);
						
						if (value > 0) {
							this.actor.update({system : {resources : {focus : {value : Math.min(this.actor.system.resources.focus.value + value, this.actor.system.resources.focus.max)}}}});
							
							ChatMessage.create({content : replacewords(game.i18n.localize(ModuleName + ".Titles.regainedfocus"), {Actor : this.actor.name, n : value})})
						}
					},
					icon: "fa-solid fa-book-open-reader"
				});
			}
			
			if (this.actor.skills.medicine.rank) {
				buttons.push({
					label: (await fromUuid("Compendium.pf2e.actionspf2e.Item.1kGNdIIhuglAjIp9")).name,
					onClick: (event) => game.pf2e.actions.treatWounds({actors : this.actor}),
					icon: "fa-solid fa-kit-medical"
				});
			}
			
			return buttons;
		}
	}
	
	class PF2EWeaponSets extends ARGON.WeaponSets {
		get setsnumber() {
			return game.settings.get(ModuleName, "weaponsetscount");
		}
		
		async swapinitem(item) {
			if (item?.system?.usage?.type == "held") {
				const sets = this.actor.getFlag("enhancedcombathud", "weaponSets") || {};
				const activeset = this.actor.getFlag("enhancedcombathud", "activeWeaponSet");
				
				if (sets && activeset) {
					if (!sets[activeset]) {
						sets[activeset] = {
							primary : null,
							secondary : null
						}
					}
					
					if (sets[activeset].secondary != item.uuid) {
						sets[activeset].secondary = item.uuid;
						
						if (item?.system?.usage?.hands > 1) {
							sets[activeset].primary = item.uuid;
						}
						
						await this.actor.setFlag("enhancedcombathud", "weaponSets", sets);
						await this.render();
						
						return true;
					}
				}
			}
		}
		
		async getDefaultSets() {
			let sets = {};
			
			for (let i = 1; i <= this.setsnumber; i++) {
				sets[i] = {
					primary: null,
					secondary: null
				}
			}
			
			if (this.actor.type == "npc") {
				let onlyactions = true;
				
				let actions = this.actor.items.filter((item) => item.type === "melee").map((action) => {
					let item = this.actor.items.find(item => item.type != "melee" && item.name == action.name);
					
					if (item) {
						return item;
						onlyactions = false;
					}
					else {
						return action;
					}
				});
				
				actions = actions.concat(this.actor.items.filter(item => item.type == "shield" && !actions.includes(item)));
				
				if(onlyactions) {
					for (let i = 1; i <= this.setsnumber; i++) {
						sets[i] = {
							primary: actions[(i-1)*2]?.uuid ?? null,
							secondary: actions[(i-1)*2 + 1]?.uuid ?? null,
						}
					}
				} 
				else {
					for (let i = 1; i <= this.setsnumber; i++) {
						sets[i] = {
							primary: actions[i-1]?.uuid ?? null,
							secondary: null,
						}
					}
				}
			}
			
			return sets;
		}
		
		async _getSets() {
			const sets = mergeObject(await this.getDefaultSets(), deepClone(this.actor.getFlag("enhancedcombathud", "weaponSets") || {}));

			for (const [set, slots] of Object.entries(sets)) {
				for (let key of ["primary", "secondary"]) {
					let item;
					
					if (slots[key] && (typeof slots[key] == "string")) {
						let infos;
						
						switch (slots[key].split(".")[0]) {
							case "Actor":
							case "Scene":
								item = await fromUuid(slots[key]);
								
								if (!item) {
									item = this.actor.system.actions?.find(action => action.item.uuid == slots[key])?.item;
								}
								break;
							case "ActorAction":
								infos = slots[key + "-infos"];
								
								if (infos?.slug) {
									item = this.actor.system.actions?.find(action => action.slug == infos.slug && action.item.uuid == slots[key].replace("ActorAction", "Actor"))?.item;
									
									if (!item) {
										item = this.actor.system.actions?.find(action => action.slug == infos.slug)?.item;
									}
								}
								else {
									item = this.actor.system.actions?.find(action => action.item.uuid == slots[key].replace("ActorAction", "Actor"))?.item;
								}
								break;
							case "ElementalBlast":
								//the misery begins
								item = await elementalBlastProxy(this.actor, slots[key]);
								break;
							break;
						}
					}
					
					if (!item) {
						item = null;
					}
					
					slots[key] = item;
				}
			}
			
			let returnsets = {};
			
			for (let i = 1; i <= this.setsnumber; i++) {
				returnsets[i] = sets[i];
			}
			
			return returnsets;
		}
		
		async onSetChange({sets, active}) {
			await this._onSetChange({sets, active});
			Hooks.callAll("argon-onSetChangeUpdateItem", {sets, active});
			Hooks.callAll("argon-onSetChangeComplete", {sets, active});
		}

		async _onSetChange({ sets, active }) {
			let lastSet = this.actor.getFlag(ModuleName, "lastSet") || {};
			
			if (active == lastSet.active && sets[active].primary?._id == lastSet.primary && sets[active].secondary?._id == lastSet.secondary) return;
			
			lastSet = {
				active : active,
				primary : sets[active].primary?._id,
				secondary : sets[active].secondary?._id
			}
			
			this.actor.setFlag(ModuleName, "lastSet", lastSet);
			
			const updates = [];
			const activeSet = sets[active] || {primary : null, secondary : null};
			const activeItems = Object.values(activeSet).filter((item) => item);
			const inactiveSets = Object.values(sets).filter((set) => set !== activeSet);
			const inactiveItems = inactiveSets.flatMap((set) => Object.values(set)).filter((item) => item).filter((item) => !activeItems.includes(item));
			
			inactiveItems.forEach((item) => {
				if (this.actor.items.get(item.id)) {
					updates.push({ _id: item.id, system : {equipped : {carryType : "worn"}} });
				}
			});
			
			let handsHeld = 1;
			if (activeItems[0] == activeItems[1]) {
				handsHeld = 2;
			}
			activeItems.forEach((item) => {
				if (this.actor.items.get(item.id)) {
					updates.push({ _id: item.id, system : {equipped : {carryType : "held", handsHeld : handsHeld}} });
				}
			});
			
			return await this.actor.updateEmbeddedDocuments("Item", updates);
		}
		
		async _onDrop(event) {
			try {      
				event.preventDefault();
				event.stopPropagation();
				const data = JSON.parse(event.dataTransfer.getData("text/plain"));
				const set = event.currentTarget.dataset.set;
				const slot = event.currentTarget.dataset.slot;
				const sets = this.actor.getFlag("enhancedcombathud", "weaponSets") || {};
				sets[set] = sets[set] || {};
				
				if (data.elementTrait) {
					sets[set][slot] = "ElementalBlast." + data.elementTrait;
				}
				else {
					if (data.uuid) {
						sets[set][slot] = data.uuid;
					}
					else {
						if (data.hasOwnProperty("index")) {
							let connectedItem = this.actor.system.actions[data.index]?.item;
							
							if (connectedItem) {
								let owneditem = this.actor.items.find(item => item.id == connectedItem.id);
								
								if (owneditem && ["weapon", "shield"].includes(owneditem.type)) {
									sets[set][slot] = connectedItem.uuid;
								}
								else {
									sets[set][slot] = connectedItem.uuid.replace("Actor", "ActorAction") || null;
									sets[set][slot + "-infos"] = {slug : this.actor.system.actions[data.index]?.slug, index : data.index};
								}
							}
						}
						else {
							
						}
					}
				}

				await this.actor.setFlag("enhancedcombathud", "weaponSets", sets);
				await this.render();
			} catch (error) {
		  
			}
		}
		
		async _renderInner() {
			await super._renderInner();
			
			this.element.style.gridTemplateColumns = "repeat(3, 1fr)";
			this.element.style.display = "grid";
			this.element.style.transform = `translate(0, ${-Math.floor((this.setsnumber-1)/3) * 57 - 5}px)`;
			this.element.querySelectorAll(".weapon-set").forEach((element) => {
				element.style.marginTop = "5px";
			});
			//temp1.style.marginTop = "5px"
		}
    }
  
	let panels = [
		PF2EActionPanel,
		PF2EReActionPanel,
		PF2EFreeActionPanel,
		PF2EPassiveActionPanel
	];
	
	if (game.settings.get(ModuleName, "showmacrocategory")) {
		panels.push(ARGON.PREFAB.MacroPanel);
	}
	
	panels.push(ARGON.PREFAB.PassTurnPanel);
  
    CoreHUD.definePortraitPanel(PF2EPortraitPanel);
    CoreHUD.defineDrawerPanel(PF2EDrawerPanel);
    CoreHUD.defineMainPanels(panels);  
	CoreHUD.defineMovementHud(PF2EMovementHud);
	CoreHUD.defineButtonHud(PF2EButtonHud);
    CoreHUD.defineWeaponSets(PF2EWeaponSets);
	CoreHUD.defineSupportedActorTypes(["character", "familiar", "npc"]);
});
