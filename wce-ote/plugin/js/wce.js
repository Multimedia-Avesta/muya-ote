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

    OTE wird in der Hoffnung, dass es nüzlich sein wird, aber
    OHNE JEDE GEWÄHRLEISTUNG, bereitgestellt; sogar ohne die implizite
    Gewährleistung der MARKTFÄHIGKEIT oder EIGNUNG FÜR EINEN BESTIMMTEN ZWECK.
    Siehe die GNU Lesser General Public License für weitere Details.

    Sie sollten eine Kopie der GNU Lesser General Public License zusammen mit diesem
    Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
*/

parent.tinymce.PluginManager.requireLangPack();

// active Editor
var ed;

// selected wce node
var wce_node;

// add new or only edit a wce node
var add_new_wce_node;

// selected Content
var selected_content;

// selected wce-node text / original text
var wce_node_text = '';

// wce-wce-name-array <span wce="wce_corr@%CE%BBdadffefadvfead" ....
var info_arr = [];

// infomation of other wce_type
var other_info_str = '';

// info arr counter
var item_counter = -1;

// current item ids
var curr_item_id;

var wce_type;
var wceUtils;
var g_mainLang = '';

//for example: use the "corrections" menu if a whole word is highlighted as "gap"
var isCombination = false;

function setConstants(_type) {
   //wce_node = ed.execCommand('getWceNode', false);
   wce_node = ed.WCE_VAR.selectedNode;
   add_new_wce_node = parent.tinymce.activeEditor.windowManager.getParams().add_new_wce_node;
   wceUtils = ed.WCEUtils;

   //Bugfix Fehler #646 Impossible combination: Deficiency + Corrections
   //for other combination can use this
   if (wce_node && ed.WCE_VAR.isSelWholeNode) {
      ed.selection.select(wce_node);
   }
   selected_content = ed.selection.getContent();
}

/**
 *
 */
function wceInfoInit(wp) {
   wce_type = wp;
   if (wce_node) {
      wce_node_text = $(wce_node).text();
      var wceAttr = wce_node.getAttribute('wce');

      if (wceAttr) {
         var arr = wceAttr.split('@');
         var al = arr.length;
         var astr;
         for (var i = 0; i < al; i++) {
            astr = arr[i];
            if (astr.indexOf('__t' + '=' + wce_type) != 0) {
               other_info_str += '@' + astr;
               continue;
            }
            item_counter++;
            info_arr['c' + item_counter] = arr[i];
         }
      }
   } else if (typeof selected_content != 'undefined' && selected_content != null) {
      wce_node_text = selected_content.replace(/<\/?[^>]+>/gi, '');
   }
}

/**
 * read Information from attribute 'wce' and fill the form
 */
function readWceNodeInfo() {
   if (!wce_node)
      return;

   // Information of attribute wce write to Form
   if (info_arr['c' + item_counter] != null) {
      formUnserialize(info_arr['c' + item_counter]);
   }
}

/**
 * @param {string}:
 *            type of wce node
 */
