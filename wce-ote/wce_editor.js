/*
	Copyright (C) 2012-2019 Trier Center for Digital Humanities, Trier (Germany)

	This file is part of the Online Transcription Editor (OTE).

    OTE is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 2.1 of the License, or
    (at your option) any later version.

    OTE is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with OTE.  If not, see <http://www.gnu.org/licenses/>.

    Diese Datei ist Teil des Online-Transkriptions-Editor (OTE).

    OTE ist Freie Software: Sie können es unter den Bedingungen
    der GNU Lesser General Public License, wie von der Free Software Foundation,
    Version 2.1 der Lizenz oder (nach Ihrer Wahl) jeder späteren
    veröffentlichten Version, weiterverbreiten und/oder modifizieren.

    OTE wird in der Hoffnung, dass es nützlich sein wird, aber
    OHNE JEDE GEWÄHRLEISTUNG, bereitgestellt; sogar ohne die implizite
    Gewährleistung der MARKTFÄHIGKEIT oder EIGNUNG FÜR EINEN BESTIMMTEN ZWECK.
    Siehe die GNU Lesser General Public License für weitere Details.

    Sie sollten eine Kopie der GNU Lesser General Public License zusammen mit diesem
    Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
*/

function setWceEditor(_id, rtl, finishCallback, lang, myBaseURL, getWitness, getWitnessLang, savefunc) {
   if (myBaseURL && typeof myBaseURL !== "undefined" && myBaseURL !== '') {
      tinymce.baseURL = myBaseURL;
      tinymce.baseURI = new tinymce.util.URI(tinymce.baseURL);
   }

   tinymce.init({
      // General options
      branding: false,
      mode: "exact",
      selector: '#' + _id,
      theme: "modern",
      menubar: false,
      skin_url: tinymce.baseURL + "../../../wce-ote/skin/",
      extended_valid_elements: 'span[class|wce_orig|style|wce|ext|id|lang|partial]',
      forced_root_block: false,
      force_br_newlines: true,
      //force_p_newlines : false, //DEPRECATED!
      entity_encoding: "raw",
      theme_advanced_path: false,
      execcommand_callback: 'wceExecCommandHandler',
      save_onsavecallback: function() {
         if (savefunc)
            savefunc();
         //saveToDisc();
         //if (saveDataToDB) saveDataToDB(true);
      },
      directionality: (rtl) ? "rtl" : "ltr",
      language: (lang) ? (lang.indexOf('de') === 0 ? "de" : "en") : "en",
      //book : (getBook) ? getBook : "",
      witness: (getWitness) ? getWitness : "",
      manuscriptLang: (getWitnessLang) ? getWitnessLang : "",
      plugins: "pagebreak,save,wordcount,paste,contextmenu,noneditable,code,localautosave",
      //selector: "textarea", // change this value according to your HTML
      las_seconds: 60,
      las_nVersions: 0,
      las_keyName: "LocalAutoSave",
      las_callback: function() {
         var content = this.content; //content saved
         var time = this.time; //time on save action
      },
      paste_as_text: true,
      external_plugins: {
         'wce': '../../wce-ote/plugin/plugin.js',
         'muyacharmap': '../../wce-ote/plugin/js/muya_charmap.js',
         'punctuation': '../../wce-ote/plugin/js/punctuation.js',
         'wcelinenumber': '../../wce-ote/plugin/js/line_number.js',
         'wcecharmapsidebar': '../../wce-ote/plugin/js/charmap_sidebar.js'
      },
      show_linenumber: true, //default false,
      show_charmapsidebar: true,
      inner_hi: false, // ticket #6130
      content_css: tinymce.baseURL + '../../../wce-ote/skin/' + 'customfonts.css?' + new Date().getTime(),
      //ignoreShiftNotEn: [188, 190],
      keyboardDebug: true,
      insertpunctuation: true,
      init_instance_callback: "wceReload",
      // Theme options
      toolbar: "undo redo muyacharmap | LoadFile save | contextmenu cut copy paste | " +
         "breaks correction illegible decoration abbreviation paratext note punctuation language versemodify | " +
         "showTeiByHtml | showHtmlByTei | info code | localautosave ",
      theme_advanced_buttons2: "",
      theme_advanced_toolbar_location: "top",
      theme_advanced_toolbar_align: "left",
      theme_advanced_statusbar_location: "bottom",
      theme_advanced_resizing: false,
      setup: function(ed) {
         ed.on('change', wceOnContentsChange);
         ed.on('init', function(e) { // Once initialized, tell the editor to go fullscreen
            addMenuItems(tinyMCE.activeEditor);
            if (finishCallback)
               finishCallback();
         });
      }
   });
}

