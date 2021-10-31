/*
CarryTorch - UDL version
A Roll20 script that automates lighting and snuffing a torch for the 5e Shaped sheet
This script handles both Updated Dynamic Lighting and Legacy Dynamic Lighting.

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Become a patron:
    https://www.patreon.com/benscripts
*/

var CarryTorch = CarryTorch || (function () {
    'use strict';

    //---- INFO ----//

    var version = '2.0',
    debugMode = true,
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
        alert: 'color: #C91010; font-size: 1.5em; font-weight: bold; font-variant: small-caps; text-align: center;'
    },
    MARKERS,
    ALT_MARKERS = [{name:'red', tag: 'red', url:"#C91010"}, {name: 'blue', tag: 'blue', url: "#1076C9"}, {name: 'green', tag: 'green', url: "#2FC910"}, {name: 'brown', tag: 'brown', url: "#C97310"}, {name: 'purple', tag: 'purple', url: "#9510C9"}, {name: 'pink', tag: 'pink', url: "#EB75E1"}, {name: 'yellow', tag: 'yellow', url: "#E5EB75"}, {name: 'dead', tag: 'dead', url: "X"}],
    LIGHT_SOURCES = [
        {name: 'Torch',
        udl_settings: {emits_bright_light: true, bright_light_distance: 20, emits_low_light: true, low_light_distance: 40},
        ldl_settings: {light_radius: 40, light_dimradius: 20, light_otherplayers: true, light_angle: 360}},

        {name: 'Lamp',
        udl_settings: {emits_bright_light: true, bright_light_distance: 15, emits_low_light: true, low_light_distance: 45},
        ldl_settings: {light_radius: 45, light_dimradius: 15, light_otherplayers: true, light_angle: 360}},

        {name: 'Bullseye Lantern',
        udl_settings: {emits_bright_light: true, bright_light_distance: 60, emits_low_light: true, low_light_distance: 120},
        ldl_settings: {light_radius: 120, light_dimradius: 60, light_otherplayers: true, light_angle: 53}},

        {name: 'Hooded Lantern',
        udl_settings: {emits_bright_light: true, bright_light_distance: 30, emits_low_light: true, low_light_distance: 60},
        ldl_settings: {light_radius: 60, light_dimradius: 30, light_otherplayers: true, light_angle: 360}},

        {name: 'Hooded Lantern (hooded)',
        udl_settings: {emits_bright_light: false, bright_light_distance: 0, emits_low_light: true, low_light_distance: 5},
        ldl_settings: {light_radius: 5, light_dimradius: -5, light_otherplayers: true, light_angle: 360}},

        {name: 'Candle',
        udl_settings: {emits_bright_light: false, bright_light_distance: 0, emits_low_light: true, low_light_distance: 5},
        ldl_settings: {light_radius: 5, light_dimradius: -5, light_otherplayers: true, light_angle: 360}}
    ],
    UDL_NO_LIGHT = {emits_bright_light: false, bright_light_distance: 0, emits_low_light: false, low_light_distance: 0},

    checkInstall = function () {
        if (!_.has(state, 'CarryTorch')) state['CarryTorch'] = state['CarryTorch'] || {};
        if (typeof state['CarryTorch'].torchMarker == 'undefined') state['CarryTorch'].torchMarker = 'bogus';
        if (typeof state['CarryTorch'].tokens == 'undefined') state['CarryTorch'].tokens = [];
        MARKERS = JSON.parse(Campaign().get("token_markers"));

        log('--> CarryTorch v' + version + ' <-- Initialized');
		if (debugMode) {
			var d = new Date();
			showDialog('Debug Mode', 'CarryTorch v' + version + ' loaded at ' + d.toLocaleTimeString() + '<br><a style=\'' + styles.textButton + '\' href="!torch config">Show config</a>', 'GM');
		}

        if (state['CarryTorch'].torchMarker == 'bogus') commandConfig();
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!torch') && playerIsGM(msg.playerid)) {
            var parms = msg.content.split(/\s+/i);
            if (parms[1]) {
                switch (parms[1]) {
                    case 'set-marker':
                        setMarker(msg);
                        break;
                    case 'markers':
                        showMarkers(msg);
                        break;
                    case 'config':
                    default:
                        commandConfig();
                }
            }
		}

        var sources = _.pluck(LIGHT_SOURCES, 'name'),
        re_light = new RegExp('\{\{title=(' + esRE(_.pluck(LIGHT_SOURCES, 'name').join('|')) + ')\}\}', 'i'),
        re_douse = new RegExp('use (' + esRE(_.pluck(LIGHT_SOURCES, 'name').join('|')) + ')', 'i'),
        page = findObjs({type: 'page', _id: Campaign().get("playerpageid")})[0];

        if (msg.content.search(re_light) != -1) {
            // Create utility Object from 5e Shaped roll template
            var utilObj = {}, components = msg.content.trim().replace(/\}\}\s+\{\{/g, '#').replace(/\{*\}*/g, '');
            components = components.split('#');
            _.each(components, function (x) {
                var parts = x.split('=');
                utilObj[parts[0]] = parts[1];
            });

            // Get character name from roll template
            var char, char_name = (utilObj.character_name && utilObj.character_name != '') ? utilObj.character_name : '',
            source = _.find(LIGHT_SOURCES, function (source) { return source.name.toLowerCase() == utilObj.title.toLowerCase(); });
            char = findObjs({type: 'character', name: utilObj.character_name, archived: false})[0];

            // Find character's token on the map and light it up
            if (char && source) {
                var tokens = findObjs({ _type: 'graphic', _pageid: Campaign().get("playerpageid") });
                var token = _.find(tokens, function (t) { return t.get('represents') == char.get('id'); });
                if (token) {
                    // Save current settings (UDL won't care about the settings)
                    if (!_.find(state['CarryTorch'].tokens, function (x) { return x.id == token.get('id'); })) {
                        state['CarryTorch'].tokens.push({
                            id: token.get('id'),
                            settings: {
                                light_radius: token.get('light_radius'),
                                light_dimradius: token.get('light_dimradius'),
                                light_otherplayers: token.get('light_otherplayers'),
                                light_angle: token.get('light_angle')
                            }
                        });
                    }
                    // Set torch settings and add token marker
                    if (page.get('dynamic_lighting_enabled')) token.set(source.udl_settings);
                    else token.set(source.ldl_settings);
                    token.set('status_' + state['CarryTorch'].torchMarker, true);
                }
            }
        }

        // Uses Police pops up right after an attempted use. Turn the light back off if it does
        if (msg.content.search(/\{\{title=Uses Police\}\}/gi) != -1 && msg.content.search(re_douse) != -1) {
            // Get character name from roll template
            var char, char_name = msg.content.split('=')[2];
            char_name = char_name.substring(0, char_name.search(' can’t use'));
            char = findObjs({type: 'character', name: char_name, archived: false})[0];

            if (char) {
                var tokens = findObjs({ _type: 'graphic', _pageid: Campaign().get("playerpageid") });
                var token = _.find(tokens, function (t) { return t.get('represents') == char.get('id'); });
                if (token) {
                    setTimeout(function () {
                        var torched = _.find(state['CarryTorch'].tokens, function (x) { return x.id == token.get('id'); });
                        if (torched) {
                            token.set('status_' + state['CarryTorch'].torchMarker, false);
                            if (page.get('dynamic_lighting_enabled')) token.set(UDL_NO_LIGHT);
                            else token.set(torched.settings);
                            state['CarryTorch'].tokens = _.reject(state['CarryTorch'].tokens, function (x) { return x.id == token.get('id'); });
                        }
                    }, 0);

                }
            }
        }
    },

    commandConfig = function (msg) {
        var message = '', marker_style = 'margin: 5px 10px 0 0; display: block; float: left;';

        var curr_marker = _.find(MARKERS, function (x) { return x.tag == state['CarryTorch'].torchMarker; });
        if (typeof curr_marker == 'undefined') curr_marker = _.find(ALT_MARKERS, function (x) { return x.tag == state['CarryTorch'].torchMarker; });

        message += getMarker(curr_marker, marker_style);
        if (typeof curr_marker == 'undefined') message += '<b style="color: #c00;">Warning:</b> The token marker "' + state['CarryTorch'].torchMarker + '" is invalid!';
        else message += '"' + curr_marker.name + '" is token marker representing a torch being carried.';

        message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!torch markers" title="This may result in a very long list...">Choose Marker</a></div>';
        message += '<div style="text-align: center;"><a style="' + styles.textButton + '" href="!torch set-marker &#63;&#123;Token Marker&#124;&#125;" title="Set marker manually">Set manually</a></div><br>';

        message += '<p>See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/CarryTorch">documentation</a> for complete instructions.</p>';
        showDialog('Config', message, 'GM');
	},

    showDialog = function (title, content, whisperTo = '') {
        // Outputs a pretty box in chat with a title and content
        var gm = /\(GM\)/i;
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        if (whisperTo.length > 0) {
            whisperTo = '/w ' + (gm.test(whisperTo) ? 'GM' : '"' + whisperTo + '"') + ' ';
            sendChat('CarryTorch', whisperTo + body, null, {noarchive:true});
        } else  {
            sendChat('CarryTorch', body);
        }
    },

    setMarker = function (msg) {
        var marker = msg.content.split(/\s+/i).pop().toLowerCase().replace('=', '::');
        var status_markers = _.pluck(MARKERS, 'tag');
        _.each(_.pluck(ALT_MARKERS, 'tag'), function (x) { status_markers.push(x); });
        if (_.find(status_markers, function (tmp) {return tmp === marker; })) {
            state['CarryTorch'].torchMarker = marker;
        } else {
            showAdminDialog('Error', 'The status marker "' + marker + '" is invalid. Please try again.');
        }
        commandConfig(msg);
    },

    showMarkers = function (msg) {
        var message = '<table style="border: 0; width: 100%;" cellpadding="0" cellspacing="2">';
        _.each(ALT_MARKERS, function (marker) {
            message += '<tr><td>' + getMarker(marker, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + marker.name + '</td>';
            if (marker.tag == state['CarryTorch'].torchMarker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 7px;"><a style="' + styles.button + '" href="!torch set-marker ' + marker.tag + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });

        _.each(MARKERS, function (icon) {
            message += '<tr><td>' + getMarker(icon, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + icon.name + '</td>';
            if (icon.tag == state['CarryTorch'].torchMarker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 7px;"><a style="' + styles.button + '" href="!torch set-marker ' + icon.tag.replace('::','=') + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });

        message += '<tr><td colspan="3" style="text-align: center; padding: 7px;"><a style="' + styles.button + '" href="!torch config">&#9668; Back</a></td></tr>';
        message += '</table>';
        showDialog('Choose Torch Marker', message, 'GM');
    },

    getMarker = function (marker, style = '') {
        var marker_style = 'width: 24px; height: 24px;' + style;
        var return_marker = '<img src="" width="24" height="24" style="' + marker_style + ' border: 1px solid #ccc;" alt=" " />';
        if (typeof marker != 'undefined' && typeof marker.tag != 'undefined') {
            var status_markers = _.pluck(MARKERS, 'tag'),
            alt_marker = _.find(ALT_MARKERS, function (x) { return x.tag == marker.tag; });

            if (_.find(status_markers, function (x) { return x == marker.tag; })) {
                var icon = _.find(MARKERS, function (x) { return x.tag == marker.tag; });
                return_marker = '<img src="' + icon.url + '" width="24" height="24" style="' + marker_style + '" />';
            } else if (typeof alt_marker !== 'undefined') {
                if (alt_marker.url === 'X') {
                    marker_style += 'color: #C91010; font-size: 30px; line-height: 24px; font-weight: bold; text-align: center; padding-top: 0px; overflow: hidden;';
                    return_marker = '<div style="' + marker_style + '">X</div>';
                } else {
                    marker_style += 'background-color: ' + alt_marker.url + '; border: 1px solid #fff; border-radius: 50%;';
                    return_marker = '<div style="' + marker_style + '"></div>';
                }
            }
        }
        return return_marker;
    },

    esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

    handleTokenChange = function (token) {
        var torched = _.find(state['CarryTorch'].tokens, function (x) { return x.id == token.get('id'); }),
        page = findObjs({type: 'page', _id: Campaign().get("playerpageid")})[0];

        if (torched && !token.get('status_' + state['CarryTorch'].torchMarker)) {
            if (page.get('dynamic_lighting_enabled')) token.set(UDL_NO_LIGHT);
            else token.set(torched.settings);
            state['CarryTorch'].tokens = _.reject(state['CarryTorch'].tokens, function (x) { return x.id == token.get('id'); });
        }
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
        on('change:graphic:statusmarkers', handleTokenChange);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    CarryTorch.checkInstall();
    CarryTorch.registerEventHandlers();
});
