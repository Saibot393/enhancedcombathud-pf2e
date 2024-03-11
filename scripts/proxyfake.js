//fake items will be created as a work around for: elementalBlasts
//it may be ugly but it works
//also: if it looks like a duck, swims like a duck and quacks like a duck it might aswell be an item
//never use the proxy fake as a duck or an item though, it will break things
import { ModuleName } from "./utils.js";

async function elementalBlastProxy(actor, elementalID) {
	let blast = new game.pf2e.ElementalBlast(actor);
	let element = elementalID.split(".")[1];
	
	let config = blast.configs.find(config => config.element == element);
	
	if (config) {
		let proxyFake = {};
		
		proxyFake.name = game.i18n.localize(config.label);
		
		proxyFake.img = config.img;
		
		proxyFake.type = "weapon";
		
		proxyFake.actor = actor;
		proxyFake.flags = {[ModuleName] : {}};
		
		proxyFake.__defineGetter__("system", () => {
			let system = {};
			
			let actionrule = actor.rules.find(rule => rule.option == "action-cost" && rule.domain == "elemental-blast");
			
			let localconfig = (new game.pf2e.ElementalBlast(actor)).configs.find(config => config.element == element);
			
			if (localconfig) {
				system.description = {value : localconfig.item.system.description.value};
				
				system.actionType = {value : "action"};
				if (actionrule) {
					system.actions = {value : actionrule.suboptions.find(option => option.selected)?.value};
				}
				
				system.traits = {};
				system.traits.__defineGetter__("value", () => {
					let toggletraits = [];
					let rule;
					
					if (actor.items.find(item => item.system.slug == "effect-weapon-infusion")) {
						if (proxyFake.flags[ModuleName].ranged) {
							rule = proxyFake.actor.rules.find(rule => rule.option == "weapon-infusion:ranged");
						}
						else {
							rule = proxyFake.actor.rules.find(rule => rule.option == "weapon-infusion:melee");
						}
					}
					
					if (rule) {
						toggletraits.push(rule.suboptions.find(option => option.selected).value);
					}
					
					return localconfig.item.system.traits.value.concat([/*proxyFake.system.damage.damageType,*/ element]).concat(toggletraits)}
				);
				
				if (proxyFake.flags[ModuleName].ranged) {
					system.rangelabel = localconfig.range.label;
				}
				else {
					game.i18n.localize("PF2E.Item.Weapon.NoRangeMelee");
				}
				
				system.__defineGetter__("attackValue", () => {return proxyFake.flags[ModuleName].ranged ? localconfig.maps.ranged.map0 : localconfig.maps.melee.map0});
				
				system.damage = {};
				system.damage.__defineGetter__("damageTypes", () => {return localconfig.damageTypes});
				system.damage.__defineGetter__("damageType", () => {return localconfig.damageTypes[proxyFake.flags[ModuleName].damageType].value});
				system.damage.die = "d" + localconfig.dieFaces;
				system.damage.dice = Math.floor((actor.level-1)/4) + 1;
			}
				
			return system;
		});
		
		proxyFake.flags[ModuleName].onclick = (options) => {
			//game.pf2e.rollActionMacro({ actorUUID: actor.uuid, type: "blast", elementTrait: element});
			(new game.pf2e.ElementalBlast(actor)).attack({ mapIncreases: options.MAP, element : element, damageType : proxyFake.system.damage.damageType, melee : !proxyFake.flags[ModuleName].ranged})
			
			return true;
		}
		
		proxyFake.flags[ModuleName].damageType = 0;
		proxyFake.flags[ModuleName].ranged = false;
		
		proxyFake.getFlag = (module, key) => {
			let moduleSpace = proxyFake.flags[module] || {};
			
			return moduleSpace[key];
		}
		
		proxyFake.setFlag = (module, key, value) => {
			if (!proxyFake.flags[module]) {
				proxyFake.flags[module] = {};
			}
			
			proxyFake.flags[module][key] = value;
			
			if (key == "damageType") {
				proxyFake.flags[module][key] = proxyFake.flags[module][key]%proxyFake.system.damage.damageTypes.length;
			}
		}
		
		proxyFake.sheet = {render : (value) => {config.item.sheet.render(value)}}
		
		proxyFake.__defineGetter__("isElementalBlast", () => {return true}); 
		proxyFake.__defineGetter__("isProxyFake", () => {return true}); 
		return proxyFake;
	}
	
	return null;
}

export {elementalBlastProxy};