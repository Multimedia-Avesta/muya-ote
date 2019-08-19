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
    OHNE JEDE GEWÄHELEISTUNG, bereitgestellt; sogar ohne die implizite
    Gewährleistung der MARKTFÄHIGKEIT oder EIGNUNG FÜR EINEN BESTIMMTEN ZWECK.
    Siehe die GNU Lesser General Public License für weitere Details.

    Sie sollten eine Kopie der GNU Lesser General Public License zusammen mit diesem
    Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
*/

// setTEIXml
//window.onerror = Fehlerbehandlung;

//pb, cb ,lb with break="no" defined in function html2Tei_mergeWNode();
var wceNodeInsideW = ["hi", "unclear", "gap", "supplied", "w", "abbr", "ex"]; //TODO: more type?
//var defaultHeaderHtml='<header><trans></trans><ms></ms><book></book><folio></folio><language name=""></language></header>';

function Fehlerbehandlung(Nachricht, Datei, Zeile) {
   var Fehler = "Error:\n" + Nachricht + "\n" + Datei + "\n" + Zeile;
   zeigeFehler(Fehler);
   return true;
}

function zeigeFehler(Fehler) {
   alert(Fehler);
}

function getHtmlByTei(inputString, args) {
   var $newDoc, $newRoot, $newRoot;
   var $formatStart, $formatEnd;
   var tinymce_ed = tinymce.activeEditor;
   var alertnotshown = true;
   var alertonlangnotshown = true;
   //tinymce.PluginManager.requireLangPack('wce');

   /*var teiIndexData = {
      'bookNumber': '',
      'witValue': '',
      'manuscriptLang': ''
   };*/

   var gid = 0;
   var g_lineNumber, g_verseNumber, g_stanzaNumber, g_chapterNumber,
       g_bookNumber, g_lineNumber, g_verselineNumber, g_ritualdirectionNumber;

   // As &om; can not be handled we go back to OMISSION
   inputString = inputString.replace(/([\r\n]|<w\s*\/\s*>)/g, '');
   inputString = inputString.replace(/(\s+)/g, ' ');
   inputString = inputString.replace(/>\s</g, '><');
   //inputString=inputString.replace(/<w\s*\/\s*>/g,'');
   inputString = inputString.replace(/&om;/g, "<w>OMISSION</w>"); //for existing transcripts
   inputString = inputString.replace(/&lac;/g, '<gap reason="lacuna" unit="unspecified" extent="unspecified"/>');
   inputString = inputString.replace(/&lacorom;/g, '<gap reason="unspecified" unit="unspecified" extent="unspecified"/>');
   inputString = inputString.replace(/lacuna\/illegible/g, 'unspecified');
   //Trick to solve problem without <w>...</w>
   inputString = inputString.replace('\u00a0', ' ');
   inputString = inputString.replace(/<\/abbr>\s*<abbr\s*/g, '</abbr><w> </w><abbr '); //Fixed #1972

   var getHtmlString = function() {
      var $oldDoc = loadXMLString(inputString);
      if (!$oldDoc) {
         //return '';
      }
      var $oldRoot = $oldDoc.documentElement;

      //validate xml
      if ($oldRoot && $oldRoot.firstChild) {
         var first = $oldRoot.firstChild;
         var error;
         if (first.nodeType == 3 && $oldRoot.nodeName && $oldRoot.nodeName.match(/parsererror/i)) {
            error = first.textContent;
         } else if (first.nodeName && first.nodeName.match(/parsererror/i)) {
            error = first.textContent;
         }

         if (error) {
            Fehlerbehandlung(' XML parser ' + error);
            //return '';
         }
      }

      $newDoc = loadXMLString("<TEMP></TEMP>");
      $newRoot = $newDoc.documentElement;

      //Tei2Html_handleLanguageChange($oldRoot);
      initTeiInput($oldRoot);
      args.inner_hi ? Tei2Html_handleHiNode($oldRoot) : {};

      var childList = $oldRoot.childNodes;
      for (var i = 0, $c, l = childList.length; i < l; i++) {
         $c = childList[i];
         if (!$c) {
            continue;
         } else {
            readAllChildrenOfTeiNode($newRoot, $c);
         }
      }
      addSpaceBeforeVerse($newRoot);
      // DOM to String
      var str = xml2String($newRoot);
      if (!str)
         return '';

      return str;
   };

   var Tei2Html_handleLanguageChange = function($teiNode) {
      var list = [];
      var abNodes = $teiNode.querySelectorAll('ab');
      if (abNodes) {
         var lang = '',
            langNode;
         abNodes.forEach(function(ab) {
            list.push(ab);
         });
      }

      function _change(_change) {
         var _next = _change.nextSibling;
         var _parent = _change.parentNode;
         /*if (_change.getAttribute('type') == 'untransPahlavi' ||
             _change.getAttribute('type') == 'untrans' ||
             _change.getAttribute('type') == 'back' ||
             //_change.getAttribute('type') == 'changeofscript' || MS: Is this necessary?
             _change.getAttribute('type') == '' ||
             _change.getAttribute('type') == 'undefined'
         ) {
             return;
         }*/
         var _del = false;
         //var _del = _parent.firstChild === _change && _parent.childNodes.length == 1; // && !_change.getAttribute('type') === 'stanza';
         /*if (_parent.firstChild === _change && !_parent.getAttribute('xml:lang')) { // && !_change.getAttribute('type') === 'stanza') {
             _del = true;
         }*/
         if (_next) {
            while (_change.firstChild) {
               _parent.insertBefore(_change.firstChild, _next);
            }
         } else {
            while (_change.firstChild) {
               _parent.appendChild(_change.firstChild);
            }
         }
         if (_del) {
            _change.remove();
         }
      }


      list.forEach(function(curr, i) {
         if (curr.getAttribute('type')) {
            _change(curr);
         }
      })
   }

   var addSpaceBeforeVerse = function($htmlNode) {
      if (!$htmlNode || ($htmlNode.nodeType != 1 && $htmlNode.nodeType != 11)) { //nodeType==11 from createDocumentFragment
         return;
      }
      var childList = $htmlNode.childNodes;
      for (var i = 0, $c, l = childList.length; i < l; i++) {
         $c = childList[i];
         if (!$c) {
            continue;
         } else {
            addSpaceBeforeVerse($c);
         }
      }

      if ($($htmlNode).hasClass('verse_number')) {
         var pre = $htmlNode.previousSibling;
         if (pre && pre.nodeType == 3) {
            var preText = pre.nodeValue;
            if (preText && !preText.match(/\s+$/)) {
               pre.nodeValue = preText + ' ';
            }
         }
      }
   };

   //merge <w> which come from wceNodeInsideW
   var initTeiInput = function($parent) {
      if (!$parent || ($parent.nodeType != 1 && $parent.nodeType != 11)) { //nodeType==11 from createDocumentFragment
         return;
      }
      /*if($parent.nodeName=='ab'){
      	var part=$parent.getAttribute('part');
      	if(part && (part=='M' || part=='I') && $parent.lastChild){//Fixed #1896: Hyphen after supplied text
      		var lb=$parent.ownerDocument.createElement('lb');
      		lb.setAttribute('break', 'no');
      		$parent.lastChild.appendChild(lb);
      	}
      }*/
      var tNext = $parent.firstChild;
      while (tNext) {
         initTeiInput(tNext);
         tNext = tNext.nextSibling;
      }
      Tei2Html_mergeWNode($parent);
   };

   var needMovieHiNode = function(_node) {
      var b1 = ['w', 'rdg', 'app'].indexOf(_node.nodeName) > -1;
      var first = _node.firstChild;
      var b2 = first && first.nodeName == 'hi' && !first.nextSibling;
      return b1 && b2;
   }


   var Tei2Html_handleHiNode = function($node) {
      if (!$node || ($node.nodeType != 1 && $node.nodeType != 11)) { //nodeType==11 from createDocumentFragment
         return;
      }

      if ($node.hasChildNodes()) {
         var list = [];
         $node.childNodes.forEach(function(c) {
            list.push(c);
         })
         list.forEach(function(c) {
            Tei2Html_handleHiNode(c);
         });
      }

      if (needMovieHiNode($node, 'hi')) {
         var hi = $node.firstChild;
         while (hi.firstChild) {
            $node.appendChild(hi.firstChild);
         }
         var $pn = $node.parentNode;
         $pn.insertBefore(hi, $node);
         hi.appendChild($node);
         Tei2Html_mergeHiNode($pn, true);
      }
   }

   var Tei2Html_mergeHiNode = function($node) {
      var curr = $node.firstChild;
      var next;
      var toAppend = new Array();
      var startNode;
      var tempspace;
      while (curr) {
         tempspace = null;
         next = curr.nextSibling;
         if (next && next.nodeType == 1 && next.nodeName == 'tempspace') {
            tempspace = next;
            next = next.nextSibling;
         }
         if (curr.nodeName == 'hi' && compareNodes(curr, next)) {
            if (!startNode) {
               startNode = curr;
            }
            if (tempspace) {
               toAppend.push(tempspace);
            }
            toAppend.push(next);
         }
         curr = next;
      }
      if (startNode) {
         for (var i = 0, a, l = toAppend.length; i < l; i++) {
            a = toAppend[i];
            if (a.nodeName == 'tempspace') {
               startNode.appendChild(a);
            } else {
               while (a.firstChild) {
                  startNode.appendChild(a.firstChild);
               }
               a.parentNode.removeChild(a);
            }
         }
      }
   }

   var Tei2Html_mergeWNode = function($node) {
      if (!$node || $node.nodeType == 3 || $node.nodeName != 'w') {
         return;
      }
      var lastChild = $node.lastChild;
      var startNode;
      var nextW = $node.nextSibling;
      var mergeAgain = false;

      if (lastChild && lastChild.nodeType != 3 && lastChild.nodeName != 'abbr') {
         var toAppend = new Array();
         //get nodes to merge
         while (nextW) {
            if (nextW.nodeType == 3 || nextW.nodeName != 'w') {
               break;
            }
            var firstChildOfNextW = nextW.firstChild;
            if (compareNodes(lastChild, firstChildOfNextW)) {
               if (!startNode) {
                  startNode = nextW.previousSibling;
               }
               toAppend.push(nextW);
               if (firstChildOfNextW.nextSibling && !compareNodes(firstChildOfNextW, firstChildOfNextW.nextSibling)) {
                  mergeAgain = true;
                  break;
               }
               nextW = nextW.nextSibling;
            } else {
               break;
            }
         }

         //merge
         if (startNode) {
            for (var i = 0, a, l = toAppend.length; i < l; i++) {
               a = toAppend[i];
               var tempspace = startNode.ownerDocument.createElement('tempspace');
               nodeAddText(tempspace, " ");
               startNode.appendChild(tempspace);
               while (a.firstChild) {
                  startNode.appendChild(a.firstChild);
               }
               a.parentNode.removeChild(a);
            }
            Tei2Html_mergeOtherNodes(startNode, true);

            if (mergeAgain) {
               Tei2Html_mergeWNode(startNode);
            }
         }
      }
   };

   var Tei2Html_mergeOtherNodes = function($node, isW) {
      if (!$node) {
         return;
      }

      if (!isW && $.inArray($node.nodeName, wceNodeInsideW) < 0) {
         return;
      }

      var curr = $node.firstChild;
      var next;
      var toAppend = new Array();
      var startNode;
      var tempspace;
      while (curr) {
         tempspace = null;
         next = curr.nextSibling;
         if (next && next.nodeType == 1 && next.nodeName == 'tempspace') {
            tempspace = next;
            next = next.nextSibling;
         }
         if (compareNodes(curr, next)) {
            if (!startNode) {
               startNode = curr;
            }
            if (tempspace) {
               toAppend.push(tempspace);
            }
            toAppend.push(next);
         }
         curr = next;
      }
      if (startNode) {
         for (var i = 0, a, l = toAppend.length; i < l; i++) {
            a = toAppend[i];
            if (a.nodeName == 'tempspace') {
               startNode.appendChild(a);
            } else {
               while (a.firstChild) {
                  startNode.appendChild(a.firstChild);
               }
               a.parentNode.removeChild(a);
            }
         }
         Tei2Html_mergeOtherNodes(startNode, isW);
         //var wParent=getWParent(startNode);
         //if(wParent){
         //	Tei2Html_mergeWNode(wParent.previousSibling);
         //}
      }
   };

   /**
    * add format_start format end into wce element
    */
   var addFormatElement = function($node, lang) {
      var $firstChild;
      if (!$node)
         return;
      if ($node.nodeType == 1 || $node.nodeType == 11) {
         if ($($node).hasClass('verse_number') || $($node).hasClass('stanza_number') ||
            $($node).hasClass('chapter_number') || $($node).hasClass('book_number') ||
            $($node).hasClass('line_number') || $($node).hasClass('verseline_number') ||
            $($node).hasClass('ritualdirection_number') || $($node).hasClass('langchange')) {
            return;
         }
      }

      $firstChild = $node.firstChild;
      if (!$firstChild)
         return;

      //TODO: Change to single position
      var $start = $newDoc.createElement('span');
      $start.setAttribute('class', 'format_start mceNonEditable');
      /*if (lang && lang !== '')
          $start.setAttribute('language', lang);*/
      nodeAddText($start, '\u2039');

      $node.insertBefore($start, $firstChild);

      var $end = $newDoc.createElement('span');
      $end.setAttribute('class', 'format_end mceNonEditable');
      /*if (lang && lang !== '')
          $end.setAttribute('language', lang);*/
      nodeAddText($end, '\u203a');
      $node.appendChild($end);
   };

   /*
    * add groupid for delete (pb, cb, lb)
    */
   var addGroupID = function($teiNode, _id) {
      if (!$teiNode) {
         return;
      }
      var n = $teiNode.nodeName;
      var i;
      if (n == 'pb') {
         i = '_3_';
      } else if (n == 'cb') {
         i = '_2_';
      } else if (n == 'lb' && _id) {
         i = '';
      } else {
         return;
      }

      if (!$teiNode.getAttribute('id')) {
         if (!_id) {
            _id = i + new Date().getTime() + '' + Math.round(Math.random() * 1000);
         }
         $teiNode.setAttribute('id', n + _id);
         $teiNode = $teiNode.nextSibling;
         addGroupID($teiNode, _id);
      }

   };

   /*
    * read all nodes of $node and change and add
    */
   var readAllChildrenOfTeiNode = function($htmlParent, $teiNode) {
      if (!$teiNode) {
         return;
      }

      if ($teiNode.nodeType == 3) {
         Tei2Html_TEXT($htmlParent, $teiNode);
      } else if ($teiNode.nodeType == 1 || $teiNode.nodeType == 11) {
         //add GroupId to pb, cb lb
         addGroupID($teiNode);

         if ($teiNode.nodeName)
            var $newParent = getHtmlNodeByTeiNode($htmlParent, $teiNode);

         // stop to read $teiNode
         if (!$newParent) {
            // make sure that a *single* gap is followed by a space
            if ($teiNode.nodeName == 'gap' && $teiNode.nextSibling && $teiNode.nextSibling.nodeName !== 'unclear' && $teiNode.nextSibling.nodeValue == null)
               nodeAddText($htmlParent, ' ');
            return;
         }

         if ($newParent && $newParent.nodeName.toLowerCase() == 'span' && !$newParent.firstChild && $htmlParent !== $newParent) {
            var needAddFormat = true;
         }

         var childList = $teiNode.childNodes;
         for (var i = 0, $c, l = childList.length; i < l; i++) {
            $c = childList[i];
            if (!$c) {
               continue;
            } else {
               readAllChildrenOfTeiNode($newParent, $c);
            }
         }

         if (needAddFormat) {
            addFormatElement($newParent);
         }


         if ($teiNode.nodeName == 'w') { //}|| $teiNode.nodeName == 'gap') { //TODO: check
            // Please note: There is *no* word numbering
            var $nextSibling = $teiNode.nextSibling;
            if ($nextSibling && $nextSibling.nodeName == 'note') {
               return;
            }
            var $lastChild = $teiNode.lastChild;
            if ($lastChild && $lastChild.nodeName == 'lb') {
               return;
            }
            nodeAddText($htmlParent, ' ');
         }
      }

   };

   var getDescendants = function(node) {
      var cList = node.childNodes;
      for (var i = 0, c; i < cList.length; i++) {
         c = cList[i];
         if (c.nodeName === 'idno') {
            tinymce.get(tinyMCE.activeEditor.id).settings.witness = c.textContent;
            break;
         }
         getDescendants(c);
      }
      return null;
   }

   /*
    * @new parentNode @ oldNode
    */
   var getHtmlNodeByTeiNode = function($htmlParent, $teiNode) {
      var teiNodeName = $teiNode.nodeName;

      switch (teiNodeName) {
         case 'teiHeader':
            getDescendants($teiNode);
            return null;

            /*         case 'idno':
                        tinymce.get(tinyMCE.activeEditor.id).settings.witness = $teiNode.textContent;
                        alert(tinymce.get(tinyMCE.activeEditor.id).settings.witness);
                        return null;*/

         case 'w':
            return $htmlParent;

         case 'unclear':
            return Tei2Html_unclear($htmlParent, $teiNode);
            // unclear

         case 'div':
            return Tei2Html_div($htmlParent, $teiNode);
            // chapter, book

         case 'gap':
            return Tei2Html_gap_supplied($htmlParent, $teiNode, teiNodeName);
            // gap

         case 'supplied':
            return Tei2Html_gap_supplied($htmlParent, $teiNode, teiNodeName);
            // gap->supplied

         case 'abbr':
            return Tei2Html_abbr($htmlParent, $teiNode, teiNodeName);
            // abbreviation

         case 'expan':
            return null;
            // abbreviation

         case 'comm':
            return Tei2Html_paratext($htmlParent, $teiNode, teiNodeName);
            // paratext

         case 'num':
            return Tei2Html_paratext($htmlParent, $teiNode, 'fw');
            // paratext

         case 'fw':
            return Tei2Html_paratext($htmlParent, $teiNode, teiNodeName);
            // paratext

         case 'ab':
            return Tei2Html_ab($htmlParent, $teiNode);
            // verse

         case 'foreign':
            return Tei2Html_foreign($htmlParent, $teiNode);
            //foreign text

         case 'pc':
            return Tei2Html_pc($htmlParent, $teiNode);
            // pc

         case 'hi':
            return Tei2Html_hi($htmlParent, $teiNode);
            // formatting

         case 'space':
            return Tei2Html_space($htmlParent, $teiNode);
            // spaces

            /*case 'qb':
            	return Tei2Html_break($htmlParent, $teiNode, 'qb');*/
            // Quire break

         case 'pb':
            return Tei2Html_break($htmlParent, $teiNode, 'pb');
            // page break

         case 'lb':
            return Tei2Html_break($htmlParent, $teiNode, 'lb');
            // line break

         case 'note':
            return Tei2Html_note($htmlParent, $teiNode);
            // note

         case 'app':
            return Tei2Html_app($htmlParent, $teiNode);
            // correction

         case 'seg': // marginal information
            if (($teiNode.firstChild && ($teiNode.firstChild.nodeName === 'fw' || $teiNode.firstChild.nodeName === 'num')) ||
               ($teiNode.parentNode && $teiNode.parentNode.nodeName === 'rdg'))
               return $htmlParent;
            else
               return Tei2Html_paratext($htmlParent, $teiNode, 'fw');

         case 'figure':
            return Tei2Html_figure($htmlParent, $teiNode);

         default:
            return $htmlParent;
      }

   };

   /*
    *
    *
    */
   var getWceAttributeByTei = function($teiNode, mapping) {
      var wceAttr = '';

      var attribute, attrName, attrValue;
      for (var i = 0, obj, l = $teiNode.attributes.length; i < l; i++) {
         attribute = $teiNode.attributes[i];
         attrName = attribute.nodeName;
         attrValue = attribute.nodeValue;
         obj = mapping[attrName];
         if (!obj) {
            continue;
         }

         if (typeof obj == 'string') {
            wceAttr += obj + attrValue;
         } else if (typeof obj == 'object') {
            if (obj['0'].indexOf('@' + attrValue) > -1) {
               wceAttr += obj['1'] + attrValue;
            } else {
               wceAttr += obj['2'] + attrValue;
            }
         }
      }

      return wceAttr;
   };

   /*
    * create TEI by Html-TextNode
    */
   var Tei2Html_TEXT = function($htmlParent, $teiNode) {
      var textValue = $teiNode.nodeValue;
      var oldNodeParentName = $teiNode.parentNode.nodeName;

      if (oldNodeParentName == 'ex') {
         // ex
         textValue = '(' + textValue + ')';
      } else if (oldNodeParentName == 'unclear') {
         // unclear
         /*var unclear_text = "";
         for (var i = 0, ch, l = textValue.length; i < l; i++) {
             ch = textValue.charAt(i);
             if (ch == ' ') {
                 unclear_text += ch;
             } else {
                 unclear_text += ch + '\u0323';
             }
         }
         textValue = unclear_text;*/
      }

      nodeAddText($htmlParent, textValue);
   };

   /*
    * **** <ex>
    */
   /*var Tei2Html_ex = function($htmlParent, $teiNode) {
   	var $newNode = $newDoc.createElement('span');
   	$newNode.setAttribute('class', 'part_abbr');
   	var wceAttr = '__t=part_abbr&__n=';
   	var rend = $teiNode.getAttribute('rend');
   	if (rend) {
   		switch (rend) {
   			case '̅':
   			case 'ę':
   			case '÷':
   			case 'ƕ':
   			case '⧺':
   			case 'ə':
   			case '&':
   			case 'ϗ':
   			case '⁊':
   			case '∸':
   				wceAttr += '&exp_rend_other=&exp_rend=';
   				break;
   			default:
   				wceAttr += '&exp_rend=other&exp_rend_other=';
   		}
   		wceAttr += encodeURIComponent(rend);
   	} else {
   		wceAttr += '&exp_rend=&exp_rend_other='
   	}
   	$newNode.setAttribute('wce', wceAttr);
   	addFormatElement($newNode);
   	$htmlParent.appendChild($newNode);
   	return $newNode;
   };*/
   /*
    * **** <unclear>
    */
   var Tei2Html_unclear = function($htmlParent, $teiNode) {
      var $newNode = $newDoc.createElement('span');
      $newNode.setAttribute('class', 'unclear');
      var wceAttr = '__t=unclear&__n=';

      $newNode.setAttribute('wce_orig', $teiNode.firstChild && $teiNode.firstChild.nodeValue ? $teiNode.firstChild.nodeValue : '');

      var reason = ($teiNode.getAttribute('reason') ? $teiNode.getAttribute('reason') : '');
      if (reason === '') { // no reason given
         wceAttr += '&unclear_text_reason=&unclear_text_reason_other=';
      } else {
         switch (reason) {
            case 'poor_image':
            case 'faded_ink':
            case 'damage_to_page':
            case 'covered_by_tape':
            case 'overwritten':
                  wceAttr += '&unclear_text_reason=' + reason.replace(/_/g, " ") + '&unclear_text_reason_other=';
               break;
            default:
                  wceAttr += '&unclear_text_reason=other&unclear_text_reason_other=' + reason;
               break;
         }
      }
      $newNode.setAttribute('wce', wceAttr);
      addFormatElement($newNode);

      //add wce_orig 28.10.2013 YG
      var s = getOriginalTextByTeiNode($teiNode);
      s = s.replace(/\%CC\%A3/g, '');
      $newNode.setAttribute('wce_orig', s);

      $htmlParent.appendChild($newNode);
      return $newNode;
   };

   /*
    * *** <div>
    */
   var Tei2Html_div = function($htmlParent, $teiNode) {
      // <div type="chapter" n="1">
      var divType = $teiNode.getAttribute('type');
      if (!divType)
         return $htmlParent;

      var partValue = $teiNode.getAttribute('part') ? $teiNode.getAttribute('part') : '';
      var langValue = $teiNode.getAttribute('xml:lang') ? $teiNode.getAttribute('xml:lang') : '';
      if (isOther(langValue)) {
         if (alertonlangnotshown) {
            alert("Please note: The \"other\" value for xml:lang is no longer supported.\nExisting entries have been removed.");
            alertonlangnotshown = false;
         }
         langValue = '';
      }
      var nValue = $teiNode.getAttribute('n') ? $teiNode.getAttribute('n') : '';
      if (divType === 'book') {
         var $newNode = $newDoc.createElement('span');
         $newNode.setAttribute('class', 'book_number mceNonEditable');
         $newNode.setAttribute('lang', langValue);
         var wceAttr = '__t=book_number';
         wceAttr += '&partial=' + partValue;
         wceAttr += '&lang=' + langValue;
         wceAttr += '&n=' + nValue;
         $newNode.setAttribute('wce', wceAttr);
         $newNode.setAttribute('id', ++gid);
         if (nValue !== '')
            nodeAddText($newNode, nValue);
      } else if (divType === 'chapter') {
         var $newNode = $newDoc.createElement('span');
         $newNode.setAttribute('class', 'chapter_number mceNonEditable');
         $newNode.setAttribute('lang', langValue);
         var wceAttr = '__t=chapter_number';
         wceAttr += '&partial=' + partValue;
         wceAttr += '&lang=' + langValue;
         wceAttr += '&n=' + nValue;
         $newNode.setAttribute('wce', wceAttr);
         $newNode.setAttribute('id', ++gid);
         if (nValue !== '')
            nodeAddText($newNode, nValue.substr(nValue.lastIndexOf('.') + 1));
      } else if (divType === 'stanza') {
         var $newNode = $newDoc.createElement('span');
         $newNode.setAttribute('class', 'stanza_number mceNonEditable');
         $newNode.setAttribute('lang', langValue);
         var wceAttr = '__t=stanza_number';
         wceAttr += '&partial=' + partValue;
         wceAttr += '&lang=' + langValue;
         wceAttr += '&n=' + nValue;
         $newNode.setAttribute('wce', wceAttr);
         if (nValue !== '') {
            nodeAddText($newNode, nValue.substr(nValue.lastIndexOf('.') + 1));
         }
      } else if (divType === 'verse') { // Verse
         var $newNode = $newDoc.createElement('span');
         var type = $teiNode.getAttribute('type');
         $newNode.setAttribute('class', 'verse_number mceNonEditable');
         $newNode.setAttribute('lang', langValue);
         var wceAttr = '__t=verse_number';
         wceAttr += '&partial=' + partValue;
         wceAttr += '&lang=' + langValue;
         wceAttr += '&n=' + nValue;
         $newNode.setAttribute('wce', wceAttr);
         if (nValue !== '')
            nodeAddText($newNode, nValue.substr(nValue.lastIndexOf('.') + 1));
      }
      addFormatElement($newNode);
      var pre = $htmlParent.previousSibling;
      if (!pre || (!pre.nodeType === 3 && pre.nodeName !== 'w')) { //add a space before book number
         nodeAddText($htmlParent, ' ');
      }
      $htmlParent.appendChild($newNode);
      nodeAddText($htmlParent, ' ');
      return $htmlParent;
   };
   /*
    * <ab>
    */
   var Tei2Html_ab = function($htmlParent, $teiNode) {
      var type = $teiNode.getAttribute("type");
      var partValue = $teiNode.getAttribute('part') ? $teiNode.getAttribute('part') : '';
      var langValue = $teiNode.getAttribute('xml:lang') ? $teiNode.getAttribute('xml:lang') : '';
      if (isOther(langValue)) {
         if (alertonlangnotshown) {
            alert("Please note: The \"other\" value for xml:lang is no longer supported.\nExisting entries have been removed.");
            alertonlangnotshown = false;
         }
         langValue = '';
      }
      var nValue = $teiNode.getAttribute('n') ? $teiNode.getAttribute('n') : '';

      if (type && type === 'line') { // line
         var $newNode = $newDoc.createElement('span');
         $newNode.setAttribute('class', 'line_number mceNonEditable');
         $newNode.setAttribute('lang', langValue);
         var wceAttr = '__t=line_number';
         wceAttr += '&partial=' + partValue;
         wceAttr += '&lang=' + langValue;
         wceAttr += '&n=' + nValue;
         $newNode.setAttribute('wce', wceAttr);
         if (nValue !== '')
            nodeAddText($newNode, nValue.substr(nValue.lastIndexOf('.') + 1));
         $htmlParent.appendChild($newNode);
         nodeAddText($htmlParent, ' ');
         return $htmlParent;
      } else if (type && type === 'verseline') { // verseline
         var $newNode = $newDoc.createElement('span');
         $newNode.setAttribute('class', 'verseline_number mceNonEditable');
         $newNode.setAttribute('lang', langValue);
         var wceAttr = '__t=verseline_number';
         wceAttr += '&partial=' + partValue;
         wceAttr += '&lang=' + langValue;
         wceAttr += '&n=' + nValue;
         $newNode.setAttribute('wce', wceAttr);
         if (nValue !== '')
            nodeAddText($newNode, nValue.substr(nValue.lastIndexOf('.') + 1));
         $htmlParent.appendChild($newNode);
         nodeAddText($htmlParent, ' ');
         return $htmlParent;
      } else if (type && type === 'ritualdirection') { // ritualdirection
         var $newNode = $newDoc.createElement('span');
         $newNode.setAttribute('class', 'ritualdirection_number mceNonEditable');
         $newNode.setAttribute('lang', langValue);
         var wceAttr = '__t=ritualdirection_number';
         wceAttr += '&partial=' + partValue;
         wceAttr += '&lang=' + langValue;
         wceAttr += '&n=' + nValue;
         $newNode.setAttribute('wce', wceAttr);
         if (nValue !== '')
            nodeAddText($newNode, nValue.substr(nValue.lastIndexOf('.') + 1));
         $htmlParent.appendChild($newNode);
         nodeAddText($htmlParent, ' ');
         return $htmlParent;
      } else { //translation or section or other
         var $newNode = $newDoc.createElement('span');
         $newNode.setAttribute('class', 'langchange');
         $newNode.setAttribute('lang', langValue);
         var wceAttr = '__t=langchange'
         if (type)
            if (type == 'translation' || type == 'section')
               wceAttr += '&reason_for_language_change=' + type;
            else {
               alert("Unknown @type for <ab> found. This will be converted to 'other'.");
               wceAttr += '&reason_for_language_change=other';
            }
         else {
            if (alertnotshown) {
               alert("There are <ab> elements without @type attribute in the XML. @type is set to 'other'.");
               alertnotshown = false;
            }
            wceAttr += '&reason_for_language_change=other';
         }
         wceAttr += '&partial=' + partValue;
         wceAttr += '&lang=' + langValue;
         $newNode.setAttribute('wce', wceAttr);
         $htmlParent.appendChild($newNode);
         nodeAddText($htmlParent, ' ');
         return $newNode;
      }
   };

   var Tei2Html_foreign = function($htmlParent, $teiNode) {
      var $newNode = $newDoc.createElement('span');
      var partValue = $teiNode.getAttribute('part') ? $teiNode.getAttribute('part') : '';
      var langValue = $teiNode.getAttribute('xml:lang') ? $teiNode.getAttribute('xml:lang') : '';
      if (isOther(langValue)) {
         if (alertonlangnotshown) {
            alert("Please note: The \"other\" value for xml:lang is no longer supported.\nExisting entries have been removed.");
            alertonlangnotshown = false;
         }
         langValue = '';
      }
      $newNode.setAttribute('class', 'langchange');
      $newNode.setAttribute('lang', langValue);

      var wceAttr = '__t=langchange'

      wceAttr += '&reason_for_language_change=other';
      wceAttr += '&partial=' + partValue;
      wceAttr += '&lang=' + langValue;
      $newNode.setAttribute('wce', wceAttr);

      //addFormatElement($newNode);
      $htmlParent.appendChild($newNode);
      nodeAddText($htmlParent, ' ');
      return $newNode;
   };

   /*
    * <pc>
    */
   var Tei2Html_pc = function($htmlParent, $teiNode) {
      var $newNode = $newDoc.createElement('span');

      $newNode.setAttribute('class', 'pc');
      if ($teiNode.getAttribute('type')) {
         $newNode.setAttribute('wce', '__t=pc&note=' + encodeURIComponent($teiNode.firstChild.nodeValue));
         nodeAddText($newNode, 'P+999');
         addFormatElement($newNode);
         $htmlParent.appendChild($newNode);
         nodeAddText($htmlParent, ' ');
         return null;
      } else {
         $newNode.setAttribute('wce', '__t=pc');
         addFormatElement($newNode);
         $htmlParent.appendChild($newNode);
         nodeAddText($htmlParent, ' ');
         return $newNode;
      }
   };

   /*
    * <gap> / <supplied>
    */
   var Tei2Html_gap_supplied = function($htmlParent, $teiNode, teiNodeName) {
      // <gap reason="lacuna" unit="char" />
      var ed = parent.tinymce.activeEditor;
      var $newNode = $newDoc.createElement('span');

      var extAttr = $teiNode.getAttribute('ext');
      if (extAttr) { //supplied text in abbr
         $newNode.setAttribute('ext', extAttr);
      }

      $newNode.setAttribute('class', 'gap');
      // for gap *and* supplied

      var wceAttr = '__t=gap&__n=' +
         '&gap_reason_dummy_editorial=editorial' +
         '&gap_reason_dummy_lacuna=lacuna' +
         '&gap_reason_dummy_illegible=illegible' +
         '&gap_reason_dummy_unspecified=unspecified' +
         '&gap_reason_dummy_inferredPage=inferredPage' +
         '&gap_reason_dummy_paperRepaired=paperRepaired' +
         '&gap_reason_dummy_abbreviatedText=abbreviatedText';
      var mapping = {
         'reason': '&gap_reason=',
         'unit': {
            '0': '@char@line@page@book@chapter@verse@stanza@structural_line@word@unspecified',
            '1': '&unit_other=&unit=',
            '2': '&unit=other&unit_other='
         },
         'extent': '&extent=',
         'quantity': '&extent=', //TODO: This could be a problem, when extent _and_ quantity are given
         'source': {
            '0': '@transcriber@restorer',
            '1': '&supplied_source_other=&supplied_source=',
            '2': '&supplied_source=other&&supplied_source_other='
         }
      };
      wceAttr += getWceAttributeByTei($teiNode, mapping);
      // In case there is no unit given, we have to fix that. Otherwise we'll get a lot of "undefined" values
      if (!$teiNode.getAttribute('unit'))
         wceAttr += '&unit_other=&unit=';
      if (teiNodeName === 'supplied') {
         wceAttr += '&mark_as_supplied=supplied';
         $newNode.setAttribute('wce_orig', $teiNode.firstChild ? $teiNode.firstChild.nodeValue : '');
         // get the content and save it as original
         // for an empty source we have to add the "none" value
         if (!$teiNode.getAttribute('source'))
            wceAttr += '&supplied_source_other=&supplied_source=none';
      }
      var lang = $teiNode.getAttribute("xml:lang") ? $teiNode.getAttribute("xml:lang") : '';
      if (isOther(lang)) {
         if (alertonlangnotshown) {
            alert("Please note: The \"other\" value for xml:lang is no longer supported.\nExisting entries have been removed.");
            alertonlangnotshown = false;
         }
         lang = '';
      }
      wceAttr += '&untranscribed_language=' + lang;
      $newNode.setAttribute('wce', wceAttr);
      if (teiNodeName === 'supplied') { // supplied
         var $tempParent = $newDoc.createElement('t');
         var cList = $teiNode.childNodes;
         for (var i = 0, c, l = cList.length; i < l; i++) {
            c = cList[i];
            if (!c) {
               break;
            }
            if (c.nodeType == 3)
               nodeAddText($tempParent, c.nodeValue);
            else
               readAllChildrenOfTeiNode($tempParent, c);
         }

         if ($tempParent) {
            nodeAddText($newNode, '[');
            while ($tempParent.hasChildNodes()) {
               $newNode.appendChild($tempParent.firstChild);
            }
            nodeAddText($newNode, ']');
         }
      } else { // gap
         var gap_text = '';
         var reason = $teiNode.getAttribute("reason");
         var extent = $teiNode.getAttribute("extent") ? $teiNode.getAttribute("extent") : '';
         if (extent === '') {
            extent = $teiNode.getAttribute("quantity") ? $teiNode.getAttribute("quantity") : '';
         }
         var _extent = (extent === '') ? 0 : parseInt(extent);
         var unit = $teiNode.getAttribute("unit") ? $teiNode.getAttribute("unit") : '';

         if (unit === "char") {
            if (extent !== '')
               nodeAddText($newNode, '[' + decodeURIComponent(extent) + ']');
            else
               nodeAddText($newNode, '[...]');
         } else if (unit === "line") {
            // TODO: numbering
            if (extent === 'part' || extent === 'unspecified')
               nodeAddText($newNode, '[...]');
            else {
               nodeAddText($newNode, '[...]');
               for (var i = 0; i < _extent; i++) {
                  $br = $newDoc.createElement('br');
                  $newNode.appendChild($br);
                  nodeAddText($newNode, '\u21B5[...]');
               }
            }
         } else if (unit === "page") {
            // TODO: numbering
            for (var i = 0; i < _extent; i++) {
               $br = $newDoc.createElement('br');
               $newNode.appendChild($br);
               nodeAddText($newNode, 'PB');
               $br = $newDoc.createElement('br');
               $newNode.appendChild($br);
               nodeAddText($newNode, '[...]');
            }
         } else {
            nodeAddText($newNode, '[...]');
         }
      }

      addFormatElement($newNode);
      //var s=getOriginalTextByTeiNode($teiNode); alert(s);
      //$newNode.setAttribute('wce_orig', s);//TODO: test wce_orig
      $htmlParent.appendChild($newNode);
      if (!ed.WCE_VAR.isc)
         nodeAddText($htmlParent, ' ');
      return null;
   };

   /*
    * <hi>
    */
   var Tei2Html_hi = function($htmlParent, $teiNode) {
      var className, wceValue;
      var $newNode = $newDoc.createElement('span');
      var rendValue = $teiNode.getAttribute('rend');
      if (!rendValue) {
         return null;
      }

      switch (rendValue) {
         case 'rubric':
            className = 'formatting_rubrication';
            break;
         case 'gold':
            className = 'formatting_gold';
            break;
         case 'blue':
            className = 'formatting_blue';
            break;
         case 'green':
            className = 'formatting_green';
            break;
         case 'yellow':
            className = 'formatting_yellow';
            break;
         case 'other':
            className = 'formatting_other';
            break;
         case 'cap':
            className = 'formatting_capitals';
            var height = $teiNode.getAttribute('height');
            break;
         case 'ol':
            // for compatibility
            className = 'formatting_overline';
            break;
         case 'overline':
            // recent option
            className = 'formatting_overline';
            break;
         case 'displaced-above':
            className = 'formatting_displaced-above';
            break;
         case 'displaced-below':
            className = 'formatting_displaced-below';
            break;
         case 'displaced-other':
            className = 'formatting_displaced-other';
            break;
         case 'subscript':
            className = 'formatting_subscript';
            break;
         case 'superscript':
            className = 'formatting_superscript';
            break;
         case 'upsidedown':
            className = 'formatting_upsidedown';
            break;
         default:
            className = 'formatting_ornamentation_other';
            wceValue = '__t=formatting_ornamentation_other&__n=&formatting_ornamentation_other=' + rendValue;
            break;
      }
      if (!className)
         return null;

      $newNode.setAttribute('class', className);
      wceValue = wceValue ? wceValue : '__t=' + className;
      if (height)
         wceValue += '&__n=&capitals_height=' + height;
      $newNode.setAttribute('wce', wceValue);
      $newNode.setAttribute('wce_orig', getOriginalTextByTeiNode($teiNode));
      addFormatElement($newNode);
      $htmlParent.appendChild($newNode);
      return $newNode;
   };

   /*
    * <abbr> /
    */
   var Tei2Html_abbr = function($htmlParent, $teiNode, teiNodeName) {
      var $newNode = $newDoc.createElement('span');

      // <abbr type="nomSac"> <hi rend="ol">aaa</hi> </abbr>
      // <span class="abbr_add_overline"
      // wce_orig="aaa" wce="__t=abbr&amp;__n=&amp;original_abbr_text=&amp;abbr_type=nomSac&amp;abbr_type_other=&amp;add_overline=overline">aaa</span>
      //var cList = $teiNode.childNodes;
      var className = teiNodeName;

      //var overlineCheckboxValue = '';
      var startlist, cList;
      var wceAttr = '__t=abbr&__n=&original_abbr_text=';
      var mapping = {
         'type': {
            '0': '@suspension',
            '1': '&abbr_type_other=&abbr_type=',
            '2': '&abbr_type=other&abbr_type_other='
         }
      };

      var toMerge;
      var _moveSupplied = function(_supp) {
         var _hi = _supp.firstChild;
         if (_supp.nodeName != 'supplied' || !_hi || _hi.nodeName != 'hi' || !_hi.getAttribute('rend') || _hi.getAttribute('rend') != 'overline' || _supp.nodeName != 'unclear') {
            return;
         }
         _supp.setAttribute('ext', 'inabbr');
         toMerge = true;
         var _deep, _temp = _hi;
         while (_temp) {
            if (_temp.nodeType == 3) {
               break;
            }
            _deep = _temp;
            _temp = _temp.firstChild;
         }
         _supp.parentNode.insertBefore(_hi, _supp);
         while (_deep.firstChild) {
            _supp.appendChild(_deep.firstChild);
         }
         _deep.appendChild(_supp);

      };

      var cList = $teiNode.childNodes;
      //test if supplied under overline hi
      for (var i = 0, c, l = cList.length; i < l; i++) {
         c = cList[i];
         if (!c) {
            continue;
         }
         _moveSupplied(c);
      }
      //Redundant?
      if (toMerge) {
         className = 'abbr_add_overline';
         wceAttr += '&add_overline=overline';
         $newNode.setAttribute('ext', 'inabbr');
         Tei2Html_mergeOtherNodes($teiNode);
         cList = $teiNode.firstChild.childNodes;
      }

      $newNode.setAttribute('class', className);

      wceAttr += getWceAttributeByTei($teiNode, mapping);
      var expansion = '';
      var $parentnode = $teiNode.parentNode;
      if ($parentnode && $parentnode.nodeName == "choice")
         if ($teiNode.previousSibling.nodeName == "expan")
            var expansion = $teiNode.previousSibling.firstChild.textContent;
      wceAttr += '&abbr_expansion=' + encodeURIComponent(expansion);
      $newNode.setAttribute('wce', wceAttr);

      var $tempParent = $newDoc.createElement('t');
      for (var i = 0, c, l = cList.length; i < l; i++) {
         c = cList[i];
         if (!c) {
            break;
         }
         if (c.nodeType == 3)
            nodeAddText($tempParent, c.nodeValue);
         else
            readAllChildrenOfTeiNode($tempParent, c);
      }

      if ($tempParent) {
         while ($tempParent.firstChild) {
            $newNode.appendChild($tempParent.firstChild);
         }
      }

      addFormatElement($newNode);
      $newNode.setAttribute('wce_orig', getOriginalTextByTeiNode($teiNode));
      $htmlParent.appendChild($newNode);
      return null;
   };

   /*
    * <space>
    */
   var Tei2Html_space = function($htmlParent, $teiNode) {

      var $newNode = $newDoc.createElement('span');
      $newNode.setAttribute('class', 'spaces');
      // set span attribute wce
      var wceAttr = '__t=spaces&__n=';
      var mapping = {
         'unit': {
            '0': '@char@line',
            '1': '&sp_unit_other=&sp_unit=',
            '2': '&sp_unit=other&sp_unit_other='
         },
         'extent': '&sp_extent=',
         'quantity': '&sp_extent='
      };
      wceAttr += getWceAttributeByTei($teiNode, mapping);
      $newNode.setAttribute('wce', wceAttr);
      nodeAddText($newNode, 'sp');
      addFormatElement($newNode);
      $htmlParent.appendChild($newNode);
      nodeAddText($htmlParent, ' ');
      return null;
   };

   /*
    * <lb>
    */
   var Tei2Html_break = function($htmlParent, $teiNode, type) {
      //
      // <span class="mceNonEditable brea" wce="__t=brea&amp;__n=&amp;break_type=lb&amp;number=2&amp;pb_type=&amp;fibre_type=&amp;running_title=&amp;lb_alignment=&amp;insert=Insert&amp;cancel=Cancel"> - <br /> </span>
      //
      var $newNode = $newDoc.createElement('span');
      var cl = 0;
      var paratexttype;
      var $temp;

      $newNode.setAttribute('class', 'mceNonEditable brea');
      var _id = $teiNode.getAttribute('id');
      if (_id) {
         $newNode.setAttribute('id', _id);
      }

      // For all types of breaks
      var wceAttr = '__t=brea&__n=&break_type=' + type + '';

      switch (type) {
         case 'pb':
            // page break
            // Write information to header first
            var folio;
            var $folio, $header;
            var number, page_type;
            var n = '';

            number = $teiNode.getAttribute('n') ? $teiNode.getAttribute('n') : '';
            if (number !== '') {
               n = number.substring(1, number.lastIndexOf("-"));
               number = number.substring(1, number.lastIndexOf("-"));
            }
            var page_type = $teiNode.getAttribute('type');
            if (page_type) {
               if (page_type === "page") {
                  wceAttr += '&number=' + number + '&rv=';
               } else { //folio
                  wceAttr += '&number=' + number.substring(0, number.length - 1) + '&rv=' + number.substring(number.length - 1);
               }
            }
            wceAttr += '&facs=';
            if ($teiNode.getAttribute('facs'))
               wceAttr += $teiNode.getAttribute('facs');
            wceAttr += '&lb_alignment=';
            break;
         case 'lb':
            wceAttr += '&number=';
            var n = '';
            if ($teiNode.getAttribute('n')) {
               var ntemp = $teiNode.getAttribute('n');
               var start = ntemp.lastIndexOf("L");
               var end = ntemp.lastIndexOf("-");
               if (end - start > 1)
                  n = parseInt($teiNode.getAttribute('n').substring(start + 1, end));
            }
            wceAttr += n;
            g_lineNumber = n;
            wceAttr += '&lb_alignment=';
            if ($teiNode.getAttribute('rend'))
               wceAttr += $teiNode.getAttribute('rend');
            wceAttr += '&rv=&facs=';
            break;
      }

      var hasBreak = false;
      var breakValue = $teiNode.getAttribute('break');
      if (breakValue && breakValue == 'no') { // attribute break="no" exists
         wceAttr += '&hasBreak=yes';
         hasBreak = true;
         nodeAddText($newNode, '\u002D');
      } else {
         wceAttr += '&hasBreak=no';
      }

      $newNode.setAttribute('wce', wceAttr);

      switch (type) {
         case 'pb':
            // page break
            var $br = $newDoc.createElement('br');
            $newNode.appendChild($br);
            nodeAddText($newNode, 'PB' + ' ' + n);
            break;
         case 'lb':
            // line break
            var $br = $newDoc.createElement('br');
            $newNode.appendChild($br);
            if ($teiNode.getAttribute("rend") && $teiNode.getAttribute("rend") === "indent")
               nodeAddText($newNode, '\u21B5\u2192' + ' ' + n);
            else if ($teiNode.getAttribute("rend") && $teiNode.getAttribute("rend") === "hang")
               nodeAddText($newNode, '\u21B5\u2190' + ' ' + n);
            else
               nodeAddText($newNode, '\u21B5' + ' ' + n);

            //
            //test, if the textnode after lb hat a space, if not, add a space
            if (!hasBreak) {
               //test previous pb/qb/cb;
               var pre = $teiNode.previousSibling;
               while (pre) {
                  if (pre.nodeType != 3) {
                     if (pre.getAttribute('break') && pre.getAttribute('break') == 'no') {
                        hasBreak = true;
                        break;
                     }
                  }
                  pre = pre.previousSibling;
               }
               if (!hasBreak) {
                  var $nextNode = $teiNode.nextSibling;
                  if ($nextNode && $nextNode.nodeType == 3) {
                     var nextText = $nextNode.nodeValue;
                     if (nextText && !startHasSpace(nextText)) {
                        $nextNode.nodeValue = ' ' + nextText;
                     }
                  }
               }
            }
            break;
      }
      addFormatElement($newNode);
      $htmlParent.appendChild($newNode);

      if ($teiNode.nextSibling && $teiNode.nextSibling.nodeName === 'w') {
         // add space only if new word follows
         nodeAddText($htmlParent, ' ');
      }
      return null;
   };

   /*
    * <com> / <fw> / <num
    */
   var Tei2Html_paratext = function($htmlParent, $teiNode, teiNodeName) {
      // <comm type="commentary" place="pagetop" rend="left">ddd</comm>

      var $newNode = $newDoc.createElement('span');
      $newNode.setAttribute('class', 'paratext');

      var wceAttr = '__t=paratext&__n='; //marginals_text is content of editor in editor,
      var cs = $teiNode.childNodes;
      var marginals_text = "";
      for (var i = 0, c, l = cs.length; i < l; i++) {
         c = cs[i];
         if (!c) {
            break;
         }

         //var $tempParent = $newDoc.createElement('t');
         var $tempParent = $newDoc.createDocumentFragment();
         // <t>...</t>
         readAllChildrenOfTeiNode($tempParent, c);
         var tempText = xml2String($tempParent); // at tei element "<app>" too
         if (tempText && tempText.length > 0) {
            //tempText = tempText.substr(3, tempText.length - 7);
            marginals_text += tempText;
         }

      }
      wceAttr += '&marginals_text=' + encodeURIComponent(marginals_text);

      var rend = $teiNode.getAttribute("rend");
      var re = /covered\((.+?)\)/g;
      var m = re.exec(rend);
      if (m)
         wceAttr += '&covered=' + m[1];
      else
         wceAttr += '&covered=' + '';


      var re = /align\((.+?)\)/g;
      var m = re.exec(rend);
      if (m)
         $teiNode.setAttribute("rend", m[1]);
      else
         $teiNode.setAttribute("rend", '');

      if ($teiNode.nodeName == 'seg') {
         var mapping = {
            'n': '&number=',
            'rend': '&paratext_alignment='
         };

         wceAttr += getWceAttributeByTei($teiNode, mapping) + '&fw_type=isolated&fw_type_other=';
         var $next = $teiNode;
      } else {
         var mapping = {
            'n': '&number=',
            'rend': '&paratext_alignment=',
            'type': {
               '0': '@commentary@runTitle@colophon@pageNum@orn@catch',
               '1': '&fw_type=',
               '2': '&fw_type=other&fw_type_other='
            }
         };

         wceAttr += getWceAttributeByTei($teiNode, mapping);

         var $next = $teiNode.parentNode;
      }

      if ($next != null && $next.nodeName == 'seg') { // seg element as parent node (has to be that way, testing anyway); as well used for isolated marginals
         wceAttr += '&paratext_position=';
         if ($next.getAttribute('type') === 'margin' || $next.getAttribute('type') === 'line') //standard values
            wceAttr += $next.getAttribute('subtype') + '&paratext_position_other=';
         else // type="other"
            wceAttr += 'other&paratext_position_other=' + $next.getAttribute('subtype');
      } else {
         wceAttr += '&paratext_position=&paratext_position_other=';
      }

      var lang = $teiNode.getAttribute("xml:lang") ? $teiNode.getAttribute("xml:lang") : '';
      if (isOther(lang)) {
         if (alertonlangnotshown) {
            alert("Please note: The \"other\" value for xml:lang is no longer supported.\nExisting entries have been removed.");
            alertonlangnotshown = false;
         }
         lang = '';
      }
      wceAttr += '&language_name=' + lang;

      $newNode.setAttribute('wce', wceAttr);
      nodeAddText($newNode, teiNodeName);

      addFormatElement($newNode);
      $htmlParent.appendChild($newNode);
      return null;
   };

   /*
    * <note>
    */
   var Tei2Html_note = function($htmlParent, $teiNode) {
      // <note type="$ note_type" n="$newHand" xml:id="_TODO_" > $note_text </note>

      var $newNode = $newDoc.createElement('span');

      $newNode.setAttribute('class', 'note');

      var wceAttr = '__t=note&__n=&note_text=' + encodeURIComponent(getDomNodeText($teiNode)) + '';
      if ($teiNode.firstChild && $teiNode.firstChild.nodeName === 'handshift') { // child node <handshift/> => note_type=changeOfHand
         wceAttr += '&note_type=changeOfHand&note_type_other=';
         if ($teiNode.firstChild.getAttribute('scribe')) //scribe is optional
            wceAttr += '&newHand=' + encodeURIComponent($teiNode.firstChild.getAttribute('scribe'));
         else if ($teiNode.firstChild.getAttribute('n')) // for compatibility
            wceAttr += '&newHand=' + encodeURIComponent($teiNode.firstChild.getAttribute('n'));
         else // write empty entry
            wceAttr += '&newHand=';
      } else {
         var mapping = {
            'n': null,
            'type': {
               '0': '@editorial@local',
               '1': '&note_type=',
               '2': '&note_type=other&note_type_other='
            }
         };
         wceAttr += getWceAttributeByTei($teiNode, mapping) + '&newhand=';
      }
      $newNode.setAttribute('wce', wceAttr);
      nodeAddText($newNode, 'Note');
      addFormatElement($newNode);
      $htmlParent.appendChild($newNode);
      // Do not add a space if there is a break after the note
      if ($teiNode.nextSibling && $teiNode.nextSibling.nodeName !== 'lb' && $teiNode.nextSibling.nodeName !== 'cb' &&
         $teiNode.nextSibling.nodeName !== 'pb' && $teiNode.nextSibling.nodeName !== 'gb')
         nodeAddText($htmlParent, ' ');
      return null;
   };

   var getOriginalTextByTeiNode = function($node) {
      var origText = '';
      var origNode = $newDoc.createElement('t');
      var list = $node.childNodes;
      for (var i = 0, cl, l = list.length; i < l; i++) {
         cl = list[i];
         if (!cl) {
            break;
         }
         readAllChildrenOfTeiNode(origNode, cl);
      }

      //remove textNode with space ' '. It come from function readAllChildrenOfTeiNode::nodeAddText($htmlParent, ' ');
      var oLast = origNode.lastChild;
      if (oLast && oLast.nodeType == 3 && oLast.nodeValue == ' ') {
         origNode.removeChild(oLast);
      }
      var _oText = xml2String(origNode);
      if (_oText && _oText.length > 6) {
         _oText = _oText.substring(3, _oText.length - 4);
         origText += _oText;
      }
      origText = origText.trim();
      origText = encodeURIComponent(origText);
      return origText;
   };

   /*
    * <app>
    */
   var Tei2Html_app = function($htmlParent, $teiNode) {
      // <span class="corr" wce_orig="..."
      var $newNode = $newDoc.createElement('span');
      //$newNode.setAttribute('class', 'corr');

      // <rdg type="orig" hand="firsthand" />
      // <rdg type="corr" hand="corrector1">
      var rdgs = $teiNode.childNodes;
      var $rdg, typeValue, handValue, deletionValue;
      var wceAttr = '';
      var origText = '';
      var rdgAttr;
      var $origRdg = $newDoc.createElement('t');
      var utvf = '';
      var utv = '';

      var collection = rdgs[0].childNodes;
      for (var i = 0, cl, l = collection.length; i < l; i++) {
         cl = collection[i];
         if (!cl) {
            break;
         }
         readAllChildrenOfTeiNode($origRdg, collection[i]);
      }

      //remove textNode with space ' '. It come from function readAllChildrenOfTeiNode::nodeAddText($htmlParent, ' ');
      var oLast = $origRdg.lastChild;
      if (oLast && oLast.nodeType == 3 && oLast.nodeValue == ' ') {
         $origRdg.removeChild(oLast);
      }
      var _oText = xml2String($origRdg);
      if (_oText && _oText.length > 6) {
         _oText = _oText.substring(3, _oText.length - 4);
         origText += _oText;
      }
      origText = origText.trim();

      if (origText === '')
         origText = 'OMISSION';
      if (origText === 'OMISSION') //blank first hand
         $newNode.setAttribute('class', 'corr_blank_firsthand');
      else {
         $newNode.setAttribute('class', 'corr');
         $newNode.setAttribute('wce_orig', encodeURIComponent(origText));
      }

      if (rdgs[0].getAttribute('hand') == 'firsthandV') {
         utvf = '&ut_videtur_firsthand=on';
      }

      origText = decodeURIComponent(origText);

      for (var i = 1, l = rdgs.length; i < l; i++) { // [0] is always original => no extra output
         utv = '';
         $rdg = rdgs[i];
         if (!$rdg || $rdg.nodeType == 3) {
            break;
         }
         typeValue = $rdg.getAttribute('type') ? $rdg.getAttribute('type') : '';
         handValue = $rdg.getAttribute('hand') ? $rdg.getAttribute('hand') : '';
         deletionValue = $rdg.getAttribute('rend') ? $rdg.getAttribute('rend') : '';

         if (i == 1) {
            wceAttr += '__t=corr';
         } else
            wceAttr += '@__t=corr';

         //Test whether handValue ends with "V" -> ut videtur
         if (handValue.charAt(handValue.length - 1) == 'V') {
            handValue = handValue.substring(0, handValue.length - 1);
            utv = '&ut_videtur_corr=on';
         }
         if ('@corrector@firsthand@corrector1@corrector2@corrector3'.indexOf(handValue) > -1) {
            wceAttr += '&__n=' + handValue + utvf + '&corrector_name_other=&corrector_name=' + handValue + utv;
         } else { //other corrector
            wceAttr += '&__n=' + handValue + utvf + '&corrector_name=other&corrector_name_other=' + handValue + utv;
         }

         wceAttr += '&reading=' + typeValue;
         if (origText != 'OMISSION')
            wceAttr += '&original_firsthand_reading=' + encodeURIComponent(origText);
         else
            wceAttr += '&original_firsthand_reading=&blank_firsthand=on';

         //wceAttr += '&common_firsthand_partial=';
         if (deletionValue !== '') {
            // deletion="underline%2Cunderdot%2Cstrikethrough"
            // &deletion_erased=0
            // &deletion_underline=1
            // &deletion_underdot=1
            // &deletion_strikethrough=1
            // &deletion_vertical_line=0
            // &deletion_other=0
            var deletionstr = '';
            var deletionArr = new Array('erased', 'underline', 'underdot', 'strikethrough',
               'vertical_line', 'overdots', 'ringed_circled', 'other');
            for (var d = 0; d < deletionArr.length; d++) {
               var deletionItem = deletionArr[d];
               if (deletionValue.indexOf(deletionItem) > -1) {
                  wceAttr += '&deletion_' + deletionItem + '=1';
                  deletionstr += ',' + deletionItem;
               } else {
                  wceAttr += '&deletion_' + deletionItem + '=0';
               }
            }
            wceAttr += '&deletion=' + encodeURIComponent(deletionstr.substring(1));
            // to get rid of very first ","
         } else { // no deletion given
            wceAttr += '&deletion_erased=0&deletion_underline=0&deletion_underdot=0&deletion_strikethrough=0&deletion_vertical_line=0&deletion_overdots=0&deletion_ringed_circled=0&deletion_other=0&deletion=';
         }

         // &correction_text Contain:
         // <note>nnn</note><w n="2">aaa</w><w n="3"> c<hi rend="gold">a</hi> b<hi rend="green">c</hi></w><w n="4">bbb</w>
         var $tempParent = $newDoc.createDocumentFragment();
         // <t>...</t>
         readAllChildrenOfTeiNode($tempParent, $rdg);
         var corrector_text = xml2String($tempParent);

         if (corrector_text && corrector_text.length > 0) {
            //corrector_text = corrector_text.substr(3, corrector_text.length - 7);
            if (corrector_text == 'OMISSION') { //Total deletion
               wceAttr += '&corrector_text=&blank_correction=on';
            } else
               wceAttr += '&corrector_text=' + encodeURIComponent(corrector_text);
         } else { //Omission
            corrector_text = 'OMISSION';
            wceAttr += '&corrector_text=&blank_correction=on';
         }

         wceAttr += '&place_corr=';
         var $test = $rdg.firstChild;
         if ($test != null && $test.nodeName == 'seg') { //seg element ahead -> place of correction
            if ($test.getAttribute('type') == 'line') {
               wceAttr += $test.getAttribute('subtype');
               //overwritten, above, below
            } else if ($test.getAttribute('type') == 'margin') {
               wceAttr += $test.getAttribute('subtype');
               //pagetop, pagebottom, pageleft, pageright, coltop, colbottom, colleft, colright, lineleft, lineright
            } else { //type="other"
               wceAttr += 'other&place_corr_other=' + encodeURIComponent($test.getAttribute('subtype'));
            }
            $rdg.removeChild($test);
            //remove this child from the list
         }
      }

      if (origText != '') {
         if (origText === 'OMISSION')
            nodeAddText($newNode, "T");
         else {
            while ($origRdg.hasChildNodes()) {
               $newNode.appendChild($origRdg.firstChild);
            }
         }
      }

      if (wceAttr != '') {
         $newNode.setAttribute('wce', wceAttr);
      }

      addFormatElement($newNode);
      $htmlParent.appendChild($newNode);
      if ($teiNode.nextSibling && ($teiNode.nextSibling.nodeName === 'w' || $teiNode.nextSibling.nodeName === 'app')) {
         nodeAddText($htmlParent, ' ');
         // add space only if new word or new apparatus follows
      }
      return null;
   };

   var Tei2Html_figure = function($htmlParent, $teiNode) {
      var ed = parent.tinymce.activeEditor;
      var $newNode = $newDoc.createElement('span');
      $newNode.setAttribute('class', 'figure');
      var wceAttr = '__t=figure&__n=&';
      var extent = $teiNode.getAttribute('rend').substr(5);
      if ($teiNode.firstChild && $teiNode.firstChild.nodeName === 'desc') {
         wceAttr += '&graphic_desc=' + encodeURI($teiNode.firstChild.textContent);
         wceAttr += '&extent=' + extent;
      }
      $newNode.setAttribute('wce', wceAttr);
      covertext = ed.translate('graphical_element');
      var _extent = parseInt(extent);
      for (var i = 0; i < _extent; i++) {
         covertext += '<span class="mceNonEditable brea" wce="__t=brea&amp;__n=&amp;hasBreak=no&amp;break_type=lb&amp;number=&amp;rv=&amp;page_number=&amp;running_title=&amp;facs=&amp;lb_alignment=">' +
            '<span class="format_start mceNonEditable">‹</span><br />↵<span class="format_end mceNonEditable">›</span></span>' + ed.translate('graphical_element');
      }

      $tmp = $('<temp>' + covertext + '</temp>')[0];
      while ($tmp.firstChild) {
         $newNode.appendChild($tmp.firstChild);
      }
      //nodeAddText($newNode, covertext);
      addFormatElement($newNode);
      $htmlParent.appendChild($newNode);
      nodeAddText($htmlParent, ' ');
      return null;
   };

   return {
      'htmlString': getHtmlString()
      //'teiIndexData': teiIndexData //TODO if we need it
   };
}

