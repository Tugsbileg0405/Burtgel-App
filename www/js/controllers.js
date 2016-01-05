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

myapp.controller('DashCtrl', function($scope,$rootScope,$timeout,onlineStatus,$ionicPopup,myData,$window,$http,$localStorage,$ionicLoading) {

  var person = $localStorage.userdata.user.person;
  $ionicLoading.show({
    content: 'Loading'
  });
  $rootScope.backSite = 'http://www.urilga.mn:1337';


  $scope.doRefresh = function() {
   if(onlineStatus.onLine == true){
    myData.getEvent(person.id).success(function (response){
      $scope.events = response;
      $localStorage.events = $scope.events;
    }).error(function (data, status, header, config) {
      console.log(data, status, header, config);
      if (status === -1) {
        console.log("Error - " + status + ", Response Timeout.");
      } 
    })
    .finally(function() {
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    })
  }
  else if(onlineStatus.onLine == false) {
   $ionicLoading.hide();
   var alertPopup = $ionicPopup.alert({
     cssClass :'error',
     template: 'Интернет холболтоо шалгана уу'
   });
   alertPopup.then(function(res) {
     $scope.$broadcast('scroll.refreshComplete');

   });
 }
};
$scope.OnLoad = function(){
  $scope.events  = $localStorage.events;
  $ionicLoading.hide();
  $scope.doRefresh();
}
$window.onload = $scope.OnLoad();
})

.controller('allticketCtrl',function($scope,$timeout,$ionicHistory,onlineStatus,myData,$state,$http,$ionicPopup,$ionicLoading,$localStorage,$stateParams,$ionicModal,$ionicTabsDelegate){
  $ionicModal.fromTemplateUrl('templates/buyTicket.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  $scope.add = function(){
    $scope.ticket_counter += 1;
  };
  $scope.sub = function(){
    if($scope.ticket_counter != 1){
      $scope.ticket_counter -= 1;
    }
  };

  var user_id = $localStorage.userdata.user.person.id;
  $scope.ticket = {};
  $scope.ticket.ticket_fullname = "";
  $scope.ticket.ticket_email="";
  $scope.ticket.ticket_phonenumber="";

  $scope.suggest = function(ticket){
    console.log('checked')
    $scope.ticket.ticket_fullname = $localStorage.userdata.user.person.person_firstname + ' '+ $localStorage.userdata.user.person.person_lastname;
    $scope.ticket.ticket_email =$localStorage.userdata.user.person.person_email;
    $scope.ticket.ticket_phonenumber = $localStorage.userdata.user.person.person_cell_number;
  }

  $scope.clear = function(ticket){
    console.log('clear');
    ticket.ticket_fullname = "";
    ticket.ticket_email = "";
    ticket.ticket_phonenumber = "";
  };
  $scope.check = function(ticket){
    if($scope.isChecked.checked ==true){
      $scope.suggest(ticket);
    }
    else {
      $scope.clear(ticket);
    }
  }
  $timeout(function(){
    $scope.check();
  },1000);
  myData.getEventById($stateParams.eventId).success(function (res){
    $scope.event_info = res;
    $scope.event_ticket = {};
    $scope.event_ticket.free = [];
    $scope.event_ticket.paid = [];
    $scope.event_ticket.urilga = [];
    angular.forEach(res.event_ticket_types,function(item){
      if(item.type == "Paid"){
        $scope.event_ticket.paid.push(item);
      }
      if(item.type == "Free"){
        $scope.event_ticket.free.push(item);
      }
      if(item.type == "Urilga"){
        $scope.event_ticket.urilga.push(item);
      }
    });
  })
  $scope.isChecked = {checked: true};
  $scope.ticket_counter = 1;

  $scope.buyTicket = function(ticket){
    if(onlineStatus.onLine == true){
     $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in'
    });
     $scope.mydata = ticket;
     if($scope.ticket_counter > 1){
      $scope.mydata.ticket_fullname = "";
    }
    var etype = JSON.parse(ticket.event_ticket_type);
    if(etype.type == 'Urilga'){
      if(etype.urilga_type == undefined){
        $scope.mydata.ticket_urilga_type = 'basic';
      }
      else {
       $scope.mydata.ticket_urilga_type = etype.urilga_type;
     }
   }
   $scope.mydata.ticket_type = etype.type;
   $scope.mydata.ticket_type_model = etype.id;
   $scope.mydata.ticket_description = etype.description;
   $scope.mydata.ticket_price = etype.price;
   $scope.mydata.ticket_countof = $scope.ticket_counter;
   $scope.mydata.ticket_created_by = user_id;
   $scope.mydata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
   $http.get('http://www.urilga.mn:1337/person?person_email='+ticket.ticket_email+'&____token=dXJpbGdhbW5BY2Nlc3M=').success(function (response){
    person_info = response[0];
    if(person_info) {
      $scope.mydata.ticket_event = $stateParams.eventId;
      $scope.mydata.ticket_user_email = person_info.person_email;
      $scope.mydata.ticket_user_name = person_info.person_lastname;
    }
    else {
      $scope.mydata.ticket_event = $stateParams.eventId;
      $scope.mydata.ticket_user_email = $localStorage.userdata.user.person.person_email;
      $scope.mydata.ticket_user_name  = $localStorage.userdata.user.person.person_lastname;
    }
    $http.post('http://www.urilga.mn:1337/ticket',$scope.mydata).success(function (response){
      if(response.state){
        $ionicLoading.hide();
        var popup = $ionicPopup.alert({
          template:'Тасалбар авах боломжгүй',
          cssClass :'error'
        })
      }
      else {
        $ionicLoading.hide();
        var popup = $ionicPopup.alert({
          cssClass: 'success',
          template:'Худалдан авалт амжилттай боллоо'
        })
        popup.then(function() {
          $scope.closeModal();
          $state.reload('tab.ticket');
        });
      }
    })
  });
}
else if(onlineStatus.onLine == false) {
  $ionicLoading.hide();
  var alertPopup = $ionicPopup.alert({
   cssClass :'error',
   template: 'Интернет холболтоо шалгана уу'
 });
}
}

