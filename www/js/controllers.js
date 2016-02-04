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

myapp.controller('DashCtrl', function($scope,ImgCache,$ionicModal,$localStorage,myData,$ionicFilterBar,$rootScope,$timeout,onlineStatus,$ionicPopup,myData,$window,$http,$localStorage,$ionicLoading) {
 $ionicModal.fromTemplateUrl('templates/addEvent.html', {
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
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
  $scope.data = {
    showDelete: false
  };
  $scope.onItemDelete = function(event) {
    $scope.events.splice($scope.events.indexOf(event), 1);
    var id = event.id;
    myData.deleteEvent(id).success(function(res){
      if(res.state == "OK"){
        $localStorage.events = $scope.events;
      }
    })
  };
  var person = $localStorage.userdata.user.person;
  $scope.event = {};
  $scope.event.event_start_date = new Date();
  $scope.event.event_end_date = new Date();
  $scope.event.event_start_time = new Date();
  $scope.event.event_title = 'Meeting';
  $scope.event.event_location = 'Ulaanbaatar';
  $scope.createEvent = function(data){
    var mydata = {};
    mydata = data;
    mydata.event_isActive = false;
    mydata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
    mydata.event_created_by = person.id;
    mydata.event_all_ticket_remaining = 100;
    mydata.event_free_ticket_remaining = 100;
    myData.createEvent(mydata).success(function (response){
      if(response){
        var ticketdata = {};
        ticketdata.type = 'Free';
        ticketdata.all_count = 100;
        ticketdata.remaining = 100;
        ticketdata.description = 'Free Ticket';
        ticketdata.event_info = response.id;
        ticketdata.____token = 'dXJpbGdhbW5BY2Nlc3M=';
        myData.createTicket(ticketdata).success(function(res){
         $scope.doRefresh();
         $scope.closeModal();
       })

      }
    })
  }
  $rootScope.backSite = 'http://www.urilga.mn:1337';
  $scope.showFilterBar = function () {
    filterBarInstance = $ionicFilterBar.show({
     cancelText: "хаах",
     items: $scope.events,
     done: function () {
      $scope.searching = false; 
    },
    update: function (filteredItems,filtertext) {
     $scope.search = filtertext;
   },
   cancel: function () {
    $scope.searching = false; 
  },
  filterProperties: 'name'
});
  };
  $ionicLoading.show({
    content: 'Loading'
  });
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
      ImgCache.$init();
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
  if($localStorage.events){
    $scope.events  = $localStorage.events;
    $ionicLoading.hide();
    $scope.doRefresh();
  }
  else {
    $scope.doRefresh();
  }
}
$window.onload = $scope.OnLoad();
})

.controller('allticketCtrl',function($scope,$timeout,$ionicFilterBar, $cordovaBarcodeScanner,$ionicHistory,onlineStatus,myData,$state,$http,$ionicPopup,$ionicLoading,$localStorage,$stateParams,$ionicModal,$ionicTabsDelegate){
 $ionicModal.fromTemplateUrl('templates/buyTicket.html', {
  scope: $scope,
  animation: 'slide-in-up'
}).then(function(modal) {
  $scope.modal = modal;
});
$scope.openBuyTicket = function() {
  $scope.modal.show();
};
$scope.closeBuyTicket = function() {
  $scope.modal.hide();
};
$scope.showFilterBar = function () {
  filterBarInstance = $ionicFilterBar.show({
   cancelText: "хаах",
   items: $scope.events,
   done: function () {
    $scope.searching = false; 
  },
  update: function (filteredItems,filtertext) {
   $scope.search = filtertext;
 },
 cancel: function () {
  $scope.searching = false; 
},
filterProperties: 'name'
});
};
$ionicModal.fromTemplateUrl('templates/handCheck.html', {
  scope: $scope,
  animation: 'slide-in-up'
}).then(function(handmodal) {
  $scope.hmodal = handmodal;
});
$scope.openHandcheck = function() {
  $scope.hmodal.show();
};
$scope.closeModal = function() {
  $scope.hmodal.hide();
};
$ionicModal.fromTemplateUrl('templates/checkTicket.html', {
  scope: $scope,
  animation: 'slide-in-up'
}).then(function(checkmodal) {
  $scope.cmodal = checkmodal;
});
$scope.openCheckTicket = function() {
  $scope.cmodal.show();
};
$scope.closeCheckTicket = function() {
  $scope.cmodal.hide();
};
$scope.add = function(){
  $scope.ticket_counter += 1;
};
$scope.sub = function(){
  if($scope.ticket_counter != 1){
    $scope.ticket_counter -= 1;
  }
};
var person = $localStorage.userdata.user.person;

$scope.checkTicket = function(data){
  var ticketdata = {};
  ticketdata.shortId = data.shortCode;
  ticketdata.createdBy = person.id;
  ticketdata.eventID= $stateParams.eventId;
  myData.checkTicketShortIDbyEvent(ticketdata).success(function (result){
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
        })
        alertPopup.then(function(){
          $scope.closeModal();
        })
      })
     }
   }
   else {
    var alertPopup = $ionicPopup.alert({
     cssClass :'error',
     template: 'Буруу код оруулсан байна.'
   })
  }
})
}



