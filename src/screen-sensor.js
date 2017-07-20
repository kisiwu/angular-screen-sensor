// Allow module to be loaded via require when using common js. e.g. npm
if(typeof module === "object" && module.exports){
    module.exports = 'angularScreenSensor';
}


(function(angular){
    'use strict';

/**
* @ngdoc module
* @module angularScreenSensor
* @description Get some elements from an element container. AngularJS
*/
angular.module('angularScreenSensor',[]);

/**
* @ngdoc directive
* @name angularScreenSensor.screenSensor
* @restrict A
* @param {number} paddingTop
* @param {number} paddingBottom
* @param {function} toppestFn
* @param {function} bottomestFn
* @description
*  The element that will be the screen
*/
angular.module('angularScreenSensor')
.directive('screenSensor',
function(sensorRemote){
  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs){
        var container = $element;
        var currentSize = container.width()+'x'+container.height();

        var scopes = [];

        var firstElem;
        var lastElem;

		    var _do = function(fn, args){
          var fnctn = $scope.$eval($attrs[fn]);
          if(typeof fnctn === 'function'){
            fnctn(args);
          }
        }

        var findToppest = function(){
          // search for the toppest
          scopes.some(function(s, idx, array){
            var elem = s.element;
            var pos = elem.offset().top - container.offset().top - ($scope.$eval($attrs.paddingTop) || 0);
            if(pos >= 0){
              if(!((firstElem) && firstElem.is(elem))){
                firstElem = elem;
                _do('toppestFn',s.scope.screenPix);
              }
              return true;
            }
          });
        }

        var findBottomest = function(){
          // search for the bottomest
          scopes.some(function(s, idx, array){
            var elem = s.element;
            var scope = s.scope;
            var pos = elem.offset().top - (container.offset().top + container.innerHeight()) + ($scope.$eval($attrs.paddingBottom) || 0);
            if(pos >= 0){
              if(!((lastElem) && lastElem.is(elem))){
                lastElem = elem;
                _do('bottomestFn',s.scope.screenPix);
              }
              return true;
            }
            if(idx == array.length -1){
              if(!((lastElem) && lastElem.is(elem))){
                lastElem = elem;
                _do('bottomestFn',s.scope.screenPix);
              }
              return true;
            }
          });
        }

        var findAll = function(){
          findToppest();
          findBottomest();
        }

        this.add = function(scope, elem){
            scopes.push({scope: scope, element: elem});
        };

        /**
        *
        * Events handlers:
        * - scroll
        * - resize
        * - sensorRemote.scan
        */

        $( container ).on('scroll', function() {
          findAll();
        });

        $( container ).resize(function(){
            var newSize = $(this).width()+'x'+$(this).height();
            if(currentSize!==newSize){
              console.log('newSize');
              currentSize = newSize;
            }
        });

        sensorRemote.register({event: 'scan', callback: findAll})
    }
  };
}
);


/**
* @ngdoc directive
* @name angularScreenSensor.screenPix
* @restrict A
* @scope
* @param {mixed} screenPix anything that defines this screen pixel
* @description
*  Element that will be a screenSensor pixel
*/
angular.module("angularScreenSensor")
.directive("screenPix", function($timeout){
  return {
    restrict: 'A',
    require: '^screenSensor',
    scope: {
      screenPix: '=',
      paddingTop: '=?',
      paddingBottom: '=?',

      // fn to call when toppest and bottomest change
      toppestFn: '=?',
      bottomestFn: '=?'
    },
    link: function(scope, elem, attrs, ctrl){

      ctrl.add(scope, elem, attrs);

	}
  }
});

/**
* @ngdoc factory
* @name angularScreenSensor.sensorRemote
* @description
*  Interact with screenSensor
*/
angular.module("angularScreenSensor")
.factory("sensorRemote", function($timeout){

  var screenSensorsListeners = [];
  const GLOBAL_EVENT = 'all';

  function scan(){
    screenSensorsListeners.forEach(
      function(listener){
        if(listener.event == 'scan' || listener.event == GLOBAL_EVENT){
          listener.callback();
        }
      }
    );
  }

  function register(fn){
    if(!fn)
      return;
    if(!angular.isObject(fn)){
      fn = {callback: fn}
    }
    if(!(typeof fn.callback === 'function'))
      return;

    if(!(fn.event && angular.isString(fn.event))){
      fn.event = GLOBAL_EVENT;
    }

    screenSensorsListeners.push(fn);
  }

  return {
    register: register,
    scan: scan
  };
});


}(angular));