/**
 * ************************************************************************ ************************************************************************ ************************************************************************
 * ************************************************************************ ************************************************************************ ************************************************************************
 * ************************************************************************ ************************************************************************ ************************************************************************
 */

// getTEIXml
function getTeiByHtml(inputString, args) {

   if (!inputString || $.trim(inputString) == '') {
      return '';
   }

   if (!args) {
      return '';
   }

   // arguments:
   // g_bookNumber, g_pageNumber, g_chapterNumber, g_verseNumber, g_wordNumber, g_columnNumber, g_witValue,
   //TODO: Check, if those values really have to be stored in an array. Aren't they just coming from the export routine directly (except for book, witness and manuscript language)
   var g_bookNumber = '';
   var g_witValue = args.witness;
   var g_manuscriptLang = args.manuscriptLang;
   var withoutW = false;
   if (g_witValue && (g_witValue instanceof Function || typeof g_witValue == "function" || typeof g_witValue == "Function")) {
      g_witValue = g_witValue();
   }
   if (g_manuscriptLang && (g_manuscriptLang instanceof Function || typeof g_manuscriptLang == "function" || typeof g_manuscriptLang == "Function")) {
      g_manuscriptLang = g_manuscriptLang();
   }

   var g_pageNumber = '';
   var g_pageNumber_id = '';
   var g_chapterNumber = '';
   var g_stanzaNumber = '';
   var g_verseNumber = '';
   var g_lineNumber = '';
   var g_verselineNumber = '';
   var g_ritualdirectionNumber = '';

   // node for TEI
   //var g_lectionNode;
   var g_bookNode;
   var g_chapterNode;
   var g_stanzaNode;
   var g_lineNode;
   var g_verseNode;
   var g_verselineNode;
   var g_ritualdirectionNode;

   var gIndex_s = 0;

   var $newDoc;
   var $newRoot;
   var g_currentParentNode;

   //var found_ab = false;
   //var final_w_found = false;
   var final_w_set = false;

   var nodec = 0;

   var w_start = '{@@{';
   var w_end = '}@@}';
   var w_start_s = '{@@@{';
   var w_end_s = '}@@@}';

   var isSeg = false;
   var note = 1;

   var idSet = new Set();

   //var global_id=0; //only for test
   /*
    * Main Method <br /> return String of TEI-Format XML
    *
    */
   var getTeiString = function() {
      //TODO
      //add punctuation span
      //Feature/extension #5579
      //  var reg=/\[O\+\d*\]/i;
      //  var found=inputString.match(reg);
      //  for(var i=0,f, p;i<found.length;i++){
      //      f=found[i];
      //      p=f.replace('[','<span class="punctuation">').replace(']','</span>');
      //     inputString=inputString.split(f).join(p);
      //  }

      inputString = inputString.replace(/>\s+</g, '> <'); //after initHtmlContent get <w before="1" after="1" />
      inputString = '<TEI>' + inputString + '</TEI>';

      var $oldDoc = loadXMLString(inputString);

      var $oldRoot = $oldDoc.documentElement;
      $oldRoot = initHtmlContent($oldRoot);

      $newDoc = loadXMLString('<TEI></TEI>');
      // <TEMP>
      $newRoot = $newDoc.documentElement;

      if (!g_currentParentNode) {
         g_currentParentNode = $newRoot;
      }
      //get tei node from htmlNode
      var childList = $oldRoot.childNodes;
      for (var i = 0, $c, l = childList.length; i < l; i++) {
         $c = childList[i];
         if (!$c) {
            continue;
         } else {
            readAllHtmlNodes(g_currentParentNode, $c, false);
         }
      }

      html2Tei_mergeNodes($newRoot, true);
      html2Tei_removeBlankW_addAttributePartI($newRoot);
      html2Tei_handleLanguageChange($newRoot);

      //ticket #6130
      args.inner_hi ? html2Tei_handleHiNode($newRoot) : '';

      // DOM to String
      var str = xml2String($newRoot);
      if (!str)
         return '';

      //
      // add an required header to get a valid XML
      //str = str.replace('<TEI>', '<?xml  version="1.0" encoding="utf-8"?><!DOCTYPE TEI [<!ENTITY om ""><!ENTITY lac ""><!ENTITY lacorom "">]><?xml-model href="TEI-NTMSS.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?><TEI xmlns="http://www.tei-c.org/ns/1.0">');
      if (str.indexOf("</teiHeader>") > -1) {
         str = str.replace('<TEI>', '<?xml  version="1.0" encoding="utf-8"?><TEI xmlns="http://www.tei-c.org/ns/1.0">');
         str = str.replace("</teiHeader>", "</teiHeader><text><body>");
      } else {
         str = str.replace("<TEI>", '<?xml  version="1.0" encoding="utf-8"?><TEI xmlns="http://www.tei-c.org/ns/1.0"><teiHeader></teiHeader><text><body>');
      }
      if (g_manuscriptLang && g_manuscriptLang != '') // set manuscript language if there are information
         str = str.replace("<text>", '<text xml:lang="' + g_manuscriptLang + '">');
      str = str.replace("</TEI>", "</body></text></TEI>");
      str = str.replace(/OMISSION/g, "");
      str = str.replace(//g, $("<div />").html("a&#772;&#778;").text());
      str = str.replace(//g, $("<div />").html("H&#803;").text());
      str.concat("</span>");
      return str;
   };

   //remove elements format_start /format_end
   //add <w> for each textNode
   var initHtmlContent = function($node) {
      removeFormatNode($node);
      //add <w> for each textNode
      $node = addWElement2Html($node);
      return $node;
   };

   var html2Tei_handleLanguageChange = function($node) {
      var abNodes = $node.querySelectorAll('ab');
      var list = [];
      if (abNodes) {
         //var lang = '',
         //    langNode = null;
         abNodes.forEach(function(ab) {
            var att_type = ab.getAttribute('type');

            list.push({
               node: ab,
               type: att_type
            });
         });
      }

      var pre;
      var end = list.length - 1;
      var j = -1;
      list.forEach(function(curr, i) {
         if (pre) {
            var _childNodes = [];
            var _add = false;

            if (pre.node.contains(curr.node)) { // check whether curr.node is a child of pre.node
               var newab = pre.node.cloneNode(false);

               // collect all child nodes of $pre till you reach the child <ab> ($curr)
               _add = true; //  start collecting child nodes
               pre.node.childNodes.forEach(function(c) {
                  if (c === curr.node) {
                     _add = false; // stop collecting child nodes
                  }
                  if (_add) {
                     _childNodes.push(c);
                  }
               });
               // append all child nodes to temporary node $newab
               _childNodes.forEach(function(c) {
                  newab.appendChild(c);
               });
               // remember this node to later deletion
               if (j == -1)
                  j = i - 1; //remember $pre
               // insert node into tree
               pre.node.parentNode.insertBefore(newab, pre.node);
            } else {
               var newab = pre.node.cloneNode(true);
               if (j > -1) {
                  abNodes[j].parentNode.replaceChild(newab, abNodes[j]);
                  j = -1;
               } else {
                  pre.node.parentNode.replaceChild(newab, pre.node);
               }
            }

            //last
            if (i == end) {
               if (j > -1) { // check, whether last <ab> was child of another <ab>
                  //abNodes[j].parentNode.insertBefore(curr.node, abNodes[j]);
                  abNodes[j].parentNode.replaceChild(newab, abNodes[j]);
                  newab.parentNode.appendChild(curr.node);
               } else {
                  var newab = curr.node.cloneNode(true);
                  curr.node.parentNode.replaceChild(newab, curr.node);
               }
            }

         }
         pre = curr;
      })
   }

   var html2Tei_handleHiNode_addHi = function($node, $hiClone) {
      if ($node.hasChildNodes()) {
         var list = [];
         $node.childNodes.forEach(function(c) {
            list.push(c);
         })
         list.forEach(function(c) {
            html2Tei_handleHiNode_addHi(c, $hiClone);
         });
      }

      if (['lb', 'w'].indexOf($node.nodeName) >= 0) {
         $hi = $hiClone.cloneNode();
         while ($node.firstChild) {
            $hi.appendChild($node.firstChild);
         }
         $node.appendChild($hi);
      }
   }


   var html2Tei_handleHiNode = function($node) {
      var isHi = $node.nodeName == 'hi' ? true : false;

      if ($node.hasChildNodes()) {
         var list = [];
         $node.childNodes.forEach(function(c) {
            list.push(c);
         })
         list.forEach(function(c) {
            if (isHi && c.nodeName == 'app') {
               $node.nextSibling ? $node.parentNode.insertBefore(c, $node.nextSibling) : $node.parentNode.appendChild(c);
               html2Tei_handleHiNode_addHi(c, $node.cloneNode(false));
            } else {
               html2Tei_handleHiNode(c);
            }
         });
      }

   }

   /*
    * test if previousSibling pb/cb/lb with break="no" is,
    */
   var html2Tei_addAttributePartF = function($htmlNode) {
      if (!$htmlNode) {
         return;
      }
      var firstNextW;
      var _first = $htmlNode.nextSibling;
      while (_first) {
         if (_first.nodeType == 3) {
            break;
         }
         if (_first.nodeName == 'w') {
            if (!_first.firstChild) {
               //<w> from a space, without nodeText
               //<w before="1" after="1"/>
               _first = _first.nextSibling;
               continue;
            }
            firstNextW = _first;
            break;
         }
         _first = _first.firstChild;
      }

      if (!firstNextW) {
         return;
      }

      var preChild = $htmlNode.previousSibling;
      var wceAttr;
      var isBreak = false;
      while (preChild) {
         if ((preChild.nodeName == 'w' && !preChild.firstChild)) {
            preChild = preChild.previousSibling;
            continue;
         }

         if ($(preChild).hasClass('book_number') || $(preChild).hasClass('chapter_number') ||
            $(preChild).hasClass('stanza_number') || $(preChild).hasClass('verse_number') ||
            $(preChild).hasClass('line_number') || $(preChild).hasClass('verseline_number') ||
            $(preChild).hasClass('ritualdirection_number')) {
            preChild = preChild.previousSibling;
            continue;
         }
         if ($(preChild).hasClass('brea')) {
            wceAttr = preChild.getAttribute('wce');
            if (wceAttr.match(/hasBreak=yes/) && wceAttr.match(/break_type=pb/)) { //only page break with hasBreak=yes
               isBreak = true;
               break;
            }
            preChild = preChild.previousSibling;
            continue;
         } else {
            break;
         }
      }
      if (isBreak) {
         $htmlNode.setAttribute('part', 'auto_F');
      }
   };

   var html2Tei_mergeNodes = function($teiNode, removeAttr) {
      if (!$teiNode || ($teiNode.nodeType != 1 && $teiNode.nodeType != 11)) { //nodeType==11: createDocumentFragment
         return;
      }

      var tNext = $teiNode.firstChild;
      while (tNext) {
         html2Tei_mergeNodes(tNext, removeAttr);
         tNext = tNext.nextSibling;
      }
      html2Tei_mergeWNode($teiNode, removeAttr);
   };

   var html2Tei_mergeWNode = function($w, removeAttr) {
      if (!$w || $w.nodeName !== 'w') {
         return;
      }

      var toAppend = new Array();
      if ($w.getAttribute('after') === '0') { //$w is start
         var ns = $w.nextSibling;
         var lastChildOfW = $w.lastChild;
         var isNextBreak = false;
         while (ns) {
            if (ns.nodeName == 'w') {
               if (ns.getAttribute('before') === '1' || ns.getAttribute('after') === '1' || ns === ns.parentNode.lastChild) {
                  if (ns.getAttribute('before') === '0') {
                     toAppend.push(ns);
                  }
                  break;
               }
            }
            var _nodeName = ns.nodeName;
            if ((_nodeName === 'pb' || _nodeName === 'lb') && (isNextBreak || ns.getAttribute('break') === 'no')) {
               if (_nodeName === 'lb') {
                  isNextBreak = false;
               } else {
                  isNextBreak = true;
               }
            } else if ($.inArray(_nodeName, wceNodeInsideW) < 0) {
               break;
            }
            if (ns.nodeName === 'hi' && ns.firstChild && ns.firstChild.nodeName === 'pc') {
               //bug #6128
            } else {
               toAppend.push(ns);
            }
            ns = ns.nextSibling;
         }
      }

      //merge
      for (var i = 0, c, l = toAppend.length; i < l; i++) {
         c = toAppend[i];
         if (c.nodeName === 'w') {
            //move all children of c to w;

            while (c.firstChild) {
               $w.appendChild(c.firstChild);
            }
            c.parentNode.removeChild(c);
         } else
            $w.appendChild(c);
      }
      if (removeAttr) {
         removeAllAttribute($w);
      }
      //	if(toAppend.length>0){
      html2Tei_mergeOtherNodes($w);
      //	}
   };

   var html2Tei_mergeOtherNodes = function($node) {
      if (!$node) {
         return;
      }

      if ($.inArray($node.nodeName, wceNodeInsideW) < 0) {
         return;
      }

      var curr = $node.firstChild;
      var next;
      var toAppend = new Array();
      var startNode;
      while (curr) {
         var tempspace = null;
         next = curr.nextSibling;
         if (compareNodes(curr, next)) {
            if (!startNode) {
               startNode = curr;
            }
            toAppend.push(next);
         } else if (startNode) { //merge which we have
            html2Tei_addNodeArrayToNode(startNode, toAppend);
            startNode = null;
            toAppend = new Array();
         }
         curr = next;
      }
      if (startNode) {
         html2Tei_addNodeArrayToNode(startNode, toAppend);
         /*for(var i=0, a, l=toAppend.length; i<l; i++){
         	a=toAppend[i];
         	while(a.firstChild){
         		startNode.appendChild(a.firstChild);
         	}
         	a.parentNode.removeChild(a);
         }
         html2Tei_mergeOtherNodes(startNode); */
      }
   };

   var html2Tei_addNodeArrayToNode = function(startNode, toAppend) {
      for (var i = 0, a, l = toAppend.length; i < l; i++) {
         a = toAppend[i];
         while (a.firstChild) {
            startNode.appendChild(a.firstChild);
         }
         a.parentNode.removeChild(a);
      }
      html2Tei_mergeOtherNodes(startNode);
   };

   var removeAllAttribute = function($wn) {
      var as = $wn.attributes;
      var a;
      var names = new Array();
      for (var i = 0, l = as.length; i < l; i++) {
         a = as[i];
         if (a && a.nodeName !== 'part') {
            names.push(a.nodeName);
         }
      }
      for (var x = 0, y = names.length; x < y; x++) {
         $wn.removeAttribute(names[x]);
      }
   };

   /*
    *remove elements "format_start" and "format_end"
    */
   var removeFormatNode = function($r) {
      if ($r.nodeType !== 1 && $r.nodeType !== 11)
         return;

      if ($($r).hasClass('format_start') || $($r).hasClass('format_end')) {
         $r.parentNode.removeChild($r);
         return;
      }

      var tempList = $r.childNodes;
      var childList = new Array();

      for (var x = 0, y = tempList.length; x < y; x++) {
         childList.push(tempList[x]);
      }
      for (var i = 0, l = childList.length, $c; i < l; i++) {
         $c = childList[i];
         if (!$c) {
            continue;
         } else {
            removeFormatNode($c);
         }
      }
   };

   /*
    *remove blank <w/>  and set Attribute Part
    */
   var html2Tei_removeBlankW_addAttributePartI = function($r) {
      if ($r.nodeType !== 1 && $r.nodeType !== 11)
         return;

      var nName = $r.nodeName;
      if (nName === 'w' && !$r.firstChild) {
         $r.parentNode.removeChild($r);
         return;
      }

      var tempList = $r.childNodes;
      var childList = new Array();

      for (var x = 0, y = tempList.length; x < y; x++) {
         childList.push(tempList[x]);
      }
      for (var i = 0, l = childList.length, $c; i < l; i++) {
         $c = childList[i];
         if (!$c) {
            continue;
         } else {
            html2Tei_removeBlankW_addAttributePartI($c);
         }
      }


      if (nName === 'ab') {
         var firstW, lastW, lastLB;

         var part = $r.getAttribute('part'); //
         if (part) {
            //get first <W>
            var _first = $r.firstChild;
            while (_first && _first.nodeType !== 3) {
               if (_first.nodeName === 'w') {
                  firstW = _first;
                  break;
               } else {
                  _first = _first.firstChild;
               }
            }
         }

         //get last <w>
         if ($r === $r.parentNode.lastChild || (part && part === 'I')) { //if it is last <ab>
            var _last = $r.lastChild;
            while (_last) {
               if (_last.nodeType == 3) {
                  break;
               }

               if (_last.nodeName === 'w') {
                  lastW = _last;
               } else if (_last.nodeName === 'lb' && _last.getAttribute('break') && _last.getAttribute('break') === 'no') {
                  lastLB = _last;
                  break;
               }
               _last = _last.lastChild;
            }
         }

         if (!part) {
            if (lastLB && lastW) { //Automatically generate part="I"
               lastW.setAttribute('part', 'I');
               $r.setAttribute('part', 'I');
               lastLB.parentNode.removeChild(lastLB); ////remove last <lb>
            }
            return;
         }

         if (part == 'auto_F' && firstW) { //Automatically generated part="F"
            $r.setAttribute('part', 'F');
            firstW.setAttribute('part', 'F');
            if (lastLB) {
               $r.setAttribute('part', 'M');
               if (lastW === firstW) {
                  lastW.setAttribute('part', 'M');
               } else {
                  lastW.setAttribute('part', 'I');
               }
               lastLB.parentNode.removeChild(lastLB); ////remove last <lb>
            }
            /*} else if (part == 'F' && firstW) { //manually set or from import
            	firstW.setAttribute('part', 'F');
            } else if (part == 'I' && lastW) { //manually set or from import
            	lastW.setAttribute('part', 'I');
            } else if (part == 'M') { //manually set or from import
            	if (firstW && lastW && firstW === lastW) {
            		lastW.setAttribute('part', 'M');
            	} else if (firstW) {
            		firstW.setAttribute('part', 'F');
            		if(lastW){
            			lastW.setAttribute('part', 'I');
            			if(lastLB)
            				lastLB.parentNode.removeChild(lastLB);////remove last <lb>
            		}
            	}
            */
         }
      }
   };

   /*
    *
    */
   var addWMark1 = function($htmlNode) {
      if (!$htmlNode) {
         return;
      }
      if ($htmlNode.nodeType == 3) {
         var textValue = $htmlNode.nodeValue;
         var addStart, addEnd;
         if (textValue) {
            if (startHasSpace(textValue)) {
               addStart = w_start_s;
            } else {
               addStart = w_start;
            }
            if (endHasSpace(textValue)) {
               addEnd = w_end_s;
            } else {
               addEnd = w_end;
            }
            textValue = addStart + $.trim(textValue) + addEnd;

            //add into middle
            textValue = textValue.replace(/\s+/g, w_end_s + w_start_s);
            $htmlNode.nodeValue = textValue;
         }
      } else if ($htmlNode.nodeType === 1 || $htmlNode.nodeType === 11) {
         var childList = $htmlNode.childNodes;
         for (var i = 0, $c, l = childList.length; i < l; i++) {
            $c = childList[i];
            if (!$c) {
               continue;
            } else {
               addWMark1($c);
            }
         }
      }
   };

   var addWMark2 = function($htmlNode) {
      if (!$htmlNode) {
         return;
      }
      if ($htmlNode.nodeType === 1 || $htmlNode.nodeType === 11) {
         //only for test
         //if($htmlNode.nodeName=='w'){
         //$htmlNode.setAttribute('id',global_id++);
         //}
         var childList = $htmlNode.childNodes;
         for (var i = 0, $c, l = childList.length; i < l; i++) {
            $c = childList[i];
            if (!$c) {
               continue;
            } else {
               addWMark2($c);
            }
         }
         var last = $htmlNode.lastChild;
         if (last && last.nodeName === 'x') {
            $htmlNode.removeChild(last);
            $htmlNode.setAttribute('after', '1');
         }
      }
   };


   var addWElement2Html = function($node, str) {
      var childList = $node.childNodes;
      for (var i = 0, $c, l = childList.length; i < l; i++) {
         $c = childList[i];
         if (!$c) {
            continue;
         } else {
            addWMark1($c);
         }
      }
      str = xml2String($node);
      str = str.replace(/{@@{/g, '<w before="0" after="0">'); //no space before
      str = str.replace(/}@@}/g, '</w>'); //no space after
      str = str.replace(/{@@@{/g, '<w before="1" after="0">'); //has space before
      str = str.replace(/}@@@}/g, '<x>t</x></w>'); //has space after

      var $doc = loadXMLString(str);
      $node = $doc.documentElement;

      childList = $node.childNodes;
      for (var i = 0, $c, l = childList.length; i < l; i++) {
         $c = childList[i];
         if (!$c) {
            continue;
         } else {
            addWMark2($c);
         }
      }
      return $node;
   };

   var readAllHtmlNodes = function($teiParent, $htmlNode) {
      if (!$htmlNode) {
         return;
      }

      if ($htmlNode.nodeType === 1 || $htmlNode.nodeType === 11) {
         if ($htmlNode.nodeName === 'w') {
            if (withoutW)
               $teiParent.appendChild($htmlNode.firstChild.cloneNode(true));
            else
               $teiParent.appendChild($htmlNode.cloneNode(true));
            return;
         } else if ($htmlNode.nodeName === 'header') {
            return;
         }
         var arr = getTeiNodeByHtmlNode($teiParent, $htmlNode);
         if (arr == null || arr[1]) {
            return;
         }
         var newParent = arr[0];

         var childList = $htmlNode.childNodes;
         for (var i = 0, c, l = childList.length; i < l; i++) {
            c = childList[i];
            if (!c) {
               continue;
            } else {
               readAllHtmlNodes(newParent, c);
            }
         }
      }
   };

   /*
    * append wce node into <w>, only for supplied, unclear,  highlight etc.
    */
   var appendNodeInW = function($teiParent, $teiNode, $htmlNode) {
      var childList = $htmlNode.childNodes;
      var w;
      var wrapNode;
      var tempParent = $newDoc.createDocumentFragment();

      for (var i = 0, c, l = childList.length; i < l; i++) {
         w = null;
         c = childList[i];
         if (!c) {
            continue;
         } else {
            if (c.nodeName === 'w') {
               w = c.cloneNode(true);
               tempParent.appendChild(w);
            } else {
               var temp = $newDoc.createDocumentFragment();
               getTeiNodeByHtmlNode(temp, c); //TODO: if not initHtmlContent, may be c.nodeType==3, what should to do?
               while (temp.firstChild) {
                  tempParent.appendChild(temp.firstChild);
               }
            }
         }
      }
      html2Tei_mergeNodes(tempParent, false);
      var tFirst = tempParent.firstChild;
      var currentParentIsTeiNode = false;
      var currentParent = $teiParent;
      while (tFirst) {
         if (tFirst.nodeName === 'w') {
            if (!tFirst.firstChild) {
               //if w is <w/>, this means that no content for $teiNode, then add only <w/>
               //in order to show there is a space and <w> stop.
               $teiParent.appendChild(tFirst);
            } else {
               wrapNode = $teiNode.cloneNode(true);
               var n = wrapChildNode(tFirst, wrapNode);
               $teiParent.appendChild(n);
               tempParent.removeChild(tFirst); //remove tFirst
            }

            currentParentIsTeiNode = false;
            currentParent = $teiParent;
         } else {
            if (!currentParentIsTeiNode) {
               var clone = $teiNode.cloneNode(true);
               clone.appendChild(tempParent.firstChild); //move tFirst
               $teiParent.appendChild(clone);
               currentParentIsTeiNode = true;
               currentParent = clone;
            } else {
               currentParent.appendChild(tempParent.firstChild); //move tFirst
            }

         }
         tFirst = tempParent.firstChild;
      }
   };


   var wrapChildNode = function($parent, $wrapNode) {
      var deepChild = $wrapNode;
      while (deepChild.firstChild) {
         deepChild = deepChild.firstChild;
      }

      while ($parent.hasChildNodes()) {
         deepChild.appendChild($parent.firstChild);
      }

      //supplied in abbr //ticket #1762
      if ($wrapNode.nodeName === 'abbr' && $wrapNode.getAttribute('ext')) {
         $wrapNode.removeAttribute('ext');
         $wrapNode = handleSupliedInAbbr($wrapNode, $newDoc.createDocumentFragment(), true);
         //$wrapNode=handleSupliedInAbbr2($wrapNode);// both function do well
      }
      //fixed #1772
      if ($wrapNode.getAttribute('removeText')) {
         while ($wrapNode.firstChild) {
            $wrapNode.removeChild($wrapNode.firstChild);
         }
         $wrapNode.removeAttribute('removeText');
      }

      //use node name and attribute
      var newParent = $parent.cloneNode(false);
      newParent.appendChild($wrapNode);
      return newParent;
   };

   //or use function handleSupliedInAbbr2
   //supplied in abbr //ticket #1762
   var handleSupliedInAbbr = function($node, $currNewNode, end) {
      if (!$node) {
         return;
      }

      var nextNewParent = $node.cloneNode(false);
      if (nextNewParent.nodeType === 3) {
         $currNewNode.appendChild(nextNewParent);
         return;
      }

      //if it is <supplied>
      if ($node.nodeType !== 3 && $node.nodeName !== 'abbr' && $node.getAttribute('ext')) {
         //find <hi ovlerline>
         var treeArr = new Array();
         var cp = $currNewNode,
            hi;
         while (cp) {
            if (cp.nodeName === 'abbr') {
               break;
            }
            treeArr.push(cp);
            hi = cp;
            cp = cp.parentNode;
         }
         var abbr = hi.parentNode;

         var supplied = $node.cloneNode(true); //supplied from copy of original teinode
         supplied.removeAttribute('ext');
         abbr.appendChild(supplied); //abbr append supplied

         var tempNode = $newDoc.createDocumentFragment();
         while (supplied.firstChild) {
            tempNode.appendChild(supplied.firstChild);
         }

         for (var c, l = treeArr.length, i = l - 1; i >= 0; i--) {
            c = treeArr[i].cloneNode(false);
            supplied.appendChild(c);
            supplied = c;
         }
         while (tempNode.firstChild) {
            supplied.appendChild(tempNode.firstChild);
         }
         nextNewParent = abbr;
         for (var c, l = treeArr.length, i = l - 1; i >= 0; i--) {
            c = treeArr[i].cloneNode(false);
            nextNewParent.appendChild(c);
            nextNewParent = c;
         }
         return nextNewParent;
      }
      $currNewNode.appendChild(nextNewParent);

      var next = $node.firstChild;
      var newp;
      while (next) {
         newP = handleSupliedInAbbr(next, nextNewParent);
         if (newP) {
            nextNewParent = newP;
         }
         next = next.nextSibling;
      }
      if (end) {
         return removeBlankNode($currNewNode.firstChild);
      }
   };

   //or use function handleSupliedInAbbr
   //supplied in abbr //ticket #1762
   var handleSupliedInAbbr2 = function($node) {
      if (!$node || $node.nodeType == 3) {
         return;
      }

      if ($node.nodeName !== 'abbr' && $node.getAttribute('ext')) {
         var s1 = '',
            s2 = '';
         var parent = $node.parentNode;
         var next = $node.nextSibling;
         var str;
         while (parent && parent.nodeName !== 'abbr') {
            s1 += '@{@/' + parent.nodeName + '@}@';
            s2 = '@{@' + getNameAndAttributeAsString(parent) + '@}@' + s2;
            parent = parent.parentNode;
         }
         $node.parentNode.insertBefore($node.ownerDocument.createTextNode(s1), $node);
         $node.insertBefore($node.ownerDocument.createTextNode(s2), $node.firstChild);
         $node.appendChild($node.ownerDocument.createTextNode(s1));
         if (next) {
            $node.parentNode.insertBefore($node.ownerDocument.createTextNode(s2), next);
         } else {
            $node.parentNode.appendChild($node.ownerDocument.createTextNode(s2));
         }
         $node.removeAttribute('ext');
         return;
      }

      var temp = $node.childNodes;
      var childList = new Array();

      for (var i = 0, l = temp.length; i < l; i++) {
         childList.push(temp[i]);
      }

      for (var x = 0, y = childList.length; x < y; x++) {
         handleSupliedInAbbr2(childList[x]);
      }

      if ($node.nodeName == 'abbr') {
         $node.removeAttribute('ext');
         var xmlstr = xml2String($node);
         xmlstr = xmlstr.replace(/@{@/g, '<');
         xmlstr = xmlstr.replace(/@}@/g, '>');
         $node = loadXMLString(xmlstr);
         $node = $node.documentElement;
         removeBlankNode($node);
         return $node;
      }
   };

   var getNameAndAttributeAsString = function($node) {
      var s = '';
      var attrs = $node.attributes;
      for (var i = 0, attr, an, l = attrs.length; i < l; i++) {
         attr = attrs[i];
         an = attr.nodeName;
         s = an + '="' + $node.getAttribute(an) + '" ';
      }
      return $node.nodeName + " " + s;
   };


   /*
    * read html-node, create tei-node and return
    */
   var getTeiNodeByHtmlNode = function($teiParent, $htmlNode) {
      var partValue = '';
      var langValue = '';
      var pos;

      if ($htmlNode.nodeType !== 1 && $htmlNode.nodeType !== 11) {
         return null;
      }
      var wceAttrValue, wceType, htmlNodeName, infoArr, arr, countverse;

      // If there is no special <div type="book"> element, the passed number from the Workspace is used.
      // We check, if it is in the correct format.
      //if (g_bookNumber.length == 1) {// add "0"
      //	g_bookNumber = '0' + g_bookNumber;
      //}

      wceAttrValue = $htmlNode.getAttribute('wce');
      if (!wceAttrValue) {
         if ($($htmlNode).hasClass('book_number')) {
            wceAttrValue = 'book_number';
         } else if ($($htmlNode).hasClass('chapter_number')) {
            wceAttrValue = 'chapter_number';
         } else if ($($htmlNode).hasClass('stanza_number')) {
            wceAttrValue = 'stanza_number';
         } else if ($($htmlNode).hasClass('verse_number')) {
            wceAttrValue = 'verse_number';
         } else if ($($htmlNode).hasClass('line_number')) {
            wceAttrValue = 'line_number';
         } else if ($($htmlNode).hasClass('verseline_number')) {
            wceAttrValue = 'verseline_number';
         } else if ($($htmlNode).hasClass('ritualdirection_number')) {
            wceAttrValue = 'ritualdirection_number';
         }
      }

      infoArr = strToArray(wceAttrValue);
      if (!infoArr) {
         return null;
      }

      arr = infoArr[0];
      partValue = arr['partial'] ? arr['partial'] : '';
      langValue = $htmlNode.getAttribute('lang') ? $htmlNode.getAttribute('lang') : '';
      // ******************* verse *******************
      if (wceAttrValue != null && wceAttrValue.match(/book_number/)) {
         var textNode = $htmlNode.firstChild;
         if (textNode) {
            textNode = textNode.firstChild;
            g_bookNumber = textNode.nodeValue;
            g_bookNumber = $.trim(g_bookNumber);
            g_bookNode = $newDoc.createElement('div');
            g_bookNode.setAttribute('type', 'book');
            g_bookNode.setAttribute('n', g_bookNumber);
            if (langValue !== '')
               g_bookNode.setAttribute('xml:lang', langValue);
            if (partValue !== '')
               g_bookNode.setAttribute('part', partValue);
            $newRoot.appendChild(g_bookNode);
            g_currentParentNode = g_bookNode;
         }
         return null;
      } else if (wceAttrValue != null && wceAttrValue.match(/chapter_number/)) {
         // ******************* chapter *******************
         var textNode = $htmlNode.firstChild;
         if (textNode) {
            textNode = textNode.firstChild;
            g_chapterNumber = textNode.nodeValue;
            g_chapterNumber = $.trim(g_chapterNumber);
            g_chapterNode = $newDoc.createElement('div');
            g_chapterNode.setAttribute('type', 'chapter');
            g_chapterNode.setAttribute('n', g_bookNumber + "." + g_chapterNumber);
            if (langValue !== '')
               g_chapterNode.setAttribute('xml:lang', langValue);
            if (partValue !== '')
               g_chapterNode.setAttribute('part', partValue);
            if (g_bookNode)
               g_bookNode.appendChild(g_chapterNode);
            else
               $newRoot.appendChild(g_chapterNode);
            g_currentParentNode = g_chapterNode;
         }
         return null;
      } else if (wceAttrValue != null && wceAttrValue.match(/stanza_number/)) {
         var textNode = $htmlNode.firstChild;
         if (textNode) {
            textNode = textNode.firstChild;
            g_stanzaNumber = textNode.nodeValue;
            g_stanzaNumber = $.trim(g_stanzaNumber);
            //old_chapterNumber = g_chapterNumber;
            g_stanzaNode = $newDoc.createElement('div');
            g_stanzaNode.setAttribute('type', 'stanza');
            g_stanzaNode.setAttribute('n', g_bookNumber + "." + g_chapterNumber + "." + g_stanzaNumber);
            if (langValue !== '')
               g_stanzaNode.setAttribute('xml:lang', langValue);
            if (partValue !== '')
               g_stanzaNode.setAttribute('part', partValue);
            if (g_chapterNode)
               g_chapterNode.appendChild(g_stanzaNode);
            else
               $newRoot.appendChild(g_stanzaNode);
            g_currentParentNode = g_stanzaNode;
            g_verseNode = null;
         }
         return null;
      } else if (wceAttrValue != null && wceAttrValue.match(/verseline_number/)) {
         var textNode = $htmlNode.firstChild;
         if (textNode) {
            textNode = textNode.firstChild; // because <w>
            g_verselineNumber = textNode.nodeValue;
            g_verselineNumber = $.trim(g_verselineNumber);
            g_verselineNode = $newDoc.createElement('ab');
            g_verselineNode.setAttribute('type', 'verseline');
            g_verselineNode.setAttribute('n', g_bookNumber + '.' + g_chapterNumber + '.' + g_verseNumber + '.' + g_verselineNumber);
            if (langValue !== '')
               g_verselineNode.setAttribute('xml:lang', langValue);
            if (partValue !== '')
               g_verselineNode.setAttribute('part', partValue);
            if (g_verseNode)
               g_verseNode.appendChild(g_verselineNode);
            else {
               alert("Found verse line without verse!");
               $newRoot.appendChild(g_verselineNode);
            }
            g_currentParentNode = g_verselineNode;
         }
         return null;
      } else if (wceAttrValue != null && wceAttrValue.match(/line_number/)) {
         var textNode = $htmlNode.firstChild;
         if (textNode) {
            textNode = textNode.firstChild; // because <w>
            g_lineNumber = textNode.nodeValue;
            g_lineNumber = $.trim(g_lineNumber);
            g_lineNode = $newDoc.createElement('ab');
            g_lineNode.setAttribute('type', 'line');
            g_lineNode.setAttribute('n', g_bookNumber + '.' + g_chapterNumber + '.' + g_stanzaNumber + '.' + g_lineNumber);
            if (langValue !== '')
               g_lineNode.setAttribute('xml:lang', langValue);
            if (partValue !== '')
               g_lineNode.setAttribute('part', partValue);
            if (g_stanzaNode)
               g_stanzaNode.appendChild(g_lineNode);
            else {
               alert("Found line " + g_lineNode.getAttribute("n") + " without stanza!");
               $newRoot.appendChild(g_lineNode);
            }
            g_currentParentNode = g_lineNode;
         }
         return null;
      } else if (wceAttrValue != null && wceAttrValue.match(/verse_number/)) {
         var textNode = $htmlNode.firstChild;
         if (textNode) {
            textNode = textNode.firstChild; // because <w>
            g_verseNumber = textNode.nodeValue;
            //var cont_index = g_verseNumber.indexOf('Cont.');
            //if (cont_index > -1)
            //    g_verseNumber = g_verseNumber.substring(0, cont_index);
            g_verseNumber = $.trim(g_verseNumber);
            g_verseNode = $newDoc.createElement('div');
            g_verseNode.setAttribute('type', 'verse');
            g_verseNode.setAttribute('n', g_bookNumber + "." + g_chapterNumber + "." + g_verseNumber);
            if (langValue !== '')
               g_verseNode.setAttribute('xml:lang', langValue);
            if (partValue !== '')
               g_verseNode.setAttribute('part', partValue);
            if (g_chapterNode)
               g_chapterNode.appendChild(g_verseNode);
            else
               $newRoot.appendChild(g_verseNode);
            g_currentParentNode = g_verseNode;
            g_stanzaNode = null;
         }
         note = 0; //reset note counter
         return null;
      } else if (wceAttrValue != null && wceAttrValue.match(/ritualdirection_number/)) {
         var textNode = $htmlNode.firstChild;
         if (textNode) {
            textNode = textNode.firstChild; // because <w>
            g_ritualdirectionNumber = textNode.nodeValue;
            g_ritualdirectionNumber = $.trim(g_ritualdirectionNumber);
            g_ritualdirectionNode = $newDoc.createElement('ab');
            g_ritualdirectionNode.setAttribute('type', 'ritualdirection');
            if (g_stanzaNode) {
               g_ritualdirectionNode.setAttribute('n', g_bookNumber + '.' + g_chapterNumber + '.' + g_stanzaNumber + '.' + g_ritualdirectionNumber);
               if (langValue !== '')
                  g_ritualdirectionNode.setAttribute('xml:lang', langValue);
               if (partValue !== '')
                  g_ritualdirectionNode.setAttribute('part', partValue);
               g_stanzaNode.appendChild(g_ritualdirectionNode);
            } else if (g_verseNode) {
               g_ritualdirectionNode.setAttribute('n', g_bookNumber + '.' + g_chapterNumber + '.' + g_verseNumber + '.' + g_ritualdirectionNumber);
               if (langValue !== '')
                  g_ritualdirectionNode.setAttribute('xml:lang', langValue);
               if (partValue !== '')
                  g_ritualdirectionNode.setAttribute('part', partValue);
               g_verseNode.appendChild(g_ritualdirectionNode);
            } else {
               alert("Found ritual direction without stanza or verse!");
               if (langValue !== '')
                  g_ritualdirectionNode.setAttribute('xml:lang', langValue);
               if (partValue !== '')
                  g_ritualdirectionNode.setAttribute('part', partValue);
               $newRoot.appendChild(g_ritualdirectionNode);
            }
            g_currentParentNode = g_ritualdirectionNode;
         }
         return null;
      } else
         htmlNodeName = $htmlNode.nodeName;

      // <br>
      if (htmlNodeName == 'br') {
         return null;
      }

      // for other type
      /*infoArr = strToArray(wceAttrValue);
      if (!infoArr) {
          return null;
      }*/

      // get attribute of wce "<span class="" wce="">, determination wce type
      arr = infoArr[0];
      if (!arr) {
         return null;
      }

      wceType = arr['__t'];

      // formatting
      if (wceType.match(/formatting/)) {
         return html2Tei_formating(arr, $teiParent, $htmlNode);
      }

      // gap
      if (wceType == 'gap') {
         return html2Tei_gap(arr, $teiParent, $htmlNode);
      }

      // correction
      if (wceType === 'corr') {
         return html2Tei_correction(infoArr, $teiParent, $htmlNode);
      }

      // break
      if (wceType.match(/brea/)) {
         return html2Tei_break(arr, $teiParent, $htmlNode);
      }

      // abbr
      if (wceType == 'abbr') {
         return html2Tei_abbr(arr, $teiParent, $htmlNode);
      }

      // spaces
      if (wceType == 'spaces') {
         return html2Tei_spaces(arr, $teiParent, $htmlNode);
      }

      // note
      if (wceType == 'note') {
         return html2Tei_note(arr, $teiParent, $htmlNode);
      }

      // pc
      if (wceType == 'pc') {
         return html2Tei_pc(arr, $teiParent, $htmlNode);
      }

      // paratext
      if (wceType == 'paratext') {
         return html2Tei_paratext(arr, $teiParent, $htmlNode);
      }

      // unclear
      if (wceType == 'unclear') {
         return html2Tei_unclear(arr, $teiParent, $htmlNode);
      }

      // part_abbr
      if (wceType == 'part_abbr') {
         return html2Tei_partarr(arr, $teiParent, $htmlNode);
      }

      if (wceType == 'langchange' || wceType == 'langchangerange') {
         return html2Tei_langchange(arr, $teiParent, $htmlNode);
      }

      if (wceType == 'figure') {
         return html2Tei_figure(arr, $teiParent, $htmlNode);
      }

      // other
      var $e = $newDoc.createElement("-TEMP-" + htmlNodeName);
      $teiParent.appendChild($e);
      return {
         0: $e,
         1: false
      };

   };

   /*
    * type formating, return <hi>
    */
   var html2Tei_formating = function(arr, $teiParent, $htmlNode) {
      var $hi = $newDoc.createElement('hi');
      var formatting_rend = '',
         formatting_height = '';
      switch (arr['__t']) {
         case 'formatting_rubrication':
            formatting_rend = 'rubric';
            break;
         case 'formatting_gold':
            formatting_rend = 'gold';
            break;
         case 'formatting_blue':
            formatting_rend = 'blue';
            break;
         case 'formatting_green':
            formatting_rend = 'green';
            break;
         case 'formatting_yellow':
            formatting_rend = 'yellow';
            break;
         case 'formatting_other':
            formatting_rend = 'other';
            break;
         case 'formatting_capitals':
            formatting_rend = 'cap';
            formatting_height = arr['capitals_height'];
            break;
         case 'formatting_overline':
            formatting_rend = 'overline';
            break;
         case 'formatting_displaced-above':
            formatting_rend = 'displaced-above';
            break;
         case 'formatting_displaced-below':
            formatting_rend = 'displaced-below';
            break;
         case 'formatting_displaced-other':
            formatting_rend = 'displaced-other';
            break;
         case 'formatting_subscript':
            formatting_rend = 'subscript';
            break;
         case 'formatting_superscript':
            formatting_rend = 'superscript';
            break;
         case 'formatting_upsidedown':
            formatting_rend = 'upsidedown';
            break;
         case 'formatting_ornamentation_other':
            formatting_rend = decodeURIComponent(arr['formatting_ornamentation_other']);
            break;
      }

      if (formatting_rend != '') {
         $hi.setAttribute('rend', formatting_rend);
      }
      if (formatting_height != '') {
         $hi.setAttribute('height', formatting_height);
      }
      appendNodeInW($teiParent, $hi, $htmlNode);
      return {
         0: $teiParent,
         1: true
      };

      /*
      // add a element <w>
      if (!stopAddW) {
      	var $w = createNewWElement();
      	$w.appendChild($hi);
      	$teiParent.appendChild($w);
      } else {
      	$teiParent.appendChild($hi);
      }


      // stop add element a <w>
      return {
      	0 : $hi,
      	1 : true
      };
      */
   };

   /*
    * type gap, return <gap> or <supplied>
    */
   var html2Tei_gap = function(arr, $teiParent, $htmlNode) {
      // wce_gap <gap OR <supplied source="STRING" _type_STRING type="STRING" _reason_STRING reason="STRING" _hand_STRING hand="STRING" _unit_STRING_extent_STRING unit="STRING" extent="STRING" />
      var $newNode;

      if (arr['mark_as_supplied'] && arr['mark_as_supplied'] === 'supplied') {
         // <supplied>
         $newNode = $newDoc.createElement('supplied');
         var _supplied_source = arr['supplied_source'];
         if (_supplied_source && _supplied_source !== '') {
            if (_supplied_source === 'other' && arr['supplied_source_other'])
               $newNode.setAttribute('source', arr['supplied_source_other'].replace(/%20/g, "_"));
            else if (_supplied_source !== 'none')
               $newNode.setAttribute('source', _supplied_source);
         }
      } else {
         $newNode = $newDoc.createElement('gap');
         // <gap>
      }
      // reason
      if (arr['gap_reason']) {
         $newNode.setAttribute('reason', decodeURIComponent(arr['gap_reason']));
      }

      var extAttr = $htmlNode.getAttribute('ext');
      if (extAttr)
         $newNode.setAttribute('ext', extAttr);

      if ($newNode.nodeName === 'gap') {
         // unit
         var unitValue = arr['unit'];
         if (unitValue !== '') {
            if (unitValue == 'other' && arr['unit_other']) {
               $newNode.setAttribute('unit', arr['unit_other'].replace(/%20/g, "_"));
            } else {
               $newNode.setAttribute('unit', unitValue);
            }
         }
         // extent
         if (arr['extent']) {
            if (isNaN(parseInt(arr['extent'])))
               $newNode.setAttribute('extent', arr['extent']);
            else
               $newNode.setAttribute('quantity', arr['extent']);
         }
         var langAttr = arr['untranscribed_language'] ? arr['untranscribed_language'] : '';
         if (langAttr !== '')
            $newNode.setAttribute('xml:lang', langAttr);
         var finished;
         //if ($newNode.getAttribute('unit') == 'word') {
         //	$newNode.setAttribute('removeText','true');
         //	if ($htmlNode.firstChild.firstChild)
         //		$htmlNode.firstChild.firstChild.nodeValue = ''; // remove content [...] etc. //TODO: This should be removeChild etc. Did not work.
         //	appendNodeInW($teiParent, $newNode, $htmlNode);
         //	finished=1;
         // } else
         //

         //test if gap exist independent
         if ($newNode.getAttribute('unit') !== 'word') {
            var pre = $htmlNode.previousSibling;
            var next = $htmlNode.nextSibling;
            while (pre) {
               if (pre.nodeName === 'w') {
                  var lastAfter = pre.getAttribute('after');
                  break;
               }
               pre = pre.lastChild;
            }

            while (next) {
               if (next.nodeName === 'w') {
                  var nextBefore = next.getAttribute('before');
                  break;
               }
               next = next.firstChild;
            }

            if (((lastAfter && lastAfter === "1") || !lastAfter) &&
               (!nextBefore || (nextBefore && nextBefore === "1"))) {
               $teiParent.appendChild($newNode);
               finished = 1;
            }
         }

         if (!finished) { // gap in <w>: in/before/after/ word fixed: #1772
            $newNode.setAttribute('removeText', 'true');
            appendNodeInW($teiParent, $newNode, $htmlNode);
         }
      } else { //($newNode.nodeName === 'supplied') {
         $htmlNode = removeBracketOfSupplied($htmlNode);
         appendNodeInW($teiParent, $newNode, $htmlNode);
      }

      return {
         0: $teiParent,
         1: true
      };
   };


   /*
    * remove text "[" and "]" of <supplied>
    */
   var removeBracketOfSupplied = function($htmlNode) {
      var firstW = $htmlNode.firstChild;
      if (firstW) {
         var firstTextNode = firstW.firstChild;
         if (firstTextNode && firstTextNode.nodeType == 3) {
            firstTextNode.nodeValue = firstTextNode.nodeValue.replace(/^\[/, "");
         }
      }
      var lastW = $htmlNode.lastChild;
      if (lastW) {
         var lastTextNode = lastW.lastChild;
         if (lastTextNode && lastTextNode.nodeType == 3) {
            lastTextNode.nodeValue = lastTextNode.nodeValue.replace(/\]$/, "");
         }
      }
      return $htmlNode;
   };

   /*
    * type correction, return <app><rdg> ....
    */
   var html2Tei_correction = function(infoArr, $teiParent, $htmlNode) {
      var $app, $seg;
      var xml_id;
      //var startWordNumberInCorrection = g_wordNumber;
      var notecount;
      //to determine the correct position of the <note> insertion
      var rdgcount;

      for (var i = 0, arr, l = infoArr.length; i < l; i++) {
         arr = infoArr[i];
         if (arr['__t'] !== 'corr') {
            // make sure, we are really dealing with a correction (problems existed with abbr + corr)
            continue;
         }
         //g_wordNumber = startWordNumberInCorrection;

         if (!$app) {
            notecount = 0;
            rdgcount = 0;
            // new Element <app>
            $app = $newDoc.createElement('app');
            $teiParent.appendChild($app);

            // new Element <rdg> for original
            // <rdg type="orig" hand="firsthand"><w n="17">���ӦŦͦɦƦŦӦ���</w> <pc>?</pc></rdg>
            var $orig = $newDoc.createElement('rdg');
            $orig.setAttribute('type', 'orig');
            if (arr['ut_videtur_firsthand'] && arr['ut_videtur_firsthand'] === 'on')
               $orig.setAttribute('hand', 'firsthandV');
            else
               $orig.setAttribute('hand', 'firsthand');
            if (arr['blank_firsthand'] && arr['blank_firsthand'] === 'on') { //Blank first hand reading
               var origText = 'OMISSION'; //this is later replaced by "" DO NOT ADD <w> HERE
               nodeAddText($orig, origText);
            } else {
               var origText = $htmlNode.getAttribute('wce_orig');
               if (origText) {
                  html2Tei_correctionAddW($orig, origText);
               }
            }
            $app.appendChild($orig);
         }
         // new Element<rdg>,child of <app>($newNode)
         rdgcount++;
         var $rdg = $newDoc.createElement('rdg');
         $rdg.setAttribute('type', arr['reading']);
         var corrector_name = arr['corrector_name'];
         if (corrector_name == 'other') {
            if (arr['ut_videtur_corr'] === 'on')
               corrector_name = arr['corrector_name_other'].replace(/%20/g, "_") + 'V';
            else
               corrector_name = arr['corrector_name_other'].replace(/%20/g, "_");
         }
         if (arr['ut_videtur_corr'] && arr['ut_videtur_corr'] === 'on')
            $rdg.setAttribute('hand', decodeURIComponent(corrector_name) + 'V');
         else
            $rdg.setAttribute('hand', decodeURIComponent(corrector_name));

         // deletion
         var deletion = decodeURIComponent(arr['deletion']);
         if (deletion && deletion != 'null' && deletion != '') {
            $rdg.setAttribute('rend', deletion.replace(/\,/g, ' '));
         }

         var place = arr['place_corr'];
         var corrector_text = arr['corrector_text'];
         if (arr['blank_correction'] && arr['blank_correction'] === 'on') {
            corrector_text = 'OMISSION'; //this is later replaced by ""
         }

         // Define value for "n" attribute. This depends on the type of marginal material

         if (place === 'pageleft' || place === 'pageright' || place === 'pagetop' || place === 'pagebottom') { //define <seg> element for marginal material
            $seg = $newDoc.createElement('seg');
            isSeg = true;
            $seg.setAttribute('type', 'margin');
            $seg.setAttribute('subtype', place);
            $seg.setAttribute('n', '@' + 'P' + g_pageNumber + '-' + g_witValue);
            if (corrector_text) { //add to <seg>
               html2Tei_correctionAddW($seg, corrector_text);
            }
            $rdg.appendChild($seg);
         } else if (place === 'coltop' || place === 'colbottom' || place === 'colleft' || place === 'colright') {
            $seg = $newDoc.createElement('seg');
            isSeg = true;
            $seg.setAttribute('type', 'margin');
            $seg.setAttribute('subtype', place);
            $seg.setAttribute('n', '@' + 'P' + g_pageNumber + '-' + g_witValue);
            if (corrector_text) { //add to <seg>
               html2Tei_correctionAddW($seg, corrector_text);
            }
            $rdg.appendChild($seg);
         } else if (place === 'lineleft' || place === 'lineright') {
            $seg = $newDoc.createElement('seg');
            isSeg = true;
            $seg.setAttribute('type', 'margin');
            $seg.setAttribute('subtype', place);
            $seg.setAttribute('n', '@' + 'P' + g_pageNumber + 'L' + g_lineNumber + '-' + g_witValue);
            if (corrector_text) { //add to <seg>
               html2Tei_correctionAddW($seg, corrector_text);
            }
            $rdg.appendChild($seg);
         } else if (place === 'overwritten' || place === 'above' || place === 'below') {
            $seg = $newDoc.createElement('seg');
            isSeg = true;
            $seg.setAttribute('type', 'line');
            $seg.setAttribute('subtype', place);
            $seg.setAttribute('n', '@' + 'P' + g_pageNumber + 'L' + g_lineNumber + '-' + g_witValue);
            if (corrector_text) { //add to <seg>
               html2Tei_correctionAddW($seg, corrector_text);
            }
            $rdg.appendChild($seg);
         } else if (place) { //other
            $seg = $newDoc.createElement('seg');
            isSeg = true;
            $seg.setAttribute('type', 'other');
            $seg.setAttribute('subtype', decodeURIComponent(arr['place_corr_other']));
            $seg.setAttribute('n', '@' + 'P' + g_pageNumber + 'L' + g_lineNumber + '-' + g_witValue);
            if (corrector_text) { //add to <seg>
               html2Tei_correctionAddW($seg, corrector_text);
            }
            $rdg.appendChild($seg);
         } else { //non-marginal material
            if (corrector_text) { //add to <rdg>
               if (corrector_text === 'OMISSION') { //we don't want <w> around here
                  nodeAddText($rdg, corrector_text);
               } else
                  html2Tei_correctionAddW($rdg, corrector_text);
            }
         }
         isSeg = false;
         $app.appendChild($rdg);
      }

      return {
         0: $app,
         1: true
      };
   };

   //text from editor in editor
   var html2Tei_correctionAddW = function($newNode, text) {
      text = decodeURIComponent(text);
      var $corrXMLDoc = loadXMLString('<TEMP>' + text + '</TEMP>');
      var $corrRoot = $corrXMLDoc.documentElement;
      $corrRoot = initHtmlContent($corrRoot);
      var childList = $corrRoot.childNodes;
      for (var x = 0, $c, y = childList.length; x < y; x++) {
         $c = childList[x];
         if (!$c) {
            continue;
         } else {
            readAllHtmlNodes($newNode, $c);
         }
      }
   };
   //text from editor in editor
   var html2Tei_paratextAddChildren = function($newNode, text) {
      html2Tei_correctionAddW($newNode, text);
      if ($newNode.nodeName === 'num')
         html2Tei_paratextRemoveWNode($newNode);
      return;
   };

   var html2Tei_paratextRemoveWNode = function($node) {
      if (!$node || $node.nodeType == 3 || $node.nodeName == 'w') {
         return;
      }
      var tempList = $node.childNodes;
      var childList = new Array();

      for (var x = 0, y = tempList.length; x < y; x++) {
         childList.push(tempList[x]);
      }

      var w;
      for (var i = 0, l = childList.length; i < l; i++) {
         w = childList[i];
         if (w.nodeType == 3) continue;

         if (w.nodeName == 'w') {
            while (w.hasChildNodes()) {
               $node.insertBefore(w.firstChild, w);
            }
            w.parentNode.removeChild(w);

         } else {
            html2Tei_paratextRemoveWNode(w);
         }
      }
   };

   var isLastNodeOf = function($node, nName) {
      var parent = $node.ParentNode;
      while (parent) {
         if (parent.nodeName == nName) {
            return true;
         }
         parent = parent.ParentNode;
      }
      return false;
   };
   /*
    * type break,
    */
   // break_type= lb / cb /qb / pb number= pb_type= running_title= lb_alignment, Page (Collate |P 121|): <pb n="121" type="page" xml:id="P121-wit" /> Folio (Collate |F 3v|): <pb n="3v" type="folio" xml:id="P3v-wit" /> Column (Collate |C 2|): <cb n="2" xml:id="P3vC2-wit" />
   // Line (Collate |L 37|): <lb n="37" xml:id="P3vC2L37-wit" />
   var html2Tei_break = function(arr, $teiParent, $htmlNode) {
      var xml_id;
      var breakNodeText = getDomNodeText($htmlNode);
      var break_type = arr['break_type'];
      var $newNode;

      if (break_type) {
         /*
         // pb, cb, lb
         if (break_type == 'lb' && !$htmlNode.nextSibling && arr['hasBreak'] === 'yes' && isLastNodeOf($teiParent,'ab')) {//if this is the last element on a page, then it is only a marker
         	if($teiParent.getAttribute('part')){
         		$teiParent.setAttribute('part', 'M');
         	}else{
         		$teiParent.setAttribute('part', 'I');
         	}
         	return;
         }*/
         $newNode = $newDoc.createElement(break_type);
         switch (break_type) {
            case 'lb':
               g_lineNumber = arr['number'];
               /*if (!isSeg)
                  $newNode.setAttribute('n', g_lineNumber);*/
               if (arr['lb_alignment'] !== '') {
                  $newNode.setAttribute('rend', arr['lb_alignment']);
               }
               xml_id = 'P' + g_pageNumber_id + 'L' + g_lineNumber + '-' + g_witValue;
               break;
            case 'pb':
               var breaPage = '';
               // Set page number and decide which type (folio|page)
               if (arr['rv'] != '') { //recto or verso
                  // folio
                  g_pageNumber = arr['number'] + arr['rv'];
                  g_pageNumber = addArrows(g_pageNumber);
                  g_pageNumber_id = removeArrows(g_pageNumber);
                  if (!isSeg)
                     $newNode.setAttribute('n', g_pageNumber);
                  $newNode.setAttribute('type', 'folio');
               } else {
                  // page
                  g_pageNumber = arr['number'];
                  g_pageNumber = addArrows(g_pageNumber);
                  g_pageNumber_id = removeArrows(g_pageNumber);
                  if (!isSeg)
                     $newNode.setAttribute('n', g_pageNumber);
                  $newNode.setAttribute('type', 'page');
               }
               //}
               if (arr['facs'] !== '') {
                  // use URL for facs attribute
                  $newNode.setAttribute('facs', decodeURIComponent(arr['facs']));
               }
               xml_id = 'P' + g_pageNumber_id + '-' + g_witValue;
               break;
         }
         if (!isSeg) //no ID for breaks inside <seg>
            $newNode.setAttribute("n", xml_id);
         //IE gets confused here
         if (arr['hasBreak'] && arr['hasBreak'] === 'yes') {
            $newNode.setAttribute('break', 'no'); //This has to be "no" due to the TEI standard
         }
      }
      // Move the break one level up, if at the end of an not hyphenated word #1714
      if ($teiParent.nodeName == 'w' && !$newNode.getAttribute('break')) { //Complete word
         switch ($newNode.nodeName) {
            case 'lb':
               if ($teiParent.lastChild.nodeName != 'pb') // no pb above lb
                  $teiParent = $teiParent.parentNode;
               break;
               /*case 'cb':
               	if ($teiParent.lastChild.nodeName != 'pb') // no pb above cb
               		$teiParent = $teiParent.parentNode;
               	break;*/
            case 'pb':
               if ($teiParent.lastChild.nodeName != 'gb') // no gb above pb
                  $teiParent = $teiParent.parentNode;
               break;
            case 'gb':
               $teiParent = $teiParent.parentNode;
               break;
         }
      }
      $teiParent.appendChild($newNode);
      // TODO
      if (break_type == 'lb') {
         // TODO why add \n?
         // for lb add newline
         // $newNode.parentNode.insertBefore($newDoc.createTextNode("\n"), $newNode);
      } else if (break_type == 'pb') {
         //found_ab = false;
         final_w_set = false;
      }

      //return null; //TODO: IS THIS CORRECT?
      return {
         0: $newNode,
         1: true
      };
   };

   /*
    * type abbr, return <abbr>
    */
   var html2Tei_abbr = function(arr, $teiParent, $htmlNode) {
      var $abbr = $newDoc.createElement('abbr');

      // type
      var abbr_type = arr['abbr_type'];
      if (abbr_type && abbr_type !== '') {
         if (abbr_type === 'other')
            $abbr.setAttribute('type', arr['abbr_type_other'].replace(/%20/g, "_"));
         else
            $abbr.setAttribute('type', abbr_type);
      }

      var abbr_expansion = arr['abbr_expansion'];
      if (abbr_expansion && abbr_expansion != '') {
         var $expan = $newDoc.createElement('expan');
         nodeAddText($expan, decodeURIComponent(arr['abbr_expansion']));
         var $choice = $newDoc.createElement('choice');
         //var $tempParent = $newDoc.createElement('t');
         var cList = $htmlNode.childNodes;
         for (var i = 0, c, l = cList.length; i < l; i++) {
            $c = cList[i];
            if (!$c) {
               break;
            }
            if ($c.nodeType == 3)
               nodeAddText($tempParent, $c.nodeValue);
            else {
               withoutW = true;
               readAllHtmlNodes($abbr, $c);
               withoutW = false;
            }
         }

         //nodeAddText($abbr, $htmlNode.firstChild.textContent);
      }

      if ($choice) {
         var $w = $newDoc.createElement('w');
         $choice.appendChild($expan);
         $choice.appendChild($abbr);
         $w.appendChild($choice);
         $teiParent.appendChild($w);
         return {
            0: $teiParent,
            1: true
         };
      } else {
         appendNodeInW($teiParent, $abbr, $htmlNode);
         return {
            0: $teiParent,
            1: true
         };
      }
   };

   /*
    * type note, return <note>
    */
   var html2Tei_note = function(arr, $teiParent, $htmlNode) {
      var $note = $newDoc.createElement('note');
      var note_type_value = arr['note_type'];
      if (note_type_value == 'other') {
         var other_value = arr['note_type_other'].replace(/%20/g, "_");
         if (other_value !== '') {
            note_type_value = other_value;
         }
      }
      if (note_type_value != '') {
         if (note_type_value === 'changeOfHand') {
            $note.setAttribute('type', 'editorial');
         } else {
            $note.setAttribute('type', note_type_value);
         }
      }

      var $lastNode = $teiParent.lastChild;
      if ($lastNode) {
         note++;
         /*var text = $lastNode.innerText || $lastNode.textContent;
         if ($lastNode.nodeName === 'note'
         	|| ($lastNode.nodeName === 'w' && text === '')) //note is immediately preceded by another note
         	note++;
         else
         	note = 1;*/
      } else // this is important for notes being inserted directly after the verse number
         note = 1;
      var xml_id = g_bookNumber + '.' + g_chapterNumber + '.' + (g_stanzaNumber ? g_stanzaNumber : g_verseNumber) + '-' + g_witValue + '-' + note;
      var temp = '';
      var i = 65;
      while (idSet.has(xml_id + temp)) {
         temp = String.fromCharCode(i).toLowerCase();
         i++;
      }
      $note.setAttribute('n', xml_id + temp);
      idSet.add(xml_id + temp);

      // add <handshift/> if necessary
      if (note_type_value === "changeOfHand") {
         var $secNewNode = $newDoc.createElement('handshift');
         if (arr['newHand'].trim() != '')
            $secNewNode.setAttribute('scribe', decodeURIComponent(arr['newHand']));
         $note.appendChild($secNewNode);
      }

      nodeAddText($note, decodeURIComponent(arr['note_text'])); // add text to node

      /*23.10.2013 YG
      // Note has to be moved after the current word; Caveat: If there is a break following the note, a special treatment has to be applied
      if ($teiParent.nodeName == 'w') {
      	$teiParent = $teiParent.parentNode;
      	if ($htmlNode.nextSibling && $htmlNode.nextSibling.nodeType == 1
      		&& $($htmlNode.nextSibling).hasClass('brea')) { // break following the note => insert space (don't forget to reverse that at import
      		var $tempNode = $newDoc.createTextNode(" ");
      		$htmlNode.parentNode.insertBefore($tempNode, $htmlNode.nextSibling);
      	}
      }*/

      $teiParent.appendChild($note); //add node to tree

      return {
         0: $note,
         1: true
      };
   };

   /*
    * type space, return <space>
    */
   var html2Tei_spaces = function(arr, $teiParent, $htmlNode) {
      var $space = $newDoc.createElement('space');

      var sp_unit_value = arr['sp_unit'];
      if (sp_unit_value === 'other' && arr['sp_unit_other'] !== '') {
         sp_unit_value = arr['sp_unit_other'].replace(/%20/g, "_");
      }
      if (sp_unit_value != '') {
         $space.setAttribute('unit', sp_unit_value);
      }

      sp_unit_value = arr['sp_extent'];
      if (sp_unit_value) {
         if (isNaN(parseInt(sp_unit_value)))
            $space.setAttribute('extent', sp_unit_value);
         else
            $space.setAttribute('quantity', sp_unit_value);
      }
      $teiParent.appendChild($space);

      return {
         0: $space,
         1: true
      };
   };

   /*
    * type pc, return <pc>
    */
   var html2Tei_pc = function(arr, $teiParent, $htmlNode) {
      //Fixed #1766
      var pre = $htmlNode.previousSibling;
      var next = $htmlNode.nextSibing;
      if (pre && pre.nodeName == 'w') {
         pre.setAttribute('after', '1');
      }
      if (next && next.nodeName == 'w') {
         next.setAttribute('before', '1');
      }

      var $pc = $newDoc.createElement('pc');
      if (arr['note']) {
         $pc.setAttribute('type', 'special');
         nodeAddText($pc, decodeURIComponent(arr['note']));
      } else
         nodeAddText($pc, getDomNodeText($htmlNode));
      $teiParent.appendChild($pc);
      //appendNodeInW($teiParent, pc, $htmlNode);
      return {
         0: $pc,
         1: true
      };
   };

   /*
    * type paratext, return <fw>, <num> or <note>
    */
   // <fw type="STRING" place="STRING" rend="align(STRING)">...</fw> <num type="STRING" n="STRING" place="STRING" rend="align(STRING)">...</num> <div type="incipit"><ab>...</ab></div> <div type="explicit"><ab>...</ab></div>
   var html2Tei_paratext = function(arr, $teiParent, $htmlNode) {
      var newNodeName, fwType = arr['fw_type'];

      if (fwType === 'commentary' || fwType === 'runTitle' || fwType === 'colophon' ||
         fwType === 'catch' || fwType === 'pageNum' ||
         fwType === 'orn' || fwType === 'other') {
         newNodeName = 'fw';
      }
      if (fwType !== 'isolated') {
         var $paratext = $newDoc.createElement(newNodeName);
         fwType = (fwType === 'other') ? arr['fw_type_other'].replace(/%20/g, "_") : fwType;
         $paratext.setAttribute('type', fwType);
      }

      var rend = "";

      var cl = arr['covered'];
      if (cl) {
         rend += "covered(" + cl + ") ";
      }

      // place
      var placeValue = arr['paratext_position'];
      if (placeValue === 'other') {
         placeValue = arr['paratext_position_other'].replace(/%20/g, "_");
      }

      // alignment
      var rendValue = arr['paratext_alignment'];
      if (fwType != 'isolated' && rendValue && rendValue != '') {
         rend += "align(" + rendValue + ")";
      }
      if (rend != '')
         $paratext.setAttribute('rend', rend.trim());

      var lang = arr['language_name'] ? arr['language_name'] : '';
      if (isOther(lang)) {
         if (alertonlangnotshown) {
            alert("Please note: The \"other\" value for xml:lang is no longer supported.\nExisting entries have been removed.");
            alertonlangnotshown = false;
         }
         lang = '';
      }
      if (fwType == 'isolated') {
         var $seg;
         isSeg = true;
         $seg = $newDoc.createElement('seg');
         if (placeValue === 'pageleft' || placeValue === 'pageright' || placeValue === 'pagetop' || placeValue === 'pagebottom' ||
            placeValue === 'coltop' || placeValue === 'colbottom' || placeValue === 'colleft' || placeValue === 'colright' ||
            placeValue === 'lineleft' || placeValue === 'lineright') {
            $seg.setAttribute('type', 'margin');
         } else if (placeValue === 'above' || placeValue === 'below' || placeValue === 'here' || placeValue === 'overwritten') {
            $seg.setAttribute('type', 'line');
         } else { // other
            $seg.setAttribute('type', 'other');
         }
         $seg.setAttribute('subtype', placeValue);
         if (lang !== '')
            $seg.setAttribute('xml:lang', lang);
         html2Tei_paratextAddChildren($seg, arr['marginals_text']);
         $teiParent.appendChild($seg);
      } else { // only if not isolated
         isSeg = true;
         html2Tei_paratextAddChildren($paratext, arr['marginals_text']);
         //nodeAddText($paratext, decodeURIComponent(arr['marginals_text']));
         var $seg;
         if (placeValue === '') {
            if (lang !== '')
               $paratext.setAttribute("xml:lang", lang);
            $teiParent.appendChild($paratext);
         } else {
            if (placeValue === 'pageleft' || placeValue === 'pageright' || placeValue === 'pagetop' || placeValue === 'pagebottom') { //define <seg> element for marginal material
               $seg = $newDoc.createElement('seg');
               $seg.setAttribute('type', 'margin');
               $seg.setAttribute('subtype', placeValue);
               $seg.setAttribute('n', '@' + 'P' + g_pageNumber + '-' + g_witValue);
            } else if (placeValue === 'coltop' || placeValue === 'colbottom' || placeValue === 'colleft' || placeValue === 'colright') {
               $seg = $newDoc.createElement('seg');
               $seg.setAttribute('type', 'margin');
               $seg.setAttribute('subtype', placeValue);
               $seg.setAttribute('n', '@' + 'P' + g_pageNumber + '-' + g_witValue);
            } else if (placeValue === 'lineleft' || placeValue === 'lineright') {
               $seg = $newDoc.createElement('seg');
               $seg.setAttribute('type', 'margin');
               $seg.setAttribute('subtype', placeValue);
               $seg.setAttribute('n', '@' + 'P' + g_pageNumber + 'L' + g_lineNumber + '-' + g_witValue);
            } else if (placeValue === 'above' || placeValue === 'below' || placeValue === 'here' || placeValue === 'overwritten') {
               $seg = $newDoc.createElement('seg');
               $seg.setAttribute('type', 'line');
               $seg.setAttribute('subtype', placeValue);
               $seg.setAttribute('n', '@' + 'P' + g_pageNumber + 'L' + g_lineNumber + '-' + g_witValue);
            } else { // other
               $seg = $newDoc.createElement('seg');
               $seg.setAttribute('type', 'other');
               $seg.setAttribute('subtype', placeValue);
               $seg.setAttribute('n', '@' + 'P' + g_pageNumber + 'L' + g_lineNumber + '-' + g_witValue);
            }
            if (lang !== '')
               $seg.setAttribute('xml:lang', lang);
            $seg.appendChild($paratext);
            $teiParent.appendChild($seg);
         }
      }
      isSeg = false;
      return null;
   };

   /*
    * type unclear, return <unclear_reason_STRING reason="STRING">...</unclear>
    */
   var html2Tei_unclear = function(arr, $teiParent, $htmlNode) {
      //remove Dot Below
      var str = xml2String($htmlNode);
      //str = str.replace(/\u0323/g, '');
      $htmlNode = loadXMLString(str).documentElement;

      var $unclear = $newDoc.createElement('unclear');
      var reasonValue = arr['unclear_text_reason'].replace(/%20/g, "_");
      if (reasonValue === 'other') {
         reasonValue = arr['unclear_text_reason_other'].replace(/%20/g, "_");
      }
      if (reasonValue && reasonValue !== '') {
         $unclear.setAttribute('reason', decodeURIComponent(reasonValue));
      }
      appendNodeInW($teiParent, $unclear, $htmlNode);

      return {
         0: $unclear,
         1: true
      };
   };

   /*
    * type part_abbr, return <ex>
    */
   var html2Tei_partarr = function(arr, $teiParent, $htmlNode) {
      var $ex = $newDoc.createElement('ex');
      var rend = arr['exp_rend'];
      if (rend === 'other') {
         rend = arr['exp_rend_other'].replace(/%20/g, "_");
      }
      if (rend && rend !== '') {
         $ex.setAttribute('rend', decodeURIComponent(rend));
      }
      var textValue = getDomNodeText($htmlNode);
      if (textValue) {
         textValue = textValue.substr(1, textValue.length - 2);
         nodeAddText($ex, textValue);
      }
      $teiParent.appendChild($ex);
      return {
         0: $ex,
         1: true
      };

      /*
      if (!stopAddW) {
      	var $w = createNewWElement();
      	$w.appendChild($ex);
      	$teiParent.appendChild($w);
      } else {
      	$teiParent.appendChild($ex);
      }

      return {
      	0 : $ex,
      	1 : true
      }*/
   };

   var html2Tei_langchange = function(arr, $teiParent, $htmlNode) {
      var count_verse = 97 + Math.floor(g_verseNumber / 2);
      var langID;
      var reason = arr['reason_for_language_change'];
      var lang = arr['lang'] ? arr['lang'] : '';
      var partial = arr['partial'] ? arr['partial'] : '';

      if (lang.indexOf("Avst") > -1)
         langID = 'A';
      else if (lang.indexOf("pal") > -1 || lang.indexOf("Phlv") > -1)
         langID = 'P';
      else if (lang.indexOf("gu") > -1)
         langID = 'G';
      else if (lang.indexOf("fa") > -1 || lang.indexOf("per") > -1)
         langID = 'PER';
      else if (lang.indexOf("sa") > -1)
         langID = 'S';
      else
         langID = 'O'; //Other

      switch (reason) {
         case 'translation':
         case 'section':
            var $ab = $newDoc.createElement('ab');
            $ab.setAttribute('type', reason);
            $ab.setAttribute('n', g_bookNumber + "." + g_chapterNumber + "." + (g_stanzaNumber ? g_stanzaNumber : g_verseNumber) + String.fromCharCode(count_verse) + langID);
            var $next = $htmlNode.nextSibling;
            while ($next && $next.innerHTML == '')
               $next = $next.nextSibling;
            //if ($next)
            //    alert($next.innerHTML);
            if ($next && (!isStructuralElement($next) || $next == $htmlNode.parentNode.lastChild))
               alert("A structural element is missing after \"" + $htmlNode.textContent + "\"");
            break;
         default: //other
            var $ab = $newDoc.createElement('foreign');
            $ab.setAttribute('n', g_bookNumber + "." + g_chapterNumber + "." + (g_stanzaNumber ? g_stanzaNumber : g_verseNumber) + String.fromCharCode(count_verse) + langID);
            break;
      }

      if (lang !== '')
         $ab.setAttribute('xml:lang', lang);

      if (partial !== '')
         $ab.setAttribute('part', partial);

      var childList = $htmlNode.childNodes;
      for (var i = 0, $c, l = childList.length; i < l; i++) {
         $c = childList[i];
         if (!$c) {
            continue;
         } else {
            readAllHtmlNodes($ab, $c, false);
         }
      }

      $teiParent.appendChild($ab);
      return {
         0: $ab,
         1: true
      };
   };

   var html2Tei_figure = function(arr, $teiParent, $htmlNode) {
      var $figure, $desc;

      $figure = $newDoc.createElement('figure');
      var _covered = arr['extent'];
      var _desc = decodeURI(arr['graphic_desc']);

      if (_covered && _covered != '')
         $figure.setAttribute('rend', 'cover' + _covered);
      if (_desc && _desc != '') {
         $desc = $newDoc.createElement('desc');
         nodeAddText($desc, _desc);
         $figure.appendChild($desc);
      }
      $teiParent.appendChild($figure);

      return {
         0: $figure,
         1: true
      };
   };

   /*
    * String converted into an array
    */
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

   return getTeiString();

};

/*
 * Compare two node by nodeName and attribute, but not textContent
 */
var compareNodes = function($n1, $n2) {
   if (!$n1 || !$n2) {
      return false;
   }
   if ($n1.nodeType == 3 || $n2.nodeType == 3) {
      return false;
   }
   if ($n1.nodeName != $n2.nodeName) {
      return false;
   }

   var atts1 = $n1.attributes;
   var atts2 = $n2.attributes;
   if (!atts1 && !atts2) {
      return true;
   }

   if ((atts1 && !atts2) || (!atts1 && atts2)) {
      return false;
   }
   if (atts1.length != atts2.length) {
      return false;
   }

   for (var b, i = 0, l = atts1.length; i < l; i++) {
      b = false;
      for (var x = 0, y = atts2.length; x < y; x++) {
         if (atts1[i].nodeName == atts2[x].nodeName && atts1[i].value == atts2[x].value) {
            b = true;
            continue;
         }
      }
      if (!b) {
         return false;
      }
   }
   return true;
};

/*
 * Is the string begins with a space
 */
var startHasSpace = function(str) {
   if (str.match(/^\s+/)) {
      return true;
   }
};

/*
 * Is the string end with a space
 */
var endHasSpace = function(str) {
   if (str.match(/\s+$/)) {
      return true;
   }
};

/*
 * load txt and generate DOM object
 */
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

/*
 * Read xml file to generate the DOM object
 */
function loadXMLDoc(dname) {
   var xhttp;
   if (window.XMLHttpRequest) {
      xhttp = new XMLHttpRequest();
   } else {
      xhttp = new ActiveXObject("Microsoft.XMLHTTP");
   }
   xhttp.open("GET", dname, false);
   xhttp.send();
   return xhttp.responseXML;
}

/*
 * converted DOM into a string
 *
 */
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
 * text or textContent
 */
function getDomNodeText($node) {
   var text = $node.text;
   if (!text) {
      text = $node.textContent;
   }
   return text;
}

/*
 * add text to a node
 */
function nodeAddText($node, str) {
   if (str) {
      $node.appendChild($node.ownerDocument.createTextNode(str));
   }
};

function addArrows(str) {
   var out = str;
   if (str.indexOf("x") == str.length - 1)
      out = str.substring(0, str.length - 1) + "→";
   else if (str.indexOf("y") == str.length - 1)
      out = str.substring(0, str.length - 1) + "↓";
   return out;
};

function removeArrows(str) {
   var out = str;
   if (str.indexOf("→") == str.length - 1)
      out = str.substring(0, str.length - 1) + "x";
   else if (str.indexOf("↓") == str.length - 1 || str.indexOf("↑") == str.length - 1) // Second one is just for compatibility
      out = str.substring(0, str.length - 1) + "y";
   return out;
};

var removeBlankNode = function($root) { //remove blank node,
   var _remove = function($node) {
      var nodeName = $node.nodeName;
      var notNames = ['lb', 'pb', 'gap'];
      if ($node.nodeType != 3 && !$node.firstChild && $.inArray(nodeName, notNames) < 0) {
         var parent = $node.parentNode;
         if (parent) {
            parent.removeChild($node);
            if (parent != $root) {
               _remove(parent);
            }
         }
         return;
      }
      var temp = $node.childNodes;
      var childList = new Array();
      for (var i = 0, c, l = temp.length; i < l; i++) {
         c = temp[i];
         if (!c) {
            continue;
         } else {
            childList.push(c);
         }
      }
      for (var i = 0, c, l = childList.length; i < l; i++) {
         c = childList[i];
         if (!c) {
            continue;
         } else {
            _remove(c);
         }
      }
      return;
   }

   //read all child of $root
   var te = $root.childNodes;
   var cl = new Array();
   for (var i = 0, c, l = te.length; i < l; i++) {
      c = te[i];
      if (!c) {
         continue;
      } else {
         cl.push(c);
      }
   }
   for (var i = 0, c, l = cl.length; i < l; i++) {
      c = cl[i];
      if (!c) {
         continue;
      } else {
         _remove(c);
      }
   }
   return $root;
};

var removeSpaceAfterLb = function($node) {
   var nodeName = $node.nodeName;
   if (nodeName && nodeName == 'lb') {
      var toTrim = $node.getAttribute('break') && $node.getAttribute('break') == 'no';
      if (!toTrim) {
         var pre = $node.previousSibling;
         while (pre) {
            if (pre.nodeType != 3) {
               if (pre.getAttribute('break') && pre.getAttribute('break') == 'no') {
                  toTrim = true;
                  break;
               }
            }
            pre = pre.previousSibling;
         }
      }
      if (toTrim) {
         var next = $node.nextSibling;
         if (next && next.nodeType == 3) {
            next.nodeValue = $.trim(next.nodeValue);
         }
      }
   }
   var temp = $node.childNodes;
   var childList = new Array();

   for (var i = 0, $c, l = temp.length; i < l; i++) {
      $c = temp[i];
      if (!$c) {
         continue;
      } else {
         childList.push($c);
      }
   }
   for (var i = 0, $c, l = childList.length; i < l; i++) {
      $c = childList[i];
      if (!$c) {
         continue;
      } else {
         removeSpaceAfterLb($c);
      }
   }
};

function isStructuralElement($node) {
   var classVal = $node.getAttribute("class") ? $node.getAttribute("class") : '';
   if (classVal.startsWith("book_number") || classVal.startsWith("chapter_number") ||
      classVal.startsWith("stanza_number") || classVal.startsWith("verse_number") ||
      classVal.startsWith("line_number") || classVal.startsWith("verseline_number") ||
      classVal.startsWith("ritualdirection_number") ||
      (classVal.startsWith("langchange") && $node.getAttribute("wce") &&
         !$node.getAttribute("wce").includes("reason_for_language_change=other"))) {
      return true;
   } //else if (classVal == '' && $node.innerHTML == '')
   //    return true;
   else
      return false;
}

function isOther(lang) {
   if (lang === "ae" || lang === "gu" || lang === "fa" || lang === "fa-Phlv" ||
      lang === "sa" || lang === "sa-Jaina" || lang === "sa-Deva" ||
      lang === "ae-Avst" || lang === "ae-Phlv" ||
      lang === "ae-Gujr" || lang === "pal-Avst" || lang === "pal-Phlv" ||
      lang === "pal-Gujr" || lang === "pal-Phli" || lang === "gu-Arab" ||
      lang === "gu-Gujr" || lang === "gu-Jaina" || lang === "gu-Deva" ||
      lang === "ar" || lang === "") {
      return false;
   } else {
      return true;
   }
}
