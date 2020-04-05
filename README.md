# CarryTorch

This [Roll20](http://roll20.net/) script is for GMs using the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped) who want to automate the use of Torches and other common light sources from the inventory of a character's sheet. These items can either be stored in the Equipment section, or in the sheet's Utility section (this is automated in the [GearManager script](https://github.com/blawson69/GearManager)) to take advantage the [Shaped script](https://github.com/mlenser/roll20-api-scripts/tree/master/5eShapedScript)'s automatic [decrementing of inventory](https://bitbucket.org/mlenser/5eshapedscript/wiki/Home#markdown-header-decrement-uses). In either case, clicking on a light source from either location will send the description to chat, and this is the signal used to trigger CarryTorch to do its thing.

If using Torches from the Utility section along with the Shaped script's decrement uses function, CarryTorch will prevent the Torch token and light settings if the Uses Police dialog is displayed for having used up all of the Torch inventory.

### Process
CarryTorch listens for players to use a light source from their character's inventory and automatically adds a custom token marker to that character's token, as well as applying the appropriate light settings. When the marker is removed (the light is snuffed or goes out), the token's previous light settings will automatically replace those of the light source. This allows tokens with "darkvision" or any other default light settings to be reset when the source is snuffed. You may set the custom token marker in the config menu (`!torch config`).

The light sources CarryTorch looks for are: Torch, Lamp, Candle, Bullseye Lantern, Hooded Lantern. If you add a "Hooded Lantern (hooded)" to inventory, you can use it to toggle the hood with its different effects.

### Caveats
The "Character Name on all roll templates" option must be set turned on in order for the script to find the character's token. It is also assumed there will be only one token for each character on the page, and that the token to be affected is on the page with the Players Ribbon. Make sure the token marker you choose is dedicated to this script and not in use by another script that listens for status marker changes.
