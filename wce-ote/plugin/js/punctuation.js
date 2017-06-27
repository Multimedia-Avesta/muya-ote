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

tinymce.PluginManager.add('punctuation', function(ed, jsUrl) {
  var menuItemsAdd = [{
    id: '001',
    title: 'single dot'
  }, {
    id: '002',
    title: 'single circle'
  }, {
    id: '003',
    title: 'single circle + 3 dots on top'
  }, {
    id: '004',
    title: 'single fat dot'
  }, {
    id: '005',
    title: 'single fat dot + 3 dots on top'
  }, {
    id: '006',
    title: '3 dots v-shape'
  }, {
    id: '007',
    title: '3 dots roof-shape'
  }, {
    id: '008',
    title: '4 dots diamond-shape arrangement'
  }, {
    id: '009',
    title: '3 circles v-shape'
  }, {
    id: '010',
    title: '3 circles roof-shape intertwined with 3 circles v-shape'
  }, {
    id: '011',
    title: '3 circles roof-shape intertwined with 3 dots v-shape'
  }, {
    id: '012',
    title: '4 circles diamond-shape arrangement'
  }, {
    id: '013',
    title: '4 dots diamond-shape plus red surrounding'
  }, {
    id: '014',
    title: 'circle with red triangle above and below'
  }, {
    id: '015',
    title: 'circle with four fat dots or circles above and below'
  }, {
    id: '016',
    title: 'circle with four circles around and red & black dots around'
  }, {
    id: '017',
    title: 'circle+6 half circles'
  }, {
    id: '018',
    title: 'circle+7 half circles'
  }, {
    id: '019',
    title: 'circle+8 half circles'
  }, {
    id: '020',
    title: 'circle+9 half circles'
  }, {
    id: '021',
    title: 'circle+10 half circle linep'
  }, {
    id: '022',
    title: 'circle+11 half circle line'
  }, {
    id: '023',
    title: 'circle surrounded by two wavy lines'
  }, {
    id: '024',
    title: 'circle + 4 round petals, flower-shape'
  }, {
    id: '025',
    title: 'circle + 5 petals, flower-shape'
  }, {
    id: '026',
    title: 'circle + 8 petals, star-shape'
  }, {
    id: '027',
    title: '2 concentric circles, 7 spokes'
  }, {
    id: '028',
    title: 'Star running, 6 arms'
  }, {
    id: '029',
    title: 'Four circles in a rhombus'
  }, {
    id: '030',
    title: 'Two parallel lines at the end of a line, left side up'
  }, {
    id: '031',
    title: 'Two parallel lines at the end of a line'
  }, {
    id: '032',
    title: 'Two parallel lines above letters'
  }, {
    id: '033',
    title: 'insertion sign v-shaped'
  }, {
    id: '034',
    title: 'insertion sign roof shaped'
  }, {
    id: '035',
    title: 'large v-shaped interpunction sign'
  }, {
    id: '',
    title: 'other (TODO)',
    onclick: function() {
      ed.execCommand('mcdAddPunctuationOther');
    }
  }];

  menuItemsAdd.forEach(function(it) {
    it.text = it.id + ' ' + it.title;
    if(!it.onclick) {
      it.onclick = function() {
        ed.execCommand('mceAdd_pc', it.id);
      }
    }
  });

  var menuItemsBlank = [{
    text: tinymce.translate('menu_add'),
    id: 'menu-punctuation-blankspaces-add',
    cmd: 'mceAddSpaces'
  }, {
    text: tinymce.translate('menu_edit'),
    id: 'menu-punctuation-blankspaces-edit',
    cmd: 'mceEditSpaces'
  }, {
    text: tinymce.translate('menu_delete'),
    id: 'menu-punctuation-blankspaces-delete',
    onclick: function() {
      WCEUtils.wceDelNode(ed);
    }
  }];

  menuItemsBlank.forEach(function(it) {
    if(!it.onclick && it.cmd) {
      it.onclick = function() {
        it.insert == undefined ? ed.execCommand(it.cmd) : ed.execCommand(it.cmd, it.insert);
      }
    }
  });

  ed.addButton('punctuation', {
    title: tinymce.translate('menu_punctuation'),
    image: jsUrl.replace(/js$/, 'img') + '/button_P.png',
    icons: false,
    type: 'menubutton',
    onPostRender: function() {
      ed.WCE_CON.buttons[this.settings.icon] = this;
    },
    menu: [{
        text: tinymce.translate('menu_punctuation_add'),
        menu: menuItemsAdd,
      },
      {
        text: tinymce.translate('menu_blank_spaces'),
        id: 'menu-punctuation-blankspaces',
        menu: menuItemsBlank,
        onshow: function(a) {
          var items = a.control.items();
          var w = ed.WCE_VAR;
          if(w.type == 'spaces') {
            items[0].disabled(true);
            items[1].disabled(false);
            items[2].disabled(false);
          } else {
            items[0].disabled(false);
            items[1].disabled(true);
            items[2].disabled(true);
          }
        }
      }
    ]
  })
});