function writeWceNodeInfo(val) {
   if (typeof wce_type == 'undefined') {
      alert('wce_type error');
      return;
   }

   if (!wce_type.match(/corr/)) {
      info_arr = [];
      info_arr[0] = formSerialize();
   }

   var newWceAttr = arrayToString(info_arr);
   if (wce_type != 'note' || other_info_str != '@__t=verse_number') //exception
      newWceAttr += other_info_str;

   var wceID = '';

   if (wce_node != null && newWceAttr == '') {
      if (wceUtils) {
         wceUtils.wceDelNode(ed);
         wceUtils.setWCEVariable(ed);
         wceUtils.redrawContols(ed);
      }
      parent.tinymce.activeEditor.windowManager.close();
      return;
   } else if (newWceAttr == '') {
      parent.tinymce.activeEditor.windowManager.close();
      return;
   }

   var startFormatHtml = ed.WCE_CON.startFormatHtml;
   var endFormatHtml = ed.WCE_CON.endFormatHtml;

   if (add_new_wce_node) {
      // default style
      var wceClass = ' class="' + wce_type + '"';

      /*	if (isCombination) {
      $(wce_node).remove();
      }*/

      // new content
      var new_content;
      var original_text = ' wce_orig="' + encodeURIComponent(selected_content) + '" ';

      switch (wce_type) {
         case 'gap':
            var gap_text = "";
            var gap_unit;
            var gap_extent;
            var gap_id;
            if (document.getElementById('mark_as_supplied').checked == true) { // supplied text
               gap_text = '[' + selected_content + ']';
               //test if in node abbr with overline
               var gap_parent = wce_node;
               var gap_parent_name;
               while (gap_parent) {
                  gap_parent_name = gap_parent.nodeName.toLowerCase();
                  if (gap_parent_name == 'body' || gap_parent_name == 'html') {
                     break;
                  }
                  // Should be redundant now
                  /*if (gap_parent_name == 'span' && gap_parent.className == 'abbr_add_overline') {
                      gap_parent.setAttribute('ext', 'inabbr');
                      wceClass = ' ext="inabbr" ' + wceClass;
                      break;
                  }*/
                  gap_parent = gap_parent.parentNode;
               }
            } else {
               gap_unit = document.getElementById('unit').value;
               gap_extent = document.getElementById('extent').value;
               if (gap_unit == "char") {
                  if (gap_extent != '')
                     gap_text += '[' + gap_extent + ']';
                  else
                     gap_text += '[...]';
               } else if (gap_unit == "line") {
                  // Check for special values
                  if (gap_extent == 'part' || gap_extent == 'unspecified')
                     gap_text += '[...]';
                  else { // get integer value
                     var _extent = parseInt(gap_extent);
                     if (_extent == 0) {
                        gap_text += '[...]';
                     } else {
                        for (var i = 0; i < _extent; i++) {
                           gap_text += '<br/>&crarr;[...]';
                        }
                     }
                     wceUtils.addToCounter(ed, 'lb', _extent);
                  }
                  gap_id = '_2_' + wceUtils.getRandomID(ed, '');
               } else if (gap_unit == "page") {
                  for (var i = 0; i < gap_extent; i++) {
                     gap_text += '<br/>PB<br/>[...]';
                  }
                  gap_id = '_4_' + wceUtils.getRandomID(ed, '');
                  wceUtils.addToCounter(ed, 'pb', gap_extent);
               } else {
                  gap_text = '[...]';
               }
            }
            if (gap_id) {
               wceID = 'id="gap' + gap_id + '" ';
            }

            selected_content = gap_text;
            break;
         case 'brea':
            if (break_type) {
               new_content = wceUtils.getBreakHtml(ed, break_type, break_lbpos, break_indention, 'wce="' + newWceAttr + '"', null);
            } else {
               new_content = 'Error:test'; //TODO: Add error message
            }
            break;
         case 'corr':
            if (document.getElementById('blank_firsthand').checked) {
               selected_content = 'T';
               wceClass = ' class="corr_blank_firsthand"';
            }
            break;
         case 'unclear':
            /*if (selected_content.indexOf('<span') == -1) { // take care of spaces element
                var unclear_text = "";
                for (var i = 0; i < selected_content.length; i++) {
                    if (selected_content.charAt(i) == ' ') {
                        unclear_text += selected_content.charAt(i);
                    } else {
                        unclear_text += selected_content.charAt(i) + '&#x0323;';
                    }
                }
                selected_content = unclear_text;
            }*/
            break;
         case 'note':
            new_content = selected_content + '<span wce="' + newWceAttr + '"' + original_text + wceClass + '>' + startFormatHtml + 'Note' + endFormatHtml + '</span>';
            if (ed.WCE_VAR.isInBE) {
               // wceUtils.insertSpace(ed,32);
               //move cursor outside of BE
               wceUtils.insertSpace(ed);
            }
            break;
         case 'abbr':
            break;
            /*case 'part_abbr':
                selected_content = "(" + selected_content + ")";
                break;*/
         case 'spaces':
            // default
            //selected_content = '&nbsp;';
            new_content = '<span wce="' + newWceAttr + '"' + wceClass + '>' + startFormatHtml + 'sp' + endFormatHtml + '</span>';
            break;
         case 'paratext':
            // default
            selected_content = val;

            // write original_text for breaks and paratext
            new_content = '<span wce="' + newWceAttr + '"' + wceClass + original_text + '>' + startFormatHtml + selected_content + endFormatHtml + '</span>';
            break;
         case 'formatting_capitals':
            //only for formatting_capitals needed
            wceClass = ' class="formatting_capitals"';
            break;
         case 'formatting_ornamentation_other':
            wceClass = ' class="formatting_ornamentation_other"';
            break;
         case 'figure':
            covertext = ed.translate('graphical_element');
            for (var i = 0; i < document.getElementById('extent').value; i++) {
               covertext += '<span class="mceNonEditable brea" wce="__t=brea&amp;__n=&amp;hasBreak=no&amp;break_type=lb&amp;number=&amp;rv=&amp;page_number=&amp;running_title=&amp;facs=&amp;lb_alignment=">' +
                  '<span class="format_start mceNonEditable">‹</span><br />↵<span class="format_end mceNonEditable">›</span></span>' + ed.translate('graphical_element');
            }
            new_content = '<span wce="' + newWceAttr + '"' + wceClass + '>' + startFormatHtml + covertext + endFormatHtml + '</span>';
            break;
         case 'langchange':
            var langValue = document.getElementById('lang').value;
            new_content = '';
            wceClass += ' lang="' + langValue + '"';
            new_content += '<span wce="' + newWceAttr + '"' + wceClass + '">' + selected_content + '</span>';
            new_content += ' ';
            break;
         default:
            break;
      }

      //if new_content is not defined, use default
      if (!new_content) {
         new_content = '<span wce="' + newWceAttr + '"' + wceID + wceClass + original_text + '>' + startFormatHtml + selected_content + endFormatHtml + '</span>';
      }

      //var marker = ed.dom.get('_marker'); //Does not work; intended for editing breaks
      //ed.selection.select(marker, false);

      //Fixed: if the selection range is collapsed and the caret is at the end of a element,
      //then the new element will appear inside of current element and not after the element
      //when one adds a new element via the menu
      var wcevar = ed.WCE_VAR;
      if (wcevar.isc && wcevar.isInBE && wcevar.isCaretAtNodeEnd &&
         (wcevar.type == ed.WCE_CON.formatEnd || wcevar.type === 'chapter_number' || wcevar.type === 'book_number' ||
            wcevar.type === 'verse_number' || wcevar.type === 'stanza_number' || wcevar.type === 'line_number' ||
            wcevar.type === 'verseline_number' || wcevar.type === 'ritualdirection_number' || wcevar.type === 'brea')) {
         var selNode = wcevar.selectedNode;
         if (wcevar.type == ed.WCE_CON.formatEnd) {
            $(new_content).insertAfter(selNode.parentNode);
            //do not know why after insert, a space will be generated after char '>',
            //Therefore format_end need to be reset
            selNode.innerHTML = '&rsaquo;';
         } else {
            $(new_content).insertAfter(selNode);
         }
      } else {
         wceUtils.setContent(ed, new_content);
      }
      if (wce_type == 'gap') {
         if (gap_unit == "line") {
            if (gap_extent !== 'part' && gap_extent !== 'unspecified') {
               if (_extent && _extent > 0) {
                  wceUtils.updateBreakCounter(ed, 'lb', 0);
                  ed.selection.setContent(wceUtils.getBreakHtml(ed, 'lb', null, null, null, gap_id));
               }
               ed.selection.setContent('&nbsp;');
            }
         } else if (gap_unit === "page") {
            wceUtils.updateBreakCounter(ed, 'pb', 0);
            ed.selection.setContent(wceUtils.getBreakHtml(ed, 'pb', null, null, null, gap_id));
            ed.selection.setContent('&nbsp;');
         }

         /*if (document.getElementById('unit').value == "line")
          ed.execCommand('mceAdd_brea', 'lb', 0);
          else if (document.getElementById('unit').value == "page")
          ed.execCommand('mceAdd_brea', 'pb', 0);*/
      }

      if (wceUtils) {
         wceUtils.setWCEVariable(ed);
         wceUtils.redrawContols(ed);
      }
   } else { //edit mode
      // update wce
      if (wce_node != null) {
         if (wce_type == 'paratext') {
            selected_content = wceUtils.wceDelNode(ed, true);
            add_new_wce_node = true;
            return writeWceNodeInfo(val);
         } else if (wce_type == 'corr') {
            if (document.getElementById('blank_firsthand').checked)
               wce_node.innerHTML = startFormatHtml + 'T' + endFormatHtml;
            else
               wceUtils.setInnerHTML(ed, wce_node, $('#original_firsthand_reading').val());
         } else if (wce_type == 'brea') {
            // break type
            //change type
            if (old_break_type != break_type) {
               selected_content = wceUtils.wceDelNode(ed, true);
               add_new_wce_node = true;
               return writeWceNodeInfo(val);
            } else {
               //edit default
               if (break_type == 'lb') {
                  break_indention = wceUtils.getBreakHtml(ed, break_type, break_lbpos, break_indention, 'wce="' + newWceAttr + '"', null, true);
                  wceUtils.setInnerHTML(ed, wce_node, break_indention);
               }
               wceUtils.updateBreakCounter(ed, break_type, document.breakinfo.number.value);
            }
         } else if (wce_type == 'abbr') {
            var abbrClass = 'abbr';
            wce_node.className = abbrClass;
         } else if (wce_type == 'gap') { // edit gap
            selected_content = wceUtils.wceDelNode(ed, true);
            add_new_wce_node = true;
            return writeWceNodeInfo(val);
            /*
            // TODO: Additional break at the end is still missing.
            if (document.getElementById('mark_as_supplied').checked == true) {// supplied text
            	wce_node.textContent = '[' + wce_node.getAttribute('wce_orig') + ']';
            } else {
            	wce_node.removeChild(wce_node.firstChild);
            	// remove old content
            	if (document.getElementById('unit').value == "char") {
            		if (document.getElementById('extent').value != '')
            			wce_node.textContent = '[' + document.getElementById('extent').value + ']';
            		else
            			wce_node.textContent = '[...]';
            	} else if (document.getElementById('unit').value == "line") {
            		for (var i = 0; i < document.getElementById('extent').value; i++) {// generate new content
            			$br = document.createElement('br');
            			wce_node.appendChild($br);
            			$text = document.createTextNode('\u21B5[...]');
            			wce_node.appendChild($text);
            		}
            		wceUtils.addToCounter(ed, 'lb', document.getElementById('extent').value);
            	} else if (document.getElementById('unit').value == "page") {
            		for (var i = 0; i < document.getElementById('extent').value; i++) {
            			$br = document.createElement('br');
            			wce_node.appendChild($br);
            			$text = document.createTextNode('PB');
            			wce_node.appendChild($text);
            			$br = document.createElement('br');
            			wce_node.appendChild($br);
            			$text = document.createTextNode('[...]');
            			wce_node.appendChild($text);
            		}
            		wceUtils.addToCounter(ed, 'pb', document.getElementById('extent').value);
            	} else if (document.getElementById('unit').value == "quire") {
            		for (var i = 0; i < document.getElementById('extent').value; i++) {
            			$br = document.createElement('br');
            			wce_node.appendChild($br);
            			$text = document.createTextNode('QB');
            			wce_node.appendChild($text);
            			$br = document.createElement('br');
            			wce_node.appendChild($br);
            			$text = document.createTextNode('[...]');
            			wce_node.appendChild($text);
            		}
            		wceUtils.addToCounter(ed, 'gb', document.getElementById('extent').value);
            	} else {
            		wce_node.textContent = '[...]';
            	}
            }*/
         } else if (wce_type == 'figure') {
            selected_content = wceUtils.wceDelNode(ed, true);
            add_new_wce_node = true;
            return writeWceNodeInfo(val);
         } else if (wce_type == 'langchange') {
            selected_content = wceUtils.wceDelNode(ed, true);
            add_new_wce_node = true;
            return writeWceNodeInfo(val);
         }
         wce_node.setAttribute('wce', newWceAttr);
      }
   }

   ed.isNotDirty = 0;
   parent.tinymce.activeEditor.windowManager.close();
}

