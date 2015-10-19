var myapp = angular.module('starter.controllers', [])

myapp.factory('onlineStatus', ["$window", "$rootScope", function ($window, $rootScope) {
    var onlineStatus = {};

    onlineStatus.onLine = $window.navigator.onLine;

    onlineStatus.isOnline = function() {
        return onlineStatus.onLine;
    }

    $window.addEventListener("online", function () {
        onlineStatus.onLine = true;
        $rootScope.$digest();
    }, true);

    $window.addEventListener("offline", function () {
        onlineStatus.onLine = false;
        $rootScope.$digest();
    }, true);

    return onlineStatus;
}]);

myapp.controller('DashCtrl', function($scope,onlineStatus,myData,$window,$http,$localStorage,$ionicLoading) {
	var person = $localStorage.userdata.user.person;
    $ionicLoading.show({
      content: 'Loading'
    });
	$scope.backSite = 'http://52.69.108.195:1337';

   $scope.doRefresh = function() {
       if(onlineStatus.onLine == true){
      myData.getEvent(person.id).success(function (response){
      $scope.events = response;
      $ionicLoading.hide();
    }).error(function (data, status, header, config) {
      console.log(data, status, header, config);
      if (status === -1) {
          console.log("Error - " + status + ", Response Timeout.");
      } 
    })
     .finally(function() {
       $scope.$broadcast('scroll.refreshComplete');
     })
   }
   else {
     var alertPopup = $ionicPopup.alert({
                   okType :'button-assertive',
                 template: 'Интернет холболтоо шалгана уу'
               });
               alertPopup.then(function(res) {
                 $scope.$broadcast('scroll.refreshComplete');
               });
              }
    };
    window.onload = $scope.doRefresh();
})
.controller('searchCtrl', function($scope,$state,$ionicPopup,myData,$ionicPopover,$http,$stateParams,$localStorage,$ionicLoading) {
  var id = $stateParams.eventId;
  myData.getTicket(id).success(function (response){
    $scope.searchTickets = response;
  });
  $scope.clear = function(){
    $scope.search = '';
  };
    $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.hide = function($event){
    $scope.popover.hide($event);
  }
   $scope.show = function($event,data) {
    $scope.popover.show($event);
    $scope.ticketId = data;
  };
  $scope.checkTicket = function(data){
    myData.getscanTicket(data).success(function (response){
      console.log(response);
      if(response.ticket_isUsed == false){
      mydata = {};
      mydata.id = response.id;
      mydata.ticket_isUsed = true;
      console.log(mydata);
      myData.scanTicket(mydata).success(function (res){
        if(res.status == true) {
                var alertPopup = $ionicPopup.alert({
                 okType :'button-balanced',
                 template: 'Амжилттай бүртгэгдлээ'
               });
                 alertPopup.then(function(res) {
                   $state.go('tab.ticket',{eventId:id});
                   $scope.popover.hide();
               });
              }
        })
    }
    else {
                var alertPopup = $ionicPopup.alert({
                   okType :'button-assertive',
                 template: 'Бүртгэгдсэн байна'
               });
                 alertPopup.then(function(res) {
                   $scope.popover.hide();
               });
              }
    }
    )
  }
})


.controller('ticketCtrl', function($scope,myData,onlineStatus,$ionicHistory,$stateParams,$ionicLoading) {
		var id = $stateParams.eventId;
  $scope.eventid = $stateParams.eventId;
     $ionicLoading.show({
      content: 'Loading'
    });
    $scope.backsite = 'http://52.69.108.195:1337';
       $scope.doRefresh = function() {
      if(onlineStatus.onLine == true){
     myData.getTicket($stateParams.eventId).success(function (response){
      $scope.tickets = response;
      $ionicLoading.hide();
    })
     .finally(function() {
       $scope.$broadcast('scroll.refreshComplete');
     })
   }
   else {
     var alertPopup = $ionicPopup.alert({
                   okType :'button-assertive',
                 template: 'Интернет холболтоо шалгана уу'
               });
               alertPopup.then(function(res) {
                 $scope.$broadcast('scroll.refreshComplete');
               });
   }
   };


         $scope.getUsed = function() {
     myData.getTicket($stateParams.eventId).success(function (response){
      $scope.tickets = response;
      $ionicLoading.hide();
      $scope.used = [];
      for ( i in $scope.tickets){
        if($scope.tickets[i].ticket_isUsed ==true){
        $scope.used.push(i);
      }
      }
      $scope.used_counter = $scope.used.length;
    })
   };

   window.onload =$scope.getUsed();
	 window.onload= $scope.doRefresh();
    $scope.checkUsed = function(){
      myData.getTicket($stateParams.eventId).success(function (response){
        $scope.usedCounter = [];
        $scope.notusedCounter = [];
        for (i in response) {
        if(response[i].ticket_isUsed == true) {
          $scope.usedCounter.push(i);
          $scope.usedTicket = response[i];
          console.log(response[i]);
          console.log($scope.usedCounter);
        }
        else {
          $scope.notusedCounter.push(i);
           console.log($scope.notusedCounter);
        }
    }
  })
}

    $scope.isChecked = function(data){
      var mydata = {};
      mydata.ticket_isUsed = data.ticket_isUsed;
      mydata.id = data.id;
      myData.scanTicket(mydata).success(function (response){
        console.log(response);
      })
    }
})
.controller('loginCtrl', function($scope,myData,$state,$localStorage) {
   $scope.login = function(data){
   	myData.login(data).success(function (response){
   	  if(response.status == true){
   			$localStorage.userdata = response;
   			$state.go('tab.dash');
      }
      else {
        alert(response.message);
      }
   	})
   }
})