$scope.eventid = $stateParams.eventId;
console.log($scope.eventid);
$scope.goForward = function () {
  var selected = $ionicTabsDelegate.selectedIndex();
  if (selected != -1) {
    $ionicTabsDelegate.select(selected + 1);
  }
}

$scope.goBack = function () {
  var selected = $ionicTabsDelegate.selectedIndex();
  if (selected != -1 && selected != 0) {
    $ionicTabsDelegate.select(selected - 1);
  }
}
})
.controller('searchCtrl', function($scope,$state,myData,$ionicLoading,onlineStatus,$ionicHistory,$ionicModal,$ionicPopup,$cordovaSms,$ionicPopup,myData,$ionicPopover,$http,$stateParams,$localStorage,$ionicLoading) {
  var id = $stateParams.eventId;
  myData.getTicket(id).success(function (res){
    $scope.searchTickets = res;
  })
  $scope.backsite = 'http://www.urilga.mn:1337';
  $scope.clear = function(){
   $scope.search = "";
 };
 $scope.searchTitle = function(data){
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in'
  });
  if(data == ""){
    data = undefined;
  }
  var search = {};
  search.text = data;
  search.id = id;
  myData.searchByNumber(search).success(function (response){
    if(response.length > 0){
      $scope.searchTickets = response;
      $scope.counter = 1;
    }
    else {
      $scope.counter = 2;
      $scope.message ='Тасалбар олдсонгүй';
    }
    $ionicLoading.hide();
  })
}
$scope.myGoBack = function() {
  $ionicHistory.goBack();
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
$ionicPopover.fromTemplateUrl('templates/filter.html', {
  scope: $scope,
}).then(function(popover) {
  $scope.popover1 = popover;
});
$scope.hidePop = function($event){
  $scope.popover1.hide($event);
}
$scope.showPop = function($event,data) {
  $scope.popover1.show($event);
  $scope.ticketId = data;
};
$ionicModal.fromTemplateUrl('templates/sendSMS.html', {
  scope: $scope,
  animation: 'slide-in-up'
}).then(function(modal) {
  $scope.modal = modal;
});
$scope.openModal = function() {
  $scope.modal.show();
};
$scope.closedModal = function() {
  $scope.modal.hide();
};
$scope.sendSMS = function(data){
  $scope.openModal();
  console.log(data);
  myData.getscanTicket(data).success(function (res){
    $scope.ticketInfo = res;
  })
}
$scope.send = function(data){
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in'
  });
  console.log(data);
  $cordovaSms
  .send(data.ticket_phonenumber, data.text)
  .then(function() {
    $ionicLoading.hide();
    var popup = $ionicPopup.alert({
      template:'Амжилттай илгээлээ',
      okType :'success'
    })
  }, function(error) {
    var popup = $ionicPopup.alert({
      template:'Амжилтгүй',
      okType :'error'
    })
  });

}
$scope.checkTicket = function(data){
  if(onlineStatus.onLine == true){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in'
    });
    myData.getscanTicket(data).success(function (response){
      console.log(response);
      if(response.ticket_isUsed == false){
        mydata = {};
        mydata.id = response.id;
        mydata.ticket_isUsed = true;
        mydata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
        console.log(mydata);
        myData.scanTicket(mydata).success(function (res){
          if(res.status == true) {
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
             okType :'success',
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
        $ionicLoading.hide();      
        var alertPopup = $ionicPopup.alert({
         cssClass :'error',
         template: 'Бүртгэгдсэн байна'
       });
        alertPopup.then(function(res) {
         $scope.popover.hide();
       });
      }
    }
    )
  }
  else if(onlineStatus.onLine == false) {
    var alertPopup = $ionicPopup.alert({
     cssClass :'error',
     template: 'Интернет холболтоо шалгана уу'
   });        
  }
}
})


