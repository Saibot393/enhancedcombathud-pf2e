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
		let actionrule = actor.rules.find(rule => rule.option == "action-cost" && rule.domain == "elemental-blast");
		
		let proxyFake = {};
		
		proxyFake.name = game.i18n.localize(config.label);
		
		proxyFake.img = config.img;
		
		proxyFake.type = "weapon";
		
		proxyFake.actor = actor;
		proxyFake.system = {};
		proxyFake.flags = {[ModuleName] : {}};
		
		proxyFake.system.description = {value : config.item.system.description.value};
		
		proxyFake.system.actionType = {value : "action"};
		if (actionrule) {
			proxyFake.system.actions = {value : actionrule.suboptions.find(option => option.selected)?.value};
		}
		
		proxyFake.system.traits = {};
		proxyFake.system.traits.__defineGetter__("value", () => {return config.item.system.traits.value.concat([proxyFake.system.damage.damageType, element])});
		
		proxyFake.system.range = config.range.max;
		
		proxyFake.system.__defineGetter__("attackValue", () => {return proxyFake.flags[ModuleName].ranged ? config.maps.ranged.map0 : config.maps.melee.map0});
		
		proxyFake.system.damage = {};
		proxyFake.system.damage.__defineGetter__("damageType", () => {return config.damageTypes[proxyFake.flags[ModuleName].damageType].value});
		proxyFake.system.damage.die = "d" + config.dieFaces;
		proxyFake.system.damage.dice = Math.floor((actor.level-1)/4) + 1;
		
		proxyFake.flags[ModuleName].onclick = (options) => {
			//game.pf2e.rollActionMacro({ actorUUID: actor.uuid, type: "blast", elementTrait: element});
			blast.attack({ mapIncreases: options.MAP, element : element, damageType : proxyFake.system.damage.damageType, melee : !proxyFake.flags[ModuleName].ranged})
			
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
		}
		
		proxyFake.sheet = {render : (value) => {config.item.sheet.render(value)}}
		
		proxyFake.__defineGetter__("isElementalBlast", () => {return true}); 
		proxyFake.__defineGetter__("isProxyFake", () => {return true}); 
		return proxyFake;
	}
	
	return null;
}

export {elementalBlastProxy};