// usage: log('inside coolFunc',this,arguments);
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments) );
  }
};

//
var Emzy = {
  start: function() {
    this.nodeEvents();
    this.createNode();
    this.deleteNode();
    this.rootNode();
  },

  number: /^[0-9\.]+$/,
  numberCanNeg: /^-?[0-9\.]+$/,

  // Return true if is the root node
  isRoot: function(element) { return element.hasClass('root'); },

  nodeEvents: function() {
    $(document).ready( function() {
      $('body')
        .on('click', '.toCss', Emzy.toCss )
        .on('click', '.emAddChild', Emzy.createNode )
        .on('click', '.emAddSibling', Emzy.createNode )
        .on('click', '.emRemove', Emzy.deleteNode )
        .on('dblclick', '.nodeName', function() { $(this).removeAttr('disabled').focus(); } )
        .on('blur', '.nodeName', function() { $(this).attr('disabled', true); } )
        .on('keyup', '.pxInput', Emzy.getValues )
        .on('sortstart', function() { $('.nodeList').toggleClass('sortStart'); })
        .on('sortstop', function() { $('.nodeList').toggleClass('sortStart'); });
    });
  },

  newNode: function(root){
    var moveHandleHtml = '',
        addSiblingHtml = '',
        removeNodeHtml = '',
        rootValue = '',
        rootResult = '',
        rootNodeHtml = ' root',
        rootNodeClass = 'body';

    if (root === false) {
      moveHandleHtml = '<div class="handle"><i class="fa fa-ellipsis-v"></i></div>',
      addSiblingHtml = '<a class="btn btn-small emAddSibling"><i class="fa fa-arrow-down"></i></a>',
      removeNodeHtml = '<a class="btn btn-small btn-danger emRemove"><i class="fa fa-remove"></i></a>',
      rootNodeHtml = '',
      rootNodeClass = 'element';
    }
    if (root === true) {
      rootValue = '16',
      rootResult = '1';
    }

    var $node =
          $('<div class="emBox'+rootNodeHtml+'"></div>'),
        nodeHtml = '<form class="form-inline">'+moveHandleHtml+'<div class="btn-group pull-right"><a class="btn btn-small emAddChild"><i class="fa fa-arrow-right"></i></a>'+addSiblingHtml+removeNodeHtml+'</div> <div class="formWrapper control-group input-prepend input-append"><input type="text" class="add-on nodeName" value="'+rootNodeClass+'" disabled><span> {&nbsp;&nbsp;</span><input type="text" class="input-small span1 pxInput" value="'+rootValue+'" /><span>px&nbsp;&nbsp;=&nbsp;&nbsp;</span><span class="uneditable-input span2 emOutput">'+rootResult+'</span><span>em&nbsp;&nbsp;}</span></div></form><div class="nodeList"></div>';

    $node.html(nodeHtml);

    return $node;
  },

  rootNode: function () {
    $(document).on('ready', function() {
      $('.emzyApp').append( Emzy.newNode(true) );
    });
  },

  sortableNode: function () {
    $('.root').sortable({
      connectWith: '.emzyApp .nodeList',
      dropOnEmpty: true,
      cursorAt: {top:5, left:5},
      handle:'.handle',
      items: '.emBox',
      placeholder: 'placeholder'
    }).disableSelection();
  },

  createNode: function () {
    if ( $(this).hasClass('emAddChild') ) {
      $(this).parent().parent().siblings('.nodeList').append( Emzy.newNode(false) );
    } else {
      $(this).parent().parent().parent().parent().append( Emzy.newNode(false) );
    }
    Emzy.sortableNode();
  },

  deleteNode: function(){
    $(this).parent().parent().parent().remove();
  },

  // Get, Evaluate and Prepare values for calculation
  getValues: function() {
    var rootInput = $('.root').children('form').children('.formWrapper').children('.pxInput'),
        parent = $(this).parent().parent().parent(),
        pxValue = $(this).val(),
        parentValue = ( (Emzy.isRoot(parent)) ? 16 : parent.parent().siblings('form').children('.formWrapper').children('.pxInput').val()),
        outputField = $(this).siblings('.emOutput');

    if ( !!$(rootInput).val() && !!$(this).val() && Emzy.number.test(pxValue) ) {
      if ( $(this).parent().hasClass('error') ) { $(this).parent().removeClass('error'); }
      $(outputField).text( Emzy.calcEm(pxValue, parentValue) );
    
    } else if ( !$(rootInput).val() && !!$(this).val() ) {
      if ( !$(rootInput).parent().hasClass('error') ) { $(rootInput).parent().addClass('error'); }
      $(outputField).text(0);
    
    } else {
      if ( !$(this).parent().hasClass('error') ) { $(this).parent().addClass('error'); }
    }

    if (Emzy.isRoot(parent)) {
      // Re calculate children values
      $(parent).find('div').filter('.emBox').each( function(){
        $(this).find('input').filter('.pxInput').each( Emzy.getValues );
      });
    }
  },

  // Calculate and return final output
  calcEm: function( pxValue, parentValue ) {
    return Emzy.roundEm( pxValue/parentValue );
  },

  roundEm: function(emValue) {
    var temp = Math.round(emValue * Math.pow(10,4)) / Math.pow(10,4);
    return temp;
  },

  toCss: function() {
    var output = '';
    $('.emBox').each( function(index) {
      var nodeClass = $(this).children('form').children('.formWrapper').children('.nodeName').val(),
          nodeEmval = $(this).children('form').children('.formWrapper').children('.emOutput').text();
      
      output += nodeClass+' { font-size: '+nodeEmval+'em }<br/>';
    });
    $('.emzyOutput').html('<pre>'+output+'</pre>');
  }

};

$( function () { Emzy.start(); });