.controller('ticketCtrl', function($scope,$window,$rootScope,$localStorage,filterFilter,$ionicPopover,$timeout,$ionicLoading,myData,onlineStatus,$ionicHistory,$stateParams,$ionicPopup,$ionicLoading) {
  var id = $stateParams.eventId;
  $scope.eventid = $stateParams.eventId;
  $ionicLoading.show({
    content: 'Loading'
  });
  $scope.sortType     = 'ticket_user_email'; 
  $scope.sortReverse  =  false;
  $scope.counter = 0;
  $scope.sortName = [
  { text:"A-Z",name: "downName", icon: 'fa-sort-alpha-asc'},
  { text:"Z-A",name: "upName", icon: 'fa-sort-alpha-desc'}
  ];
  $scope.sortTicketType = [
  { text:"Үнэгүй",eventType: "Free"},
  { text:"Үнэтэй",eventType: "Paid"},
  { text:"Урилга",eventType: "Urilga"}
  ];
  $scope.isChecked = function(data){
    var mydata = {};
    mydata.ticket_isUsed = data.ticket_isUsed;
    mydata.id = data.id;
    mydata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
    myData.scanTicket(mydata).success(function (response){
      $state.reload('tab.ticket.all');
      console.log(response);
    })
  }

  $scope.sortByName = function(data){
    console.log(data.name);
    delete data.eventType;
    delete data.date;
    if(data.name == 'downName'){
      $scope.sortType = 'ticket_user.person_firstname';
      $scope.sortReverse = false;
      $scope.counter = 0;
    }
    else if (data.name == 'upName'){
      $scope.sortType = 'ticket_user.person_firstname';
      $scope.sortReverse = true;
      $scope.counter = 0;
    }
    $scope.hide();
  }
  $scope.sortByTicketNumber = function(data){
    console.log(data.name);
    delete data.eventType;
    delete data.date;
    if(data.name == 'downName'){
      $scope.sortType = 'ticket_user.person_firstname';
      $scope.sortReverse = false;
    }
    else if (data.name == 'upName'){
      $scope.sortType = 'ticket_user.person_firstname';
      $scope.sortReverse = true;
    }
    $scope.hide();
  }
  $ionicPopover.fromTemplateUrl('templates/filter.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.hide = function($event){
    $scope.popover.hide($event);
  }
  $scope.show = function($event) {
    $scope.popover.show($event);
  };
  $scope.counter = 0;
  $scope.sortTicket = function(data){
    console.log(data);
    $scope.ticket_type = {};
    $scope.ticket_type.freeticket=[];
    $scope.ticket_type.urilgaticket = [];
    $scope.ticket_type.paidticket = [];
    angular.forEach($scope.tickets, function (item){
      if(item.ticket_type == 'Free'){
        $scope.ticket_type.freeticket.push(item)
      }
      else if (item.ticket_type == 'Paid'){
        $scope.ticket_type.paidticket.push(item);
      }
      else if (item.ticket_type == 'Urilga'){
        $scope.ticket_type.urilgaticket.push(item);
      }
    })
    if(data.eventType == 'Free'){
      $scope.counter = 1;
    }
    else if (data.eventType == 'Paid'){
      $scope.counter = 2;
    }
    else if (data.eventType == 'Urilga') {
     $scope.counter = 3
   }
   $scope.hide();
 }

 $scope.sortBy = function(data){
   $ionicLoading.show({
    content: 'Loading'
  });
   console.log(data);
   console.log(data[Object.keys(data)[0 ]]);
   angular.forEach(data, function(value, key) {
    if(value != ""){
     console.log(key + ': ' + value);

     if(value == 'downName'){
      delete data.name;
      delete data.email;
      delete data.number ;
      delete data.ticketType;
      $scope.sortReverse  =  false;
      $scope.sortType = 'ticket_user.person_firstname';
    }
    else if(value == 'upName' ){
     delete data.name;
     delete data.email;
     delete data.number ;
     delete data.ticketType;
     $scope.counter = 0;
     $scope.sortReverse  =  true;
     $scope.sortType = 'ticket_user.person_firstname';
   }
   else if(value == 'downEmail'){
     delete data.name;
     delete data.email;
     delete data.number ;
     delete data.ticketType;
     $scope.counter = 0;
     $scope.sortReverse  =  false;
     $scope.sortType = 'ticket_user.person_email';
   }
   else if(value == 'upEmail'){
    delete data.name;
    delete data.email;
    delete data.number ;
    delete data.ticketType;
    $scope.counter = 0;
    $scope.sortReverse  =  true;
    $scope.sortType = 'ticket_user.person_email';
  }
  else if(value == 'downNumber'){
   delete data.name;
   delete data.email;
   delete data.number ;
   delete data.ticketType;
   $scope.counter = 0;
   $scope.sortType = 'ticket_countof';
   $scope.sortReverse  =  false;
 }
 else if(value== 'upNumber'){
  delete data.name;
  delete data.email;
  delete data.number ;
  delete data.ticketType;
  $scope.counter = 0;
  $scope.sortType = 'ticket_countof';
  $scope.sortReverse  =  true;
}
}
})
$scope.hide();
$ionicLoading.hide();
}
$scope.backsite = 'http://www.urilga.mn:1337';
$scope.doRefresh = function() {
  if(onlineStatus.onLine == true){
   myData.getTicket($stateParams.eventId).success(function (response){
    $scope.tickets = response;
    $ionicLoading.hide();
  })
   .finally(function() {
     $scope.$broadcast('scroll.refreshComplete');
     $scope.counter = 0;
   })
 }
 else if(onlineStatus.onLine == false) {
  $ionicLoading.hide();
  var alertPopup = $ionicPopup.alert({
   cssClass :'error',
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
$window.onload= $scope.doRefresh();
$scope.checkUsed = function(){
  myData.getTicket($stateParams.eventId).success(function (response){
    $scope.usedCounter = [];
    $scope.notusedCounter = [];
    for (i in response) {
      if(response[i].ticket_isUsed == true) {
        $scope.usedCounter.push(i);
        $scope.usedTicket = response[i];
      }
      else {
        $scope.notusedCounter.push(i);
      }
    }
  })
}

$scope.isChecked = function(data){
  var mydata = {};
  mydata.ticket_isUsed = data.ticket_isUsed;
  mydata.id = data.id;
  mydata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
  myData.scanTicket(mydata).success(function (response){
    console.log('amjilttai');
  })
}
})
.controller('loginCtrl', function($scope,$http,$cordovaOauth,onlineStatus,$ionicLoading,$ionicPopup,myData,$state,$localStorage) {
  $scope.facebookLogin = function() {
    $cordovaOauth.facebook("512066465633383", ["email"]).then(function (result) {
      $localStorage.accessToken = result.access_token;
      $http.get("https://graph.facebook.com/v2.5/me", { params: { access_token: $localStorage.accessToken, fields: "id,name,gender,location,website,picture,relationship_status,email" }}).then(function(result) {
        $ionicLoading.show({
         content: 'Loading',
         animation: 'fade-in'
       }) 
        var userdata = {};
        userdata.email = result.data.email;
        userdata.fb_id = result.data.id;
        userdata.name = result.data.name;
        userdata.picture = result.data.picture.data.url;
        userdata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
        myData.fbLogin(userdata).success(function (response){
          if(response.status == true){
            $localStorage.userdata = response;
            $ionicLoading.hide();
            $state.go('tab.dash', {}, {reload:true});
          }
          else {
           $ionicLoading.hide();
           var alertPopup = $ionicPopup.alert({
             okType :'button-assertive',
             template: response.message
           });
           alertPopup.then(function(res) {
            $state.go('main',{}, {reload:true});
          });
         }
       })
        console.log(userdata);
      }, function(error) {
        alert("There was a problem getting your profile.  Check the logs for details.");
        console.log(error);
      });            
}, function(error) {
  console.log(JSON.stringify(error));
});
}

$scope.login = function(data){
  if(onlineStatus.onLine == true){
    if(!data || !data.email || !data.pass){
     var alertPopup = $ionicPopup.alert({
       cssClass :'error',
       template: 'Бүх талбарыг бөглөнө үү'
     });
   }
   else {
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in'
    }); 
    if(isNaN(data.email)){
     myData.login(data).success(function (response){
      if(response.status == true){
        $localStorage.userdata = response;
        $ionicLoading.hide();
        $state.go('tab.dash',{},{reload:true});
      }
      else {
        $ionicLoading.hide();
        var popup = $ionicPopup.alert({
          cssClass: 'error',
          template: response.message
        })
      }
    })
   }
   else {
    myData.loginPhone(data).success(function (response) {
      if (response.status == true){   
        $localStorage.userdata = response;
        $ionicLoading.hide();
        $state.go('tab.dash', {}, {reload:true});
      }
      else {
        $ionicLoading.hide();
        var popup = $ionicPopup.alert({
          cssClass: 'error',
          template: response.message
        })
      }
    })
  }

}
}
else if(onlineStatus.onLine == false) {
  var alertPopup = $ionicPopup.alert({
   cssClass :'error',
   template: 'Интернет холболтоо шалгана уу'
 });
}
}
})
.controller('registerCtrl', function($scope,$ionicLoading,$http,onlineStatus,myData,$ionicPopover,$cordovaCamera,$ionicPopup,$state,$localStorage) {

  $ionicPopover.fromTemplateUrl('templates/changePic.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.hide = function($event){
    $scope.popover.hide($event);
  }
  $scope.show = function($event) {
    $scope.popover.show($event);
  };

  $scope.pictureURL = 'default.png';
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
      $scope.pictureURL = "data:image/jpeg;base64," + imageData;
    }, function(err) {
      // error
    });

  }


  $scope.Register = function(data) {
    if(onlineStatus.onLine == true){
      if (!data || !data.fname || !data.uname || !data.pass || !data.email || !data.phone ) {
       var alertPopup = $ionicPopup.alert({
         template: 'Бүх талбарыг бөглөнө үү',
         cssClass : 'error'
       });
     }
     else {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in'
      });
      $http.post("http://www.urilga.mn:1337/person", {____token:'dXJpbGdhbW5BY2Nlc3M=',person_firstname:data.fname,person_lastname:data.uname,person_email:data.email,person_cell_number:data.phone,person_profile_img:$scope.pictureURL}).success(function (response) {
        if(response.error){
          $ionicLoading.hide();
          var alertPopup = $ionicPopup.alert({
           template: 'Таны утасны дугаар эсвэл и-мэйл хаяг бүртгэлтэй байна.',
           okType :'button-assertive'
         });
        }
        else {
          var person_id = response.id;
          $http.post("http://www.urilga.mn:1337/user",{____token:'dXJpbGdhbW5BY2Nlc3M=',phonenumber:data.phone,email:data.email,person:person_id,password:data.pass}).success(function(res){
            if(res.error){
              $ionicLoading.hide();
              var alertPopup = $ionicPopup.alert({
               template: res.error,
               okType :'button-assertive'
             });
            }
            else {
              $ionicLoading.hide();
              var alertPopup = $ionicPopup.alert({
               template: 'Амжилттай бүртгүүллээ',
               cssClass :'success'
             });
              alertPopup.then(function(res) {
               $state.go('login',{},{reload:true});
             });
            }
          })
        }
      })
}  
}
else if(onlineStatus.onLine == false) {
  var alertPopup = $ionicPopup.alert({
   template: 'Интернет холболтоо шалгана уу',
   cssClass :'error'
 });
}
};
})
.controller('notusedTicketCtrl', function($scope,$ionicLoading,$cordovaSms,$ionicHistory,$ionicPopup,$state,$ionicModal,myData,onlineStatus,$ionicLoading,$ionicHistory,$localStorage,$stateParams,$state) {
  var id = $stateParams.eventId;
  $scope.eventid = $stateParams.eventId;
  $ionicLoading.show({
    content: 'Loading'
  });
  $scope.backsite = 'http://www.urilga.mn:1337';
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  $ionicModal.fromTemplateUrl('templates/peopleSendSms.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/sendSMS.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.sendmodal = modal;
  });
  $scope.sendModal = function (){
    $scope.sendmodal.show();
  }
  $scope.closedModal = function(){
    $scope.sendmodal.hide();
  }
  $scope.isChecked = function(data){
    var mydata = {};
    mydata.ticket_isUsed = data.ticket_isUsed;
    mydata.id = data.id;
    mydata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
    myData.scanTicket(mydata).success(function (response){
      $state.reload('tab.ticket.notused');
    })
  }

  var unique = function(origArr) {
    var newArr = [],
    origLen = origArr.length,
    found, x, y;

    for (x = 0; x < origLen; x++) {
      found = undefined;
      for (y = 0; y < newArr.length; y++) {
        if (origArr[x] === newArr[y]) {
          found = true;
          break;
        }
      }
      if (!found) {
        newArr.push(origArr[x]);
      }
    }
    return newArr;
  }
  Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
        this.splice(ax, 1);
      }
    }
    return this;
  };
  $scope.checkedTicket = [];
  $scope.checkAll = function (data) {
    if (data) {
      $scope.selectedAll = true;
    } else {
      $scope.selectedAll = false;
    }
    if($scope.selectedAll == true){
      angular.forEach($scope.notusedTickets,function(item) {
        if(item.ticket_phonenumber != ""){
          item.check = $scope.selectedAll;
          $scope.Checked(item,$scope.check);
        }
      })
    }
    else {
     angular.forEach($scope.notusedTickets,function(item) {
       item.check = $scope.selectedAll;
       $scope.Checked(item);
     })
   }
 };


 $scope.Checked = function(data){
  if(data.check == true){
    if(data.ticket_phonenumber != undefined){
     $scope.checkedTicket.push(data.ticket_phonenumber);
     var arrunique = unique($scope.checkedTicket);
     $scope.uniqueNumber =arrunique;
     var test = arrunique.toString();
     $scope.ticketInfo= { ticket_phonenumber:  test.toString() };
   }
 }
 else {
  $scope.checkedTicket.remove(data.ticket_phonenumber);
  var arrunique = unique($scope.checkedTicket);
  $scope.uniqueNumber =arrunique;
  var test = arrunique.toString();
  $scope.ticketInfo= { ticket_phonenumber:  test.toString() };
}
}
$scope.numbers = [];
$scope.send = function(data){
  if(data.ticket_phonenumber == ''){
    alert('Утасны дугаар хоосон байна');
  }
  else {
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in'
    });
    angular.forEach($scope.uniqueNumber,function (item){
     $cordovaSms
     .send(item, data.text)
     .then(function() {
      $ionicLoading.hide();
      console.log('amjilttai');
    }, function(error) {
      $ionicLoading.hide();
      alert(error);
    });
   })
  }
}
$scope.doRefresh = function() {
  if(onlineStatus.onLine == true){
   myData.getTicket($stateParams.eventId).success(function (response){
    $scope.tickets = response;
    $ionicLoading.hide();
    $scope.notused = [];
    $scope.notusedTickets = [];
    for ( i in $scope.tickets){
      if($scope.tickets[i].ticket_isUsed ==false){
        $scope.notused.push(i);
        $scope.notusedTickets.push($scope.tickets[i]);
      }
    }
    $scope.not_used_counter = $scope.notused.length;
  })
   .finally(function() {
     $scope.$broadcast('scroll.refreshComplete');
   })
 }
 else if(onlineStatus.onLine == false) {
  $ionicLoading.hide();
  var alertPopup = $ionicPopup.alert({
   cssClass :'error',
   template: 'Интернет холболтоо шалгана уу'
 });
  alertPopup.then(function(res) {
   $scope.$broadcast('scroll.refreshComplete');
 });
}
};
window.onload = $scope.doRefresh();
})
.controller('ChatsCtrl', function($scope,$ionicModal,$ionicPopup,$state,$localStorage,onlineStatus,$ionicLoading,$cordovaBarcodeScanner,myData) {
  $ionicModal.fromTemplateUrl('templates/handCheck.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  var person = $localStorage.userdata.user.person;
  $scope.isChecked = 0;
  $scope.checkTicket = function(data){
    var ticketdata = {};
    ticketdata.shortId = data.shortCode;
    ticketdata.createdBy = person.id;
    myData.checkTicketShortID(ticketdata).success(function (result){
      if(result[0]){
        if(result[0].ticket_isUsed == true){
          var alertPopup = $ionicPopup.alert({
           cssClass :'error',
           template: 'Ашиглагдсан тасалбар байна.'
         });
        }
        else {
         $ionicLoading.show({
           content: 'Loading'
         });
         var updatedata ={};
         updatedata.id = result[0].id;
         updatedata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
         updatedata.ticket_isUsed = true;
         myData.scanTicket(updatedata).success(function (result){
          $ionicLoading.hide();
          var alertPopup = $ionicPopup.alert({
            cssClass :'success',
            template: 'Амжилттай бүртгэлээ.'
          });
        })
       }
     }
     else {
      var alertPopup = $ionicPopup.alert({
       cssClass :'error',
       template: 'Буруу код оруулсан байна.'
     });
    }
  })
  }
  $scope.scan = function(){
    if(onlineStatus.onLine == true){
     $cordovaBarcodeScanner.scan().then(function(barcodeData) {
       $ionicLoading.show({
         content: 'Loading'
       });
       $scope.scanData =barcodeData;
       myData.getscanTicket($scope.scanData.text).success(function (ticketInfos){
        myData.getEvent(person.id).success(function (response){
          $scope.events = response;
          try{  angular.forEach($scope.events,function(__event){
            if(__event.id == ticketInfos.ticket_event.id) {
             if(ticketInfos.ticket_isUsed == false){
               throw $scope.ash = 0;
             }
             if(ticketInfos.ticket_isUsed == true) {
              throw $scope.ash = 1;
            }
          } 
          $scope.isNo = true;
          console.log($scope.isNo);
        });
        } catch(e){
         console.log(e);
       }
       if($scope.ash == 0) {
        $scope.isChecked = 1;
        $scope.ticketInfo = ticketInfos;
        var data = {};
        data.id = $scope.ticketInfo.id;
        data.ticket_isUsed = true;
        data.____token = 'dXJpbGdhbW5BY2Nlc3M=';
        myData.scanTicket(data).success(function (res){
          $ionicLoading.hide();
        })
        console.log('ashiglaagui');
      }
      else if($scope.ash == 1){
        $scope.isChecked = 2;
        console.log('ashiglagdsan');
        $ionicLoading.hide();
      }
      else if ($scope.isNo = true){
        $scope.isChecked = 4;
        console.log('bgui');
        $ionicLoading.hide();
      }
    });
$ionicLoading.hide();
})
.error(function (err){
  $scope.isChecked = 3;
  $ionicLoading.hide();
  console.log('bgui ee');
})
$ionicLoading.hide();
})
}
else if(onlineStatus.onLine == false) {
  var alertPopup = $ionicPopup.alert({
   cssClass :'error',
   template: 'Интернет холболтоо шалгана уу'
 });
}
}
})

.controller('usedTicketCtrl', function($scope,$ionicLoading,myData,onlineStatus,$ionicPopup,$ionicLoading,$ionicHistory,$localStorage,$stateParams,$state) {
  $ionicLoading.show({
   content: 'Loading'
 });
  $scope.backsite = 'http://www.urilga.mn:1337';

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
   else if(onlineStatus.onLine == false) {
     $ionicLoading.hide();
     var alertPopup = $ionicPopup.alert({
       cssClass :'error',
       template: 'Интернет холболтоо шалгана уу'
     });
     alertPopup.then(function(res) {
       $scope.$broadcast('scroll.refreshComplete');
     });
   }
 };
 window.onload = $scope.doRefresh();
})

