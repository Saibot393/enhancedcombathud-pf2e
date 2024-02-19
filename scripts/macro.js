export async function createItemMacro(item) {
	let itemMacro;
	
	console.log(item);
	if (item) {
		itemMacro = await Macro.create({
			command: itemMacroCode(item),
			name: item.name,
			type: "script",
			img: item.img
		})
	}
	
	return itemMacro;
}

function itemMacroCode(item) {
	console.log(item.type);
	switch (item.type) {
		case "condition": return `
			for (let actor of actors) {
				actor.toggleCondition(${item.slug});
			}
		`
		case "effect": return `
			//based on PF2E effect toggle macro:
			ITEM_UUID = "${item.getFlag("core", "sourceId")}";
		
			source = (await fromUuid(ITEM_UUID))?.toObject();
			
			if (!source) {
				return;
			}
			
			if (actor) {
				const existing = actor.itemTypes.effect.find((item) => item.flags.core?.sourceId === ITEM_UUID);
				
				if (existing) {
					await existing.delete();
				}
				else {
					await actor.createEmbeddedDocuments("Item", [source]);
				}
			}
		`;
		case "action":
			return `game.pf2e.rollActionMacro({ actorUUID: "${item.actorUUID}",  type: "strike", itemId: "LlYpQtJJJGFb1jri", slug: "staff" })`;
		default: return `game.pf2e.rollItemMacro("${item.id}");`;
	}
}