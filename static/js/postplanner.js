"use strict";
/*your code here*/
$(document).ready(function(){
	/*$.graphModal({
		type:'message',
		theme:'dark',
		title: 'Facebook Post Planner',
		content: 'Welcome to Facebook Post Planner&mdash;Test I. Under construction. Wait. Wait. Wait.'
	});*/
	PostPlanner.FB.init();
    $('#fbPost').click(function(){ /*click the post button*/
    	var a = $('#fbMsg').val(); //fetch the value of message
    	console.log(a);
    	var b = {
    		method: "post",
    		message: a,
    		access_token:currentToken
    	};
    	$.get('https://graph.facebook.com/v2.1/me/feed',b)
    		.done(function(){
    			$.graphModal({
		    		type:'message',
		    		theme:'dark',
		    		title: 'Facebook Post',
		    		content: 'Your have posted successfully.'
		    	});
		    	$('#fbMsg').val('');
    		})
    		.fail(function(){
    			$.graphModal({
		    		type:'message',
		    		theme:'dark',
		    		title: 'Facebook Post',
		    		content: 'An error occurred. Please try again.'
		    	});	
    		});
    	
    });

});

var PostPlanner = {}, /*create global namespace*/
	currentID = function(){return (Cookie.get('socA')!="" ? Cookie.get('socA') : "0");}, 
	currentToken = function(){return (Cookie.get('socB')!="" ? Cookie.get('socB') : "0");},
	currentInfo = function(){return (Cookie.get('socC')!="" ? Cookie.get('socC') : "");};
	

/*
 *	FB sub-namespace for Facebook
 *	Chainable except the connect object
 */
PostPlanner.FB = {
	init: function(){
		this.connect(this.apiID);
	},
	apiID: "704513729631955",
	connect: function(a){
		window.fbAsyncInit = function() {
        FB.init({
          appId      : a,
          xfbml      : true,
          version    : 'v2.1'
        });
		if(typeof FB != "undefined"){
			/*check fb user status and refresh access token*/
			FB.getLoginStatus(function(zz){
				if(zz.status == "connected" && zz.authResponse.userID == Cookie.get('socA')){
					PostPlanner.FB.info({
		            	a: zz.authResponse.userID,
		            	b: zz.authResponse.accessToken
		            });
				}
				PostPlanner.FB.pic();
			});
			/*assign function to login link*/
      		implementFunctions(); 
		}
      };
      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "//connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
	},
	pic: 	function(){
		FB.api(
		    "/me/picture",
			{
		        "redirect": false,
		        "height": "50",
		        "type": "normal",
		        "width": "50"
		    },
		    function (response) {
		      if (response && !response.error){Cookie.set('socD',response.data.url);}
		      else{Cookie.set('socD','/static/img/user-40.png');}

			  $('.fb-names img').prop('src',Cookie.get('socD') );
		    }
		);	
		return this;
	},
	info: 	function(zz){
		currentID = zz.a;
		currentToken = zz.b;
		Cookie.set('socA', currentID);
	    Cookie.set('socB', currentToken);
	    return this;
	},
	me: 	function(a){
		if(typeof a == "function"){
			FB.api(
			    "/me",
			    a
			);
		}
		else{
			console.alert('Ooops. This object only accepts functions.');
		}
		return this;
	},
	isLoggedOut: function(a){
		if(typeof a == "boolean"){
			if(a === true){
		  		FB.logout();
				currentID=currentToken="0";
				this.info({
		            	a: '',
		            	b: ''
		        });
	            Cookie.set('socC','Guest');
	            Cookie.set('socD','/static/img/user-40.png');
				$('.fb-names img').prop('src',Cookie.get('socD') );
	            $('.fb-names span a').html(Cookie.get('socC'));
	            $('.fb-names span a').attr('href','#');
	            $('.fb-names span a').removeAttr('target');
				$('.fb-login').html('Login');
			}
			else{
				this.pic();
				$('.fb-login').html('Logout');
			}
		}
		else{
			console.alert('Ooops. This object only accepts boolean');
		}
		return this;
	}
};


var implementFunctions = function(){
	var a = {
			a: Cookie.get('socD') || "/static/img/user-40.png",
			b: Cookie.get('socE') || "#",
			c: Cookie.get('socC') || "Guest",
			d: (Cookie.get('socA')=="" ? "Login" : "Logout")
		},
		b = $('#tempLogin').html(),
		c = Handlebars.compile(b),
		d = c(a);
	$('#gridLogin').append(d);
	$(document).on("click", ".fb-login", function(e) {
		e.preventDefault();
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
			  	if(Cookie.get('socA')!=""){
			  		PostPlanner.FB.isLoggedOut(true);
			  		return false;
		  		}
				PostPlanner.FB
					.info({
		            	a: response.authResponse.userID,
		            	b: response.authResponse.accessToken
	            	})
	            	.me(
	            		function (response) {
						    if (response && !response.error) {
						    	Cookie.set('socC',response.name);
						    	Cookie.set('socE',response.link);
						    }
					    }
	            	)
	            	.isLoggedOut(false);
		  	}
			else {
			  	console.log('else here');
			  	if(Cookie.get('socA')==''){
				    FB.login(function(response) {
		                if(response.status == "connected"){
		                    PostPlanner.FB
		                    	.info({
					            	a: response.authResponse.userID,
					            	b: response.authResponse.accessToken
				            	})
					            .me(
				            		function(response){
					            		if (response && !response.error) {
									      	Cookie.set('socC',response.name);
									      	Cookie.set('socE',response.link);
							      			$('.fb-names span a').html(Cookie.get('socC'));
							      			$('.fb-names span a').attr('target','_blank');
							      			$('.fb-names span a').attr('href',Cookie.get('socE'));
									    }
				            		}
				            	)
				            	.isLoggedOut(false);
				            console.log(response.authResponse.accessToken);
				            console.log(Cookie.get('socB'));
		                }
		              },{scope: " email," + " publish_actions," +
		                " user_birthday," + " xmpp_login,", return_scopes: true});
			  	}
			}
		});
	});
};


var Cookie = {
	set: function(cname, cvalue, exdays){
		var d = new Date();
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
	    var expires = "expires="+d.toGMTString();
	    document.cookie = cname + "=" + cvalue + "; " + expires;
	},
	get: function(cname){
		var name = cname + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0; i<ca.length; i++) {
	        var c = ca[i].trim();
	        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	    }
	    return "";	
	},
	check: function(cname) {
	    var user = this.get(cname);
	    if (user != "") {
	        return true;
	    } else {
	        return false;
	    }
	}	
}

var setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

var getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
};

var checkCookie = function(cname) {
    var user = getCookie(cname);
    if (user != "") {
        return true;
    } else {
        return false;
    }
};