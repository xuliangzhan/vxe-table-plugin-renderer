"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginRenderer = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getCursorPosition(textarea) {
  var rangeData = {
    text: '',
    start: 0,
    end: 0
  };

  if (_xeUtils["default"].isFunction(textarea.setSelectionRange)) {
    rangeData.start = textarea.selectionStart;
    rangeData.end = textarea.selectionEnd;
  }

  return rangeData;
}

function setCursorPosition(textarea, rangeData) {
  if (_xeUtils["default"].isFunction(textarea.setSelectionRange)) {
    textarea.focus();
    textarea.setSelectionRange(rangeData.start, rangeData.end);
  }
}

var $text;

if (typeof document !== 'undefined') {
  $text = document.createElement('span');
  $text.className = 'x-textarea--resize';
  $text.style.visibility = 'hidden';
  $text.style.zIndex = '-1';
  $text.style.position = 'absolute';
}

function autoResizeTextarea(evnt, renderOpts, params) {
  var _renderOpts$props = renderOpts.props,
      props = _renderOpts$props === void 0 ? {} : _renderOpts$props;
  var $table = params.$table,
      column = params.column;
  var minWidth = column.renderWidth,
      minHeight = column.renderHeight;
  var inpElem = evnt.target; // let cell = inpElem.parentNode.parentNode ? inpElem.parentNode.parentNode.parentNode : null

  var maxWidth = props.maxWidth || 600;
  var maxHeight = props.maxHeight || 400;
  $text.textContent = "".concat(inpElem.value, "\n");
  $text.style.maxWidth = "".concat(maxWidth, "px");

  if (!$text.parentNode) {
    $table.$el.appendChild($text);
  }

  var height = Math.min(maxHeight, $text.offsetHeight + 4);
  inpElem.style.width = "".concat(Math.min(maxWidth, Math.max(minWidth, $text.offsetWidth + 20)), "px");
  inpElem.style.height = "".concat(height < minHeight ? minHeight : height, "px");
  inpElem.style.overflowY = height > maxWidth ? 'auto' : '';
}

function getEvents(renderOpts, params) {
  var events = renderOpts.events;
  var $table = params.$table,
      column = params.column;
  var model = column.model;
  var on = {
    input: function input(evnt) {
      var cellValue = evnt.target.value;
      model.update = true;
      model.value = cellValue;
      $table.updateStatus(params, cellValue);
    }
  };

  if (events) {
    _xeUtils["default"].assign(on, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        cb.apply(null, [params].concat.apply(params, args));
      };
    }));
  }

  return on;
}
/**
 * 渲染函数
 */


var renderMap = {
  XInput: {
    autofocus: '.x-input',
    renderEdit: function renderEdit(h, renderOpts, params) {
      var _renderOpts$props2 = renderOpts.props,
          props = _renderOpts$props2 === void 0 ? {} : _renderOpts$props2,
          attrs = renderOpts.attrs,
          _renderOpts$events = renderOpts.events,
          events = _renderOpts$events === void 0 ? {} : _renderOpts$events;
      var column = params.column;
      var model = column.model;
      var prefixIcon = props.prefixIcon,
          suffixIcon = props.suffixIcon;
      var prefixClick = events.prefixClick,
          suffixClick = events.suffixClick;
      return [h('div', {
        "class": ['x-input--wrapper', {
          'is--prefix': props.prefixIcon,
          'is--suffix': props.suffixIcon
        }],
        style: {
          height: "".concat(column.renderHeight - 1, "px")
        }
      }, [prefixIcon ? h('i', {
        "class": ['x-input--prefix', prefixIcon, {
          'is--trigger': prefixClick
        }],
        on: prefixClick ? {
          click: function click(evnt) {
            return prefixClick(params, evnt);
          }
        } : null
      }) : null, h('input', {
        "class": 'x-input',
        attrs: attrs,
        domProps: {
          value: model.value
        },
        on: getEvents(renderOpts, params)
      }), suffixIcon ? h('i', {
        "class": ['x-input--suffix', suffixIcon, {
          'is--trigger': suffixClick
        }],
        on: suffixClick ? {
          click: function click(evnt) {
            return suffixClick(params, evnt);
          }
        } : null
      }) : null])];
    }
  },
  XTextarea: {
    autofocus: '.x-textarea',
    renderEdit: function renderEdit(h, renderOpts, params) {
      var attrs = renderOpts.attrs,
          events = renderOpts.events;
      var $table = params.$table,
          column = params.column;
      var model = column.model;

      var autoResizeEvent = function autoResizeEvent(evnt) {
        setTimeout(function () {
          return autoResizeTextarea(evnt, renderOpts, params);
        }, 0);

        if (events && events[evnt.type]) {
          events[evnt.type](params, evnt);
        }
      };

      return [h('div', {
        "class": 'x-textarea--wrapper',
        style: {
          height: "".concat(column.renderHeight - 1, "px")
        }
      }, [h('textarea', {
        "class": 'x-textarea',
        attrs: attrs,
        domProps: {
          value: model.value
        },
        on: _xeUtils["default"].assign(getEvents(renderOpts, params), {
          cut: autoResizeEvent,
          paste: autoResizeEvent,
          drop: autoResizeEvent,
          focus: autoResizeEvent,
          keydown: function keydown(evnt) {
            if (evnt.keyCode === 13 && (!$table.keyboardConfig || evnt.altKey)) {
              evnt.preventDefault();
              evnt.stopPropagation();
              var inpElem = evnt.target;
              var rangeData = getCursorPosition(inpElem);
              var pos = rangeData.end;
              var cellValue = inpElem.value;
              cellValue = "".concat(cellValue.slice(0, pos), "\n").concat(cellValue.slice(pos, cellValue.length));
              inpElem.value = cellValue;
              model.update = true;
              model.value = cellValue;
              setTimeout(function () {
                rangeData.start = rangeData.end = ++pos;
                setCursorPosition(inpElem, rangeData);
                autoResizeEvent(evnt);
              });
            } else {
              autoResizeEvent(evnt);
            }
          },
          compositionstart: autoResizeEvent,
          compositionupdate: autoResizeEvent,
          compositionend: autoResizeEvent
        })
      })])];
    },
    renderCell: function renderCell(h, renderOpts, params) {
      var row = params.row,
          column = params.column;
      return [h('span', {
        "class": 'x-textarea--content'
      }, _xeUtils["default"].get(row, column.property))];
    }
  }
};
/**
 * 基于 vxe-table 表格的增强插件，提供一些常用的渲染器
 */

