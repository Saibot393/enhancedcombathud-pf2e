export async function createItemMacro(item) {
	let Macro;
	
	if (item) {
		Macro = await Macro.create({
			command: itemMacroCode(item),
			name: item.name,
			type: "script",
			img: item.img
		})
	}
	
	return Macro;
}

function itemMacroCode(item) {
	switch (item.type) {
		case "condition": return `
			for (let actor of actors) {
				actor.toggleCondition(${item.slug});
			}
		`
		case "effect": return `
			//based on PF2E effect toggle macro:
			ITEM_UUID = ${item.getFlag("core", "sourceId")};
		
			source = (await fromUuid(ITEM_UUID))?.toObject();
			
			if (!source) {
				return;
			}
			
			for (let actor of actors) {
				const existing = actor.itemTypes.effect.find((item) => item.flags.core?.sourceId === ITEM_UUID);
				
				if (existing) {
					await existing.delete();
				}
				else {
					await actor.createEmbeddedDocuments("Item", [source]);
				}
			}
		`;
		default: return `game.pf2e.rollItemMacro("${item.id}");`;
	}
}