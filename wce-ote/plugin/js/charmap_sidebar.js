/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('wcecharmapsidebar', function (ed) {
    var isArray = tinymce.util.Tools.isArray;

    function getDefaultCharMap() {
        return [
      ['160', 'no-break space'],
      ['173', 'soft hyphen'],
      ['34', 'quotation mark'],
      // finance
      ['162', 'cent sign'],
      ['8364', 'euro sign'],
      ['163', 'pound sign'],
      ['165', 'yen sign'],
      // signs
      ['169', 'copyright sign'],
      ['174', 'registered sign'],
      ['8482', 'trade mark sign'],
      ['8240', 'per mille sign'],
      ['181', 'micro sign'],
      ['183', 'middle dot'],
      ['8226', 'bullet'],
      ['8230', 'three dot leader'],
      ['8242', 'minutes / feet'],
      ['8243', 'seconds / inches'],
      ['167', 'section sign'],
      ['182', 'paragraph sign'],
      ['223', 'sharp s / ess-zed'],
      ['712', 'final stroke'],
      // quotations
      ['8249', 'single left-pointing angle quotation mark'],
      ['8250', 'single right-pointing angle quotation mark'],
      ['171', 'left pointing guillemet'],
      ['187', 'right pointing guillemet'],
      ['8216', 'left single quotation mark'],
      ['8217', 'right single quotation mark'],
      ['8220', 'left double quotation mark'],
      ['8221', 'right double quotation mark'],
      ['8218', 'single low-9 quotation mark'],
      ['8222', 'double low-9 quotation mark'],
      ['60', 'less-than sign'],
      ['62', 'greater-than sign'],
      ['8804', 'less-than or equal to'],
      ['8805', 'greater-than or equal to'],
      ['8211', 'en dash'],
      ['8212', 'em dash'],
      ['175', 'macron'],
      ['8254', 'overline'],
      ['164', 'currency sign'],
      ['166', 'broken bar'],
      ['168', 'diaeresis'],
      ['161', 'inverted exclamation mark'],
      ['191', 'turned question mark'],
      ['710', 'circumflex accent'],
      ['732', 'small tilde'],
      ['176', 'degree sign'],
      ['8722', 'minus sign'],
      ['177', 'plus-minus sign'],
      ['247', 'division sign'],
      ['8260', 'fraction slash'],
      ['215', 'multiplication sign'],
      ['185', 'superscript one'],
      ['178', 'superscript two'],
      ['179', 'superscript three'],
      ['188', 'fraction one quarter'],
      ['189', 'fraction one half'],
      ['190', 'fraction three quarters'],
      // math / logical
      ['402', 'function / florin'],
      ['8747', 'integral'],
      ['8721', 'n-ary sumation'],
      ['8734', 'infinity'],
      ['8730', 'square root'],
      ['8764', 'similar to'],
      ['8773', 'approximately equal to'],
      ['8776', 'almost equal to'],
      ['8800', 'not equal to'],
      ['8801', 'identical to'],
      ['8712', 'element of'],
      ['8713', 'not an element of'],
      ['8715', 'contains as member'],
      ['8719', 'n-ary product'],
      ['8743', 'logical and'],
      ['8744', 'logical or'],
      ['172', 'not sign'],
      ['8745', 'intersection'],
      ['8746', 'union'],
      ['8706', 'partial differential'],
      ['8704', 'for all'],
      ['8707', 'there exists'],
      ['8709', 'diameter'],
      ['8711', 'backward difference'],
      ['8727', 'asterisk operator'],
      ['8733', 'proportional to'],
      ['8736', 'angle'],
      // undefined
      ['180', 'acute accent'],
      ['184', 'cedilla'],
      ['170', 'feminine ordinal indicator'],
      ['186', 'masculine ordinal indicator'],
      ['8224', 'dagger'],
      ['8225', 'double dagger'],
      // alphabetical special chars
      ['192', 'A - grave'],
      ['193', 'A - acute'],
      ['194', 'A - circumflex'],
      ['195', 'A - tilde'],
      ['196', 'A - diaeresis'],
      ['197', 'A - ring above'],
      ['256', 'A - macron'],
      ['198', 'ligature AE'],
      ['199', 'C - cedilla'],
      ['200', 'E - grave'],
      ['201', 'E - acute'],
      ['202', 'E - circumflex'],
      ['203', 'E - diaeresis'],
      ['274', 'E - macron'],
      ['204', 'I - grave'],
      ['205', 'I - acute'],
      ['206', 'I - circumflex'],
      ['207', 'I - diaeresis'],
      ['298', 'I - macron'],
      ['208', 'ETH'],
      ['209', 'N - tilde'],
      ['0x004e+0x0328', 'N - ogonek'],
      ['210', 'O - grave'],
      ['211', 'O - acute'],
      ['212', 'O - circumflex'],
      ['213', 'O - tilde'],
      ['214', 'O - diaeresis'],
      ['216', 'O - slash'],
      ['332', 'O - macron'],
      ['338', 'ligature OE'],
      ['352', 'S - caron'],
      ['217', 'U - grave'],
      ['218', 'U - acute'],
      ['219', 'U - circumflex'],
      ['220', 'U - diaeresis'],
      ['362', 'U - macron'],
      ['221', 'Y - acute'],
      ['376', 'Y - diaeresis'],
      ['562', 'Y - macron'],
      ['222', 'THORN'],
      ['224', 'a - grave'],
      ['225', 'a - acute'],
      ['226', 'a - circumflex'],
      ['227', 'a - tilde'],
      ['228', 'a - diaeresis'],
      ['229', 'a - ring above'],
      ['257', 'a - macron'],
      ['230', 'ligature ae'],
      ['231', 'c - cedilla'],
      ['232', 'e - grave'],
      ['233', 'e - acute'],
      ['234', 'e - circumflex'],
      ['235', 'e - diaeresis'],
      ['275', 'e - macron'],
      ['236', 'i - grave'],
      ['237', 'i - acute'],
      ['238', 'i - circumflex'],
      ['239', 'i - diaeresis'],
      ['299', 'i - macron'],
      ['240', 'eth'],
      ['241', 'n - tilde'],
      ['0x006e+0x0328', 'N - ogonek'],
      ['242', 'o - grave'],
      ['243', 'o - acute'],
      ['244', 'o - circumflex'],
      ['245', 'o - tilde'],
      ['246', 'o - diaeresis'],
      ['248', 'o slash'],
      ['333', 'o macron'],
      ['339', 'ligature oe'],
      ['353', 's - caron'],
      ['249', 'u - grave'],
      ['250', 'u - acute'],
      ['251', 'u - circumflex'],
      ['252', 'u - diaeresis'],
      ['363', 'u - macron'],
      ['253', 'y - acute'],
      ['254', 'thorn'],
      ['255', 'y - diaeresis'],
      ['563', 'y - macron'],
      ['913', 'Alpha'],
      ['914', 'Beta'],
      ['915', 'Gamma'],
      ['916', 'Delta'],
      ['917', 'Epsilon'],
      ['918', 'Zeta'],
      ['919', 'Eta'],
      ['920', 'Theta'],
      ['921', 'Iota'],
      ['922', 'Kappa'],
      ['923', 'Lambda'],
      ['924', 'Mu'],
      ['925', 'Nu'],
      ['926', 'Xi'],
      ['927', 'Omicron'],
      ['928', 'Pi'],
      ['929', 'Rho'],
      ['931', 'Sigma'],
      ['932', 'Tau'],
      ['933', 'Upsilon'],
      ['934', 'Phi'],
      ['935', 'Chi'],
      ['936', 'Psi'],
      ['937', 'Omega'],
      ['945', 'alpha'],
      ['946', 'beta'],
      ['947', 'gamma'],
      ['948', 'delta'],
      ['949', 'epsilon'],
      ['950', 'zeta'],
      ['951', 'eta'],
      ['952', 'theta'],
      ['953', 'iota'],
      ['954', 'kappa'],
      ['955', 'lambda'],
      ['956', 'mu'],
      ['957', 'nu'],
      ['958', 'xi'],
      ['959', 'omicron'],
      ['960', 'pi'],
      ['961', 'rho'],
      ['962', 'final sigma'],
      ['963', 'sigma'],
      ['964', 'tau'],
      ['965', 'upsilon'],
      ['966', 'phi'],
      ['967', 'chi'],
      ['968', 'psi'],
      ['969', 'omega'],
      // symbols
      ['8501', 'alef symbol'],
      ['982', 'pi symbol'],
      ['8476', 'real part symbol'],
      ['978', 'upsilon - hook symbol'],
      ['8472', 'Weierstrass p'],
      ['8465', 'imaginary part'],
      // arrows
      ['8592', 'leftwards arrow'],
      ['8593', 'upwards arrow'],
      ['8594', 'rightwards arrow'],
      ['8595', 'downwards arrow'],
      ['8596', 'left right arrow'],
      ['8629', 'carriage return'],
      ['8656', 'leftwards double arrow'],
      ['8657', 'upwards double arrow'],
      ['8658', 'rightwards double arrow'],
      ['8659', 'downwards double arrow'],
      ['8660', 'left right double arrow'],
      ['8756', 'therefore'],
      ['8834', 'subset of'],
      ['8835', 'superset of'],
      ['8836', 'not a subset of'],
      ['8838', 'subset of or equal to'],
      ['8839', 'superset of or equal to'],
      ['8853', 'circled plus'],
      ['8855', 'circled times'],
      ['8869', 'perpendicular'],
      ['8901', 'dot operator'],
      ['8968', 'left ceiling'],
      ['8969', 'right ceiling'],
      ['8970', 'left floor'],
      ['8971', 'right floor'],
      ['9001', 'left-pointing angle bracket'],
      ['9002', 'right-pointing angle bracket'],
      ['9674', 'lozenge'],
      ['9824', 'black spade suit'],
      ['9827', 'black club suit'],
      ['9829', 'black heart suit'],
      ['9830', 'black diamond suit'],
      ['8194', 'en space'],
      ['8195', 'em space'],
      ['8201', 'thin space'],
      ['8204', 'zero width non-joiner'],
      ['8205', 'zero width joiner'],
      ['8206', 'left-to-right mark'],
      ['8207', 'right-to-left mark']
    ];
    }

    function getGuCharMap() {
        return [
      ['2693', 'GUJARATI LETTER A'],
      ['2694', 'GUJARATI LETTER AA'],
      ['2695', 'GUJARATI LETTER I'],
      ['2696', 'GUJARATI LETTER II'],
      ['2697', 'GUJARATI LETTER U'],
      ['2698', 'GUJARATI LETTER UU'],
      ['2699', 'GUJARATI LETTER VOCALIC R'],
      ['2784', 'GUJARATI LETTER VOCALIC RR'],
      ['2701', 'GUJARATI VOWEL CANDRA E'],
      ['2703', 'GUJARATI LETTER E'],
      ['2704', 'GUJARATI LETTER AI'],
      ['2705', 'GUJARATI VOWEL CANDRA O'],
      ['2707', 'GUJARATI LETTER O'],
      ['2708', 'GUJARATI LETTER AU'],
      ['2709', 'GUJARATI LETTER KA'],
      ['2710', 'GUJARATI LETTER KHA'],
      ['2711', 'GUJARATI LETTER GA'],
      ['2712', 'GUJARATI LETTER GHA'],
      ['2713', 'GUJARATI LETTER NGA'],
      ['2714', 'GUJARATI LETTER CA'],
      ['2715', 'GUJARATI LETTER CHA'],
      ['2716', 'GUJARATI LETTER JA'],
      ['2717', 'GUJARATI LETTER JHA'],
      ['2718', 'GUJARATI LETTER NYA'],
      ['2719', 'GUJARATI LETTER TTA'],
      ['2720', 'GUJARATI LETTER TTHA'],
      ['2721', 'GUJARATI LETTER DDA'],
      ['2722', 'GUJARATI LETTER DDHA'],
      ['2723', 'GUJARATI LETTER NNA'],
      ['2724', 'GUJARATI LETTER TA'],
      ['2725', 'GUJARATI LETTER THA'],
      ['2726', 'GUJARATI LETTER DA'],
      ['2727', 'GUJARATI LETTER DHA'],
      ['2728', 'GUJARATI LETTER NA'],
      ['2730', 'GUJARATI LETTER PA'],
      ['2731', 'GUJARATI LETTER PHA'],
      ['2732', 'GUJARATI LETTER BA'],
      ['2733', 'GUJARATI LETTER BHA'],
      ['2734', 'GUJARATI LETTER MA'],
      ['2735', 'GUJARATI LETTER YA'],
      ['2736', 'GUJARATI LETTER RA'],
      ['2738', 'GUJARATI LETTER LA'],
      ['2739', 'GUJARATI LETTER LLA'],
      ['2741', 'GUJARATI LETTER VA'],
      ['2742', 'GUJARATI LETTER SHA'],
      ['2743', 'GUJARATI LETTER SSA'],
      ['2744', 'GUJARATI LETTER SA'],
      ['2745', 'GUJARATI LETTER HA'],
    ];
    }

    function getAvCharMap() {
        return [
      ['0x0061', 'AVESTAN LETTER A'],
      ['0x00E5', 'AVESTAN LETTER AA'],
      ['0x101', 'AVESTAN LETTER AO'],
      ['0x0061+772+778', 'AVESTAN LETTER AAO'],
      ['0x105', 'AVESTAN LETTER AN'],
      ['0x105+0x307', 'AVESTAN LETTER AAN'],
      ['0x01dd', 'AVESTAN LETTER AE'],
      ['0x1dd+0x0304', 'AVESTAN LETTER AEE'],
      ['0x0065', 'AVESTAN LETTER E'],
      ['0x0113', 'AVESTAN LETTER EE'],
      ['0x006F', 'AVESTAN LETTER O'],
      ['0x014d', 'AVESTAN LETTER OO'],
      ['0x0069', 'AVESTAN LETTER I'],
      ['0x012b', 'AVESTAN LETTER II'],
      ['0x0075', 'AVESTAN LETTER U'],
      ['0x016b', 'AVESTAN LETTER UU'],
      ['0x006b', 'AVESTAN LETTER KE'],
      ['0x0078', 'AVESTAN LETTER XE'],
      ['0x0078+0x0301', 'AVESTAN LETTER XYE'],
      ['0x0078+0x200b+0x036e', 'AVESTAN LETTER XVE'],
      ['0x0067', 'AVESTAN LETTER GE'],
      ['0x0121', 'AVESTAN LETTER GGE'],
      ['0x03b3', 'AVESTAN LETTER GHE'],
      ['0x0063', 'AVESTAN LETTER CE'],
      ['0x006a', 'AVESTAN LETTER JE'],
      ['0x0074', 'AVESTAN LETTER TE'],
      //      ['0x03b8', 'AVESTAN LETTER THE'],
      ['0x03d1', 'AVESTAN LETTER THE'],
      ['0x0064', 'AVESTAN LETTER DE'],
      ['0x03b4', 'AVESTAN LETTER DHE'],
      ['0x03b4+0x0301', 'AVESTAN LETTER DHE'],
      ['0x0074+0x0330', 'AVESTAN LETTER TTE'],
      ['0x0070', 'AVESTAN LETTER PE'],
      ['0x0066', 'AVESTAN LETTER FE'],
      ['0x0062', 'AVESTAN LETTER BE'],
      ['0x03b2', 'AVESTAN LETTER BHE'],
      ['0x014b', 'AVESTAN LETTER NGE'],
      ['0x014b+0x0301', 'AVESTAN LETTER NGYE'],
      ['0x014b+0x200b+0x0367', 'AVESTAN LETTER NGVE'],
      ['0x006e', 'AVESTAN LETTER NE'],
      ['0x0144', 'AVESTAN LETTER NYE'],
      ['0x1e45', 'AVESTAN LETTER NYE'],
      ['0x1e47', 'AVESTAN LETTER NNE'],
      ['0x006d', 'AVESTAN LETTER ME'],
      ['0x006d+0x0328', 'AVESTAN LETTER HME'],
      ['0x1e8f', 'AVESTAN LETTER YYE'],
      ['0x0079', 'AVESTAN LETTER YE'],
      ['0x0076', 'AVESTAN LETTER VE'],
      ['0x0076+0x0307', 'AVESTAN LETTER VE'],
      ['0x0072', 'AVESTAN LETTER RE'],
      ['0x006c', 'AVESTAN LETTER LE'],
      ['0x0073', 'AVESTAN LETTER SE'],
      ['0x007a', 'AVESTAN LETTER ZE'],
      ['0x0161', 'AVESTAN LETTER SHE'],
      ['0x0161+0x0301', 'AVESTAN LETTER ZHE'],
      ['0x0161+0x0323', 'AVESTAN LETTER SHYE'],
      ['0x017e', 'AVESTAN LETTER SSHE'],
      ['0x0068', 'AVESTAN LETTER HE'],
      ['0x0068+0x0301', 'AVESTAN LETTER HE'],
      //      ['0x002e', 'AVESTAN LETTER '],
      //      ['0x10b3b', 'AVESTAN LETTER '],
    ];
    }

    function getPaCharMap() {
        return [
      ['0x02be', 'Aleph'],
      ['0x02bf', 'Ayin'],
      ['b+0x0331', 'Small letter b with macron below'],
      ['B+0x0331', 'Capital letter B with macron below'],
      ['B+0x0302+0x0331', 'Capital letter B with circumflex and macron below'],
      ['d+0x0331', 'Small letter d with macron below'],
      ['D+0x0331', 'Capital letter D with macron below'],
      ['d+0x0302', 'Small letter d with circumflex'],
      ['D+0x0302', 'Capital letter D with circumflex'],
      ['d+0x0308', 'Small letter d with diaeresis'],
      ['D+0x0308', 'Capital letter D with diaeresis'],
      ['g+0x0304', 'Small letter g with macron'],
      ['G+0x0331', 'Capital letter G with macron below'],
      ['g+0x0302', 'Small letter g with circumflex'],
      ['G+0x0302', 'Capital letter G with circumflex'],
      ['g+0x0308', 'Small letter g with diaeresis'],
      ['G+0x0308', 'Capital letter G with diaeresis'],
      ['H+0x0323', 'Capital letter H with dot below'],
      ['k+0x0331', 'Small letter k with macron below'],
      ['K+0x0331', 'Capital letter K with macron below'],
      ['l+0x0335', 'Small letter l with short stroke overlay'],
      ['L+0x0335', 'Capital letter L with short stroke overlay'],
      ['n+0x0331', 'Small letter n with macron below'],
      ['p+0x0304', 'Small letter p with macron'],
      ['P+0x0304', 'Capital letter P with macron'],
      ['R+0x0331', 'Capital letter R with macron below'],
      ['s+0x0331', 'Small letter s with macron below'],
      ['s+0x030C', 'Small letter s with caron'],
      ['S+0x030C', 'Capital letter S with caron'],
      ['0x0745+s', 'Small letter s with three dots above'],
      ['t+0x0302', 'Small letter t with circumflex'],
      ['x+0x2081', 'Small letter x with subscript 1'],
      ['x+0x2082', 'Small letter x with subscript 2'],
      ['y+0x0304', 'Small letter y with macron'],
      ['Y+0x0304', 'Small letter Y with macron'],
      ['y+0x0302', 'Small letter y with circumflex'],
      ['Y+0x0302', 'Capital letter Y with circumflex'],
      ['y+0x0323', 'Small letter y with dot below'],
      ['y+0x0308', 'Small letter y with diaeresis'],
      ['Y+0x0308', 'Capital letter Y with diaeresis'],
      ['y+0x0324', 'Small letter y with diaeresis below'],
      ['Y+0x0324', 'Capital letter Y with diaeresis below'],
      ['z+0x0331', 'Small letter z with macron below'],
      ['Z+0x0331', 'Capital letter Z with macron below'],
    ];
    }

    function getInterpunctionSigns() {
        return [
      ['0x0964', 'danda'],
      ['0x0965', 'double danda'],
      ['0x10B3D', 'Three dots (pyramid shape)'],
      ['0x10B3E', 'Three dots (v-shape)'],
    ];
    }

    function isInterpunctionSign(currindex) {
        return (currindex >= getPaCharMap().length + getAvCharMap().length + getGuCharMap().length);
    }

    function charmapFilter(charmap) {
        return tinymce.util.Tools.grep(charmap, function (item) {
            return isArray(item) && item.length == 2;
        });
    }

    function getCharsFromSetting(settingValue) {
        if (isArray(settingValue)) {
            return [].concat(charmapFilter(settingValue));
        }

        if (typeof settingValue == "function") {
            return settingValue();
        }

        return [];
    }

    function extendCharMap(charmap) {
        var settings = ed.settings;

        if (settings.charmap) {
            charmap = getCharsFromSetting(settings.charmap);
        }

        if (settings.charmap_append) {
            return [].concat(charmap).concat(getCharsFromSetting(settings.charmap_append));
        }

        return charmap;
    }

    function getCharMap() {
        return extendCharMap(getDefaultCharMap().concat(getPaCharMap()).concat(getAvCharMap()).concat(getGuCharMap().concat(getInterpunctionSigns())));
    }

    function insertChar(chr, chrindex) {
        ed.fire('insertCustomChar', {
            chr: chr
        }).chr;
        if (isInterpunctionSign(chrindex))
            ed.execCommand('mceInsertContent', false, chr);
        else
            ed.execCommand('mceInsertContent', false, chr);
    }

    function charselected(e) {
        if (!e)
            e = window.event;
        var target = e.target;

        if (/^(TD|DIV)$/.test(target.nodeName)) {
            insertChar(tinymce.trim(target.innerText || target.textContent),
                target.getAttribute("tabindex"));
        }
    }

    function getGridHtml(charmap) {
        var gridHtml = '<table role="presentation" cellspacing="0" class="mce-charmap"><tbody>';
        charmap = charmap ? charmap : getCharMap();
        var width = Math.min(charmap.length, 25);
        var height = Math.ceil(charmap.length / width);
        for (y = 0; y < height; y++) {
            gridHtml += '<tr>';
            for (x = 0; x < width; x++) {
                var index = y * width + x;
                if (index < charmap.length) {
                    var chr = charmap[index];
                    gridHtml += '<td title="' + chr[1] + '"><div tabindex="' + index + '" title="' + chr[1] + '" role="button">' +
                        (chr ? parseSomeInt(chr[0]) : '&nbsp;') + '</div></td>';
                } else {
                    gridHtml += '<td />';
                }
            }

            gridHtml += '</tr>';
        }

        gridHtml += '</tbody></table>';
        return gridHtml;
    }

    function parseSomeInt(charcodes) {
        var str = charcodes.split('+');
        var out = '';
        for (i = 0; i < str.length; i++) {
            if (isNaN(parseFloat(str[i]))) {
                out += str[i];
            } else {
                out += String.fromCodePoint(parseInt(str[i]));
            }
        }
        return out;
    }

    var lineheight = 0;
    var sidebar;

    function _initSidebar() {
        var ct = ed.getContentAreaContainer();
        ct.style.display = "flex";
        var iframe = ct.querySelector('iframe');
        var bd = ed.dom.select('body');
        var fontsize = parseInt($(bd).css('font-size'));
        lineheight = fontsize * 1.6;
        sidebar = document.createElement("div");
        sidebar.classList.add("wce-charmap-sidebar");
        sidebar.style.width = "600px";
        sidebar.style.borderRight = "1px solid #aaa";
        sidebar.style.backgroundColor = "lightgray";
        sidebar.style.position = "relative";
        sidebar.style.overflow = "hidden";
        ct.appendChild(sidebar);
        _drawCharmapsidebar();
        $(ed.getWin()).scroll(function (e) {
            //_drawCharmapsidebar();
        });
        $(ed.getWin()).resize(function () {
            //_drawCharmapsidebar();
        });
        ed.on('ResizeEditor', function (e) {
            iframe.style.height = null;
        });

        ed.on('change', function () {

        });
        ed.on('keyup', function () {

        });
        ed.on('setContent', function () {

        });
    }

    ed.addCommand('wceShowcharmapsidebar', function (b) {
        if (!sidebar) {
            _initSidebar();
        }
        sidebar.style.display = b ? 'block' : 'none';
    });

    function _drawCharmapsidebar() {
        //var translate = tinymce.util.I18n.translate;
        //sidebar.appendChild(radioHtml);
        var div = document.createElement('div');
        div.setAttribute("class", "mce-charmap-wrapper");
        div.innerHTML = getGridHtml();
        //const element = div.querySelectorAll('.tabindex');
        sidebar.appendChild(div);
        sidebar.addEventListener('click', event => charselected(event), true);
    }

    //$(document).ready(function() {
});