$scope.scan = function(){
  if(onlineStatus.onLine == true){
    $cordovaBarcodeScanner.scan().then(function(barcodeData) {
      if(barcodeData.cancelled == true){
        $ionicLoading.hide();
      }
      else {
        $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in'
        });
        $scope.ticketid = barcodeData.text;
        $scope.eventId = $stateParams.eventId;
        myData.getscanTicketByEvent($stateParams.eventId).success(function(res){
          $scope.eventTickets = res;
          var keepGoing = true;
          $scope.checker = 0;
          if($scope.eventTickets.length == 0){
            $ionicLoading.hide();
               var alertPopup = $ionicPopup.alert({
               cssClass :'error',
               template: 'Тасалбар байхгүй байна.'
             })
              alertPopup.then(function(){
                $scope.closeCheckTicket()
              });
          }
          else {
             angular.forEach($scope.eventTickets,function(ticket){
            $scope.ticket = ticket;
            if(keepGoing){
             if($scope.ticket.id == barcodeData.text){
              if($scope.ticket.ticket_isUsed == true){
                console.log('ashiglagdasan');
                $scope.checker = 1;
              }
              else {
                console.log('ashiglaagui');
                $scope.checker = 2;
              }
              keepGoing = false;
            }
          }
        })
          if(keepGoing == false){
            if($scope.checker == 1){
              $ionicLoading.hide();
              var alertPopup = $ionicPopup.alert({
               cssClass :'error',
               template: 'Ашиглагдсан тасалбар байна та дахин шалгана уу'
             });
            }
            else if ($scope.checker == 2){
             var data = {};
             data.ticket_isUsed = true;
             data.id = $scope.ticket.id;
             data.____token = 'dXJpbGdhbW5BY2Nlc3M=';
             myData.scanTicket(data).success(function (res){
              $ionicLoading.hide();
              if(res.status == true){
               var alertPopup = $ionicPopup.alert({
                 cssClass :'success',
                 template: 'Амжилттай бүртгэлээ'
               })
               alertPopup.then(function(){
                $scope.closeCheckTicket();
              });
             }
             else {
              var alertPopup = $ionicPopup.alert({
               cssClass :'error',
               template: 'Дахин шалгана уу'
             })
              alertPopup.then(function(){
                $scope.closeCheckTicket();
              });
            }
          })
           }
         }
         else {
           if(keepGoing == true){
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
             cssClass :'error',
             template: 'Тасалбар олдсонгүй та дахин шалгана уу'
           });
          }
        }
          }
      })
}
},function(error){
  console.log(error);
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
var events = $localStorage.events;
angular.forEach(events,function(event){
  if(event.id == $stateParams.eventId){
   $scope.event_info = event;
   $scope.event_ticket = {};
   $scope.event_ticket.free = [];
   $scope.event_ticket.paid = [];
   $scope.event_ticket.urilga = [];
   angular.forEach(event.event_ticket_types,function(item){
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
 }
})
// myData.getEventById($stateParams.eventId).success(function (res){
//   $scope.event_info = res;
//   $scope.event_ticket = {};
//   $scope.event_ticket.free = [];
//   $scope.event_ticket.paid = [];
//   $scope.event_ticket.urilga = [];
//   angular.forEach(res.event_ticket_types,function(item){
//     if(item.type == "Paid"){
//       $scope.event_ticket.paid.push(item);
//     }
//     if(item.type == "Free"){
//       $scope.event_ticket.free.push(item);
//     }
//     if(item.type == "Urilga"){
//       $scope.event_ticket.urilga.push(item);
//     }
//   });
// })
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
        $scope.closeBuyTicket();
        $state.reload();
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
$scope.doRefresh = function(){
  myData.getTicket($scope.eventid).success(function (res){
    console.log(res);
  })
}
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
.controller('searchCtrl', function($scope,$ionicHistory,$ionicFilterBar,$state,myData,$ionicLoading,onlineStatus,$ionicHistory,$ionicModal,$ionicPopup,$cordovaSms,$ionicPopup,myData,$ionicPopover,$http,$stateParams,$localStorage,$ionicLoading) {
  var id = $stateParams.eventId;
  myData.getTicket(id).success(function (res){
    $scope.searchTickets = res;
  })
  $scope.backsite = 'http://www.urilga.mn:1337';
  $scope.clear = function(){
   $scope.search = "";
 };
 $scope.goBack = function() {
  $ionicHistory.goBack();
}
$scope.showFilterBar = function () {
  filterBarInstance = $ionicFilterBar.show({
   cancelText: "хаах",
   items: $scope.searchTickets,
   done: function () {
    $scope.searching = false; 
  },
  update: function (filteredItems,filtertext) {
   $scope.search = filtertext;
   console.log(filteredItems);
 },
 cancel: function () {
  $scope.searching = false; 
},
filterProperties: 'name'
});
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
    $ionicLoading.hide();
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
             cssClass :'success',
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


.controller('ticketCtrl', function($scope,$window,ImgCache,$ionicFilterBar,$rootScope,$localStorage,filterFilter,$ionicPopover,$timeout,$ionicLoading,myData,onlineStatus,$ionicHistory,$stateParams,$ionicPopup,$ionicLoading) {
  $scope.showFilterBar = function () {
    filterBarInstance = $ionicFilterBar.show({
     cancelText: "хаах",
     items: $scope.tickets,
     done: function () {
      $scope.searching = false; 
    },
    update: function (filteredItems,filtertext) {
     $scope.search = filtertext;
     console.log(filteredItems);
   },
   cancel: function () {
    $scope.searching = false; 
  },
  filterProperties: 'name'
});
  };
  var id = $stateParams.eventId;
  $scope.eventid = $stateParams.eventId;
  $scope.sortType     = 'ticket_user_email'; 
  $scope.sortReverse  =  false;
  $scope.counter = 0;
  $scope.sortName = [
  { text:"A-Z",name: "downName", icon: 'fa-sort-alpha-asc'},
  { text:"Z-A",name: "upName", icon: 'fa-sort-alpha-desc'}
  ];
  $scope.sortTicketType = [
  {text:'Бүх тасалбар',eventType: 'All'},
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
  // $scope.sortByTicketNumber = function(data){
  //   console.log(data.name);
  //   delete data.eventType;
  //   delete data.date;
  //   if(data.name == 'downName'){
  //     $scope.sortType = 'ticket_user.person_firstname';
  //     $scope.sortReverse = false;
  //   }
  //   else if (data.name == 'upName'){
  //     $scope.sortType = 'ticket_user.person_firstname';
  //     $scope.sortReverse = true;
  //   }
  //   $scope.hide();
  // }
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
    if(data.eventType == 'Free'){
      $scope.tickets = $localStorage.ticketType.freeTicket;
    }
    else if (data.eventType == 'Paid'){
      $scope.tickets = $localStorage.ticketType.paidTicket;
    }
    else if (data.eventType == 'Urilga'){
      $scope.tickets = $localStorage.ticketType.urilgaTicket;
    }
    else if (data.eventType == 'All'){
      $scope.tickets = $localStorage.tickets;
    }
    $scope.hide();
  }

//   $scope.sortBy = function(data){
//    $ionicLoading.show({
//     content: 'Loading'
//   });
//    console.log(data);
//    console.log(data[Object.keys(data)[0 ]]);
//    angular.forEach(data, function(value, key) {
//     if(value != ""){
//      console.log(key + ': ' + value);

//      if(value == 'downName'){
//       delete data.name;
//       delete data.email;
//       delete data.number ;
//       delete data.ticketType;
//       $scope.sortReverse  =  false;
//       $scope.sortType = 'ticket_user.person_firstname';
//     }
//     else if(value == 'upName' ){
//      delete data.name;
//      delete data.email;
//      delete data.number ;
//      delete data.ticketType;
//      $scope.counter = 0;
//      $scope.sortReverse  =  true;
//      $scope.sortType = 'ticket_user.person_firstname';
//    }
//    else if(value == 'downEmail'){
//      delete data.name;
//      delete data.email;
//      delete data.number ;
//      delete data.ticketType;
//      $scope.counter = 0;
//      $scope.sortReverse  =  false;
//      $scope.sortType = 'ticket_user.person_email';
//    }
//    else if(value == 'upEmail'){
//     delete data.name;
//     delete data.email;
//     delete data.number ;
//     delete data.ticketType;
//     $scope.counter = 0;
//     $scope.sortReverse  =  true;
//     $scope.sortType = 'ticket_user.person_email';
//   }
//   else if(value == 'downNumber'){
//    delete data.name;
//    delete data.email;
//    delete data.number ;
//    delete data.ticketType;
//    $scope.counter = 0;
//    $scope.sortType = 'ticket_countof';
//    $scope.sortReverse  =  false;
//  }
//  else if(value== 'upNumber'){
//   delete data.name;
//   delete data.email;
//   delete data.number ;
//   delete data.ticketType;
//   $scope.counter = 0;
//   $scope.sortType = 'ticket_countof';
//   $scope.sortReverse  =  true;
// }
// }
// })
// $scope.hide();
// $ionicLoading.hide();
// }
$scope.backsite = 'http://www.urilga.mn:1337';
$scope.doRefresh = function() {
 if(onlineStatus.onLine == true){
   myData.getTicket($stateParams.eventId).success(function (response){
     $ionicLoading.hide();
     $scope.tickets = response;
     $localStorage.tickets = $scope.tickets;
      var ticketType = {};
      ticketType.freeTicket = [];
      ticketType.paidTicket = [];
      ticketType.urilgaTicket = [];
      angular.forEach($scope.tickets, function(ticket){
        if(ticket.ticket_type == 'Free'){
          ticketType.freeTicket.push(ticket);
        } 
        else if (ticket.ticket_type == 'Paid'){
          ticketType.paidTicket.push(ticket);
        }
        else if(ticket.ticket_type == 'Urilga'){
          ticketType.urilgaTicket.push(ticket);
        }
      })
      $localStorage.ticketType = ticketType;
   })
   .finally(function() {
    ImgCache.$init();
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
$scope.onLoad = function(){
  if($localStorage.tickets){
    $ionicLoading.hide();
    $scope.tickets = $localStorage.tickets;
    $scope.doRefresh();
  }
  else {
    $scope.doRefresh();
  }
}
window.onload= $scope.onLoad();
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
      if (!data || !data.fname || !data.pass || !data.email || !data.phone ) {
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
      $http.post("http://www.urilga.mn:1337/person", {____token:'dXJpbGdhbW5BY2Nlc3M=',person_firstname:data.fname,person_email:data.email,person_cell_number:data.phone,person_profile_img:$scope.pictureURL}).success(function (response) {
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
                $http.post("http://www.urilga.mn:1337/login",{email:data.email,password:data.pass}).success(function (response){
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
.controller('notusedTicketCtrl', function($scope,ImgCache,$ionicLoading,$cordovaSms,$ionicHistory,$ionicPopup,$state,$ionicModal,myData,onlineStatus,$ionicLoading,$ionicHistory,$localStorage,$stateParams,$state) {
  var id = $stateParams.eventId;
  $scope.eventid = $stateParams.eventId;
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
    var alertPopup = $ionicPopup.alert({
     cssClass :'error',
     template: 'Утасны дугаар хоосон байна шалгана уу'
   });
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
    $localStorage.tickets = $scope.tickets;
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
    ImgCache.$init();
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
$scope.onLoad = function(){
  if($localStorage.tickets){
    var tickets = $localStorage.tickets;
    $scope.notusedTickets = [];
    angular.forEach(tickets,function(ticket){
      if(ticket.ticket_isUsed == false){
        $scope.notusedTickets.push(ticket);
      }
    })
    $ionicLoading.hide();
    $scope.doRefresh();
  }
  else {
    $scope.doRefresh();
  }
}
window.onload = $scope.onLoad();
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
       if(barcodeData.cancelled == true){
        $ionicLoading.hide();
      }
      else {
       $scope.scanData =barcodeData;
       myData.getscanTicket($scope.scanData.text).success(function (ticketInfos){
        $scope.events = $localStorage.events;
        $scope.keepGoing = true;
        angular.forEach($scope.events,function(__event){
          if($scope.keepGoing){
            if(__event.id == ticketInfos.ticket_event.id){
              if(ticketInfos.ticket_isUsed == true){
                $ionicLoading.hide();
                console.log('ashiglasan');
                $scope.isChecked = 2;
              }
              else if(ticketInfos.ticket_isUsed == false) {
                $ionicLoading.hide();
                var data = {};
                data.id = $scope.ticketInfo.id;
                data.ticket_isUsed = true;
                data.____token = 'dXJpbGdhbW5BY2Nlc3M=';
                myData.scanTicket(data).success(function (res){
                  if(res.status == true){
                    $ionicLoading.hide();
                    $scope.ticketInfo = res.updated_ticket;
                    $scope.isChecked = 1;
                  }
                  else {
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                     cssClass :'error',
                     template: 'Та дахин шалгана уу.'
                   });
                  }
                }).error(function(err){
                  $ionicLoading.hide();
                  console.log(err);
                })
              }
              $scope.keepGoing = false;
            }
          }
        })
if($scope.keepGoing == true){
  $ionicLoading.hide();
  $scope.isChecked = 3;
}      
}).error(function(err,err1,err2){
  $ionicLoading.hide();
  $scope.isChecked = 4;
})
      }
},function(error){
  console.log(error);
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

.controller('usedTicketCtrl', function($scope,ImgCache,$ionicLoading,myData,onlineStatus,$ionicPopup,$ionicLoading,$ionicHistory,$localStorage,$stateParams,$state) {
  $scope.backsite = 'http://www.urilga.mn:1337';
  $scope.doRefresh = function() {
    if(onlineStatus.onLine == true){
     myData.getTicket($stateParams.eventId).success(function (response){
      $scope.tickets = response;
      $localStorage.tickets = $scope.tickets;
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
       ImgCache.$init();
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
 $scope.onLoad = function(){
  if($localStorage.tickets){
    var tickets = $localStorage.tickets;
    $scope.usedTickets = [];
    angular.forEach(tickets, function(ticket){
      if(ticket.ticket_isUsed == true){
        $scope.usedTickets.push(ticket);
      }
    })
    $ionicLoading.hide();
    $scope.doRefresh();
  }
  else {
    $scope.doRefresh();
  }
}
window.onload = $scope.onLoad();
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
.controller('searchByEventCtrl',function($scope,$localStorage,$state,$ionicHistory){
  $scope.clear = function(){
   $scope.search = "";
 };
 $scope.myGoBack = function() {
  $ionicHistory.goBack();
};
$scope.events = $localStorage.events;
})
.controller('checkTicketCtrl',function($scope,onlineStatus,$stateParams,myData,$ionicModal,$cordovaBarcodeScanner,$localStorage,$state,$ionicLoading,$ionicHistory,$ionicPopup){
  var person = $localStorage.userdata.user.person;
  $scope.goBack = function(){
    $state.go('tab.ticket',{eventId:$stateParams.eventId})
  }
  $ionicModal.fromTemplateUrl('templates/handCheck.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(handmodal) {
    $scope.hmodal = handmodal;
  });
  $scope.openHandcheck = function() {
    $scope.hmodal.show();
  };
  $scope.closeModal = function() {
    $scope.hmodal.hide();
  };
  $scope.checkTicket = function(data){
    var ticketdata = {};
    ticketdata.shortId = data.shortCode;
    ticketdata.createdBy = person.id;
    ticketdata.eventID= $stateParams.eventId;
    myData.checkTicketShortIDbyEvent(ticketdata).success(function (result){
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
          })
          alertPopup.then(function(){
            $scope.closeModal();
          })
        })
       }
     }
     else {
      var alertPopup = $ionicPopup.alert({
       cssClass :'error',
       template: 'Буруу код оруулсан байна.'
     })
    }
  })
  }
  $scope.counter = 0;
  $scope.scan = function(){
    if(onlineStatus.onLine == true){
      $cordovaBarcodeScanner.scan().then(function(barcodeData) {
        if(barcodeData.cancelled == true){
          $ionicLoading.hide();
        }
        else {
          $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in'
          });
          $scope.ticketid = barcodeData.text;
          $scope.eventId = $stateParams.eventId;
          myData.getscanTicketByEvent($scope.eventId).success(function (res) {
            if(res.length == 0){
              $ionicLoading.hide();
              $scope.counter = 1;
             //  var alertPopup = $ionicPopup.alert({
             //   cssClass :'error',
             //   template: 'Тасалбар байхгүй байна.'
             // })
             //  alertPopup.then(function(){
             //    $scope.closeCheckTicket()
             //  });
}
else {
 try {  angular.forEach(res , function(ticket){
  $scope.ticket = ticket;
  if ($scope.ticket.id == $scope.ticketid){
    if(ticket.ticket_isUsed == false){
      throw $scope.isChecker = 0;
    }
    if(ticket.ticket_isUsed == true) {
      throw $scope.isChecker = 1;
    }
  }
  $scope.isNo = true;

})
}
catch(e){
  console.log(e);
}
if($scope.isChecker == 0){
  var data = {};
  data.ticket_isUsed = true;
  data.id = $scope.ticket.id;
  data.____token = 'dXJpbGdhbW5BY2Nlc3M=';
  myData.scanTicket(data).success(function (res){
    $ionicLoading.hide();
    if(res.status == true){
      $scope.ticketInfo = $scope.ticket;
      $scope.counter = 2;
              //  var alertPopup = $ionicPopup.alert({
              //    cssClass :'success',
              //    template: 'Амжилттай бүртгэлээ'
              //  })
              //  alertPopup.then(function(){
              //   $scope.transitionTo('tab.ticket',{eventId:$stateParams.eventId},{reload:true});
              // });
}
else {
 $scope.counter = 3;
 $ionicLoading.hide();
}
})
}
else if($scope.isChecker == 1){
 $ionicLoading.hide();
 $scope.counter = 4;
           // var alertPopup = $ionicPopup.alert({
           //   cssClass :'error',
           //   template: 'Ашиглагдсан тасалбар байна та дахин шалгана уу'
           // });
}
else if ($scope.isNo == true){
  $ionicLoading.hide();
  $scope.counter =5;
         //  var alertPopup = $ionicPopup.alert({
         //   cssClass :'error',
         //   template: 'Тасалбар олдсонгүй та дахин шалгана уу'
         // });
}
}
})   
.error(function (err){
 $ionicLoading.hide();
 $scope.counter = 6;
 // var alertPopup = $ionicPopup.alert({
 //   cssClass :'error',
 //   template: 'Та дахин шалгана уу'
 // });
})
}
},function(error){
  console.log(error);
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
;
