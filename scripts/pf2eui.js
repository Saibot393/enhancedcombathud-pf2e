import {registerPF2EECHSItems, PF2EECHActionItems, PF2EECHFreeActionItems, PF2EECHReActionItems, itemfromRule} from "./specialItems.js";
import {replacewords, ModuleName, getTooltipDetails, damageIcon, firstUpper, actioninfo, hasAoO, hasSB, MAPtext, spelluseAction, isClassFeature, connectedItem} from "./utils.js";
import {openNewInput} from "./popupInput.js";

const defaultIcons = ["systems/pf2e/icons/actions/FreeAction.webp", "systems/pf2e/icons/actions/OneAction.webp", "systems/pf2e/icons/actions/OneThreeActions.webp", "systems/pf2e/icons/actions/OneTwoActions.webp", "systems/pf2e/icons/actions/Passive.webp", "systems/pf2e/icons/actions/Reaction.webp", "systems/pf2e/icons/actions/ThreeActions.webp", "systems/pf2e/icons/actions/TwoActions.webp", "systems/pf2e/icons/actions/TwoThreeActions.webp", "icons/sundries/books/book-red-exclamation.webp"]

const systemicons = {
	lifeSupport : "fa-heart-pulse",
	sensors : "fa-satellite-dish",
	engines : "fa-rocket",
	powerCore : "fa-bolt",

	weaponsArrayForward : "fa-up-long",
	weaponsArrayAft : "fa-down-long",
	weaponsArrayStarboard : "fa-right-long",
	weaponsArrayPort : "fa-left-long"
}

const systemconditionicons = {
	nominal : "fa-check",
	glitching : "fa-bug",
	malfunctioning : "fa-exclamation",
	wrecked : "fa-xmark"
}

const systemconditioncolor = {
	nominal : "green",
	glitching : "yellow",
	malfunctioning : "orange",
	wrecked : "red"
}

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

//ammend Hooks
Hooks.on("updateItem", (item) => {
	const PF2EDailies = "pf2e-dailies";
	if (ui.ARGON && item.parent == ui.ARGON?.components.portrait.actor) {
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
		if (item.type == "spellcastingEntry") {
			let staffid;
			
			if (game.modules.get(PF2EDailies)?.active) {
				staffid = item.getFlag(PF2EDailies, "staff")?.staveID;
			}
			
			for (const itemButton of ui.ARGON.itemButtons) {
				if (itemButton.item?.id == staffid || item.spells?.get(itemButton.item?.id)) {
							itemButton.render();
				}
			}
		}
		if (item.rules?.length) {
			for (const itemButton of ui.ARGON.itemButtons) {
				if (itemButton.item?.system?.updateID == item.id) {
					itemButton.render();
				}
			}
		}
	}
});