function wceReload() {
   //setTEI('<text><body><div type="book" xml:id="Yasna" n="Yasna"><pb n="P1r-Test8" type="folio"/><lb n="P1rL-Test8"/><div type="chapter" xml:id="Yasna1" n="1"><ab type="stanza" xml:id="Yasna1.1" n="1"><w>The</w><pc>P+.</pc><w>text</w><pc>P+.</pc><w>begins</w><pc>P+.</pc><w>in</w><pc>P+.</pc><w>Avestan</w><pc>P+.</pc><lb n="P1rL-Test8"/><w>language</w><pc>P+.</pc><foreign type="ritual" xml:id="Yasna1.1a-ritual-P" n="a" xml:lang="pal-Phlv"><w><hi rend="rubric">rest</hi></w><w><hi rend="rubric">of</hi></w><w><hi rend="rubric">stanza</hi></w><w><hi rend="rubric">abbreviated</hi></w></foreign><foreign type="" xml:id="Yasna1.1a-other-G" n="a" xml:lang="mainlanguage"/></ab><ab type="stanza" xml:id="Yasna1.2" n="2"><foreign type="" xml:id="Yasna1.1a-other-G" n="a" xml:lang="mainlanguage"/></ab><ab type="stanza" xml:id="Yasna1.3" n="3"><foreign type="" xml:id="Yasna1.1a-other-G" n="a" xml:lang="mainlanguage"/></ab><ab type="stanza" xml:id="Yasna1.4" n="4"><foreign type="" xml:id="Yasna1.1a-other-G" n="a" xml:lang="mainlanguage"><w>and</w><pc>P+.</pc><lb n="P1rL-Test8"/><w>then</w><pc>P+.</pc><w>continues</w><pc>P+.</pc></foreign><foreign type="ritual" xml:id="Yasna1.4a-ritual-P" n="a" xml:lang="pal-Phlv"><w><hi rend="rubric">Put</hi></w><w><hi rend="rubric">text</hi></w><w><hi rend="rubric">of</hi></w><w><hi rend="rubric">ritual</hi></w><w><hi rend="rubric">direction</hi></w><w><hi rend="rubric">here</hi></w></foreign><foreign type="back" xml:id="Yasna1.4a-back-G" n="a" xml:lang="mainlanguage"/></ab><ab type="stanza" xml:id="Yasna1.5" n="5"/><ab type="stanza" xml:id="Yasna1.6" n="6"/><ab type="stanza" xml:id="Yasna1.7" n="7"><w>back</w><pc>P+.</pc><w>to</w><pc>P+.</pc><w>avestan</w><pc>P+.</pc><lb n="P1rL-Test8"/><w>text</w><pc>P+.</pc></ab></div></div></body></text>');
}


// get dirty-value of editor
function isEditorDirty() {
   return tinyMCE.activeEditor.isDirty();
}

// set editor dirty-value
function setEditorNotDirty(b) {
   tinyMCE.activeEditor.isNotDirty = b;
}

// set editor html content
function setData(msg) {
   tinyMCE.activeEditor.setContent(msg);
}