.controller('ChatsCtrl', function($scope,$state,$ionicLoading,$cordovaBarcodeScanner,myData) {
    $scope.check = 0;
    $scope.scan = function(){
         $cordovaBarcodeScanner
      .scan()
      .then(function(barcodeData) {
         $ionicLoading.show({
             content: 'Loading'
           });
        $scope.scanData =barcodeData;
        myData.getscanTicket($scope.scanData.text).success(function (response){
          if(response.ticket_isUsed == false) {
            var data = {};
            data.ticket_isUsed = true;
            data.id = response.id;
            $scope.ticketInfo = response;
            myData.scanTicket(data).success(function (response){
              $scope.checkTicketInfo = 'Амжилттай бүртгэгдлээ';
              $scope.check = 1;
              $ionicLoading.hide();
            })
          }
          else {
               $scope.checkTicket = 'Ашиглагдсан тасалбар байна';
               $scope.check = 2;
               $ionicLoading.hide();
          }
        }).error(function (error){
         $scope.checkTicket = 'Олдсонгүй';
         $ionicLoading.hide();
         $scope.check = 2;
        })
      }, function(error) {
        $scope.checkTicket = 'Олдсонгүй';
         $ionicLoading.hide();
        $scope.check = 2;
      });
    }
  })
.controller('usedTicketCtrl', function($scope,myData,onlineStatus,$ionicLoading,$ionicHistory,$localStorage,$stateParams,$state) {
         $scope.doRefresh = function() {
          if(onlineStatus.onLine == true){
     myData.getTicket($stateParams.eventId).success(function (response){
      $scope.tickets = response;
      $ionicLoading.hide();
      $scope.used = [];
      $scope.usedTickets = [];
      for ( i in $scope.tickets){
        if($scope.tickets[i].ticket_isUsed ==true){
        $scope.used.push(i);
        $scope.usedTickets.push($scope.tickets[i]);
      }
      }
      $scope.used_counter = $scope.used.length;
    })
     .finally(function() {
       $scope.$broadcast('scroll.refreshComplete');
     })
   }
   else {
     var alertPopup = $ionicPopup.alert({
                   okType :'button-assertive',
                 template: 'Интернет холболтоо шалгана уу'
               });
               alertPopup.then(function(res) {
                 $scope.$broadcast('scroll.refreshComplete');
               });
   }
 };
   window.onload = $scope.doRefresh();
})

.controller('AccountCtrl', function($scope,$cordovaCamera,myData,$localStorage,$state,$ionicPopover) {
   $scope.userInfo = $localStorage.userdata.user.person;
  console.log($scope.userInfo.person_profile_img);
    $ionicPopover.fromTemplateUrl('templates/changePic.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.hide = function($event){
    $scope.popover.hide($event);
  }
   $scope.show = function($event,data) {
    $scope.popover.show($event);
    $scope.ticketId = data;
  };
  $scope.pictureURL = 'img/default.png';
  console.log($scope.userInfo);
  $scope.getPicture = function(){
        var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 80,
      targetHeight: 80,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
      correctOrientation:true
    };

    $cordovaCamera.getPicture(options).then(function(imageData) {
      $scope.pictureURL = "data:image/jpeg;base64," + imageData;
      var mydata = {};
      mydata.id = $scope.userInfo.id;
      mydata.person_profile_img = $scope.pictureURL;
      myData.updatePerson(mydata).success(function (response){
          $localStorage.userdata.user.person = response.updated_person;
          location.reload();
        })
    }, function(err) {
      // error
    });
  }
  $scope.getPhotos = function(){
      var options = {
      quality: 80,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };

    $cordovaCamera.getPicture(options).then(function(imageData) {
      $scope.imageURL = "data:image/jpeg;base64," + imageData;
       var mydata = {};
      mydata.id = $scope.userInfo.id;
      mydata.person_profile_img = $scope.imageURL;
      console.log($scope.imageURL);
      myData.updatePerson(mydata).success(function (response){
          $localStorage.userdata.user.person = response.updated_person;
          console.log('success');
        })
    }, function(err) {
      // error
    });

  }
  $scope.logout = function(){
    localStorage.clear();
    $state.go('login',{},{reload:true});
  }
});
