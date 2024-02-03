import {registerPF2EECHSItems, PF2EECHActionItems, PF2EECHFreeActionItems, PF2EECHReActionItems, itemfromRule} from "./specialItems.js";
import {ModuleName, getTooltipDetails, damageIcon, firstUpper, activationCost, actionGlyphs, hasAoO, hasSB, MAPtext} from "./utils.js";

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

Hooks.on("argonInit", async (CoreHUD) => {
    const ARGON = CoreHUD.ARGON;
  
	await registerPF2EECHSItems();
	
	//ammend Hooks
	Hooks.on("updateItem", (item) => {
		if (item.type == "spellcastingEntry") {
			for (const itemButton of ui.ARGON.itemButtons) {
				if (item.spells?.get(itemButton.item?.id)) {
					itemButton.render();
				}
			}
		}
		if (item.rules?.length) {
			for (const itemButton of ui.ARGON.itemButtons) {
				if (itemButton.item?.system?.item?.id == item.id) {
					itemButton.render();
				}
			}
		}
	});
	
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
	
	function armsof(actor) {
		let attributes = actor?.system.attributes;
		
		switch(actor?.type) {
			case "character":
			case "npc":
			case "npc2":
				return attributes?.arms
				break;
			case "drone":
				let arms = 0;
				
				if (attributes?.arms) {
					arms = arms + attributes.arms;
				}
				
				if (attributes?.weaponMounts?.melee) {
					arms = arms + attributes.weaponMounts.melee.max;
				}
				
				if (attributes?.weaponMounts?.ranged) {
					arms = arms + attributes.weaponMounts.ranged.max;
				}
				
				return arms;
				break;
			case "starship":
				return 1;
		}
	}
	
	//for ammunition updates
	function onUpdateItemadditional(item) {
		if (item.parent !== ui.ARGON._actor) return;
		for (const itemButton of ui.ARGON.itemButtons) {
			if (itemButton.item?.system?.container?.contents[0]?.id == item.id) itemButton.render();
		}
	}
	Hooks.on("updateItem", onUpdateItemadditional.bind(CoreHUD));
  
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
			}
		}

		get isDead() {
			return this.isDying && this.actor.type !== "character";
		}

		get isDying() {
			return this.actor.system.attributes.hp.value <= 0;
		}
		
		async _onDeathSave(event) {
			this.actor.rollRecovery();
		}

		async getStatBlocks() {
			const HPText = game.i18n.localize("PF2E.HitPointsShortLabel");
			
			const ACText = game.i18n.localize("PF2E.ArmorClassShortLabel");
			
			const ClassDC = game.i18n.localize("PF2E.Check.DC.Unspecific");

			const hpColor = this.actor.system.attributes.hp.temp ? "#6698f3" : "rgb(0 255 170)";
			const tempMax = this.actor.system.attributes.hp.tempmax;
			const hpMaxColor = tempMax ? (tempMax > 0 ? "rgb(222 91 255)" : "#ffb000") : "rgb(255 255 255)";

			return [
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
					},
				],
				[
					{
						text: ClassDC,
					},
					{
						text: this.actor.system.attributes.classDC?.dc,
						color: "var(--ech-movement-baseMovement-background)",
					},
				],
			];
		}
	}
	
	class PF2EDrawerPanel extends ARGON.DRAWER.DrawerPanel {
		constructor(...args) {
			super(...args);
		}

		get categories() {
			let returncategories = [];
			
			const saves = this.actor.saves;
			const skills = this.actor.skills;
			
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
			this._currentActions = this.maxActions;
			this.updateActionUse();
		}
		
		async _getButtons() {
			let buttons = [];
			let specialActions = Object.values(PF2EECHActionItems);
			
			buttons.push(new PF2EItemButton({ parent : this, item: null, isWeaponSet : true, isPrimary: true}));
			buttons.push(new PF2EItemButton({ parent : this, item: null, isWeaponSet : true, isPrimary: false}));
			
			buttons.push(new PF2ESplitButton(new PF2EButtonPanelButton({parent : this, type: "toggle"}), new PF2ESpecialActionButton(specialActions[1])));
			
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "feature"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "consumable"}));
			
			buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[2]), new PF2ESpecialActionButton(specialActions[3])));
			buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[4]), new PF2ESpecialActionButton(specialActions[5])));
			
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
			return "freeaction";
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
			let specialActions = Object.values(PF2EFreeActionPanel);
			
			//buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[0]), new PF2ESpecialActionButton(specialActions[1])));
			
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "feature"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "consumable"}));
			 
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
			return 2;
		}
		
		async _getButtons() {
			let buttons = [];
			let specialActions = Object.values(PF2EECHReActionItems);
			
			buttons.push(new PF2EItemButton({ parent : this, item: null, isWeaponSet : true, isPrimary: true}));
			buttons.push(new PF2EItemButton({ parent : this, item: null, isWeaponSet : true, isPrimary: false}));
			
			buttons.push(new PF2ESplitButton(new PF2ESpecialActionButton(specialActions[0]), new PF2ESpecialActionButton(specialActions[1])));
			
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "feature"}));
			buttons.push(new PF2EButtonPanelButton({parent : this, type: "consumable"}));
			
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
			
			return true;
		}

		get targets() {
			return null;
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
		
		get visible() {
			if (this._isWeaponSet && this.actionType != "action") {
				if (this.item) {
					if (this.item.type == "shield") {
						return hasSB(this.actor);
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
				case "equipment":
					if (this.item.system?.container?.contents[0]?.id) {
						const ammunition = this.actor.items.get(this.item.system.container.contents[0].id);
						
						if (ammunition) {
							if (ammunition.system.capacity?.max) {
								return ammunition.system.capacity?.value;
							}
							else {
								return ammunition.system.quantity;
							}
						}
					}
					
					if (this.item?.system.uses?.max && this.item?.system.uses?.max > 0) {
						return this.item.system.capacity.value;
					}
					
					return null;
					break;
				
				case "spell":
					let uses = 0;
					let hasuses = false;
					
					if (this.parent.usecounts?.hasOwnProperty(this.item?.id)) {
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
					return this.item?.system?.quantity;
					break;
			}
		}
		
		async getTooltipData() {
			const tooltipData = {};//await getTooltipDetails(this.item);
			return tooltipData;
		}

		async _onLeftClick(event, options = {MAP : 0}) {
			if (!(event.target.id != "specialAction" || options.specialAction)) return;

			var used = false;
			
			if (this._clickAction) {
				used = this._clickAction();
			}
			
			if (this.item) {
				if (this.item.flags.hasOwnProperty(ModuleName) && this.item.flags[ModuleName].onclick) {
					this.item.flags[ModuleName].onclick();
				}
				else {
					let action = this.actor.system.actions.find(action => action.slug == this.item.system.slug);
					
					if (action) {
						let variant = action.variants[options.MAP];
						
						if (!variant) {
							variant = action.variants[0];
						}
						
						if (await variant?.roll()) {
							used = true;
						}
					}
					else {
						this.item.toChat();
						used = true;
					}
				}
			}
			
			if (used) {
				useAction(this.actionType);
			}
		}
		
		async _onRightClick(event) {
			this.item?.sheet?.render(true);
		}
		
		async _onTooltipMouseEnter(event) {
			await super._onTooltipMouseEnter(event);
			if (this.element.querySelector("#specialAction")) {
				this.element.querySelector("#maintitle").style.visibility = "hidden";
				for (const specialelement of this.element.querySelectorAll("#specialAction")) {
					specialelement.style.visibility = "";
				}
			}
		}

		async _onTooltipMouseLeave(event) {
			await super._onTooltipMouseLeave(event);
			
			if (this.element.querySelector("#specialAction")) {
				this.element.querySelector("#maintitle").style.visibility = "";
				for (const specialelement of this.element.querySelectorAll("#specialAction")) {
					specialelement.style.visibility = "hidden";
				}
			}
		}
		
		async _renderInner() {
			if (!this.visible) {//fix for potential bug
				this.element.style.display = "none";
				return;
			}
			await super._renderInner();
			
			if (this.item?.flags && this.item.flags[ModuleName]) {
				if (this.item.flags[ModuleName].toggleable && this.item.flags[ModuleName].active && !this.item.flags[ModuleName].active()) {
					this.element.style.filter = "grayscale(1)";
				}
				else {
					this.element.style.filter = "";
				}
			}
			
			const MAPActions = [{MAP : 1}, {MAP : 2}];
			if (this.item.type == "weapon") {
				this.element.querySelector("span").id = "maintitle";
				
				for (let i = 0; i < MAPActions.length; i++) {
					let Action = MAPActions[i];
					let ActionTitle = document.createElement("span");
					ActionTitle.id = "specialAction";
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
				ammoSelect.id = "specialAction";
				
				for (let ammo of [{name : "", id : ""},...this.actor.items.filter(item => item.isAmmo)]) {
					let option = document.createElement("option");
					option.text = ammo.name;
					option.value = ammo.id;

					option.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
					option.style.width = "200px";
					option.style.height = "20px";
					option.style.backgroundColor = "grey";
					option.selected = this.item.system.selectedAmmoId == ammo.id;
					
					ammoSelect.appendChild(option);
				}
				
				ammoSelect.style.position = "absolute";
				ammoSelect.style.top = "0";
				ammoSelect.style.left = "0";
				ammoSelect.style.width = `${100/2}%`;
				ammoSelect.style.height = `${100/8}%`;
				ammoSelect.style.color = "#c8c8c8";
				ammoSelect.style.backdropFilter = "var(--ech-blur-amount)";
				ammoSelect.style.backgroundColor = "rgba(0,0,0,.3)";
				ammoSelect.style.textShadow = "0 0 10px rgba(0,0,0,.9)";
				ammoSelect.style.borderColor = "inherit";
				
				ammoSelect.onchange = () => {this.item.update({system : {selectedAmmoId : ammoSelect.value}})};
				
				this.element.appendChild(ammoSelect);
			}
			
			if (this.item) {
				let toggles = [];
				
				let toggleoptions = ["versatile", "modular"];
				
				for (let togglekey of toggleoptions) {
					if (this.item.system.traits.toggles) {
						let toggle = this.item.system.traits.toggles[togglekey];
						
						if (toggle.options.length) {
							let options = [null, ...toggle.options];
							
							let current = toggle.selection;
							let currentid = options.indexOf(current);
							let next = options[(currentid + 1)%options.length];
							
							console.log(next);
							
							if (current == null) {
								current = this.item.system.damage.damageType;
							}
							
							let toggleData = {
								iconclass : damageIcon(current),
								onclick : () => {this.item.update({system : {traits : {toggles : {[togglekey] : {selection : next}}}}})}
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
						onclick : () => {this.item.setFlag(ModuleName, "thrown", !isthrown)}
					};	

					toggles.push(toggleData);
				}
				
				const iconsize = 30;
				let topoffset = 1;
				
				for (let toggle of toggles) {
					let icon;
					if (toggle.iconclass) {
						icon = document.createElement("i");
						icon.classList.add("icon", ...toggle.iconclass);
						icon.style.fontSize = `${iconsize*0.75}px`;
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
					
					icon.id = "specialAction";
					icon.onclick = toggle.onclick;
					icon.style.position = "absolute";
					icon.style.top = `${topoffset}px`;
					icon.style.right = `${1}px`;
					icon.style.height = `${iconsize}px`;
					icon.style.width = `${iconsize}px`;
					icon.style.visibility = "hidden";
					
					this.element.appendChild(icon);
					
					topoffset = topoffset + iconsize;
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
			return this.item?.name;
		}

		get icon() {
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
			var used = false;
			
			const item = this.item;
			
			if (item?.flags[ModuleName]?.onclick) {
				used = item?.flags[ModuleName]?.onclick(item);
			}
			else {
				used = true;
			}
			
			if (used) {
				useAction(this.actionType);
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
				default:
					let items = this.actor.items.filter(item => item.type == this.type);
					
					items = items.filter(item => activationCost(item).find(glyph => actionGlyphs(this.actionType).includes(glyph)));
					
					return items;
					break;
			}
		}
		
		get isvalid() {
			return this.validitems.length;
		}
		
		sortedSpells() {
			let entries = this.actor.items.filter(entry => entry.type == "spellcastingEntry");
			
			let prepared = entries.filter(entry => entry.system.prepared.value == "prepared");
			let spontaneous = entries.filter(entry => entry.system.prepared.value == "spontaneous");
			let innate = entries.filter(entry => entry.system.prepared.value == "innate");
			let focus = entries.filter(entry => entry.system.prepared.value == "focus");	

			let usecounts = {};

			let spellCategories = [];
			
			let addcantrips = [];
			
			let isvalidspell = (spell, level) => {
				if (!activationCost(spell).find(glyph => actionGlyphs(this.actionType).includes(glyph))) {
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
						return !spell.isCantrip && spell.system.level.value == level;
					}
				}
			}
			
			function addusecounts(usecountbuffer) {
				for (let key of Object.keys(usecountbuffer)) {
					
					usecounts[key] = () => {return (usecounts[key] ? usecounts[key]() : 0) + usecountbuffer[key]()};
				}
			}
			
			function spelluseAction(spell, spellGroup, level) {
				return () => {
					if (spell && spellGroup) {
						spellGroup.cast(spell, {consume : true, rank : level});
						
						return true;
					}
					
					return false;
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
					
					spellbuttons = spellbuttons.concat(group.spells.filter(spell => ids.includes(spell.id)).map(spell => new PF2EItemButton({item : spell, clickAction : spelluseAction(spell, group, i)})));
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
					return new PF2EAccordionPanel({accordionPanelCategories: this.sortedSpells().map(data => new PF2EAccordionPanelCategory(data)) });
					break;
				/*
				case "maneuver":
					return new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({buttons: this.validitems.map(item => new PF2ESpecialActionButton(item))});
					break;
				*/
				case "toggle":
					return new PF2EButtonPanel({buttons: this.validitems.map(item => new PF2EItemButton({item}))});
					break;
				default:
					return new PF2EButtonPanel({buttons: this.validitems.map(item => new PF2EItemButton({item}))});
					break;
			}
		}
    }
	
	class PF2EAccordionPanel extends ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel {
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
			
			this.prevUsedMovement = 0;
		}

		get visible() {
			return game.combat?.started;
		}

		get movementMax() {
			return 0;
			switch (this.actor.type) {
				case "starship":
					return this.actor.system.attributes.speed.value;
					break;
				default:
					return this.actor.system.attributes.speed[this.movementtype].value / canvas.scene.dimensions.distance;
					break;
			}
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
		
		set movementUsed(value) {
			super._movementUsed = value;
			
			if (Math.ceil(value/this.movementMax) - Math.ceil(this.prevUsedMovement/this.movementMax) > 0) {
				useAction("move");
			};
			
			this.prevUsedMovement = value;
		}
		
		_onNewRound(combat) {
			super._onNewRound(combat);
			
			this.prevUsedMovement = 0;
	    }
		
		async _renderInner() {
			await super._renderInner();
			
			const movementselect = document.createElement("select");
			movementselect.id = "movementselect";
			movementselect.style.width = "100%";
			movementselect.style.color = "white";
			
			for (const movementtype of Object.keys(this.actor.system.attributes.speed).filter(key => this.actor.system.attributes.speed[key]?.value)) {
				const typeoption = document.createElement("option");
				typeoption.value = movementtype;
				typeoption.innerHTML = CONFIG.SFRPG.speeds[movementtype];
				typeoption.checked = (movementtype == "land");
				typeoption.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
				typeoption.style.width = "200px";
				typeoption.style.height = "20px";
				typeoption.style.backgroundColor = "grey";
				
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
			return [
				{
					label: "SFRPG.Rest.Long.Title",
					onClick: (event) => this.actor.longRest(),
					icon: "fas fa-bed",
				},
				{
					label: "SFRPG.Rest.Short.Title",
					onClick: (event) => this.actor.shortRest(),
					icon: "fas fa-coffee",
				}
			]
		}
	}
	
	class PF2EWeaponSets extends ARGON.WeaponSets {
		async getDefaultSets() {
			const sets = await super.getDefaultSets();
			const actions = this.actor.items.filter((item) => item.type === "weapon" && item.system.activation?.type === "action");
			const bonus = this.actor.items.filter((item) => item.type === "weapon" && item.system.activation?.type === "bonus");
			return {
				1: {
					primary: actions[0]?.uuid ?? null,
					secondary: bonus[0]?.uuid ?? null,
				},
				2: {
					primary: actions[1]?.uuid ?? null,
					secondary: bonus[1]?.uuid ?? null,
				},
				3: {
					primary: actions[2]?.uuid ?? null,
					secondary: bonus[2]?.uuid ?? null,
				},
			};
		}

		async _getSets() {
			const isTransformed = this.actor.flags?.dnd5e?.isPolymorphed;

			const sets = isTransformed ? await this.getDefaultSets() : mergeObject(await this.getDefaultSets(), deepClone(this.actor.getFlag("enhancedcombathud", "weaponSets") || {}));
		
			for (const [set, slots] of Object.entries(sets)) {
			  slots.primary = slots.primary ? await fromUuid(slots.primary) : null;
			  slots.secondary = slots.secondary ? await fromUuid(slots.secondary) : null;
			}
			return sets;
		}

		async _onSetChange({ sets, active }) {
			const updates = [];
			const activeSet = sets[active];
			const activeItems = Object.values(activeSet).filter((item) => item);
			const inactiveSets = Object.values(sets).filter((set) => set !== activeSet);
			const inactiveItems = inactiveSets.flatMap((set) => Object.values(set)).filter((item) => item).filter((item) => !activeItems.includes(item));
			inactiveItems.forEach((item) => {
				if (item.system?.equipped) updates.push({ _id: item.id, "system.equipped": false });
			});
			activeItems.forEach((item) => {
				if (!item.system?.equipped) updates.push({ _id: item.id, "system.equipped": true });
			});
			return await this.actor.updateEmbeddedDocuments("Item", updates);
		}
    }
  
    /*
    class PF2EEquipmentButton extends ARGON.MAIN.BUTTONS.EquipmentButton {
		constructor(...args) {
			super(...args);
		}
    }
	*/
  
    CoreHUD.definePortraitPanel(PF2EPortraitPanel);
    CoreHUD.defineDrawerPanel(PF2EDrawerPanel);
    CoreHUD.defineMainPanels([
		PF2EActionPanel,
		PF2EFreeActionPanel,
		PF2EReActionPanel,
		ARGON.PREFAB.PassTurnPanel
    ]);  
	CoreHUD.defineMovementHud(PF2EMovementHud);
	CoreHUD.defineButtonHud(PF2EButtonHud);
    CoreHUD.defineWeaponSets(PF2EWeaponSets);
	CoreHUD.defineSupportedActorTypes(["character", "drone", "npc", "npc2", "starship" /*, "starship", "vehicle" */]);
});
