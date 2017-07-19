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
function(){
  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs){
        var container = $element;
        var scopes = [];

        var firstElem;
        var lastElem;

		var _do = function(fn, args){
          var fnctn = $scope.$eval($attrs[fn]);
          if(typeof fnctn === 'function'){
            fnctn(args);
          }
        }

        $( container ).on('scroll', function() {
          // search for the first
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

          // search for the last
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
        });

        this.add = function(scope, elem){
            scopes.push({scope: scope, element: elem});
        };
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


}(angular));


