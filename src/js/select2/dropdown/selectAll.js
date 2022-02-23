/**
 * Name: Select All
 * Description: When the select is multiple and
 *  selectAllOption is true, display the `select all`
 * Author: Dande
 */
define([
  'jquery',
  '../utils'
], function ($, Utils) {
  function SelectAll (decorated, $element, options, dataAdapter) {
    decorated.call(this, $element, options, dataAdapter);
  }

  SelectAll.prototype.render = function (decorated) {
    var $rendered = decorated.call(this);
    var selectAllLabel = this.options.get('selectAllText');
    selectAllLabel = selectAllLabel?
      selectAllLabel:
      this.options.get('translations').get('selectAllText')();

    var $selectAll = $(
      '<div class="select2-selectall select2-selectall--dropdown">' +
        '<label>' +
          '<input class="select2-selectall__field" type="checkbox"' +
          ' role="selectallbox"/>' +
          selectAllLabel +
        '</label>' +
      '</div>'
    );
    this.$selectAllContainer = $selectAll;
    this.$selectAll = $selectAll.find('input');

    this.$selectAll.prop('autocomplete', this.options.get('autocomplete'));
    this.$selectAll.attr('aria-label', selectAllLabel);
    $rendered.prepend($selectAll);
    return $rendered;
  };

  SelectAll.prototype.bind = function (decorated, container, $container) {
    var self = this;

    var resultsId = container.id + '-results';

    decorated.call(this, container, $container);

    // Event select all click.
    this.$selectAll.on('change', function(evt) {
      var checked = $(this).is(':checked');
      if(checked) {
        self._selectAll(evt);
      } else {
        self._unselectAll(evt);
      }
      self.trigger(checked?'close':'open');
    });

    container.on('open', function (e) {
      self.$selectAll.attr('tabindex', 0);
      self.$selectAll.attr('aria-controls', resultsId);
    });

    container.on('results:all', function (params) {
      var data = params.data.results;
      var bool = self._selectedCheck(data);
      self.$selectAll.prop('checked', bool);
    });

    container.on('close', function () {
      self.$selectAll.attr('tabindex', -1);
      self.$selectAll.removeAttr('aria-controls');
      self.$selectAll.removeAttr('aria-activedescendant');
    });
  };
  SelectAll.prototype._selectedCheck = function(_, data){
    for(var i in data) {
      if(data[i].element != null && !data[i].element.disabled){
        if(data[i].hasOwnProperty('children')) {
          if(!this._selectedCheck(data[i].children)) {
            return false;
          }
        } else if(!$(data[i].element).is(':checked')) {
          return false;
        }
      }
    }
    return true;
  };
  SelectAll.prototype._selectAll = function(_, evt){
    var self = this;
    var result = this.$dropdown.find('#' +
      this.$selectAll.attr('aria-controls') +
      ' .select2-results__option--selectable');
    result.each(function(i){
      var data = Utils.GetData(this, 'data');
      self.trigger('select', {
        data: data
      });
    });
  };
  SelectAll.prototype._unselectAll = function(_, evt){
    var self = this;
    var result = this.$dropdown.find('#' +
      this.$selectAll.attr('aria-controls') +
      ' .select2-results__option--selected');
    result.each(function(i){
      var data = Utils.GetData(this, 'data');
      self.trigger('unselect', {
        data: data
      });
    });
  };

  return SelectAll;
});
