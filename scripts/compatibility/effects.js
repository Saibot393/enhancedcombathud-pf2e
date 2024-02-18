//this will require:
//PF2e Animations Macros
//This code is based on PF2E Animations Macros "Action Counter" macro:

import { ModuleName } from "../utils.js";

const maxActions = 4;

export function updateActionEffect(Actor, Updates = {Actions : undefined, Reaction : undefined}) {
	if (Actor?.isOwner && Sequencer?.EffectManager) {
		let Tokens = canvas.tokens.placeables.filter(Token => Token.actor == Actor);
		
		for (let Token of Tokens) {
			if (Updates.Actions != undefined) {
				for (let i = 1; i <= maxActions; i++) {
					let hasActionEffect = !isEmpty(Sequencer.EffectManager.getEffects({name : [Token.name,ModuleName,"Action",i].join("-"), object : Token.document}));
					
					if (hasActionEffect != (i <= Updates.Actions)) {
						console.log(i);
						console.log(hasActionEffect);
						console.log(Updates.Actions);
						if (i <= Updates.Actions) {
							giveActionEffect(Token, i);
						}
						else {
							Sequencer.EffectManager.endEffects({ name: [Token.name,ModuleName,"Action",i].join("-"), object: Token.document });
						}
					}
				}
			}
		}
	}
}

function giveActionEffect(Token, number) {
	let seq = new Sequence({moduleName: ModuleName, softFail: true})
        .effect()
        .name([Token.name,ModuleName,"Action",number].join("-"))
        .file("modules/pf2e-jb2a-macros/assets/actions/one.png", true)
        .fadeIn(1000)
        .animateProperty("sprite", `position.y`, 
            {
                from: 0.3, 
                to: 0, 
                gridUnits: true, 
                duration: 1000 
            }
        )
        .fadeOut(500)
        .attachTo(Token.document, 
            { 
                align: "top", 
                edge: "outer", 
                offset: { x: [-3/6, -2/6, -1/6, 0, 1/6, 2/6, 3/6].at(number) }, 
                gridUnits: true, 
                followRotation: false 
            }
        )
        .animateProperty("sprite", `position.y`, 
            {
                from: 0, 
                to: -0.3, 
                gridUnits: true,
                duration: 1000, 
                fromEnd: true
            }
        )
        .persist(true)
        .scale(0.15)
        .aboveLighting()
        .opacity(0.8)
        .wait(250);
		
		
	seq.play();
}