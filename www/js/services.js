angular.module('starter.services', [])

.factory('myData', function($http) {
  return {
    getEvent : function(personid){
      return  $http.get('http://www.urilga.mn:1337/event?event_created_by='+personid+'&____token=dXJpbGdhbW5BY2Nlc3M=');
    },
    getEventById : function(id){
      return  $http.get('http://www.urilga.mn:1337/event/'+id+'?____token=dXJpbGdhbW5BY2Nlc3M=');
    },
    deleteEvent : function(id){
      return $http.delete('http://www.urilga.mn:1337/event/'+id+'?____token=dXJpbGdhbW5BY2Nlc3M=');
    },
    getPerson : function(id){
      return $http.get('http://www.urilga.mn:1337/person/'+id+'?____token=dXJpbGdhbW5BY2Nlc3M=');
    },
    updatePerson : function(data){
      return $http.put('http://www.urilga.mn:1337/person/'+data.id,data);
    },
    login: function(data){
      return $http.post('http://www.urilga.mn:1337/login',{email:data.email,password:data.pass,____token:'dXJpbGdhbW5BY2Nlc3M='});
    },
    loginPhone:function(data){
      return $http.post('http://www.urilga.mn:1337/loginviaphone',{phonenumber:data.email,password:data.pass,____token:'dXJpbGdhbW5BY2Nlc3M='});
    },
    getTicket: function(eventid){
      return $http.get('http://www.urilga.mn:1337/ticket?ticket_event='+eventid+'&____token=dXJpbGdhbW5BY2Nlc3M=');
    },
    searchByNumber: function(data){
      return $http.get('http://www.urilga.mn:1337/ticket?ticket_event='+data.id+'&ticket_phonenumber=%'+data.text+'%'+'&____token=dXJpbGdhbW5BY2Nlc3M=');
    },
    scanTicket: function(data){
      return $http.put('http://www.urilga.mn:1337/ticket/'+data.id,data);
    },
    postMessage: function(data){
      return $http.post('http://www.urilga.mn:1337/ticketmessage',{ticket:data});
    },
    getscanTicket: function(id){
      return $http.get('http://www.urilga.mn:1337/ticket/'+id+'?____token=dXJpbGdhbW5BY2Nlc3M=');
    },
    getscanTicketByEvent: function(data){
      return $http.get('http://www.urilga.mn:1337/ticket?ticket_event='+data+'&____token=dXJpbGdhbW5BY2Nlc3M=');
    },
    checkTicketShortID: function(data){
      return $http.get('http://www.urilga.mn:1337/ticket?ticket_created_by='+data.createdBy+'&ticket_short_id='+data.shortId+'&____token=dXJpbGdhbW5BY2Nlc3M=');
    },
    checkTicketShortIDbyEvent: function(data){
      return $http.get('http://www.urilga.mn:1337/ticket?ticket_created_by='+data.createdBy+'&ticket_short_id='+data.shortId+'&ticket_event='+data.eventID+'&____token=dXJpbGdhbW5BY2Nlc3M=');
    },
    fbLogin: function(data){
      return $http.post('http://www.urilga.mn:1337/loginviafacebook',data);
    },
    createEvent: function(data){
      return $http.post('http://www.urilga.mn:1337/event',data);
    },
    createTicket:function(data){
      return $http.post('http://www.urilga.mn:1337/tickettype',data);
    }
  }
})
;