// get editor html content
function getData() {
   return tinyMCE.activeEditor.getContent();
}
/*
// The following parameters should be set before tei-output:
// @param {String} bookNumber: book number, default 00;
// @param {Number} pageNumber: page start number, default 0,
// @param {Number} chapterNumber: chapter number, default 0, only use the if htmlInput not start with chapter/verse;
// @param {Number} verseNumber: verseNumber, default 0, only use the if if htmlInput not start with chapter/verse;
// @param {Number} wordNumber: word start number for <w>, default 0, only use the if htmlInput not start with chapter/verse;
// @param {Number} columnNumber: column number, defualt 0
// @param {Number} witValue: value for wit, defualt 0
function setTeiIndexData(bookNumber, witValue, manuscriptLang) {
	var wid = getTeiIndexData();
	if (bookNumber) {
		wid['bookNumber'] = bookNumber;
	}
	if (witValue) {
		wid['witValue'] = witValue;
	}
	if (manuscriptLang) {
		wid['manuscriptLang'] = manuscriptLang;
	}
}

function getTeiIndexData() {
	return tinyMCE.activeEditor.teiIndexData;
}
*/
// get TEI String from editor html content
function getTEI() {
   return getTeiByHtml(getData(), tinyMCE.activeEditor.settings);
}

// set editor html content from tei input
// teiIndexData can be change
// @param {String} teiStringInput
function setTEI(teiStringInput) {
   var result = getHtmlByTei(teiStringInput, tinyMCE.activeEditor.settings);
   if (result) {
      var htmlContent = result['htmlString'];
      if (htmlContent)
         setData(htmlContent);
   }
   /*var teiIndexData = result['teiIndexData'];
   if (teiIndexData) {
   	tinyMCE.activeEditor.teiIndexData = teiIndexData;
   }*/
   resetCounter(); //for resetting the counter each time this method is called
   return 0;
}

function saveDataToDB() {
   if (!tinyMCE.activeEditor.isDirty())
      return;

   // currently we grab the HTML span formatted data, but eventually we'd like to grab the TEI
   var transcriptionData = getData();

   // currently we store to the portal user's personal data store, but eventually we'd like to
   // store to the transcription repository
   var req = opensocial.newDataRequest();
   req.add(req.newUpdatePersonAppDataRequest("VIEWER", 'trans-' + lastPage.docid + '-' + lastPage.pageid, encodeURIComponent(transcriptionData)));
   req.send(function(data) {
      if (data.hadError()) {
         alert(data.getErrorMessage());
         return;
      }
      alert("Changes are saved.");
      if (gadgets.util.hasFeature('pubsub-2'))
         gadgets.Hub.publish("interedition.transcription.saved", null);
   });
}

function saveToDisc() {
   if ('Blob' in window) {
      var wce_var = tinyMCE.activeEditor.WCE_VAR;
      var fileName = wce_var.loadFileInput ? wce_var.loadFileInput.files[0].name : 'untitled.xml';
      //		var fileName = prompt('Please enter file name to save', 'untitled.xml');
      if (fileName) {
         var textToWrite = getTEI();
         var textFileAsBlob = new Blob([textToWrite], {
            type: 'text/xml'
         });
         if ('msSaveOrOpenBlob' in navigator) {
            navigator.msSaveOrOpenBlob(textFileAsBlob, fileName);
         } else {
            var downloadLink = document.createElement('a');
            downloadLink.download = fileName;
            downloadLink.innerHTML = 'Download File';
            if ('webkitURL' in window) {
               // Chrome allows the link to be clicked without actually adding it to the DOM.
               downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            } else {
               // Firefox requires the link to be added to the DOM before it can be clicked.
               downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
               downloadLink.onclick = destroyClickedElement;
               downloadLink.style.display = 'none';
               document.body.appendChild(downloadLink);
            }
            downloadLink.click();
         }
      }
   } else {
      alert('Your browser does not support the HTML5 Blob.');
   }
};

function destroyClickedElement(event) {
   document.body.removeChild(event.target);
}

function setPreferredFontFamily(fontFamily) {
   $('#wce_editor_ifr').contents().find('#tinymce').css('font-family', fontFamily);
}

function increaseLineHeight() {
   /*
    * var lineheight = document.getElementById($(this)).style.lineHeight; alert(document.getElementsByTagName('textarea')[0].style.lineHeight); document.getElementByTagName('wce_editor').style.lineHeight = "30px";
    */
}

function decreaseLineHeight() {

}

function wceOnContentsChange() {
   //alert(tinyMCE.activeEditor.getContent());
}

