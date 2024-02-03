# Argon-Starfinder
An implementation of the [Argon - Combat HUD](https://foundryvtt.com/packages/enhancedcombathud) (by [TheRipper93](https://theripper93.com/) and [Mouse0270](https://github.com/mouse0270)) for the [Starfinder](https://foundryvtt.com/packages/sfrpg) system. The Argon Combat HUD (CORE) module is required for this module to work.

![image](https://github.com/Saibot393/enhancedcombathud-sfrpg/assets/137942782/07336b27-b42c-43eb-a961-a98e4277e1e8)
![image](https://github.com/Saibot393/enhancedcombathud-sfrpg/assets/137942782/0acea995-f42f-4097-8473-d802ff3ade64)
<sup>All icon included in this project are from [Game-icons.net](game-icons.net), used under the [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) license</sup>

### The documentation for the core argon features can be found [here](https://api.theripper93.com/modulewiki/enhancedcombathud/free)

This module adjust various Argon features for the Starfinder system:
- **Portrait**
    - The HP and SP will be displayed as bars, temporary HP will be displayed as a bar over the HP
    - Both kinetic AC and energy AC will be displayer
- **Action tracking** The module can manage Standard actions, Move actions, Swift actions, Full actions, Reactions and their cross use
- **Skills and Attributes**
    - Beside Attributes and Skill, Saves will shown
    - The Key ability score of the characters class will be marked with a star
- **Weapon Sets**
    - Auto manages the behaviour of two-handed weaposn
    - Allows for Technological, Magical and Hybrid items to be placed in the slots
- **Tooltips** will display used weapon properties, ranges, damage, level, saves, areas... where applicable

### Client Customization
- **Show action groups** swift and full actions can be hidden to adjust HUD size
- **Status Bar** The size of the Status Bar can be adjusted
- **Custom spell slot consume** If spell slot consume should be managed by Argon - Starfinder (if consumed via the HUD) to circumvent a [system bug](https://github.com/foundryvtt-starfinder/foundryvtt-starfinder/issues/1267)

### Limitations

The module only includes the english version of the action description included in the system. Should you wish to customize the description of these actions, you can create an item with the name _argonUI_#ActionID where #ActionID is replaced by the actions id:
- "Combat Maneuver":`CombatManeuver`,
- "Bull Rush":`BullRush`
- "Dirty Trick":`DirtyTrick`
- "Disarm":`Disarm`
- "Grapple":`Grapple`
- "Reposition":`Reposition`
- "Sunder":`Sunder`
- "Trip":`Trip`
- "Covering Fire":`CoveringFire`
- "Feint":`Feint`
- "Fight Defensively":`BreakFree`
- "Harrying Fire":`HarryingFire`
- "Total Defense":`TotalDefense`
- "Draw/Sheathe":`DrawSheathe`
- "Guarded Step":`GuardedStep`
- "Reload":`Reload`
- "Stand Up":`StandUp`
- "Charge":`Charge`
- "Coup de Grace":`CoupdeGrace`
- "Fight Defensively":`FightDefensively`
- "Withdraw":`Withdraw`

#### Languages:

The module contains an English and a German translation. If you want additional languages to be supported [let me know](https://github.com/Saibot393/enhancedcombathud-sfrpg/issues).

**If you have suggestions, questions, or requests for additional features please [let me know](https://github.com/Saibot393/enhancedcombathud-sfrpg/issues).**