function readDocInfos() {
   var transcriber = '',
      manID = '',
      textID = '',
      folID = '',
      language = '';
   var $head;
   var child;

   ed = parent.tinymce.activeEditor;
   $head = ed.dom.select('header')[0];
   if ($head != null) {
      child = $head.firstChild;
      while (child) {
         switch (child.nodeName.toLowerCase()) {
            case 'trans':
               transcriber = child.textContent.replace(new RegExp(/\"/, 'g'), '');
               break;
            case 'ms':
               manID = child.textContent.replace(new RegExp(/\"/, 'g'), '');
               break;
            case 'book':
               textID = child.textContent;
               break;
            case 'folio':
               folID = child.textContent;
               break;
            case 'language':
               language = child.textContent;
         }
         child = child.nextSibling;
      }
   }
   return [transcriber, manID, textID, folID, language];
}

function writeDocInfos(metadata) {
   var $oldhead, $oldbook, $oldfolio;
   var $header, $tr, $ms, $book, $folio, $language;
   var oldwce, oldnumber, newnumber, oldrv, newrv, posa, posb;
   var newWceAttr;

   ed = parent.tinymce.activeEditor;
   newnumber = metadata[3];
   newrv = metadata[4];
   newWceAttr = '__t=brea&amp;__n=&amp;hasBreak=no&amp;break_type=pb&amp;number=' +
      newnumber + '&amp;rv=' + newrv + '&amp;page_number=&amp;facs=&amp';

   $newDoc = loadXMLString("<TEMP></TEMP>");
   //$newRoot = $newDoc.documentElement;

   $header = $newDoc.createElement('header');
   $tr = $newDoc.createElement('trans');
   $tr.appendChild($tr.ownerDocument.createTextNode(metadata[0].replace(/ /g, "_")));
   $header.appendChild($tr);
   $ms = $newDoc.createElement('ms');
   $ms.appendChild($ms.ownerDocument.createTextNode(metadata[1]));
   $header.appendChild($ms);
   $book = $newDoc.createElement('book');
   $book.appendChild($book.ownerDocument.createTextNode(metadata[2]));
   $header.appendChild($book);
   $folio = $newDoc.createElement('folio');
   $folio.appendChild($book.ownerDocument.createTextNode(newnumber + newrv));
   $header.appendChild($folio);
   $language = $newDoc.createElement('language');
   $language.setAttribute('name', metadata[6]);
   $language.appendChild($language.ownerDocument.createTextNode(metadata[5]));
   $header.appendChild($language);

   // check, whether there is already a header
   $oldhead = ed.dom.select('header')[0];
   if ($oldhead) {
      $oldhead.parentNode.replaceChild($header, $oldhead);
   } else { // empty document or existing one without header
      oldcontent = ed.getContent(); // might be empty (for new documents)
      ed.setContent(xml2String($header) + oldcontent);
   }
   $oldbook = ed.dom.select('span[class="book_number mceNonEditable"]')[0];
   if ($oldbook) {
      $oldbook.firstChild.textContent = metadata[2];
      // TODO: Add ability to change language
   } else { // new or existing old document
      $bookNode = $newDoc.createElement('span');
      $bookNode.setAttribute('class', "book_number");
      $bookNode.setAttribute('wce', "__t=book_number&lang=" + metadata[5]);
      $bookNode.appendChild($bookNode.ownerDocument.createTextNode(metadata[2]));
   }

   $oldfolio = ed.dom.select('span[class="mceNonEditable brea"]')[0];
   if ($oldfolio) {
      if ($oldfolio.getAttribute("wce").indexOf("break_type=pb") == -1) {
         alert("No page break found at beginning of document!")
      } else {
         oldwce = $oldfolio.getAttribute("wce");
         posa = oldwce.indexOf("number=");
         posb = oldwce.substring(posa).indexOf("&");
         oldnumber = oldwce.substring(posa + 7, posa + posb);
         $oldfolio.setAttribute("wce", oldwce.replace("number=" + oldnumber, "number=" + newnumber))

         // Now we look for the rv information
         oldwce = $oldfolio.getAttribute("wce");
         posa = oldwce.indexOf("rv=");
         posb = oldwce.substring(posa).indexOf("&");
         oldrv = oldwce.substring(posa + 3, posa + 4);
         if (oldrv == "&")
            $oldfolio.setAttribute("wce", oldwce.replace("rv=", "rv=" + newrv));
         else
            $oldfolio.setAttribute("wce", oldwce.replace("rv=" + oldrv, "rv=" + newrv));

         for (var i = 0; i < $oldfolio.childNodes.length; i++) {
            if ($oldfolio.childNodes[i].textContent === "PB " + oldnumber + oldrv) {
               $oldfolio.childNodes[i].textContent = "PB " + newnumber + newrv;
            }
         }
      }
   } else {
      oldcontent = ed.getContent();
      ed.setContent(oldcontent + xml2String($bookNode) + wceUtils.getBreakHtml(ed, 'pb', 'lb', null, 'wce="' + newWceAttr + '"', null, false) + ' ');
   }

   if (wceUtils) {
      wceUtils.setWCEVariable(ed);
      wceUtils.redrawContols(ed);
   }

   g_mainLang = metadata[5];
   ed.isNotDirty = 0;
   ed.windowManager.close();
}

function loadXMLString(txt) {
   var xmlDoc;
   if (window.DOMParser) {
      var parser = new DOMParser();
      try {
         xmlDoc = parser.parseFromString(txt, "text/xml");
      } catch (err) {
         Fehlerbehandlung("XML error\n" + err);
      }
   } else {
      // Internet Explorer
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      xmlDoc.loadXML(txt);
   }
   return xmlDoc;
}

function xml2String(xmlNode) {
   try {
      // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
      return (new XMLSerializer()).serializeToString(xmlNode);
   } catch (e) {
      try {
         // Internet Explorer.
         return xmlNode.xml;
      } catch (e) {
         // Other browsers without XML Serializer
         alert('Xmlserializer not supported');
      }
   }
   return false;
}
/*

/**
 * form unserialize
 *
 * @param {String}
 *            attribute wce value of wce-node /*
 */
function formUnserialize(str) {
   $('input:checkbox').prop('checked', false);

   if (str == null || str == '')
      return;

   var arr = str.split('&');
   var kv, k, v;

   for (var i = 2; i < arr.length; i++) {
      kv = arr[i].split('=');
      k = kv[0];
      v = kv[1] == null ? '' : kv[1];
      v = v.replace(/\+/g, ' ');

      if ($('#' + k).attr('type') == 'checkbox') {
         $('#' + k).prop('checked', true);
      } else {
         if (!v)
            continue;
         var dec_v = decodeURIComponent(v);
         if (k == 'corrector_text' && corrector_text_editor) {
            corrector_text_editor.setContent(dec_v);
         } else if (k == 'marginals_text' && marginals_text_editor) {
            marginals_text_editor.setContent(dec_v);
         }
         $('#' + k).val(dec_v);
      }
   }
}

/**
 * form serialize
 *
 * @param {document-form}
 * @param {String}
 *            name of str, example: new corrector, firsthand, ....
 *
 */
function formSerialize(f, wce_name) {
   if (f == null) {
      f = document.forms[0];
   }

   if (typeof wce_name == 'undefined' || wce_name == null) {
      wce_name = '';
   }

   var arr = $(f).find(':input');
   var s = '__t' + '=' + wce_type + '&' + '__n' + '=' + wce_name;
   var a;
   var a_type, a_id;
   for (var i = 0, l = arr.length; i < l; i++) {
      a = $(arr[i]);
      a_type = a.attr('type');
      a_id = a.attr('id');

      if (!a_id || a_id == 'undefined' || a_type == 'reset' || a_id == 'insert' || a_id == 'cancel')
         continue;

      if (a.attr('type') == 'checkbox' && !a.is(':checked'))
         continue;

      if (a.attr('id') == 'corrector_text') {
         s += '&' + a.attr('id') + '=' + encodeURIComponent(corrector_text_editor.getContent());
      } else if (a.attr('id') == 'marginals_text') {
         s += '&' + a.attr('id') + '=' + encodeURIComponent(marginals_text_editor.getContent());
      } else {
         s += '&' + a.attr('id') + '=' + encodeURIComponent(a.val());
      }
   }
   return s;
}

function arrayToString(arr) {
   var s = '';
   for (var p in arr) {
      if (p == null || arr[p] == null || p == 'c-1')
         continue;

      if (s != '') {
         s += '@';
      }
      s += arr[p];
   }
   return s;
}

(function(window, document, undefined) {
   var XBTooltip = function(element, userConf, tooltip) {
      var config = {
         id: userConf.id || undefined,
         className: userConf.className || undefined,
         x: userConf.x || 20,
         y: userConf.y || 20,
         text: userConf.text || undefined
      };
      var over = function(event) {
            tooltip.style.display = "block";
         },
         out = function(event) {
            tooltip.style.display = "none";
         },
         move = function(event) {
            event = event ? event : window.event;
            if (event.pageX == null && event.clientX != null) {
               var doc = document.documentElement,
                  body = document.body;
               event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
               event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
            }
            tooltip.style.top = (event.pageY + config.y) + "px";
            tooltip.style.left = (event.pageX + config.x) + "px";
         }
      if (tooltip === undefined && config.id) {
         tooltip = document.getElementById(config.id);
         if (tooltip)
            tooltip = tooltip.parentNode.removeChild(tooltip)
      }
      if (tooltip === undefined && config.text) {
         tooltip = document.createElement("div");
         if (config.id)
            tooltip.id = config.id;
         tooltip.innerHTML = config.text;
      }
      if (config.className)
         tooltip.className = config.className;
      tooltip = document.body.appendChild(tooltip);
      tooltip.style.position = "absolute";
      element.onmouseover = over;
      element.onmouseout = out;
      element.onmousemove = move;
      over();
   };
   window.XBTooltip = window.XBT = XBTooltip;
})(this, this.document);

function comboBindReturnEvent(id1) {
   var entryEvent = function(e) {
      if (!e) {
         var e = window.event;
      }
      var keyCode = e.keyCode ? e.keyCode : e.charCode ? e.charCode : e.which;
      if (keyCode == 13) {
         $('#' + id1).click();
      }
   };

   //test in firefox, safari, chrome
   if (!parent.tinyMCE.isIE && !parent.tinyMCE.isOpera) {
      $('#' + id1).focus();
      $('select').keydown(function(e) {
         entryEvent(e)
      });
      $(':checkbox').click(function(e) {
         $('#' + id1).focus()
      });
   }
}

function wce_openWindow(txt) {
   var smallwindow;
   if ((smallwindow == null) || (smallwindow.closed)) {
      if (parent.tinyMCE.activeEditor.settings.language == 'de')
         smallwindow = window.open(txt, "_blank",
            "width=800,height=600,resizable=yes,status=no," +
            "menubar=no,location=no,scrollbars=yes,toolbar=no");
      else
         smallwindow = window.open(txt.replace('docu', 'docu_en'), "_blank",
            "width=800,height=600,resizable=yes,status=no," +
            "menubar=no,location=no,scrollbars=yes,toolbar=no");
      smallwindow.opener = parent;
      smallwindow.focus();
   } else {
      smallwindow.focus();
   }
}


/************************************************************************************************************
Editable select
Copyright (C) September 2005  DHTMLGoodies.com, Alf Magne Kalleland

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

Dhtmlgoodies.com., hereby disclaims all copyright interest in this script
written by Alf Magne Kalleland.

Alf Magne Kalleland, 2006
Owner of DHTMLgoodies.com

************************************************************************************************************/


// Path to arrow images
var arrowImage = './img/select_arrow.gif'; // Regular arrow
var arrowImageOver = './img/select_arrow_over.gif'; // Mouse over
var arrowImageDown = './img/select_arrow_down.gif'; // Mouse down


var selectBoxIds = 0;
var currentlyOpenedOptionBox = false;
var editableSelect_activeArrow = false;

function selectBox_switchImageUrl() {
   if (this.src.indexOf(arrowImage) >= 0) {
      this.src = this.src.replace(arrowImage, arrowImageOver);
   } else {
      this.src = this.src.replace(arrowImageOver, arrowImage);
   }
}

function selectBox_showOptions() {
   if (editableSelect_activeArrow && editableSelect_activeArrow != this) {
      editableSelect_activeArrow.src = arrowImage;

   }
   editableSelect_activeArrow = this;

   var numId = this.id.replace(/[^\d]/g, '');
   var optionDiv = document.getElementById('selectBoxOptions' + numId);
   if (optionDiv.style.display == 'block') {
      optionDiv.style.display = 'none';
      if (navigator.userAgent.indexOf('MSIE') >= 0) document.getElementById('selectBoxIframe' + numId).style.display = 'none';
      this.src = arrowImageOver;
   } else {
      optionDiv.style.display = 'block';
      if (navigator.userAgent.indexOf('MSIE') >= 0) document.getElementById('selectBoxIframe' + numId).style.display = 'block';
      this.src = arrowImageDown;
      if (currentlyOpenedOptionBox && currentlyOpenedOptionBox != optionDiv) currentlyOpenedOptionBox.style.display = 'none';
      currentlyOpenedOptionBox = optionDiv;
   }
}

function selectOptionValue() {
   var parentNode = this.parentNode.parentNode;
   var textInput = parentNode.getElementsByTagName('INPUT')[0];
   textInput.value = this.innerHTML;
   this.parentNode.style.display = 'none';
   document.getElementById('arrowSelectBox' + parentNode.id.replace(/[^\d]/g, '')).src = arrowImageOver;

   if (navigator.userAgent.indexOf('MSIE') >= 0) document.getElementById('selectBoxIframe' + parentNode.id.replace(/[^\d]/g, '')).style.display = 'none';

}
var activeOption;

function highlightSelectBoxOption() {
   if (this.style.backgroundColor == '#316AC5') {
      this.style.backgroundColor = '';
      this.style.color = '';
   } else {
      this.style.backgroundColor = '#316AC5';
      this.style.color = '#FFF';
   }

   if (activeOption) {
      activeOption.style.backgroundColor = '';
      activeOption.style.color = '';
   }
   activeOption = this;

}

function createEditableSelect(dest) {
   dest.className = 'selectBoxInput';
   var div = document.createElement('DIV');
   div.style.styleFloat = 'left';
   div.style.width = dest.offsetWidth + 16 + 'px';
   div.style.position = 'relative';
   div.id = 'selectBox' + selectBoxIds;
   var parent = dest.parentNode;
   parent.insertBefore(div, dest);
   div.appendChild(dest);
   div.className = 'selectBox';
   div.style.zIndex = 10000 - selectBoxIds;

   var img = document.createElement('IMG');
   img.src = arrowImage;
   img.className = 'selectBoxArrow';

   img.onmouseover = selectBox_switchImageUrl;
   img.onmouseout = selectBox_switchImageUrl;
   img.onclick = selectBox_showOptions;
   img.id = 'arrowSelectBox' + selectBoxIds;

   div.appendChild(img);

   var optionDiv = document.createElement('DIV');
   optionDiv.id = 'selectBoxOptions' + selectBoxIds;
   optionDiv.className = 'selectBoxOptionContainer';
   optionDiv.style.width = div.offsetWidth - 2 + 'px';
   div.appendChild(optionDiv);

   if (navigator.userAgent.indexOf('MSIE') >= 0) {
      var iframe = document.createElement('<IFRAME src="about:blank" frameborder=0>');
      iframe.style.width = optionDiv.style.width;
      iframe.style.height = optionDiv.offsetHeight + 'px';
      iframe.style.display = 'none';
      iframe.id = 'selectBoxIframe' + selectBoxIds;
      div.appendChild(iframe);
   }

   if (dest.getAttribute('selectBoxOptions')) {
      var options = dest.getAttribute('selectBoxOptions').split(';');
      var optionsTotalHeight = 0;
      var optionArray = new Array();
      for (var no = 0; no < options.length; no++) {
         var anOption = document.createElement('DIV');
         anOption.innerHTML = options[no]; //.replace("_"," ");
         anOption.className = 'selectBoxAnOption';
         anOption.onclick = selectOptionValue;
         anOption.style.width = optionDiv.style.width.replace('px', '') - 2 + 'px';
         anOption.onmouseover = highlightSelectBoxOption;
         optionDiv.appendChild(anOption);
         optionsTotalHeight = optionsTotalHeight + anOption.offsetHeight;
         optionArray.push(anOption);
      }
      if (optionsTotalHeight > optionDiv.offsetHeight) {
         for (var no = 0; no < optionArray.length; no++) {
            optionArray[no].style.width = optionDiv.style.width.replace('px', '') - 22 + 'px';
         }
      }
      optionDiv.style.display = 'none';
      optionDiv.style.visibility = 'visible';
   }

   selectBoxIds = selectBoxIds + 1;
}