function resetCounter() {
   var v = tinyMCE.activeEditor.WCE_VAR;
   if (!v)
      return false;
   // page count
   v.pcnt = 0;
   // line count
   v.lcnt = 1; //Because of the predefined part from the NTVMR
   // counting as r/v
   v.rectoverso = 'true';
   return true;
}

function addMenuItems(ed) {
   //var wceAttr = '';
   var isPreviousActive = false;
   var b = false;
   var pos, posa;
   var oldwce;

   var contextMenu = null;
   var staticMenuCount = 0;
   tinymce.ui.Menu.prototype.Mixins = [{
      init: function() {
         if (this.settings.context == 'contextmenu') contextMenu = this;
      }
   }];

   console.log('fix context menu');
   ed.on('contextmenu', function(event) {
      //return false;
      var ed = $(this)[0];
      var selectedNode = ed.selection.getNode();
      var items = contextMenu.items();
      var menu = new tinymce.ui.Menu({
         items: contextMenu.items().toArray(),
         context: 'newcontextmenu',
         classes: 'contextmenu'
      }).renderTo();
      var type;

      // added my options
      if (selectedNode.getAttribute('wce')) {
         oldwce = selectedNode.getAttribute('wce');
         var pos = oldwce.substring(4).indexOf('&');
         if (pos > -1)
            type = oldwce.substring(4, 4 + pos);
         else
            type = oldwce.substring(4);
         if (type === 'book_number' || type === 'chapter_number' || type === 'verse_number' ||
            type === 'stanza_number' || type === 'line_number' || type === 'verseline_number' ||
            type === 'ritualdirection_number' || type == 'langchange') {
            menu.add({
               text: tinymce.translate('initial_portion'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_partial', 'I');
               }
            });
            menu.add({
               text: tinymce.translate('medial_portion'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_partial', 'M');
               }
            });
            menu.add({
               text: tinymce.translate('final_portion'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_partial', 'F');
               }
            });
            menu.add({
               text: tinymce.translate('remove_partial'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_partial', '');
               }
            });
            menu.add({
               text: '|'
            });
            menu.add({
               text: tinymce.translate('avestan'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'ae');
               }
            });
            menu.add({
               text: tinymce.translate('gujarati'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'gu');
               }
            });
            menu.add({
               text: tinymce.translate('persian'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'fa');
               }
            });
            menu.add({
               text: tinymce.translate('persian_phlv'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'fa-Phlv');
               }
            });
            menu.add({
               text: tinymce.translate('sanskrit'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'sa');
               }
            });
            menu.add({
               text: tinymce.translate('avestan_avst'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'ae-Avst');
               }
            });
            menu.add({
               text: tinymce.translate('avestan_phlv'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'ae-Phlv');
               }
            });
            menu.add({
               text: tinymce.translate('avestan_gujr'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'ae-Gujr');
               }
            });
            menu.add({
               text: tinymce.translate('pahlavi_avst'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'pal-Avst');
               }
            });
            menu.add({
               text: tinymce.translate('pahlavi_phlv'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'pal-Phlv');
               }
            });
            menu.add({
               text: tinymce.translate('pahlavi_gujr'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'pal-Gujr');
               }
            });
            menu.add({
               text: tinymce.translate('pahlavi_phli'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'pal-Phli');
               }
            });
            menu.add({
               text: tinymce.translate('gujarati_arab'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'gu-Arab');
               }
            });
            menu.add({
               text: tinymce.translate('gujarati_gujr'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'gu-Gujr');
               }
            });
            menu.add({
               text: tinymce.translate('arabic'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', 'ar');
               }
            });
            menu.add({
               text: tinymce.translate('removeLanguage'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_set_language', '');
               }
            });
            /*if (type !== 'langchange') {
                menu.add({
                    text: tinymce.translate('removeLanguage'),
                    icon: '',
                    onclick: function () {
                        ed.execCommand('mce_set_language', '');
                    }
                });
            }*/
         } else if (selectedNode.getAttribute('wce').indexOf('break_type=pb') > -1 &&
            selectedNode.textContent.indexOf('PB') > -1) {
            isPreviousActive = (selectedNode.getAttribute('wce').indexOf('hasBreak=yes') > -1);
            menu.add({
               text: '|'
            });
            menu.add({
               text: tinymce.translate('previous_hyphenation'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_previous_hyphenation', true);
               }
            });
            menu.items()[menu.items().length - 1].disabled(isPreviousActive);
            menu.add({
               text: tinymce.translate('no_previous_hyphenation'),
               icon: '',
               onclick: function() {
                  ed.execCommand('mce_previous_hyphenation', false);
               }
            });
            menu.items()[menu.items().length - 1].disabled(!isPreviousActive);
         } else {
            //other selection
            contextMenu.hide();
            return;
         }
      } else {
         contextMenu.hide();
         return;
      }
      menu.renderNew();
      menu.moveTo($(contextMenu.getEl()).position().left, $(contextMenu.getEl()).position().top);
      contextMenu.hide();
   }); //end contextmenu on

   //
   ed.addCommand('mce_set_partial', function(type) {
      ed.execCommand('mce_remove_partial');
      oldwce = ed.selection.getNode().getAttribute('wce');
      ed.selection.getNode().setAttribute('wce', oldwce + '&partial=' + type);
   });
   ed.addCommand('mce_remove_partial', function() {
      oldwce = ed.selection.getNode().getAttribute('wce');
      infoArr = strToArray(oldwce);
      arr = infoArr[0];
      var oldPartValue = arr['partial'] ? arr['partial'] : '';
      ed.selection.getNode().setAttribute('wce', oldwce.replace('&partial=' + oldPartValue, ''));
   });
   ed.addCommand('mce_set_language', function(l) {
      ed.execCommand('mce_remove_language');
      oldwce = ed.selection.getNode().getAttribute('wce');
      ed.selection.getNode().setAttribute('wce', oldwce + '&lang=' + l);
      ed.selection.getNode().setAttribute('lang', l);
   });
   ed.addCommand('mce_remove_language', function() {
      ed.selection.getNode().setAttribute('lang', '');
      oldwce = ed.selection.getNode().getAttribute('wce');
      infoArr = strToArray(oldwce);
      arr = infoArr[0];
      var oldLangValue = arr['lang'] ? arr['lang'] : '';
      ed.selection.getNode().setAttribute('wce', oldwce.replace('&lang=' + oldLangValue, ''));
   });
   ed.addCommand('mce_previous_hyphenation', function(b) {
      pos = oldwce.indexOf("number=");
      var newstring = oldwce.substring(pos + 7);
      var num = newstring.substring(0, newstring.indexOf("&"));
      pos = oldwce.indexOf("rv=");
      newstring = oldwce.substring(pos + 3);
      rv = newstring.substring(0, newstring.indexOf("&"));
      if (b == true) {
         selectedNode.setAttribute('wce', oldwce.replace("hasBreak=no", "hasBreak=yes"));
         selectedNode.innerHTML = ed.WCE_CON.startFormatHtml + '&#8208;<br />PB' + ' ' + num + '' + rv + ed.WCE_CON.endFormatHtml;
      } else {
         selectedNode.setAttribute('wce', oldwce.replace("hasBreak=yes", "hasBreak=no"));
         selectedNode.innerHTML = ed.WCE_CON.startFormatHtml + '<br />PB' + ' ' + num + '' + rv + ed.WCE_CON.endFormatHtml;
      }
   });
}

if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment) {
   Range.prototype.createContextualFragment = function(html) {
      var frag = document.createDocumentFragment(),
         div = document.createElement("div");
      frag.appendChild(div);
      div.outerHTML = html;
      return frag;
   };
}

var strToArray = function(str) {
   if (!str)
      return null;
   var outArr = new Array();

   var arr0 = str.split('@');
   var p1, k0, v0, k1, v, v1, k2, v2, arr1, arr2;
   for (k0 in arr0) {
      v = arr0[k0];
      outArr[k0] = new Array();
      arr1 = v.split('&');
      for (p1 in arr1) {
         v1 = arr1[p1];
         arr2 = v1.split('=');
         if (arr2.length > 0) {
            k2 = arr2[0];
            v2 = arr2[1];
            try {
               outArr[k0][k2] = v2;
            } catch (e) {
               alert(e);
            }
         }
      }
   }
   return outArr;
};
