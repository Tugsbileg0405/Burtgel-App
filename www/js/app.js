// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ti-segmented-control','angularMoment','ImgCache','ngResource','angular.filter','ionicProcessSpinner','jett.ionic.filter.bar','ionicLazyLoad','ngMaterial','ionic-material','starter.controllers','starter.services','starter.auth','ngStorage','ngCordova'])

.run(function($ionicPlatform,AuthService,ImgCache,$rootScope,$state,$ionicLoading,$ionicPopup) {
 $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams, fromState, fromStateParams) {
  if(toState.name.indexOf('tab') !== -1 ) {
    if(!AuthService.getAuthStatus()) {
      event.preventDefault();
      $state.go('login',{},{reload:true});
    }

  }
})

 $ionicPlatform.ready(function() {
     ImgCache.$init();
 if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
  cordova.plugins.Keyboard.disableScroll(true);

}
if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
    $ionicPlatform.registerBackButtonAction(function(){
      if($state.current.name == 'tab.dash'){
        navigator.app.exitApp();
      }
      else {
        navigator.app.backHistory();
      }
    },100)

    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          okType: 'button-assertive',
          content: "Та интернетэд холбогдож байж ашиглана уу"
        })
        .then(function(result) {
          if(result) {
            ionic.Platform.exitApp();
          }
        });
      }
    }
  });
})

.config(function($stateProvider,$provide,$ionicFilterBarConfigProvider,ImgCacheProvider,$httpProvider,$mdGestureProvider,$urlRouterProvider,$ionicConfigProvider) {
   $provide.decorator('$state',
        ["$delegate", "$stateParams", '$timeout', function ($delegate, $stateParams, $timeout) {
            $delegate.forceReload = function () {
                var reload = function () {
                    $delegate.transitionTo($delegate.current, angular.copy($stateParams), {
                        reload: true,
                        inherit: true,
                        notify: true
                    })
                };
                reload();
                $timeout(reload, 100);
            };
            return $delegate;
        }]);
 ImgCacheProvider.setOption('debug', true);
 ImgCacheProvider.setOption('usePersistentCache', true);
 ImgCacheProvider.setOptions({
  debug: true,
  usePersistentCache: true
});
 ImgCacheProvider.manualInit = true;

 $ionicFilterBarConfigProvider.clear('ion-ios-close-outline');
  $ionicFilterBarConfigProvider.theme('custom');
 $httpProvider.defaults.timeout = 5000;
 $mdGestureProvider.skipClickHijack();
 $ionicConfigProvider.tabs.position('bottom');
 $ionicConfigProvider.navBar.alignTitle('center');
 $ionicConfigProvider.views.maxCache(10);
 $ionicConfigProvider.views.transition('none');
 $ionicConfigProvider.views.forwardCache(true);
 $ionicConfigProvider.form.checkbox('square');
 $ionicConfigProvider.backButton.icon('ion-ios-arrow-back');
 $ionicConfigProvider.form.toggle('large');
 $stateProvider

 .state('login', {
  url: '/login',
  templateUrl: 'templates/login.html',
  controller: 'loginCtrl'
})
 .state('register', {
  url: '/register',
  templateUrl: 'templates/register.html',
  controller: 'registerCtrl'
})
 .state('tab', {
  url: '/tab',
  abstract: true,
  templateUrl: 'templates/tabs.html'
})
 .state('forgotpassword',{
  url: '/forgotpassword',
  templateUrl:'templates/forgotpassword.html',
  controller:'ForgotPasswordCtrl'
})


 .state('tab.dash', {
  url: '/dash',
  views: {
    'tab-dash': {
      templateUrl: 'templates/tab-dash.html',
      controller: 'DashCtrl'
    }
  }
})
 .state('tab.ticket', {
  url: '/dash/:eventId',
  views: {
    'tab-dash':{
      templateUrl: 'templates/tickets.html',
      controller: 'allticketCtrl'
    }
  }
})
 .state('tab.ticket.all',{
  url:'/all',
  views:{
    'tab-dash-1': {
      templateUrl:'templates/chat-detail.html',
      controller:'ticketCtrl'
    }
  }
})
 .state('tab.ticket.used',{
  url:'/used',
  views:{
    'tab-dash-2': {
      templateUrl:'templates/used.html',
      controller:'usedTicketCtrl'
    }
  }
})
 .state('tab.ticket.notused',{
  url:'/notused',
  views:{
    'tab-dash-3': {
      templateUrl:'templates/notused.html',
      controller:'notusedTicketCtrl'
    }
  }
})
 .state('tab.searchEvent', {
  url: '/dash/searchByEvent',
  views: {
    'tab-dash':{
      templateUrl: 'templates/searchByEvent.html',
      controller: 'searchByEventCtrl'
    }
  }
})
 .state('tab.search', {
  url: '/dash/:eventId/search',
  views: {
    'tab-dash':{
      templateUrl: 'templates/search.html',
      controller: 'searchCtrl'
    }
  }
})
 .state('tab.used', {
  url: '/dash/:eventId/used',
  views: {
    'tab-dash':{
      templateUrl: 'templates/used.html',
      controller: 'usedTicketCtrl'
    }
  }
})

 .state('tab.chats', {
  url: '/chats',
  views: {
    'tab-chats': {
      templateUrl: 'templates/tab-chats.html',
      controller: 'ChatsCtrl'
    }
  }
})

 .state('tab.account', {
  url: '/account',
  views: {
    'tab-account': {
      templateUrl: 'templates/tab-account.html',
      controller: 'AccountCtrl'
    }
  }
})
 ;

  // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise(function($injector, $location){
      var $state = $injector.get("$state");
      $state.go('tab.dash');
  });


})


.filter('myFilter', function() {

  return function(input) {
    var newInput = [];
    angular.forEach(input, function(item) {
      if (item.ticket_phonenumber != "") newInput.push(item);
    });
    return newInput;
  };
})
.directive('nxEqualEx', function() {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, model) {
      if (!attrs.nxEqualEx) {
        console.error('nxEqualEx expects a model as an argument!');
        return;
      }
      scope.$watch(attrs.nxEqualEx, function (value) {
                // Only compare values if the second ctrl has a value.
                if (model.$viewValue !== undefined && model.$viewValue !== '') {
                  model.$setValidity('nxEqualEx', value === model.$viewValue);
                }
              });
      model.$parsers.push(function (value) {
                // Mute the nxEqual error if the second ctrl is empty.
                if (value === undefined || value === '') {
                  model.$setValidity('nxEqualEx', true);
                  return value;
                }
                var isValid = value === scope.$eval(attrs.nxEqualEx);
                model.$setValidity('nxEqualEx', isValid);
                return isValid ? value : undefined;
              });
    }
  };
})
.directive('ngCache', function() {

  return {
    restrict: 'A',
    link: function(scope, el, attrs) {

      attrs.$observe('ngSrc', function(src) {

        ImgCache.isCached(src, function(path, success) {
          if (success) {
            ImgCache.useCachedFile(el);
          } else {
            ImgCache.cacheFile(src, function() {
              ImgCache.useCachedFile(el);
            });
          }
        });

      });
    }
  };
})
.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
  }
  return fallbackSrc;
});