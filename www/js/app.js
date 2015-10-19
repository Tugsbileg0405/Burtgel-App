// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionicLazyLoad','ngMaterial','starter.controllers','starter.services','starter.auth','ngStorage','ngCordova'])

.run(function($ionicPlatform,AuthService,$rootScope,$state,$ionicLoading,$ionicPopup) {

     $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams, fromState, fromStateParams) {
      if(toState.name.indexOf('tab') !== -1 ) {

        if(!AuthService.getAuthStatus()) {
              event.preventDefault();
              $state.go('login',{},{reload:true});
        }
        
      }
    })

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
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

.config(function($stateProvider,$httpProvider,$mdGestureProvider,$urlRouterProvider,$ionicConfigProvider) {
  
      $httpProvider.defaults.timeout = 5000;
      $ionicConfigProvider.views.transition('none');
         $mdGestureProvider.skipClickHijack();
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.form.checkbox('circle');
  $ionicConfigProvider.backButton.icon('ion-ios-arrow-back');
  $ionicConfigProvider.form.toggle('large');
    $stateProvider

    .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

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
             controller: 'ticketCtrl'
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
  $urlRouterProvider.otherwise('/tab/dash');


});
