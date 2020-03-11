# CarryTorch

This [Roll20](http://roll20.net/) script listens for players to use a torch from their inventory (equipment or utility sections) and automatically adds a custom token marker, as well as applying the appropriate light settings that character's token. When the marker is removed, the token's previous light settings will replace those of the torch. This allows tokens with "darkvision" or any other light settings to be reset to the desired effect when the torch is snuffed. You may set the custom token marker in the config menu (`!torch config`).

**Caveats:** Character sheets must be set to show character names in the roll template in order to find the right token. It is also assumed there is only one token for each character on the page. Make sure the token marker you choose is not in use by another script that listens for status marker changes or there will be conflicts.

This script is only for use with the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped).