.controller('AccountCtrl', function($scope,$window,$cordovaCamera,myData,$localStorage,$state,$ionicPopover) {
 $scope.userInfo = $localStorage.userdata.user.person;
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
$scope.backsite = 'http://www.urilga.mn:1337';
$scope.pictureURL = 'default.png';
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
    mydata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
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
    console.log(imageData);
    $scope.imageURL = "data:image/jpeg;base64," + imageData;
    var mydata = {};
    mydata.id = $scope.userInfo.id;
    mydata.person_profile_img = $scope.imageURL;
    console.log($scope.imageURL);
    mydata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
    myData.updatePerson(mydata).success(function (response){
      $localStorage.userdata.user.person = response.updated_person;
      console.log('success');
    })
  }, function(err) {
      // error
    });

}
$scope.logout = function(){
  $window.location.reload();
  $localStorage.$reset();
  $state.go('login',{},{reload:true}); 
}
})
.controller('ForgotPasswordCtrl',function($scope,$ionicHistory,$ionicLoading,$ionicPopup,$state,$window,$http){
  $scope.goBack = function() {
    $ionicHistory.goBack();
  }
  $scope.showIndex = 0;
 //  $scope.checkEmail = function(data){
 //    if(!data ){
 //      var alertPopup = $ionicPopup.alert({
 //       template: 'Бүх талбарыг бөглөнө үү',
 //       cssClass :'error'
 //     });
 //    }
 //    else {
 //     $ionicLoading.show({
 //      content: 'Loading',
 //      animation: 'fade-in',
 //    });
 //     $http.get('http://www.urilga.mn:1337/person?person_email='+data+'&____token= dXJpbGdhbW5BY2Nlc3M=').success(function (res){
 //      if(res.length > 0){
 //        $scope.showIndex = 1;
 //        $ionicLoading.hide();
 //      }
 //      else {
 //        $ionicLoading.hide();
 //        var alertPopup = $ionicPopup.alert({
 //         template: 'Бүртгэлгүй и-мэйл байна',
 //         cssClass :'error'
 //       });
 //      }
 //    })
 //   }
 // }
 $scope.changePassword = function(data){
  if(!data || !data.change){
   var alertPopup = $ionicPopup.alert({
     template: 'Талбарыг бөглөнө үү',
     okType :'button-assertive'
   });
 }
 else {
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
  });
  if(!isNaN(data.change)){
   $http.post('http://www.urilga.mn:1337/userforgotpassword1',{phonenumber___:data.change,____token:'dXJpbGdhbW5BY2Nlc3M='}).success(function (res){
    console.log(res);
    if(res.state == 'OK'){
      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
       template: res.message,
       okType :'button-balanced'
     });
      alertPopup.then(function(res) {
       $state.go('main', {}, {reload:true});
     });
    }
    else {
      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
       template: res.state,
       okType :'button-assertive'
     });
    }
  })
 }
 else {
  $http.post('http://www.urilga.mn:1337/userforgotpassword',{email___:data.change,____token:'dXJpbGdhbW5BY2Nlc3M='}).success(function (res){
    console.log(res);
    if(res.state == 'OK'){
      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
       template: res.message,
       okType :'button-balanced'
     });
      alertPopup.then(function(res) {
       $state.go('main', {}, {reload:true});
     });
    }
    else {
      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
       template: res.state,
       okType :'button-assertive'
     });
    }
  })
}
}
}
$scope.changepass = function(data){
  if(!data || !data.newpass || !data.email || !data.newpass_verify){
   var alertPopup = $ionicPopup.alert({
     template: 'Талбарыг бөглөнө үү',
     okType :'button-assertive'
   });
 }
 else {
   if(data.newpass == data.newpass_verify){
     $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
    });
     $http.put('http://www.urilga.mn:1337/user',{email:data.email,password:data.newpass}).success(function (res){
      if(res.status == true){
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
         template: 'Амжилттай өөрчлөгдлөө',
         cssClass :'success'
       });
        alertPopup.then(function(res) {
         $state.go('login', {}, {reload:true});
       });
      }
      else {
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
         template: 'Амжилтгүй',
         cssClass :'error'
       });
      }
    })
   }
   else {
    var alertPopup = $ionicPopup.alert({
     template: 'Нууц үг тохирохгүй байна',
     cssClass :'error'
   });
  }
}
};
})

;
