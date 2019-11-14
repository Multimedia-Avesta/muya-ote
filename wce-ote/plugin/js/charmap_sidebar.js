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

tinymce.PluginManager.add('wcecharmapsidebar', function(ed) {
   var isArray = tinymce.util.Tools.isArray;
   var charmap_filter_value = 'All_glyphs';
   var radioGroup = [{
         id: 'charmap_default',
         value: 'Default_only',
         i18n: 'charmap_default_only',
         charmap: getDefaultCharMap
      }, {
         id: 'charmap_gu',
         value: 'Gujarati_only',
         i18n: 'charmap_gujarati_only',
         charmap: getGuCharMap
      }, {
         id: 'charmap_av',
         value: 'Avestan_only',
         i18n: 'charmap_avestan_only',
         charmap: getAvCharMap
      }, {
         id: 'charmap_pa',
         value: 'Pahlavi_only',
         i18n: 'charmap_pahlavi_only',
         charmap: getPaCharMap
      }, {
         id: 'charmap_in',
         value: 'interpunction_signs_only',
         i18n: 'charmap_interpunction_signs_only',
         charmap: getInterpunctionSigns
      },
      {
         id: 'charmap_all',
         value: 'All_glyphs',
         i18n: 'charmap_all',
         charmap: getCharMap
      }
   ];



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
         ['0x004e+0x0320', 'N - circumflex'],
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
         ['0x006e+0x0328', 'n - ogonek'],
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
         ['257', 'Small letter a with macron'],
         ['0x1E0D', 'Small letter d with dot below'],
         ['0x1E25', 'Small letter h with dot below'],
         ['0x1E2B ', 'Small letter h with breve below'],
         ['299', 'Small letter i with macron'],
         ['0x1E37', 'Small letter l with dot below'],
         ['l+0x0325', 'Small letter l with ring below'],
         ['l+0x0304+0x0325', 'Small letter l with macron and ring below'],
         ['0x1E41', 'Small letter m with dot above'],
         ['m+0x0310', 'Small letter m with candrabindu'],
         ['0x1E43', 'Small letter m with dot below'],
         ['241', 'Small letter n with tilde'],
         ['0x1e45', 'Small letter n with dot above'],
         ['0x1e47', 'Small letter n with dot below'],
         ['r+0x0325', 'Small letter r with ring below'],
         ['r+0x0304+0x0325', 'Small letter r with macron and ring below'],
         ['0x1E5B', 'Small letter r with dot below'],
         ['0x1E63', 'Small letter s with dot below'],
         ['0x015B', 'Small letter s with acute'],
         ['0x1E6D', 'Small letter t with dot below'],
         ['363', 'Small letter u with macron'],
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
         ['0x00EF', 'Small letter i with diaeresis'],
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
         ['0x1E6B+0x0330', 'AVESTAN LETTER TTE with dot above'],
         ['0x0074+0x0328', 'Small letter t with ogonek'],
         ['0x1E6B', 'Small letter t with dot above'],
         ['0x0070', 'AVESTAN LETTER PE'],
         ['0x0066', 'AVESTAN LETTER FE'],
         ['0x0062', 'AVESTAN LETTER BE'],
         ['0x03b2', 'AVESTAN LETTER BHE'],
         ['0x014b', 'AVESTAN LETTER NGE'],
         ['0x014b+0x0301', 'AVESTAN LETTER NGYE'],
         ['0x014b++0x200b+0x036e', 'AVESTAN LETTER NGVE'],
         ['0x006e', 'AVESTAN LETTER NE'],
         ['0x0144', 'AVESTAN LETTER NYE'],
         ['0x1e45', 'AVESTAN LETTER NYE'],
         ['0x1e47', 'AVESTAN LETTER NNE'],
         ['0x006e+0x0328', 'AVESTAN LETTER NE with ogonek'],
         ['0x006e+0x0302', 'AVESTAN LETTER NE with circumflex'],
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
         ['.', 'Full stop within word'],
      ];
   }

   function getPaCharMap() {
      return [
         ['712', 'final stroke'],
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
         ['d+0x0324', 'Small letter d with diaeresis below'],
         ['D+0x0324', 'Capital letter D with diaeresis below'],
         ['g+0x0304', 'Small letter g with macron'],
         ['G+0x0331', 'Capital letter G with macron below'],
         ['g+0x0302', 'Small letter g with circumflex'],
         ['G+0x0302', 'Capital letter G with circumflex'],
         ['g+0x0308', 'Small letter g with diaeresis'],
         ['G+0x0308', 'Capital letter G with diaeresis'],
         ['H+0x0323', 'Capital letter H with dot below'],
         ['H+0x0302', 'Capital letter H with circumflex'],
         ['0x00EF', 'Small letter i with diaeresis'],
         ['k+0x0331', 'Small letter k with macron below'],
         ['K+0x0331', 'Capital letter K with macron below'],
         ['k+0x0308', 'Small letter k with diaeresis'],
         ['K+0x0308', 'Capital letter k with diaeresis'],
         ['k+0x0324', 'Small letter k with diaeresis below'],
         ['K+0x0324', 'Capital letter k with diaeresis below'],
         ['l+0x0335', 'Small letter l with short stroke overlay'],
         ['L+0x0335', 'Capital letter L with short stroke overlay'],
         ['n+0x0331', 'Small letter n with macron below'],
         ['N+0x0331', 'Capital letter N with macron below'],
         ['n+0x0302', 'Small letter n with circumflex'],
         ['N+0x0302', 'Capital letter n with circumflex'],
         ['m+0x0328', 'Small letter m with ogonek'],
         ['M+0x0328', 'Capital letter M with ogonek'],
         ['p+0x0304', 'Small letter p with macron'],
         ['P+0x0304', 'Capital letter P with macron'],
         ['r+0x0331', 'Small letter r with macron below'],
         ['R+0x0331', 'Capital letter R with macron below'],
         ['s+0x0331', 'Small letter s with macron below'],
         ['S+0x0331', 'Capital letter S with macron below'],
         ['s+0x030C', 'Small letter s with caron'],
         ['S+0x030C', 'Capital letter S with caron'],
         ['s+0x030C+0x0745', 'Small letter s with caron and three dots'],
         ['S+0x030C+0x0745', 'Capital letter S with caron and three dots'],
         ['s+0x0745', 'Small letter s with three dots above'],
         ['S+0x0745', 'Capital letter S with three dots above'],
         ['s+0x0746', 'Small letter s with three dots below'],
         ['s+0x0745', 'Small letter s with three dots above'],
         ['S+0x0745', 'Capital letter S with three dots above'],
         ['s+0x0746', 'Small letter s with three dots below'],
         ['S+0x0746', 'Capital letter S with three dots below'],
         ['0x0161', 'Small letter s with caron'],
         ['0x0160', 'Capital letter S with caron'],
         ['s+0x032C', 'Small letter s with caron below'],
         ['S+0x032C', 'Capital letter S with caron below'],
         ['0x0161+0x032C', 'Small letter s with caron above and below'],
         ['0x0160+0x032C', 'Capital letter S with caron above and below'],
         ['t+0x0302', 'Small letter t with circumflex'],
         ['T+0x0302', 'Capital letter T with circumflex'],
         ['t+0x0308', 'Small letter t with diaeresis'],
         ['T+0x0308', 'Capital letter T with diaeresis'],
         ['t+0x0328', 'Small letter t with ogonek'],
         ['T+0x0328', 'Capital letter T with ogonek'],
         ['0x1E6B', 'Small letter t with dot above'],
         ['0x1E6A', 'Capital letter T with dot above'],
         ['x+0x2081', 'Small letter x with subscript 1'],
         ['x+0x2082', 'Small letter x with subscript 2'],
         ['x+0x0302+0x2081', 'Small letter x with circumflex and subscript 1'],
         ['x+0x0302+0x2082', 'Small letter x with circumflex and subscript 2'],
         ['y+0x0304', 'Small letter y with macron'],
         ['Y+0x0304', 'Capital letter Y with macron'],
         ['y+0x0302', 'Small letter y with circumflex'],
         ['Y+0x0302', 'Capital letter Y with circumflex'],
         ['y+0x0323', 'Small letter y with dot below'],
         ['Y+0x0323', 'Capital letter Y with dot below'],
         ['y+0x0308', 'Small letter y with diaeresis'],
         ['Y+0x0308', 'Capital letter Y with diaeresis'],
         ['y+0x0324', 'Small letter y with diaeresis below'],
         ['Y+0x0324', 'Capital letter Y with diaeresis below'],
         ['y+0x0302+0x0323', 'Small letter y with circumflex and dot below'],
         ['Y+0x0302+0x0323', 'Capital letter Y with circumflex and dot below'],
         ['y+0x0302+0x0324', 'Small letter y with circumflex and diaeresis below'],
         ['Y+0x0302+0x0324', 'Capital letter Y with circumflex and diaeresis below'],
         ['z+0x0331', 'Small letter z with macron below'],
         ['Z+0x0331', 'Capital letter Z with macron below'],
         ['z+0x0302+0x0331', 'Small letter z with circumflex and macron below'],
         ['Z+0x0302+0x0331', 'Capital letter Z with circumflex and macron below'],
      ];
   }

   function getInterpunctionSigns() {
      return [
         ['0x0964', 'danda'],
         ['0x0965', 'double danda'],
         /*['0x10B39', 'AVESTAN ABBREVIATION MARK'],
         ['0x10B3A', 'TINY TWO DOTS OVER ONE DOT PUNCTUATION'],
         ['0x10B3B', 'SMALL TWO DOTS OVER ONE DOT PUNCTUATION'],
         ['0x10B3C', 'LARGE TWO DOTS OVER ONE DOT PUNCTUATION'],*/
         ['0x10B3D', 'Three dots (pyramid shape)'],
         ['0x10B3E', 'Three dots (v-shape)'],
         ['.', 'Full stop within word'],
         //['0x10B3F', 'LARGE ONE RING OVER TWO RINGS PUNCTUATION'],
      ];
   }

   function isInterpunctionSign(currindex) {
      return (currindex >= getPaCharMap().length + getAvCharMap().length + getGuCharMap().length);
   }

   function charmapFilter(charmap) {
      return tinymce.util.Tools.grep(charmap, function(item) {
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
         if (target.getAttribute("tabindex")) {
            insertChar(tinymce.trim(target.innerText || target.textContent),
               target.getAttribute("tabindex"));
         }
      } else {
         if (target.nodeName && target.nodeName.toLocaleLowerCase() == 'input') {
            var filterValue = target.value;
            var radioInput = radioGroup.find(function(r) {
               if (r.value == filterValue) {
                  return true;
               }
            });
            if (radioInput) {
               charmap_filter_value = filterValue;
               _drawCharmapsidebar(radioInput.charmap());
            }
         }
      }
   }

   function getGridHtml(charmap, currwidth) {
      var gridHtml = '<table role="presentation" cellspacing="0" class="mce-charmap"><tbody>';
      var x, y;
      charmap = charmap ? charmap : getCharMap();
      var width = Math.floor(currwidth / 25);
      var height = (width == 0 ? 0 : Math.ceil(charmap.length / width));
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

   function getRadioHtml() {
      //radio html
      var radioHtml = '<div style="padding:10px">';
      var translate = tinymce.util.I18n.translate;
      radioGroup.forEach(function(r, i) {
         radioHtml += '<div><input type="radio" id="' + r.id + '"';
         r.value == charmap_filter_value ? radioHtml += ' checked="checked"' : '';
         radioHtml += ' name="charmap_filter" value="' + r.value + '" /> ';
         radioHtml += '<label style="margin-right:2px">' + translate(r.i18n) + '</label></div>';
      });
      radioHtml += '</div>';
      return radioHtml;
   }

   function parseSomeInt(charcodes) {
      var str = charcodes.split('+');
      var out = '';
      for (var i = 0; i < str.length; i++) {
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

   function lookup(array, prop, value) {
      for (var i = 0, len = array.length; i < len; i++)
         if (array[i] && array[i][prop] === value) return array[i];
   }

   function _initSidebar() {
      var ct = ed.getContentAreaContainer();
      ct.style.display = "flex";
      var iframe = ct.querySelector('iframe');
      var bd = ed.dom.select('body');
      var fontsize = parseInt($(bd).css('font-size'));
      lineheight = fontsize * 1.6;
      sidebar = document.createElement("div");
      sidebar.classList.add("wce-charmap-sidebar");
      sidebar.id = "right_panel";
      // see skin.min.class
      //sidebar.style.width = String(screen.width/2).concat("px");
      //sidebar.style.width = "600px";
      //alert(sidebar.style.width);
      sidebar.style.maxHeight = String(document.querySelector('iframe#wce_editor_ifr').offsetHeight).concat("px"); //"400px";
      sidebar.style.borderRight = "1px solid #aaa";
      sidebar.style.overflow = "auto";
      _drawEditor();

      let m_pos;
      var activeresize = false;

      sidebar.addEventListener('mousedown', function(e) {
         if (e.offsetX < 4) {
            m_pos = e.x;
            activeresize = true;
         }
      }, false);
      sidebar.addEventListener("mouseup", function() {
         activeresize = false;
      }, false);
      sidebar.addEventListener('mousemove', function(e) {
         if (activeresize) {
            const dx = m_pos - e.x;
            m_pos = e.x;
            sidebar.style.width = (parseInt(getComputedStyle(sidebar).width, '') + dx) + "px";
            var currentcharmap = lookup(radioGroup, "value", charmap_filter_value);
            _drawCharmapsidebar(currentcharmap.charmap());
            _drawEditor();
         }
      }, false);

      ct.appendChild(sidebar);
      _drawCharmapsidebar(getCharMap());

      $(ed.getWin()).scroll(function(e) {
         var currentcharmap = lookup(radioGroup, "value", charmap_filter_value);
         _drawCharmapsidebar(currentcharmap.charmap());
      });
      $(ed.getWin()).resize(function() {
         var currentcharmap = lookup(radioGroup, "value", charmap_filter_value);
         _drawCharmapsidebar(currentcharmap.charmap());
      });
      ed.on('ResizeEditor', function(e) {
         iframe.style.height = null;
         iframe.style.width = null;
      });
      ed.on('change', function() {});
      ed.on('keyup', function() {});
      ed.on('setContent', function() {});

      ed.on('mousemove', function(e) {
         if (activeresize) {
            const dx = m_pos - e.x;
            m_pos = e.x;
            sidebar.style.width = (parseInt(getComputedStyle(sidebar).width, '') + dx) + "px";
            var currentcharmap = lookup(radioGroup, "value", charmap_filter_value);
            _drawCharmapsidebar(currentcharmap.charmap());
            _drawEditor();
         }
      });

      ed.on('mouseup', function() {
         activeresize = false;
      });
   }

   ed.addCommand('wceShowcharmapsidebar', function(b) {
      if (!sidebar) {
         _initSidebar();
      }
      sidebar.style.display = b ? 'block' : 'none';
   });

   function _drawCharmapsidebar(cf) {
      var currentdiv = sidebar.querySelector("div");
      if (currentdiv) {
         sidebar.removeChild(currentdiv);
      }
      var div = document.createElement('div');
      div.setAttribute("class", "mce-charmap-wrapper");
      div.innerHTML = getGridHtml(cf, sidebar.offsetWidth) + getRadioHtml();
      sidebar.appendChild(div);
      if (!currentdiv)
         sidebar.addEventListener('click', event => charselected(event), true);
   }

   function _drawEditor() {
      var ifr = document.querySelector('iframe#wce_editor_ifr');
      ifr.style.width = (parseInt(window.innerWidth, '') - sidebar.offsetWidth - 40) + "px";
   }

});