var VXETablePluginRenderer = {
  install: function install(xtable) {
    xtable.renderer.mixin(renderMap);
  }
};
exports.VXETablePluginRenderer = VXETablePluginRenderer;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginRenderer);
}

var _default = VXETablePluginRenderer;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImdldEN1cnNvclBvc2l0aW9uIiwidGV4dGFyZWEiLCJyYW5nZURhdGEiLCJ0ZXh0Iiwic3RhcnQiLCJlbmQiLCJYRVV0aWxzIiwiaXNGdW5jdGlvbiIsInNldFNlbGVjdGlvblJhbmdlIiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJzZXRDdXJzb3JQb3NpdGlvbiIsImZvY3VzIiwiJHRleHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJzdHlsZSIsInZpc2liaWxpdHkiLCJ6SW5kZXgiLCJwb3NpdGlvbiIsImF1dG9SZXNpemVUZXh0YXJlYSIsImV2bnQiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwicHJvcHMiLCIkdGFibGUiLCJjb2x1bW4iLCJtaW5XaWR0aCIsInJlbmRlcldpZHRoIiwibWluSGVpZ2h0IiwicmVuZGVySGVpZ2h0IiwiaW5wRWxlbSIsInRhcmdldCIsIm1heFdpZHRoIiwibWF4SGVpZ2h0IiwidGV4dENvbnRlbnQiLCJ2YWx1ZSIsInBhcmVudE5vZGUiLCIkZWwiLCJhcHBlbmRDaGlsZCIsImhlaWdodCIsIk1hdGgiLCJtaW4iLCJvZmZzZXRIZWlnaHQiLCJ3aWR0aCIsIm1heCIsIm9mZnNldFdpZHRoIiwib3ZlcmZsb3dZIiwiZ2V0RXZlbnRzIiwiZXZlbnRzIiwibW9kZWwiLCJvbiIsImlucHV0IiwiY2VsbFZhbHVlIiwidXBkYXRlIiwidXBkYXRlU3RhdHVzIiwiYXNzaWduIiwib2JqZWN0TWFwIiwiY2IiLCJhcmdzIiwiYXBwbHkiLCJjb25jYXQiLCJyZW5kZXJNYXAiLCJYSW5wdXQiLCJhdXRvZm9jdXMiLCJyZW5kZXJFZGl0IiwiaCIsImF0dHJzIiwicHJlZml4SWNvbiIsInN1ZmZpeEljb24iLCJwcmVmaXhDbGljayIsInN1ZmZpeENsaWNrIiwiY2xpY2siLCJkb21Qcm9wcyIsIlhUZXh0YXJlYSIsImF1dG9SZXNpemVFdmVudCIsInNldFRpbWVvdXQiLCJ0eXBlIiwiY3V0IiwicGFzdGUiLCJkcm9wIiwia2V5ZG93biIsImtleUNvZGUiLCJrZXlib2FyZENvbmZpZyIsImFsdEtleSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwicG9zIiwic2xpY2UiLCJsZW5ndGgiLCJjb21wb3NpdGlvbnN0YXJ0IiwiY29tcG9zaXRpb251cGRhdGUiLCJjb21wb3NpdGlvbmVuZCIsInJlbmRlckNlbGwiLCJyb3ciLCJnZXQiLCJwcm9wZXJ0eSIsIlZYRVRhYmxlUGx1Z2luUmVuZGVyZXIiLCJpbnN0YWxsIiwieHRhYmxlIiwicmVuZGVyZXIiLCJtaXhpbiIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7QUFTQSxTQUFTQSxpQkFBVCxDQUE0QkMsUUFBNUIsRUFBeUQ7QUFDdkQsTUFBSUMsU0FBUyxHQUFpQjtBQUFFQyxJQUFBQSxJQUFJLEVBQUUsRUFBUjtBQUFZQyxJQUFBQSxLQUFLLEVBQUUsQ0FBbkI7QUFBc0JDLElBQUFBLEdBQUcsRUFBRTtBQUEzQixHQUE5Qjs7QUFDQSxNQUFJQyxvQkFBUUMsVUFBUixDQUFtQk4sUUFBUSxDQUFDTyxpQkFBNUIsQ0FBSixFQUFvRDtBQUNsRE4sSUFBQUEsU0FBUyxDQUFDRSxLQUFWLEdBQWtCSCxRQUFRLENBQUNRLGNBQTNCO0FBQ0FQLElBQUFBLFNBQVMsQ0FBQ0csR0FBVixHQUFnQkosUUFBUSxDQUFDUyxZQUF6QjtBQUNEOztBQUNELFNBQU9SLFNBQVA7QUFDRDs7QUFFRCxTQUFTUyxpQkFBVCxDQUE0QlYsUUFBNUIsRUFBMkRDLFNBQTNELEVBQWtGO0FBQ2hGLE1BQUlJLG9CQUFRQyxVQUFSLENBQW1CTixRQUFRLENBQUNPLGlCQUE1QixDQUFKLEVBQW9EO0FBQ2xEUCxJQUFBQSxRQUFRLENBQUNXLEtBQVQ7QUFDQVgsSUFBQUEsUUFBUSxDQUFDTyxpQkFBVCxDQUEyQk4sU0FBUyxDQUFDRSxLQUFyQyxFQUE0Q0YsU0FBUyxDQUFDRyxHQUF0RDtBQUNEO0FBQ0Y7O0FBRUQsSUFBSVEsS0FBSjs7QUFDQSxJQUFJLE9BQU9DLFFBQVAsS0FBb0IsV0FBeEIsRUFBcUM7QUFDbkNELEVBQUFBLEtBQUssR0FBR0MsUUFBUSxDQUFDQyxhQUFULENBQXVCLE1BQXZCLENBQVI7QUFDQUYsRUFBQUEsS0FBSyxDQUFDRyxTQUFOLEdBQWtCLG9CQUFsQjtBQUNBSCxFQUFBQSxLQUFLLENBQUNJLEtBQU4sQ0FBWUMsVUFBWixHQUF5QixRQUF6QjtBQUNBTCxFQUFBQSxLQUFLLENBQUNJLEtBQU4sQ0FBWUUsTUFBWixHQUFxQixJQUFyQjtBQUNBTixFQUFBQSxLQUFLLENBQUNJLEtBQU4sQ0FBWUcsUUFBWixHQUF1QixVQUF2QjtBQUNEOztBQUVELFNBQVNDLGtCQUFULENBQTZCQyxJQUE3QixFQUF3Q0MsVUFBeEMsRUFBeURDLE1BQXpELEVBQW9FO0FBQUEsMEJBQzdDRCxVQUQ2QyxDQUM1REUsS0FENEQ7QUFBQSxNQUM1REEsS0FENEQsa0NBQ3BELEVBRG9EO0FBQUEsTUFFNURDLE1BRjRELEdBRXpDRixNQUZ5QyxDQUU1REUsTUFGNEQ7QUFBQSxNQUVwREMsTUFGb0QsR0FFekNILE1BRnlDLENBRXBERyxNQUZvRDtBQUFBLE1BRy9DQyxRQUgrQyxHQUdURCxNQUhTLENBRzVERSxXQUg0RDtBQUFBLE1BR3ZCQyxTQUh1QixHQUdUSCxNQUhTLENBR3JDSSxZQUhxQztBQUlsRSxNQUFJQyxPQUFPLEdBQXFCVixJQUFJLENBQUNXLE1BQXJDLENBSmtFLENBS2xFOztBQUNBLE1BQUlDLFFBQVEsR0FBV1QsS0FBSyxDQUFDUyxRQUFOLElBQWtCLEdBQXpDO0FBQ0EsTUFBSUMsU0FBUyxHQUFXVixLQUFLLENBQUNVLFNBQU4sSUFBbUIsR0FBM0M7QUFDQXRCLEVBQUFBLEtBQUssQ0FBQ3VCLFdBQU4sYUFBdUJKLE9BQU8sQ0FBQ0ssS0FBL0I7QUFDQXhCLEVBQUFBLEtBQUssQ0FBQ0ksS0FBTixDQUFZaUIsUUFBWixhQUEwQkEsUUFBMUI7O0FBQ0EsTUFBSSxDQUFDckIsS0FBSyxDQUFDeUIsVUFBWCxFQUF1QjtBQUNyQlosSUFBQUEsTUFBTSxDQUFDYSxHQUFQLENBQVdDLFdBQVgsQ0FBdUIzQixLQUF2QjtBQUNEOztBQUNELE1BQUk0QixNQUFNLEdBQUdDLElBQUksQ0FBQ0MsR0FBTCxDQUFTUixTQUFULEVBQW9CdEIsS0FBSyxDQUFDK0IsWUFBTixHQUFxQixDQUF6QyxDQUFiO0FBQ0FaLEVBQUFBLE9BQU8sQ0FBQ2YsS0FBUixDQUFjNEIsS0FBZCxhQUF5QkgsSUFBSSxDQUFDQyxHQUFMLENBQVNULFFBQVQsRUFBbUJRLElBQUksQ0FBQ0ksR0FBTCxDQUFTbEIsUUFBVCxFQUFtQmYsS0FBSyxDQUFDa0MsV0FBTixHQUFvQixFQUF2QyxDQUFuQixDQUF6QjtBQUNBZixFQUFBQSxPQUFPLENBQUNmLEtBQVIsQ0FBY3dCLE1BQWQsYUFBMEJBLE1BQU0sR0FBR1gsU0FBVCxHQUFxQkEsU0FBckIsR0FBaUNXLE1BQTNEO0FBQ0FULEVBQUFBLE9BQU8sQ0FBQ2YsS0FBUixDQUFjK0IsU0FBZCxHQUEwQlAsTUFBTSxHQUFHUCxRQUFULEdBQW9CLE1BQXBCLEdBQTZCLEVBQXZEO0FBQ0Q7O0FBRUQsU0FBU2UsU0FBVCxDQUFvQjFCLFVBQXBCLEVBQXFDQyxNQUFyQyxFQUFnRDtBQUFBLE1BQ3hDMEIsTUFEd0MsR0FDN0IzQixVQUQ2QixDQUN4QzJCLE1BRHdDO0FBQUEsTUFFeEN4QixNQUZ3QyxHQUVyQkYsTUFGcUIsQ0FFeENFLE1BRndDO0FBQUEsTUFFaENDLE1BRmdDLEdBRXJCSCxNQUZxQixDQUVoQ0csTUFGZ0M7QUFBQSxNQUd4Q3dCLEtBSHdDLEdBRzlCeEIsTUFIOEIsQ0FHeEN3QixLQUh3QztBQUk5QyxNQUFJQyxFQUFFLEdBQUc7QUFDUEMsSUFBQUEsS0FETyxpQkFDQS9CLElBREEsRUFDUztBQUNkLFVBQUlnQyxTQUFTLEdBQUdoQyxJQUFJLENBQUNXLE1BQUwsQ0FBWUksS0FBNUI7QUFDQWMsTUFBQUEsS0FBSyxDQUFDSSxNQUFOLEdBQWUsSUFBZjtBQUNBSixNQUFBQSxLQUFLLENBQUNkLEtBQU4sR0FBY2lCLFNBQWQ7QUFDQTVCLE1BQUFBLE1BQU0sQ0FBQzhCLFlBQVAsQ0FBb0JoQyxNQUFwQixFQUE0QjhCLFNBQTVCO0FBQ0Q7QUFOTSxHQUFUOztBQVFBLE1BQUlKLE1BQUosRUFBWTtBQUNWNUMsd0JBQVFtRCxNQUFSLENBQWVMLEVBQWYsRUFBbUI5QyxvQkFBUW9ELFNBQVIsQ0FBa0JSLE1BQWxCLEVBQTBCLFVBQUNTLEVBQUQ7QUFBQSxhQUFrQixZQUF3QjtBQUFBLDBDQUFYQyxJQUFXO0FBQVhBLFVBQUFBLElBQVc7QUFBQTs7QUFDckZELFFBQUFBLEVBQUUsQ0FBQ0UsS0FBSCxDQUFTLElBQVQsRUFBZSxDQUFDckMsTUFBRCxFQUFTc0MsTUFBVCxDQUFnQkQsS0FBaEIsQ0FBc0JyQyxNQUF0QixFQUE4Qm9DLElBQTlCLENBQWY7QUFDRCxPQUY0QztBQUFBLEtBQTFCLENBQW5CO0FBR0Q7O0FBQ0QsU0FBT1IsRUFBUDtBQUNEO0FBRUQ7Ozs7O0FBR0EsSUFBTVcsU0FBUyxHQUFHO0FBQ2hCQyxFQUFBQSxNQUFNLEVBQUU7QUFDTkMsSUFBQUEsU0FBUyxFQUFFLFVBREw7QUFFTkMsSUFBQUEsVUFGTSxzQkFFTUMsQ0FGTixFQUVtQjVDLFVBRm5CLEVBRW9DQyxNQUZwQyxFQUUrQztBQUFBLCtCQUNWRCxVQURVLENBQzdDRSxLQUQ2QztBQUFBLFVBQzdDQSxLQUQ2QyxtQ0FDckMsRUFEcUM7QUFBQSxVQUNqQzJDLEtBRGlDLEdBQ1Y3QyxVQURVLENBQ2pDNkMsS0FEaUM7QUFBQSwrQkFDVjdDLFVBRFUsQ0FDMUIyQixNQUQwQjtBQUFBLFVBQzFCQSxNQUQwQixtQ0FDakIsRUFEaUI7QUFBQSxVQUU3Q3ZCLE1BRjZDLEdBRWxDSCxNQUZrQyxDQUU3Q0csTUFGNkM7QUFBQSxVQUc3Q3dCLEtBSDZDLEdBR25DeEIsTUFIbUMsQ0FHN0N3QixLQUg2QztBQUFBLFVBSTdDa0IsVUFKNkMsR0FJbEI1QyxLQUprQixDQUk3QzRDLFVBSjZDO0FBQUEsVUFJakNDLFVBSmlDLEdBSWxCN0MsS0FKa0IsQ0FJakM2QyxVQUppQztBQUFBLFVBSzdDQyxXQUw2QyxHQUtoQnJCLE1BTGdCLENBSzdDcUIsV0FMNkM7QUFBQSxVQUtoQ0MsV0FMZ0MsR0FLaEJ0QixNQUxnQixDQUtoQ3NCLFdBTGdDO0FBTW5ELGFBQU8sQ0FDTEwsQ0FBQyxDQUFDLEtBQUQsRUFBUTtBQUNQLGlCQUFPLENBQUMsa0JBQUQsRUFBcUI7QUFDMUIsd0JBQWMxQyxLQUFLLENBQUM0QyxVQURNO0FBRTFCLHdCQUFjNUMsS0FBSyxDQUFDNkM7QUFGTSxTQUFyQixDQURBO0FBS1ByRCxRQUFBQSxLQUFLLEVBQUU7QUFDTHdCLFVBQUFBLE1BQU0sWUFBS2QsTUFBTSxDQUFDSSxZQUFQLEdBQXNCLENBQTNCO0FBREQ7QUFMQSxPQUFSLEVBUUUsQ0FDRHNDLFVBQVUsR0FBR0YsQ0FBQyxDQUFDLEdBQUQsRUFBTTtBQUNsQixpQkFBTyxDQUFDLGlCQUFELEVBQW9CRSxVQUFwQixFQUFnQztBQUNyQyx5QkFBZUU7QUFEc0IsU0FBaEMsQ0FEVztBQUlsQm5CLFFBQUFBLEVBQUUsRUFBRW1CLFdBQVcsR0FBRztBQUNoQkUsVUFBQUEsS0FBSyxFQUFFLGVBQUNuRCxJQUFEO0FBQUEsbUJBQWVpRCxXQUFXLENBQUMvQyxNQUFELEVBQVNGLElBQVQsQ0FBMUI7QUFBQTtBQURTLFNBQUgsR0FFWDtBQU5jLE9BQU4sQ0FBSixHQU9MLElBUkosRUFTRDZDLENBQUMsQ0FBQyxPQUFELEVBQVU7QUFDVCxpQkFBTyxTQURFO0FBRVRDLFFBQUFBLEtBQUssRUFBTEEsS0FGUztBQUdUTSxRQUFBQSxRQUFRLEVBQUU7QUFDUnJDLFVBQUFBLEtBQUssRUFBRWMsS0FBSyxDQUFDZDtBQURMLFNBSEQ7QUFNVGUsUUFBQUEsRUFBRSxFQUFFSCxTQUFTLENBQUMxQixVQUFELEVBQWFDLE1BQWI7QUFOSixPQUFWLENBVEEsRUFpQkQ4QyxVQUFVLEdBQUdILENBQUMsQ0FBQyxHQUFELEVBQU07QUFDbEIsaUJBQU8sQ0FBQyxpQkFBRCxFQUFvQkcsVUFBcEIsRUFBZ0M7QUFDckMseUJBQWVFO0FBRHNCLFNBQWhDLENBRFc7QUFJbEJwQixRQUFBQSxFQUFFLEVBQUVvQixXQUFXLEdBQUc7QUFDaEJDLFVBQUFBLEtBQUssRUFBRSxlQUFDbkQsSUFBRDtBQUFBLG1CQUFla0QsV0FBVyxDQUFDaEQsTUFBRCxFQUFTRixJQUFULENBQTFCO0FBQUE7QUFEUyxTQUFILEdBRVg7QUFOYyxPQUFOLENBQUosR0FPTCxJQXhCSixDQVJGLENBREksQ0FBUDtBQW9DRDtBQTVDSyxHQURRO0FBK0NoQnFELEVBQUFBLFNBQVMsRUFBRTtBQUNUVixJQUFBQSxTQUFTLEVBQUUsYUFERjtBQUVUQyxJQUFBQSxVQUZTLHNCQUVHQyxDQUZILEVBRWdCNUMsVUFGaEIsRUFFaUNDLE1BRmpDLEVBRTRDO0FBQUEsVUFDN0M0QyxLQUQ2QyxHQUMzQjdDLFVBRDJCLENBQzdDNkMsS0FENkM7QUFBQSxVQUN0Q2xCLE1BRHNDLEdBQzNCM0IsVUFEMkIsQ0FDdEMyQixNQURzQztBQUFBLFVBRTdDeEIsTUFGNkMsR0FFMUJGLE1BRjBCLENBRTdDRSxNQUY2QztBQUFBLFVBRXJDQyxNQUZxQyxHQUUxQkgsTUFGMEIsQ0FFckNHLE1BRnFDO0FBQUEsVUFHN0N3QixLQUg2QyxHQUduQ3hCLE1BSG1DLENBRzdDd0IsS0FINkM7O0FBSW5ELFVBQUl5QixlQUFlLEdBQUcsU0FBbEJBLGVBQWtCLENBQUN0RCxJQUFELEVBQWM7QUFDbEN1RCxRQUFBQSxVQUFVLENBQUM7QUFBQSxpQkFBTXhELGtCQUFrQixDQUFDQyxJQUFELEVBQU9DLFVBQVAsRUFBbUJDLE1BQW5CLENBQXhCO0FBQUEsU0FBRCxFQUFxRCxDQUFyRCxDQUFWOztBQUNBLFlBQUkwQixNQUFNLElBQUlBLE1BQU0sQ0FBQzVCLElBQUksQ0FBQ3dELElBQU4sQ0FBcEIsRUFBaUM7QUFDL0I1QixVQUFBQSxNQUFNLENBQUM1QixJQUFJLENBQUN3RCxJQUFOLENBQU4sQ0FBa0J0RCxNQUFsQixFQUEwQkYsSUFBMUI7QUFDRDtBQUNGLE9BTEQ7O0FBTUEsYUFBTyxDQUNMNkMsQ0FBQyxDQUFDLEtBQUQsRUFBUTtBQUNQLGlCQUFPLHFCQURBO0FBRVBsRCxRQUFBQSxLQUFLLEVBQUU7QUFDTHdCLFVBQUFBLE1BQU0sWUFBS2QsTUFBTSxDQUFDSSxZQUFQLEdBQXNCLENBQTNCO0FBREQ7QUFGQSxPQUFSLEVBS0UsQ0FDRG9DLENBQUMsQ0FBQyxVQUFELEVBQWE7QUFDWixpQkFBTyxZQURLO0FBRVpDLFFBQUFBLEtBQUssRUFBTEEsS0FGWTtBQUdaTSxRQUFBQSxRQUFRLEVBQUU7QUFDUnJDLFVBQUFBLEtBQUssRUFBRWMsS0FBSyxDQUFDZDtBQURMLFNBSEU7QUFNWmUsUUFBQUEsRUFBRSxFQUFFOUMsb0JBQVFtRCxNQUFSLENBQWVSLFNBQVMsQ0FBQzFCLFVBQUQsRUFBYUMsTUFBYixDQUF4QixFQUE4QztBQUNoRHVELFVBQUFBLEdBQUcsRUFBRUgsZUFEMkM7QUFFaERJLFVBQUFBLEtBQUssRUFBRUosZUFGeUM7QUFHaERLLFVBQUFBLElBQUksRUFBRUwsZUFIMEM7QUFJaERoRSxVQUFBQSxLQUFLLEVBQUVnRSxlQUp5QztBQUtoRE0sVUFBQUEsT0FMZ0QsbUJBS3ZDNUQsSUFMdUMsRUFLOUI7QUFDaEIsZ0JBQUlBLElBQUksQ0FBQzZELE9BQUwsS0FBaUIsRUFBakIsS0FBd0IsQ0FBQ3pELE1BQU0sQ0FBQzBELGNBQVIsSUFBMEI5RCxJQUFJLENBQUMrRCxNQUF2RCxDQUFKLEVBQW9FO0FBQ2xFL0QsY0FBQUEsSUFBSSxDQUFDZ0UsY0FBTDtBQUNBaEUsY0FBQUEsSUFBSSxDQUFDaUUsZUFBTDtBQUNBLGtCQUFJdkQsT0FBTyxHQUFHVixJQUFJLENBQUNXLE1BQW5CO0FBQ0Esa0JBQUkvQixTQUFTLEdBQUdGLGlCQUFpQixDQUFDZ0MsT0FBRCxDQUFqQztBQUNBLGtCQUFJd0QsR0FBRyxHQUFHdEYsU0FBUyxDQUFDRyxHQUFwQjtBQUNBLGtCQUFJaUQsU0FBUyxHQUFHdEIsT0FBTyxDQUFDSyxLQUF4QjtBQUNBaUIsY0FBQUEsU0FBUyxhQUFNQSxTQUFTLENBQUNtQyxLQUFWLENBQWdCLENBQWhCLEVBQW1CRCxHQUFuQixDQUFOLGVBQWtDbEMsU0FBUyxDQUFDbUMsS0FBVixDQUFnQkQsR0FBaEIsRUFBcUJsQyxTQUFTLENBQUNvQyxNQUEvQixDQUFsQyxDQUFUO0FBQ0ExRCxjQUFBQSxPQUFPLENBQUNLLEtBQVIsR0FBZ0JpQixTQUFoQjtBQUNBSCxjQUFBQSxLQUFLLENBQUNJLE1BQU4sR0FBZSxJQUFmO0FBQ0FKLGNBQUFBLEtBQUssQ0FBQ2QsS0FBTixHQUFjaUIsU0FBZDtBQUNBdUIsY0FBQUEsVUFBVSxDQUFDLFlBQUs7QUFDZDNFLGdCQUFBQSxTQUFTLENBQUNFLEtBQVYsR0FBa0JGLFNBQVMsQ0FBQ0csR0FBVixHQUFnQixFQUFFbUYsR0FBcEM7QUFDQTdFLGdCQUFBQSxpQkFBaUIsQ0FBQ3FCLE9BQUQsRUFBVTlCLFNBQVYsQ0FBakI7QUFDQTBFLGdCQUFBQSxlQUFlLENBQUN0RCxJQUFELENBQWY7QUFDRCxlQUpTLENBQVY7QUFLRCxhQWhCRCxNQWdCTztBQUNMc0QsY0FBQUEsZUFBZSxDQUFDdEQsSUFBRCxDQUFmO0FBQ0Q7QUFDRixXQXpCK0M7QUEwQmhEcUUsVUFBQUEsZ0JBQWdCLEVBQUVmLGVBMUI4QjtBQTJCaERnQixVQUFBQSxpQkFBaUIsRUFBRWhCLGVBM0I2QjtBQTRCaERpQixVQUFBQSxjQUFjLEVBQUVqQjtBQTVCZ0MsU0FBOUM7QUFOUSxPQUFiLENBREEsQ0FMRixDQURJLENBQVA7QUE4Q0QsS0ExRFE7QUEyRFRrQixJQUFBQSxVQTNEUyxzQkEyREczQixDQTNESCxFQTJEZ0I1QyxVQTNEaEIsRUEyRGlDQyxNQTNEakMsRUEyRDRDO0FBQUEsVUFDN0N1RSxHQUQ2QyxHQUM3QnZFLE1BRDZCLENBQzdDdUUsR0FENkM7QUFBQSxVQUN4Q3BFLE1BRHdDLEdBQzdCSCxNQUQ2QixDQUN4Q0csTUFEd0M7QUFFbkQsYUFBTyxDQUNMd0MsQ0FBQyxDQUFDLE1BQUQsRUFBUztBQUNSLGlCQUFPO0FBREMsT0FBVCxFQUVFN0Qsb0JBQVEwRixHQUFSLENBQVlELEdBQVosRUFBaUJwRSxNQUFNLENBQUNzRSxRQUF4QixDQUZGLENBREksQ0FBUDtBQUtEO0FBbEVRO0FBL0NLLENBQWxCO0FBcUhBOzs7O0FBR08sSUFBTUMsc0JBQXNCLEdBQUc7QUFDcENDLEVBQUFBLE9BRG9DLG1CQUMzQkMsTUFEMkIsRUFDSjtBQUM5QkEsSUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxLQUFoQixDQUFzQnZDLFNBQXRCO0FBQ0Q7QUFIbUMsQ0FBL0I7OztBQU1QLElBQUksT0FBT3dDLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JQLHNCQUFwQjtBQUNEOztlQUVjQSxzQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQgeyBWWEVUYWJsZSB9IGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuaW50ZXJmYWNlIHBvc1JhbmdlRGF0YSB7XHJcbiAgdGV4dDogc3RyaW5nO1xyXG4gIHN0YXJ0OiBudW1iZXI7XHJcbiAgZW5kOiBudW1iZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEN1cnNvclBvc2l0aW9uICh0ZXh0YXJlYTogSFRNTFRleHRBcmVhRWxlbWVudCk6IHBvc1JhbmdlRGF0YSB7XHJcbiAgbGV0IHJhbmdlRGF0YTogcG9zUmFuZ2VEYXRhID0geyB0ZXh0OiAnJywgc3RhcnQ6IDAsIGVuZDogMCB9XHJcbiAgaWYgKFhFVXRpbHMuaXNGdW5jdGlvbih0ZXh0YXJlYS5zZXRTZWxlY3Rpb25SYW5nZSkpIHtcclxuICAgIHJhbmdlRGF0YS5zdGFydCA9IHRleHRhcmVhLnNlbGVjdGlvblN0YXJ0XHJcbiAgICByYW5nZURhdGEuZW5kID0gdGV4dGFyZWEuc2VsZWN0aW9uRW5kXHJcbiAgfVxyXG4gIHJldHVybiByYW5nZURhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0Q3Vyc29yUG9zaXRpb24gKHRleHRhcmVhOiBIVE1MVGV4dEFyZWFFbGVtZW50LCByYW5nZURhdGE6IHBvc1JhbmdlRGF0YSkge1xyXG4gIGlmIChYRVV0aWxzLmlzRnVuY3Rpb24odGV4dGFyZWEuc2V0U2VsZWN0aW9uUmFuZ2UpKSB7XHJcbiAgICB0ZXh0YXJlYS5mb2N1cygpXHJcbiAgICB0ZXh0YXJlYS5zZXRTZWxlY3Rpb25SYW5nZShyYW5nZURhdGEuc3RhcnQsIHJhbmdlRGF0YS5lbmQpXHJcbiAgfVxyXG59XHJcblxyXG52YXIgJHRleHQ6IEhUTUxTcGFuRWxlbWVudFxyXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICR0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXHJcbiAgJHRleHQuY2xhc3NOYW1lID0gJ3gtdGV4dGFyZWEtLXJlc2l6ZSdcclxuICAkdGV4dC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbidcclxuICAkdGV4dC5zdHlsZS56SW5kZXggPSAnLTEnXHJcbiAgJHRleHQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGF1dG9SZXNpemVUZXh0YXJlYSAoZXZudDogYW55LCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSwgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgeyByZW5kZXJXaWR0aDogbWluV2lkdGgsIHJlbmRlckhlaWdodDogbWluSGVpZ2h0IH0gPSBjb2x1bW5cclxuICBsZXQgaW5wRWxlbTogSFRNTElucHV0RWxlbWVudCA9IGV2bnQudGFyZ2V0XHJcbiAgLy8gbGV0IGNlbGwgPSBpbnBFbGVtLnBhcmVudE5vZGUucGFyZW50Tm9kZSA/IGlucEVsZW0ucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUgOiBudWxsXHJcbiAgbGV0IG1heFdpZHRoOiBudW1iZXIgPSBwcm9wcy5tYXhXaWR0aCB8fCA2MDBcclxuICBsZXQgbWF4SGVpZ2h0OiBudW1iZXIgPSBwcm9wcy5tYXhIZWlnaHQgfHwgNDAwXHJcbiAgJHRleHQudGV4dENvbnRlbnQgPSBgJHtpbnBFbGVtLnZhbHVlfVxcbmBcclxuICAkdGV4dC5zdHlsZS5tYXhXaWR0aCA9IGAke21heFdpZHRofXB4YFxyXG4gIGlmICghJHRleHQucGFyZW50Tm9kZSkge1xyXG4gICAgJHRhYmxlLiRlbC5hcHBlbmRDaGlsZCgkdGV4dClcclxuICB9XHJcbiAgbGV0IGhlaWdodCA9IE1hdGgubWluKG1heEhlaWdodCwgJHRleHQub2Zmc2V0SGVpZ2h0ICsgNClcclxuICBpbnBFbGVtLnN0eWxlLndpZHRoID0gYCR7TWF0aC5taW4obWF4V2lkdGgsIE1hdGgubWF4KG1pbldpZHRoLCAkdGV4dC5vZmZzZXRXaWR0aCArIDIwKSl9cHhgXHJcbiAgaW5wRWxlbS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHQgPCBtaW5IZWlnaHQgPyBtaW5IZWlnaHQgOiBoZWlnaHR9cHhgXHJcbiAgaW5wRWxlbS5zdHlsZS5vdmVyZmxvd1kgPSBoZWlnaHQgPiBtYXhXaWR0aCA/ICdhdXRvJyA6ICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEV2ZW50cyAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSwgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgeyBtb2RlbCB9ID0gY29sdW1uXHJcbiAgbGV0IG9uID0ge1xyXG4gICAgaW5wdXQgKGV2bnQ6IGFueSkge1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gZXZudC50YXJnZXQudmFsdWVcclxuICAgICAgbW9kZWwudXBkYXRlID0gdHJ1ZVxyXG4gICAgICBtb2RlbC52YWx1ZSA9IGNlbGxWYWx1ZVxyXG4gICAgICAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcywgY2VsbFZhbHVlKVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICBYRVV0aWxzLmFzc2lnbihvbiwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSlcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcCA9IHtcclxuICBYSW5wdXQ6IHtcclxuICAgIGF1dG9mb2N1czogJy54LWlucHV0JyxcclxuICAgIHJlbmRlckVkaXQgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IHByb3BzID0ge30sIGF0dHJzLCBldmVudHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBtb2RlbCB9ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByZWZpeEljb24sIHN1ZmZpeEljb24gfSA9IHByb3BzXHJcbiAgICAgIGxldCB7IHByZWZpeENsaWNrLCBzdWZmaXhDbGljayB9ID0gZXZlbnRzXHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgY2xhc3M6IFsneC1pbnB1dC0td3JhcHBlcicsIHtcclxuICAgICAgICAgICAgJ2lzLS1wcmVmaXgnOiBwcm9wcy5wcmVmaXhJY29uLFxyXG4gICAgICAgICAgICAnaXMtLXN1ZmZpeCc6IHByb3BzLnN1ZmZpeEljb25cclxuICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgaGVpZ2h0OiBgJHtjb2x1bW4ucmVuZGVySGVpZ2h0IC0gMX1weGBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBbXHJcbiAgICAgICAgICBwcmVmaXhJY29uID8gaCgnaScsIHtcclxuICAgICAgICAgICAgY2xhc3M6IFsneC1pbnB1dC0tcHJlZml4JywgcHJlZml4SWNvbiwge1xyXG4gICAgICAgICAgICAgICdpcy0tdHJpZ2dlcic6IHByZWZpeENsaWNrXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICBvbjogcHJlZml4Q2xpY2sgPyB7XHJcbiAgICAgICAgICAgICAgY2xpY2s6IChldm50OiBhbnkpID0+IHByZWZpeENsaWNrKHBhcmFtcywgZXZudClcclxuICAgICAgICAgICAgfSA6IG51bGxcclxuICAgICAgICAgIH0pIDogbnVsbCxcclxuICAgICAgICAgIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICBjbGFzczogJ3gtaW5wdXQnLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgZG9tUHJvcHM6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogbW9kZWwudmFsdWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICAgIHN1ZmZpeEljb24gPyBoKCdpJywge1xyXG4gICAgICAgICAgICBjbGFzczogWyd4LWlucHV0LS1zdWZmaXgnLCBzdWZmaXhJY29uLCB7XHJcbiAgICAgICAgICAgICAgJ2lzLS10cmlnZ2VyJzogc3VmZml4Q2xpY2tcclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIG9uOiBzdWZmaXhDbGljayA/IHtcclxuICAgICAgICAgICAgICBjbGljazogKGV2bnQ6IGFueSkgPT4gc3VmZml4Q2xpY2socGFyYW1zLCBldm50KVxyXG4gICAgICAgICAgICB9IDogbnVsbFxyXG4gICAgICAgICAgfSkgOiBudWxsXHJcbiAgICAgICAgXSlcclxuICAgICAgXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgWFRleHRhcmVhOiB7XHJcbiAgICBhdXRvZm9jdXM6ICcueC10ZXh0YXJlYScsXHJcbiAgICByZW5kZXJFZGl0IChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7ICR0YWJsZSwgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgbW9kZWwgfSA9IGNvbHVtblxyXG4gICAgICBsZXQgYXV0b1Jlc2l6ZUV2ZW50ID0gKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gYXV0b1Jlc2l6ZVRleHRhcmVhKGV2bnQsIHJlbmRlck9wdHMsIHBhcmFtcyksIDApXHJcbiAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbZXZudC50eXBlXSkge1xyXG4gICAgICAgICAgZXZlbnRzW2V2bnQudHlwZV0ocGFyYW1zLCBldm50KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgIGNsYXNzOiAneC10ZXh0YXJlYS0td3JhcHBlcicsXHJcbiAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICBoZWlnaHQ6IGAke2NvbHVtbi5yZW5kZXJIZWlnaHQgLSAxfXB4YFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgIGgoJ3RleHRhcmVhJywge1xyXG4gICAgICAgICAgICBjbGFzczogJ3gtdGV4dGFyZWEnLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgZG9tUHJvcHM6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogbW9kZWwudmFsdWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IFhFVXRpbHMuYXNzaWduKGdldEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpLCB7XHJcbiAgICAgICAgICAgICAgY3V0OiBhdXRvUmVzaXplRXZlbnQsXHJcbiAgICAgICAgICAgICAgcGFzdGU6IGF1dG9SZXNpemVFdmVudCxcclxuICAgICAgICAgICAgICBkcm9wOiBhdXRvUmVzaXplRXZlbnQsXHJcbiAgICAgICAgICAgICAgZm9jdXM6IGF1dG9SZXNpemVFdmVudCxcclxuICAgICAgICAgICAgICBrZXlkb3duIChldm50OiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldm50LmtleUNvZGUgPT09IDEzICYmICghJHRhYmxlLmtleWJvYXJkQ29uZmlnIHx8IGV2bnQuYWx0S2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICBldm50LnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgICAgZXZudC5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgICAgICAgICAgICBsZXQgaW5wRWxlbSA9IGV2bnQudGFyZ2V0XHJcbiAgICAgICAgICAgICAgICAgIGxldCByYW5nZURhdGEgPSBnZXRDdXJzb3JQb3NpdGlvbihpbnBFbGVtKVxyXG4gICAgICAgICAgICAgICAgICBsZXQgcG9zID0gcmFuZ2VEYXRhLmVuZFxyXG4gICAgICAgICAgICAgICAgICBsZXQgY2VsbFZhbHVlID0gaW5wRWxlbS52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICBjZWxsVmFsdWUgPSBgJHtjZWxsVmFsdWUuc2xpY2UoMCwgcG9zKX1cXG4ke2NlbGxWYWx1ZS5zbGljZShwb3MsIGNlbGxWYWx1ZS5sZW5ndGgpfWBcclxuICAgICAgICAgICAgICAgICAgaW5wRWxlbS52YWx1ZSA9IGNlbGxWYWx1ZVxyXG4gICAgICAgICAgICAgICAgICBtb2RlbC51cGRhdGUgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgIG1vZGVsLnZhbHVlID0gY2VsbFZhbHVlXHJcbiAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhbmdlRGF0YS5zdGFydCA9IHJhbmdlRGF0YS5lbmQgPSArK3Bvc1xyXG4gICAgICAgICAgICAgICAgICAgIHNldEN1cnNvclBvc2l0aW9uKGlucEVsZW0sIHJhbmdlRGF0YSlcclxuICAgICAgICAgICAgICAgICAgICBhdXRvUmVzaXplRXZlbnQoZXZudClcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGF1dG9SZXNpemVFdmVudChldm50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY29tcG9zaXRpb25zdGFydDogYXV0b1Jlc2l6ZUV2ZW50LFxyXG4gICAgICAgICAgICAgIGNvbXBvc2l0aW9udXBkYXRlOiBhdXRvUmVzaXplRXZlbnQsXHJcbiAgICAgICAgICAgICAgY29tcG9zaXRpb25lbmQ6IGF1dG9SZXNpemVFdmVudFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICBdKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ3NwYW4nLCB7XHJcbiAgICAgICAgICBjbGFzczogJ3gtdGV4dGFyZWEtLWNvbnRlbnQnXHJcbiAgICAgICAgfSwgWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpKVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTlop7lvLrmj5Lku7bvvIzmj5DkvpvkuIDkupvluLjnlKjnmoTmuLLmn5PlmahcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpblJlbmRlcmVyID0ge1xyXG4gIGluc3RhbGwgKHh0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICB4dGFibGUucmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5SZW5kZXJlcilcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5SZW5kZXJlclxyXG4iXX0=
