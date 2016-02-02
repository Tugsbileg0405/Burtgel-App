angular.module('starter.auth',[])

.factory('AuthService', function($http,$localStorage) {
  
  var service = {};
  
  service.getAuthStatus = function() {
  	if($localStorage.userdata){
    return true;
	}
	else {
	return false;
	}	
  }
  
  return service;
  
});