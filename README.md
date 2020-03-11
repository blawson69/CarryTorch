# CarryTorch

This [Roll20](http://roll20.net/) script is for GMs using the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped) who want to automate the use of Torches from the inventory of a character's sheet. Torches are stored either in the Equipment section, or they can be added to the sheet's Utility section (this is automated in the [GearManager script](https://github.com/blawson69/GearManager)) to take advantage the [Shaped script](https://github.com/mlenser/roll20-api-scripts/tree/master/5eShapedScript)'s automatic [decrementing of inventory](https://bitbucket.org/mlenser/5eshapedscript/wiki/Home#markdown-header-decrement-uses). In either case, clicking on a Torch from either location will send the description to chat, and this is the signal used to trigger CarryTorch to do its thing.

If using Torches from the Utility section along with the Shaped script's decrement uses function, CarryTorch will prevent the Torch token and light settings if the Uses Police dialog is displayed for having used up all of the Torch inventory.

### Process
CarryTorch listens for players to use a Torch from their character's inventory and automatically adds a custom token marker to that character's token, as well as applying the appropriate Torch light settings. When the marker is removed (the Torch is snuffed or goes out), the token's previous light settings will automatically replace those of the Torch. This allows tokens with "darkvision" or any other light settings to be reset to the desired effect when the Torch is snuffed. You may set the custom token marker in the config menu (`!torch config`).

### Caveats
The "Character Name on all roll templates" option needs to be set turned on in order for the script to find the character's token. It is also assumed there will be only one token for each character on the page. Make sure the token marker you choose is dedicated to this script and not in use by another script that listens for status marker changes.
