## v1.11.15
- Fixed bug with ammo select
- Unequipped weapons in the weapon set buttons are now greyscaled
- Added draw/sheathe button to weapon set buttons

## v1.11.14
- Small bug fix

## v1.11.13
- Fixed bug that prevented the rank letters for not lore skills to show up
- Fixed bug that prevented spell buttons from updating when used

## v1.11.12
- Bug fix for create a diversion action

## v1.11.11
- Bug fix for elemental blasts

## v1.11.10
- Added missing action "Treat wounds" to skill actions

## v1.11.9
- Small bug fix for rule toggles

## v1.11.8
- Fixed bug regarding cantrips added via patchmuncher

## v1.11.7
- Update for compatibility with pf2e-dailies v3.0.0

## v1.11.6
- Addendum for previous fix

## v1.11.5
- Small bug fix regarding stamina points

## v1.11.4
- Fixed bug that prevented proficient NPC skill to be displayed in the skill drawer

## v1.11.3
- Small bug fix for elemental blasts

## v1.11.2
- Update for Polish translation (thanks to [Lioheart](https://github.com/Lioheart))

## v1.11.1
- Fixed bug that could prevent the HUD from opening when using the new favourite system
- Fixed display bug that could cause attack values to be displayed with an additional "+"

## v1.11.0
- Added setting Favourite system, which allows certain items (consumables, feats...) to be favored, causing them to be displayed directly on the action panel (also allows for removal of class features)
- Movement left will now be lost when an action is used
- Added setting "Allow movement split" to allow for players to split their movement between actions
- Changed setting "Show NPC passives" so that passives can now be displayed directly in the action panel instead of the toggle panel
- Added setting "Save, skill, lore scale" to scale the size of the Save, skill, lore panel
- Added shield to default weapon sets of NPCs

## v1.10.3
- Small improvement to weapon sets

## v1.10.2
- Improved attack and damage tooltips

## v1.10.1
- Update for Polish translation (thanks to [Lioheart](https://github.com/Lioheart))

## v1.10.0
- Added setting to display connected passives in action item buttons
- Added setting to show passive feats in HUD
- Added support for the optional stamina rule
- Added sort option for the infused trait
- Added MAP to tooltips
- Improved MAP update
- Improved item trait recognition
- Improved MAP recognition

## v1.9.7
- Small bug fix for two handed weapon sets

## v1.9.6
- Improved class ability recognition

## v1.9.5
- Added support for "Reactive Shield" (thanks to [JamzTheMan](https://github.com/JamzTheMan))

## v1.9.4
- Fixed bug that caused the remaining actions to not update correctly

## v1.9.3
- Fixed bug that caused a "none" action to show up in the action panel

## v1.9.2
- Fixed spelling mistake

## v1.9.1
- Update for Polish translation (thanks to [Lioheart](https://github.com/Lioheart))

## v1.9.0
- Added setting to choose the action pip display (either CORE (as is now) or PF2e action style)
- Added sort option to item panels 
- Added button to toggle a skills action section
- Added option to use swap ammo macro instead of the ammo select
- Added option to show consumables weapons in the consumable panel
- Improved item trait localization
- Fixed the z-level of the hp segment in the portrait
- Attack of opportunity actions will now correctly consume actions

## v1.8.5
- Changed the way actions are loaded to improve compatibility with translation modules (and make it possible to change them on the fly in the future)

## v1.8.4
- Bug fix for strikes gained via feats in weaponsets

## v1.8.3
- Fixed bug with NPC weapons in item sets

## v1.8.2
- Further bug fix for action use api

## v1.8.1
- Fixed bug that allowed players to see the HUD for dead NPCs
- Fixed bug with action use api
- Update for Polish translation (thanks to [Lioheart](https://github.com/Lioheart))
- Added translation for Brazilian Portuguese (thanks to [zengerbr](https://github.com/zengerbr))

## v1.8.0
- Items(including conditions & effects) can now be dragged into macro buttons to create an appropiate macro
- Added option to show icon indicating the required actions on item buttons
- Added option to show quick buttons for saves in portrait
- Improved weaponsets created by drag & dropping actions
- Improved action tracking
- Improved replacement image search

## v1.7.2
- Update for Polish translation (thanks to [Lioheart](https://github.com/Lioheart))

## v1.7.1
- Improved party and familiar/master buttons
- Improved staff spell casting (thanks to [Codas](https://github.com/Codas))

## v1.7.0
- Added setting to hide actions that can not be performed due to the character not being traine in the connected skill
- Added option to reduce the attack of opportunity buttons
- Added item/spell level to subtitle
- Added menu to change hp/temp hp (open by hovering over the hp display)
- Added filter to only show available npc skills
- Added "pseudo rank color" to npc skills & saves
- Added api to use argon hud actions (`game.modules.get("enhancedcombathud-pf2e").api.useAction(actiontype, actionamount)`)
- Staff tooltips will now close when the staff spell panel is open(ed)
- Update for Polish translation (thanks to [Lioheart](https://github.com/Lioheart))
- Fixed bug that could prevent the pf2e [PF2e Ranged Combat](https://foundryvtt.com/packages/pf2e-ranged-combat) reload/unload options from showing up 
- Fixed bug that could prevent the HUD from opening when selecting familiars

## v1.6.1
- Small improvements and bug fixes

## v1.6.0
- Added macro panel to access the macros stored on the macro bar (which is a new [CORE](https://foundryvtt.com/packages/enhancedcombathud) base feature)
- Improved the macro buttons
- Added icon to indicate signature spells
- Added buttons to select the initiative skill from the save/skill/lore drawer
- Added setting to choose the behaviour of the initiative button
- Added mouse over tooltips for the traits in Argon tooltips
- Added a setting to scale the training rank icon scale
- CTRL+Z now works with the movement tracker (ony the current segment can be reversed)
- Skill actions now use action points
- For spell users, the spell (highest) DC will now be displayed instead of the class DC
- Perform and Administer first aid now request the variant before being rolled
- Update for Polish translation (thanks to [Lioheart](https://github.com/Lioheart))

## v1.5.2
- Added Polish translation (thanks to [Lioheart](https://github.com/Lioheart))

## v1.5.1
- Small bug fix regarding macro lock

## v1.5.0
- Added standard actions to sva/skill/lore drawer (right click a skill to see all options)
- Added macro lock to lock macro and use them for all actors
- Added quick and secret roll to save/skill/lore drawer
- Added setting to choose which tab is opened when the button above the portrait is used to open the character sheet
- Added setting to close all other spell subpanels when a new one is opened
- Added fallback to recognise attacks gained from effects that were removed and regained
- Improved the refocus action
- Improved localisation
- Improved reactive strike recognition

## v1.4.2
- fixed icon path typo

## v1.4.1
- Fixed bug related to action recognition in npcs

## v1.4.0
- Added change grip button to weapon set items that can be held in two hands
- Added optional party button to portrait, linking to a characters party
- Added optional familiar/master button to portrait, linking to a characters familiar/master
- Added autoroll for "Grab an egde" and "Arest a fall"
- Changed training rank icon of skills/saves
- Added filter for valid NPC tags in portrait
- Fixed portrait title section for NPCs

## v1.3.2
- Added flexible spellcasting

## v1.3.1
- small bug fix

## v1.3.0
- Added setting to show macro buttons
- Added setting to show reload and unload as added by [PF2e Ranged Combat](https://foundryvtt.com/packages/pf2e-ranged-combat) to ranged weapons
- Added setting to reverse order of saves,skills,lore
- Added setting to display a a letter indicating the training rank next to saves, skills and lore skills

## v1.2.3
- Fixed bug that prevented spells from being cast

## v1.2.2
- Fixed problem with some prepared seplls not being entered into the right ranks
- Fixed problems with elemental blast (including with feats like Weapon Infusion and Versatile Blast)
- Fixed problem with thrown weapons not working for NPCs

## v1.2.1
- Fixed bug that caused some character abilities to show up as passives

## v1.2.0
- Added seting for the klick behaviour of consumable item buttons (consume, to chat, both)
- Added setting to display the traits of NPCs in the portrait
- Added setting for the amount of item sets displayed
- Added setting to display the passives of NPCs in the hUD
- Added option to display a swap icon for items that can be held, to swap them into the active item set
- Saves, skills and lore skills will now be rolled secretly when clicked while holding down ctrl
- Added option to send the take cover to chat instead of giving the effect
- Improved some localizations
- Fixed issue with spells being cast twice upon click
- Fixed issue with the select box of toggles

## v1.1.3
- Fixed bug that prevented the item title from hiding when map was displayed
- Fixed bug that caused weapon sets to miss indetify natural weapons and similar (requires actions to be redraged into the item set)

## v1.1.2
- Improved aid action automation

## v1.1.1
- small bug fix

## v1.1.0
- Attacks for combination items can now be toggled
- Kineticist elemental blasts can now be dragged into the weapon set
- The quickened condition will now be considered for the action maximum
- The options of toggle elements can now be switched from the item button
- Improved image path recognition of some strikes
- Added options for icon scale and added a scaleable icon background shadow
- Added an initiative roll box on the portrait element
- Fixed problem with thrown attacks, these should now be correctly rolled
- Fixed problem with some strikes not being registered when dragged into the weapon set
- Fixed problem with some elements opening a context menu when right clicked
- Fixed problem with first aid action that caused it to fail on use, a selection can now be made

## v1.0.1
- Actions can now be dropped into weapon sets (except for kineticist blasts)
- Fixed bug with max speed calculation

## v1.0.0
- First release