Hooks.on("argonInit", async (CoreHUD) => {
    const ARGON = CoreHUD.ARGON;
  
	await registerPF2EECHSItems();
	
	CoreHUD._movementSave = {};
	
	function useAction(actionType, fallback = true) {
		switch (actionType) {
			case "action":
				if (!ui.ARGON.components.main[0].isActionUsed) {
					ui.ARGON.components.main[0].isActionUsed = true;
					ui.ARGON.components.main[0].updateActionUse();
				}
				else {
					if (fallback) {
						useAction("full");
					}
				}
				break;
			case "move":
				if (!ui.ARGON.components.main[1].isActionUsed) {
					ui.ARGON.components.main[1].isActionUsed = true;
					ui.ARGON.components.main[1].updateActionUse();
				}
				else {
					if (fallback) {
						useAction("action");
					}
				}
				break;
			case "swift":
				if (!ui.ARGON.components.main[2].isActionUsed) {
					ui.ARGON.components.main[2].isActionUsed = true;
					ui.ARGON.components.main[2].updateActionUse();
				}
				else {
					if (fallback) {
						useAction("move");
					}
				}
				break;
			case "full":
				for (let i = 0; i <= 2; i++) {
					ui.ARGON.components.main[i].isActionUsed = true;
					ui.ARGON.components.main[i].updateActionUse();
				}
				break;
			case "reaction":
				ui.ARGON.components.main[3].isActionUsed = true;
                ui.ARGON.components.main[3].updateActionUse();
				break;
		}
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
				
					return `CR ${this.actor.system.details.level.value} ${status}`;
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

		async getStatBlocks() {
			const HPText = game.i18n.localize("PF2E.HitPointsShortLabel");
			
			const ACText = game.i18n.localize("PF2E.ArmorClassShortLabel");
			
			const ClassDC = game.i18n.localize("PF2E.Check.DC.Unspecific");

			const hppercent = this.actor.system.attributes.hp.value/this.actor.system.attributes.hp.max;
			const hpColor = this.actor.system.attributes.hp.temp ? "#6698f3" : (hppercent <= 0.5 ? (hppercent <= 0.1 ?  "rgb(255 10 10)" : "rgb(255 127 0)") : "rgb(0 255 170)");
			const tempMax = this.actor.system.attributes.hp.tempmax;
			const hpMaxColor = tempMax ? (tempMax > 0 ? "rgb(222 91 255)" : "#ffb000") : "rgb(255 255 255)";

			let blocks = [
				[
					{
						text: `${this.actor.system.attributes.hp.value + (this.actor.system.attributes.hp.temp ?? 0)}`,
						color: hpColor,
					},
					{
						text: `/`,
					},
					{
						text: `${this.actor.system.attributes.hp.max + (this.actor.system.attributes.hp.tempmax ?? 0)}`,
						color: hpMaxColor,
					},
					{
						text: HPText,
					},
				],
				[
					{
						text: ACText,
					},
					{
						text: this.actor.system.attributes.ac.value,
						color: "var(--ech-movement-baseMovement-background)",
						id: "ACvalue"
					},
				]
			];
			
			if (this.actor.system.attributes.classDC?.dc) {
				blocks.push([
					{
						text: ClassDC,
					},
					{
						text: this.actor.system.attributes.classDC?.dc,
						color: "var(--ech-movement-baseMovement-background)",
					}
				]);
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
			this.element.oncontextmenu = () => {
				if (this.actor.sheet.rendered) {
					this.actor.sheet.close();
				}
				else {
					this.actor.sheet.render(true);
				}
			};
			
			if (this.actor.system.resources.heroPoints?.max) {
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
				heroPoints.oncontextmenu = () => {event.stopPropagation(); this.actor.update({system : {resources : {heroPoints : {value : Math.max(value - 1, 0)}}}})};
				
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
			
			if (this.isDying) {
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
				dyingcount.oncontextmenu = () => {event.stopPropagation(); this.actor.decreaseCondition("dying")};
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
			
			if (this.actor.system.attributes.shield?.raised) {
				let shieldIcon = document.createElement("i");
				shieldIcon.classList.add("fa-solid", "fa-shield");
				shieldIcon.setAttribute("data-tooltip", game.i18n.localize("TYPES.Item.shield"));
				
				this.element.querySelector("#ACvalue").appendChild(shieldIcon);
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
			
			const savesButtons = Object.keys(saves).map(saveKey => {
				const save = saves[saveKey];
				
				let valueLabel = `<span style="margin: 0 1rem">+${save.mod}</span>`;
				let nameLabel = `<span style="padding-left : 5px;padding-right : 5px;text-align: center; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 2px;background-color: var(--color-proficiency-${game.i18n.localize("PF2E.ProficiencyLevel" + save.rank).toLowerCase()})">${save.label}</span>`;
				
				return new ARGON.DRAWER.DrawerButton([
					{
						label: nameLabel,
						onClick: () => {save.check.roll()}
					},
					{
						label: valueLabel,
						onClick: () => {save.check.roll()},
						style: "display: flex; justify-content: flex-end;"
					}
				]);
			});
			
			
			let skillsButtons = Object.keys(skills).map(skillKey => {
				const skill = skills[skillKey];
				
				if (!skill.lore) {
					let valueLabel = `<span style="margin: 0 1rem">+${skill.mod}</span>`;
					let nameLabel = `<span style="padding-left : 5px;padding-right : 5px;text-align: center; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 2px;background-color: var(--color-proficiency-${game.i18n.localize("PF2E.ProficiencyLevel" + skill.rank).toLowerCase()})">${skill.label}</span>`;
					
					return new ARGON.DRAWER.DrawerButton([
						{
							label: nameLabel,
							onClick: () => {skill.check.roll()}
						},
						{
							label: valueLabel,
							onClick: () => {skill.check.roll()},
							style: "display: flex; justify-content: flex-end;"
						},
					]);
				}
			}).filter(button => button);
			
			let loreButtons = Object.keys(skills).map(skillKey => {
				const lore = skills[skillKey];
				
				if (lore.lore) {
					let valueLabel = `<span style="margin: 0 1rem">+${lore.mod}</span>`;
					let nameLabel = `<span style="padding-left : 5px;padding-right : 5px;text-align: center; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 2px;background-color: var(--color-proficiency-${game.i18n.localize("PF2E.ProficiencyLevel" + lore.rank).toLowerCase()})">${lore.label}</span>`;
					
					return new ARGON.DRAWER.DrawerButton([
						{
							label: nameLabel,
							onClick: () => {lore.check.roll()}
						},
						{
							label: valueLabel,
							onClick: () => {lore.check.roll()},
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
					gridCols: "7fr 2fr",
					captions: [
						{
							label: game.i18n.localize("PF2E.CoreSkillsHeader"),
						},
						{
							label: "",
						},
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
			
			return returncategories;
		}

		get title() {
			return `${game.i18n.localize("PF2E.SavesHeader")}, ${game.i18n.localize("PF2E.CoreSkillsHeader")} & ${game.i18n.localize("PF2E.LoreSkillsHeader")}`;
		}
	}
  
    class PF2EActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
			
			this._currentActions = this.maxActions;
		}

		get label() {
			return "PF2E.ActionTypeAction";
		}
		
		get maxActions() {
			if (this.actor.inCombat) {
				return 3;
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
		}
		
		get actionType() {
			return "action";
		}
		
		get colorScheme() {
			return 0;
		}
		
		_onNewRound(combat) {
			let stunned = this.actor.items.find(i => i.system.slug == "stunned")?.system.value?.value;
			let slowed = this.actor.items.find(i => i.system.slug == "slowed")?.system.value?.value;
			
			this._currentActions = this.maxActions;
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
			
			buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[3]), new PF2ESpecialActionButton(specialActions[4])));
			
			buttons.push(...this.actor.items.filter(item => item.type == "action" && isClassFeature(item) && item.system.actionType?.value == this.actionType).map(item => new PF2EItemButton({item: item, inActionPanel: true})));
			
			return buttons.filter(button => button.isvalid);
		}
    }
	
    class PF2EReActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
			
			this._currentActions = this.maxActions;
		}

		get label() {
			return "PF2E.ActionTypeReaction";
		}
		
		get maxActions() {
			if (this.actor.inCombat) {
				return 1;
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
		}
		
		get actionType() {
			return "reaction";
		}
		
		get colorScheme() {
			return 1;
		}
		
		_onNewRound(combat) {
			this._currentActions = this.maxActions;
			this.updateActionUse();
		}
		
		async _getButtons() {
			let buttons = [];
			let specialActions = Object.values(PF2EECHReActionItems);
			
			buttons.push(new PF2EItemButton({ parent : this, item: null, isWeaponSet : true, isPrimary: true}));
			buttons.push(new PF2EItemButton({ parent : this, item: null, isWeaponSet : true, isPrimary: false}));
			
			buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[0]), new PF2ESpecialActionButton(specialActions[1])));
			
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "feat"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "consumable"}));
			
			buttons.push(...this.actor.items.filter(item => item.type == "action" && isClassFeature(item) && item.system.actionType?.value == this.actionType).map(item => new PF2EItemButton({item: item, inActionPanel: true})));
			
			return buttons.filter(button => button.isvalid);
		}
    }
	
	
    class PF2EFreeActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			//return "PF2E.ActionTypeFree";
			return game.i18n.localize("PF2E.ActionTypeFree")//.split(" ")[0];
		}
		
		get actionType() {
			return "free";
		}
		
		get colorScheme() {
			return 2;
		}
		
		_onNewRound(combat) {
			this._currentActions = this.maxActions;
			this.updateActionUse();
		}
		
		async _getButtons() {
			let buttons = [];
			let specialActions = Object.values(PF2EFreeActionPanel);
			
			//buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[0]), new PF2ESpecialActionButton(specialActions[1])));
			
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "feat"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "consumable"}));
			
			buttons.push(...this.actor.items.filter(item => item.type == "action" && isClassFeature(item) && item.system.actionType?.value == this.actionType).map(item => new PF2EItemButton({item: item, inActionPanel: true})));
			 
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
			
			if (this.item?.system.identification) {
				//hide mystified items from non GMs
				return this.item.system.identification.status == "identified" || game.user.isGM;
			}
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
					
					if (replaceItem) {
						return replaceItem.img;
					}
				}
				
				if (this.item?.system.selfEffect?.img) {
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

			const item = this.isPrimary ? activeSet.primary : (activeSet.primary != activeSet.secondary ? activeSet.secondary : null);
			this.setItem(item);    
		}
		
		get visible() {
			if (this._isWeaponSet && this.actionType != "action") {
				if (this.item) {
					if (this.item.type == "shield") {
						return /*hasSB(this.actor) ||*/ hasAoO(this.actor);
					}
					
					if (this.item.type == "weapon") {
						if (!this.item.system.range) {
							return hasAoO(this.actor);
						}
					}
					
					return false;
				}
			}
		
			return super.visible;
		}
		
		get quantity() {
			switch (this.item?.type) {
				case "weapon":
					const PF2EDailies = "pf2e-dailies";
					if (game.modules.get(PF2EDailies)?.active) {
						let staffSpells = this.actor.items.find(item => item.type == "spellcastingEntry" && item.getFlag(PF2EDailies, "staff")?.staveID == this.item.id)
						
						if (staffSpells) {
							return staffSpells.getFlag(PF2EDailies, "staff").charges;
						}
					}
					
					if (this.item.reload && this.item.reload != "-") {
						if (this.item.ammo) {
							if (this.item.ammo.system.uses?.max) {
								return this.item.ammo.system.uses.value + (this.item.ammo.system.quantity - 1) * this.item.ammo.system.uses.max;
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
					break;
				case "shield":
					if (this.item) {
						if (this.item?.isBroken) return 0;
						return this.item.system.hp?.value;
					}
					return null;
					break;
				case "spell":
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
			const tooltipData = await getTooltipDetails(this.item);
			return tooltipData;
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
					let spellgroup = this.actor.items.filter(item => item.type == "spellcastingEntry").find(item => item.getFlag(PF2EDailies, "staff")?.staveID == this.item.id);
					
					if (spellgroup) {
						let spellCategorie = {};
						
						spellCategorie.label = this.item.name;
						spellCategorie.uses = () => {
							let value = spellgroup?.getFlag(PF2EDailies, "staff")?.charges;
							let max = spellgroup?.getFlag(PF2EDailies, "staff")?.max;
							
							if (!max || max < value) {
								max = value;
							}
							
							return {
							max : max,
							value : value
						}}
						spellCategorie.buttons = spellgroup.spells.map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, spellgroup, spell.system.level?.value)}));
						
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
			
			if (this._clickAction) {
				used = this._clickAction();
			}
			
			if (this.item) {
				if (this.item.flags.hasOwnProperty(ModuleName) && this.item.flags[ModuleName].onclick) {//custom on clicks
					this.item.flags[ModuleName].onclick();
				}
				else {
					if (this.panel && game.settings.get(ModuleName, "directStaffuse")) {//panel action
						this.panel.toggle()
					}
					else {
						let action = this.actor.system.actions.find(action => action.slug == this.item.system.slug);
						
						if (!action && this.item.type == "melee") {
							action = this.actor.system.actions.find(action => action.slug == this.item.name.toLowerCase());
						}
						
						if (action) {//default actions
							let variant = action.variants[options.MAP];
							
							if (!variant) {
								variant = action.variants[0];
							}
							
							if (await variant?.roll()) {
								used = true;
							}
						}
						else {
							if (this.item.consume) {//consume actions
								this.item.consume();
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
			
			if (used) {
				useAction(this.actionType);
			}
		}
		
		async _onRightClick(event) {
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
				if (this.isWeaponSet) {
					this.element.querySelector("span.action-element-title").style.visibility = "hidden";
				}
				for (const specialelement of this.element.querySelectorAll(".specialAction")) {
					specialelement.style.visibility = "";
				}
			}
		}

		async _onTooltipMouseLeave(event) {
			await super._onTooltipMouseLeave(event);
			
			if (this.element.querySelector(".specialAction")) {
				if (this.isWeaponSet) {
					this.element.querySelector("span.action-element-title").style.visibility = "";
				}
				for (const specialelement of this.element.querySelectorAll(".specialAction")) {
					specialelement.style.visibility = "hidden";
				}
			}
		}
		
		async _renderInner() {
			const iconsize = 30;
			let topoffset = 1;
					
			if (!this.visible) {//fix for potential bug
				this.element.style.display = "none";
				return;
			}
			await super._renderInner();
			
			if (this.isWeaponSet && this.isPrimary) {
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
			}
			
			let toggles = [];
			
			if (this.isWeaponSet && !(this.panel && game.settings.get(ModuleName, "directStaffuse"))) {
				const MAPActions = [{MAP : 1}, {MAP : 2}];
				if ((this.item.type == "weapon" || this.item.type == "shield" || this.item.type == "melee") && this.actionType == "action") {
					this.element.querySelector("span").id = "maintitle";
					
					for (let i = 0; i < MAPActions.length; i++) {
						let Action = MAPActions[i];
						let ActionTitle = document.createElement("span");
						ActionTitle.classList.add("specialAction");
						ActionTitle.classList.add("action-element-title");
						ActionTitle.innerHTML = MAPtext(this.item, Action.MAP);
						ActionTitle.onclick = (event) => {event.stopPropagation(); event.preventDefault(); this._onLeftClick(event, {MAP : Action.MAP, specialAction : true})};
						ActionTitle.style.visibility = "hidden";
						
						ActionTitle.style.width = `${100/MAPActions.length}%`;
						ActionTitle.style.left = `${i * 100/MAPActions.length}%`;
						
						ActionTitle.onmouseenter = () => {ActionTitle.style.filter = "brightness(66%)"}
						ActionTitle.onmouseleave = () => {ActionTitle.style.filter = ""}
						
						this.element.appendChild(ActionTitle);
					}
				}
				
				if (this.item?.requiresAmmo) {
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
					ammoSelect.style.visibility = "hidden";
					
					ammoSelect.onchange = () => {this.item.update({system : {selectedAmmoId : ammoSelect.value}})};
					
					this.element.appendChild(ammoSelect);
				}
				
				if (this.item?.type == "shield" && this.actionType == "action") {
					let toggleData = {
						iconclass : ["fa-solid", "fa-shield"],
						greyed : !this.item.isRaised,
						onclick : () => {
							console.log("acn action should be used here");
							game.pf2e.actions.raiseAShield({actors : this.actor})
						},
						tooltip : (await fromUuid("Compendium.pf2e.actionspf2e.Item.xjGwis0uaC2305pm")).name
					};	

					toggles.push(toggleData);
				}
				
				let toggleoptions = ["versatile", "modular"];
				
				for (let togglekey of toggleoptions) {
					if (this.item.system.traits.toggles) {
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
									if (togglekey == "modular") console.log("an action should be used here");
									this.item.update({system : {traits : {toggles : {[togglekey] : {selection : next}}}}})
								},
								tooltip : game.i18n.localize("PF2E.Trait" + firstUpper(togglekey))
							};
							
							toggles.push(toggleData);
						}
					}
				}
				
				if (this.item.isThrowable) {
					let isthrown = this.item.getFlag(ModuleName, "thrown");
					
					let toggleData = {
						iconsource : "systems/pf2e/icons/mdi/thrown.svg",
						greyed : !isthrown,
						onclick : () => {this.item.setFlag(ModuleName, "thrown", !isthrown)},
						tooltip : game.i18n.localize("PF2E.TraitThrown")
					};	

					toggles.push(toggleData);
				}
				
				if (this.panel) {
					if (!game.settings.get(ModuleName, "directStaffuse")) {
						let toggleData = {
							iconclass : ["fa-solid", "fa-wand-magic-sparkles"],
							onclick : () => {this.panel.toggle()},
							tooltip : game.i18n.localize("PF2E.Item.Spell.Plural")
						};	

						toggles.push(toggleData);
					}
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
			
			/*
			if (this.item.type == "spell" && this.item.system.duration?.sustained) {
					let toggleData = {
						iconclass : ["fa-solid", "fa-s"],
						tooltip : game.i18n.localize("PF2E.Item.Spell.Sustained.Label")
					};	

					toggles.push(toggleData);
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
					icon.style.right = `${1}px`;
				}
				if (toggle.iconsource) {
					icon = document.createElement("div");
					icon.style.backgroundImage = `url(${toggle.iconsource})`;
					icon.style.backgroundSize = "cover";
					icon.style.filter = "invert(1)"; //for white icon
					if (toggle.greyed) {
						icon.style.filter = "invert(0.4)"; //for white icon
					}
					icon.style.right = `${5}px`;
				}
				
				if (toggle.tooltip) icon.setAttribute("data-tooltip", toggle.tooltip);
				
				icon.classList.add("specialAction");
				icon.onclick = toggle.onclick;
				icon.style.position = "absolute";
				icon.style.top = `${topoffset}px`;
				icon.style.height = `${iconsize}px`;
				icon.style.width = `${iconsize}px`;
				icon.style.visibility = "hidden";
				
				this.element.appendChild(icon);
				
				topoffset = topoffset + iconsize;
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
		
		get quantity() {
			if (this.item?.system.resolvePointCost) {
				return game.user.character?.system ? game.user.character.system.attributes.rp.value : 0
			}
			
			return null;
		}

		get hasTooltip() {
			return true;
		}

		get colorScheme() {
			return this.parent.colorScheme;
		}
		
		get actionType() {
			return this.parent.actionType;
		}
		
		get enabled() {
			if (this.item.getFlag(ModuleName, "enabled")) {
				if (!this.item.getFlag(ModuleName, "enabled")({actor : this.actor})) {
					return false;
				}
			}	
			
			return true;
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
					used = await onclick({actor : this.actor});
				}
				else {
					used = true;
				}
				
				if (used) {
					console.log("an action should be used here");
					useAction(this.actionType);
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
  
    class PF2EButtonPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
		constructor({parent, type, color, item}) {
			super();
			this.type = type;
			this._parent = parent;
			
			this.replacementItem = item;
		}

		get colorScheme() {
			return this.parent.colorScheme;
		}

		get label() {
			if (this.replacementItem) {
				return this.replacementItem.name;
			}
			
			switch (this.type) {
				case "feat": return game.i18n.localize("TYPES.Item.feat").split("/")[1];
				case "toggle": return game.i18n.localize("PF2E.TogglesLabel");
				default : return game.i18n.localize("TYPES.Item." + this.type);
			}
			
			return game.i18n.localize("TYPES.Item." + this.type);
		}
		
		get hasTooltip() {
			return this.replacementItem;
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
			}
		}
		
		get actionType() {
			return this.parent.actionType;
		}
		
		get validitems() {
			switch (this.type) {
				case "toggle":
					return this.actor.rules.filter(rule => rule.toggleable).map(rule => itemfromRule(rule));
					break;
				case "feat":
					return this.actor.items.filter(item => (item.type == this.type || item.type == "action") && item.system.actionType?.value == this.actionType).filter(item => !isClassFeature(item));
					break;
				default:
					let items = this.actor.items.filter(item => item.type == this.type);
					
					items = items.filter(item => actioninfo(item).actionType.value == this.actionType);
					
					return items;
					break;
			}
		}
		
		get isvalid() {
			return this.validitems.length;
		}
		
		sortedSpells() {//this is a mess, look away
			let entries = this.actor.items.filter(entry => entry.type == "spellcastingEntry");
			
			let prepared = entries.filter(entry => entry.system.prepared.value == "prepared");
			let spontaneous = entries.filter(entry => entry.system.prepared.value == "spontaneous");
			let innate = entries.filter(entry => entry.system.prepared.value == "innate");
			let focus = entries.filter(entry => entry.system.prepared.value == "focus");	

			let usecounts = {};

			let spellCategories = [];
			
			let addcantrips = [];
			
			let isvalidspell = (spell, level) => {
				
				if (actioninfo(spell).actionType.value != this.actionType) {
					return false;
				}
				
				if (level == 0) {
					return spell.isCantrip;
				}
				else {
					if (level == undefined) {
						return !spell.isCantrip
					}
					else {
						if (!spell.system.level || (spell.system.level.value == undefined)) return true;
						
						return !spell.isCantrip && spell.system.level.value == level;
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
					buttons = buttons.concat(group.spells.filter(spell => isvalidspell(spell)).map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, group, spell.system.level?.value)})));
					
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
						
						return {
							max: max, 
							value: value
						}
					}
				}
				
				let spellbuttons = [];
				
				if (i == 0) {
					spellbuttons = spellbuttons.concat(addcantrips.map(spell => new PF2EItemButton({item : spell.spell, clickAction : spelluseAction(spell.spell, spell.group, i)})));
				}
				
				let addsignaturebuttons = signaturespells.map(spell => new PF2EItemButton({item : spell.spell, clickAction : spelluseAction(spell.spell, spell.group, i)}));
				for (let group of spontaneous) {
					let spells = group.spells.filter(spell => isvalidspell(spell, i));
					
					spellbuttons = spellbuttons.concat(spells.map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, group, i)})));
					
					signaturespells = signaturespells.concat(spells.filter(spell => spell.system.location.signature).map((spell) => {return {spell, group, level : i}}));
				}
				
				for (let group of innate) {
					spellbuttons = spellbuttons.concat(group.spells.filter(spell => isvalidspell(spell, i)).map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, group, i)})));	
				}
				
				for (let group of prepared) {
					let ids = Object.values(group.system.slots["slot"+i].prepared).map(slot => slot.id);
					
					if (i > 0) {
						let usecountbuffer = {};
						
						ids.forEach((id) => {usecountbuffer[id] = () => {return Object.values(group.system.slots["slot"+i].prepared).filter(prep => prep.id == id && !prep.expended).length}});
						
						addusecounts(usecountbuffer);
					}
					
					spellbuttons = spellbuttons.concat(group.spells.filter(spell => ids.includes(spell.id)).filter(spell => isvalidspell(spell, i == 0 ? 0  : undefined)).map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, group, i)})));
				}
				
				if (spellbuttons.length) {
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
    }
	
	class PF2EAccordionPanel extends ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel {
		async toggleDefaults() {
			this._subPanels[0]?.toggle(true);
			this._subPanels[1]?.toggle(true);
		}
		
		get actionType() {
			return this.parent?.actionType;
		}
	}
	
	class PF2EAccordionPanelCategory extends ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory {
		constructor({label, uses = {}, buttons, level, usecounts}) {
			super({label, uses, buttons});
			
			this._level = level;
			
			this._usecounts = usecounts;
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
			if (value > 0) {
				const prevUsed = this._movementUsed;
				
				this._movementUsed = value;
				
				let max = this.movementMax;
				
				if (max > 0) {
					let usedactions = Math.ceil((this._movementUsed-this._prevUsepoint)/max) - Math.ceil((prevUsed-this._prevUsepoint)/max);
					
					this.useActions(usedactions);
					
					if (this._movementUsed-this._prevUsepoint >= max) {
						this.resettempspeed();
						
						this._prevUsepoint = this._movementUsed - ((this._movementUsed - this._prevUsepoint)%max);
					}
					
					this.updateMovement();
				}
				else {//movement was invalid
					this._movementUsed = prevUsed;
				}
			}
		}
		
		_onNewRound(combat) {
			console.log(combat);
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
				return typeinfo.value;
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
					
					console.log("an action should be used here");
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
					onClick: (event) => this.actor.update({system : {resources : {focus : {value : Math.min(this.actor.system.resources.focus.value + 1, this.actor.system.resources.focus.max)}}}}),
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
		async getDefaultSets() {
			const sets = await super.getDefaultSets();
			
			let onlyactions = true;
			
			if (this.actor.type !== "npc") return sets;
			const actions = this.actor.items.filter((item) => item.type === "melee").map((action) => {
				let item = this.actor.items.find(item => item.type != "melee" && item.name == action.name);
				
				if (item) {
					return item;
					onlyactions = false;
				}
				else {
					return action;
				}
			});
			
			if(onlyactions) {
				return {
					1: {
						primary: actions[0]?.uuid ?? null,
						secondary: actions[1]?.uuid ?? null,
					},
					2: {
						primary: actions[2]?.uuid ?? null,
						secondary: actions[3]?.uuid ?? null,
					},
					3: {
						primary: actions[4]?.uuid ?? null,
						secondary: actions[5]?.uuid ?? null,
					},
				}
			} 
			else {
				return {
					1: {
						primary: actions[0]?.uuid ?? null,
						secondary: null,
					},
					2: {
						primary: actions[1]?.uuid ?? null,
						secondary: null,
					},
					3: {
						primary: actions[2]?.uuid ?? null,
						secondary: null,
					},
				}
			}
		}

		async _onSetChange({ sets, active }) {
			const updates = [];
			const activeSet = sets[active];
			const activeItems = Object.values(activeSet).filter((item) => item);
			const inactiveSets = Object.values(sets).filter((set) => set !== activeSet);
			const inactiveItems = inactiveSets.flatMap((set) => Object.values(set)).filter((item) => item).filter((item) => !activeItems.includes(item));
			
			inactiveItems.forEach((item) => {
				updates.push({ _id: item.id, system : {equipped : {carryType : "worn"}} });
			});
			
			let handsHeld = 1;
			if (activeItems[0] == activeItems[1]) {
				handsHeld = 2;
			}
			activeItems.forEach((item) => {
				updates.push({ _id: item.id, system : {equipped : {carryType : "held", handsHeld : handsHeld}} });
			});
			
			return await this.actor.updateEmbeddedDocuments("Item", updates);
		}
    }
  
    CoreHUD.definePortraitPanel(PF2EPortraitPanel);
    CoreHUD.defineDrawerPanel(PF2EDrawerPanel);
    CoreHUD.defineMainPanels([
		PF2EActionPanel,
		PF2EReActionPanel,
		PF2EFreeActionPanel,
		ARGON.PREFAB.PassTurnPanel
    ]);  
	CoreHUD.defineMovementHud(PF2EMovementHud);
	CoreHUD.defineButtonHud(PF2EButtonHud);
    CoreHUD.defineWeaponSets(PF2EWeaponSets);
	CoreHUD.defineSupportedActorTypes(["character", "familiar", "npc"]);
});
