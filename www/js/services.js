angular.module('starter.services', [])

.factory('myData', function($http) {
      return {
      getEvent : function(personid){
      return  $http.get('http://52.69.108.195:1337/event?event_created_by='+personid);
     },
     getPerson : function(id){
      return $http.get('http://52.69.108.195:1337/person/'+id);
     },
      updatePerson : function(data){
      return $http.put('http://52.69.108.195:1337/person/'+data.id,data);
     },
     login: function(data){
      return $http.post('http://52.69.108.195:1337/login',{email:data.email,password:data.pass});
     },
     getTicket: function(eventid){
      return $http.get('http://52.69.108.195:1337/ticket?ticket_event='+eventid);
     },
     scanTicket: function(data){
      return $http.put('http://52.69.108.195:1337/ticket',data);
     },
     getscanTicket: function(id){
      return $http.get('http://52.69.108.195:1337/ticket/'+id);
     }
   }
});
