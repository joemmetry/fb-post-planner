'use strict';
$(document).ready(function () {
    PostPlanner.FB.init();
    $('#fbPost').click(function () {
        var a = $('#fbMsg').val();
        console.log(a);
        var b = {
            method: 'post',
            message: a,
            access_token: currentToken
        };
        $.get('https://graph.facebook.com/v2.1/me/feed', b).done(function () {
            $.graphModal({
                type: 'message',
                theme: 'dark',
                title: 'Facebook Post',
                content: 'Your have posted successfully.'
            });
            $('#fbMsg').val('');
        }).fail(function () {
            $.graphModal({
                type: 'message',
                theme: 'dark',
                title: 'Facebook Post',
                content: 'An error occurred. Please try again.'
            });
        });
    });
});
var PostPlanner = {},
    currentID = function () {
        return (Cookie.get('socA') != '' ? Cookie.get('socA') : '0');
    },
    currentToken = function () {
        return (Cookie.get('socB') != '' ? Cookie.get('socB') : '0');
    },
    currentInfo = function () {
        return (Cookie.get('socC') != '' ? Cookie.get('socC') : '');
    };
PostPlanner.FB = {
    init: function () {
        this.connect(this.apiID);
    },
    apiID: '704513729631955',
    connect: function (a) {
        window.fbAsyncInit = function () {
            FB.init({
                appId: a,
                xfbml: true,
                version: 'v2.1'
            });
            if (typeof FB != 'undefined') {
                FB.getLoginStatus(	function (response) {
                    if (response.status == 'connected' && response.authResponse.userID == Cookie.get('socA')) {
                        PostPlanner.FB.info({
                            a: response.authResponse.userID,
                            b: response.authResponse.accessToken
                        }).pic().checkLogin(response);
                    }
                });
                implementFunctions();
            }
        };
        (function (d, _0xbec7x9, _0xbec7xa) {
            var _0xbec7xb, _0xbec7xc = d.getElementsByTagName(_0xbec7x9)[0];
            if (d.getElementById(_0xbec7xa)) {
                return;
            }
            _0xbec7xb = d.createElement(_0xbec7x9);
            _0xbec7xb.id= _0xbec7xa;
            _0xbec7xb.src= '//connect.facebook.net/en_US/sdk.js';
            _0xbec7xc.parentNode.insertBefore(_0xbec7xb, _0xbec7xc);
        }(document, 'script', 'facebook-jssdk'));
    },
    pic: function () {
        FB.api('/me/picture', {
            "\x72\x65\x64\x69\x72\x65\x63\x74": false,
            "\x68\x65\x69\x67\x68\x74": '50',
            "\x74\x79\x70\x65": 'normal',
            "\x77\x69\x64\x74\x68": '50'
        }, function (a) {
            if (a && !a.error) {
                Cookie.set('socD', a.data.url);
            } else {
                Cookie.set('socD', '/static/img/user-40.png');
            }
            $('.fb-names img').prop('src', Cookie.get('socD'));
        });
        return this;
    },
    info: function (response) {
        currentID = response.a;
        currentToken = response.b;
        Cookie.set('socA', currentID);
        Cookie.set('socB', currentToken);
        $('[name="fbID"]').val(Cookie.get('socA'));
        $('[name="fbAccessToken"]').val(Cookie.get('socB'));
        $('[name="fbName"]').val(Cookie.get('socC'));
        return this;
    },
    me: function (a) {
        if (typeof a == 'function') {
            FB.api('/me', a);
        } else {
            console.warn('Ooops. This object only accepts functions.');
        }
        return this;
    },
    checkLogin: function(a,b){
        console.log(a)
        if(!a || typeof a == "undefined"){ 
            console.warn('Ooops. There is no object here. Try again.');return this;
        }


		if (Cookie.get('socA') != '' && Cookie.get('socA') == a.authResponse.userID &&
                                    typeof b == "boolean" && b==true ) {
		    FB.logout();
		    this.isLoggedOut(true);
		    return false;
		}
		this.info({
		    a: a.authResponse.userID,
		    b: a.authResponse.accessToken
		}).me(
                                        function (a) {
                                            if (a && !a.error) {
                                                Cookie.set('socC', a.name);
                                                Cookie.set('socE', a.link);
                                                $('[name="fbName"]').val(a.name);
                                                $('.fb-names span a').html(Cookie.get('socC'));
                                                $('.fb-names span a').attr('target', '_blank');
                                                $('.fb-names span a').attr('href', Cookie.get('socE'));
                                            }
		}).isLoggedOut(false);
		return this;
    },
    isLoggedOut: function (a) {
        if (typeof a == 'boolean') {
            if (a === true) {
                currentID = currentToken = '0';
                this.info({
                    a: '',
                    b: ''
                });
                Cookie.set('socC', 'Guest');
                Cookie.set('socD', '/static/img/user-40.png');
                $('.fb-names img').prop('src', Cookie.get('socD'));
                $('.fb-names span a').html(Cookie.get('socC'));
                $('.fb-names span a').attr('href', '#');
                $('.fb-names span a').removeAttr('target');
                $('.fb-login').html('Login with Facebook');
            } else {
                this.pic();
                $('.fb-login').html('Logout');
            };
        } else {
            console.warn('Ooops. This object only accepts boolean');
        }
        return this;
    }
};
var Cookie = {
    set: function (a, b, c) {
        var d = new Date();
        d.setTime(d.getTime() + (c * 24 * 60 * 60 * 1000));
        var e = 'expires=' + d.toGMTString();
        document.cookie = a + '=' + b + '; ' + e;
    },
    get: function (a) {
        var b = a + '=';
        var c = document.cookie.split(';');
        for (var d = 0; d < c.length; d++) {
            var e = c[d].trim();
            if (e.indexOf(b) == 0) {
                return e.substring(b.length, e.length);
            }
        }
        return '';
    },
    check: function (a) {
        var f = this.get(a);
        if (f != '') {
            return true;
        } else {
            return false;
        }
    }
};
var implementFunctions = function () {
        var a = {
            a: Cookie.get('socD') || '/static/img/user-40.png',
            b: Cookie.get('socE') || '#',
            c: Cookie.get('socC') || 'Guest',
            d: (Cookie.get('socA') == '' ? 'Login with Facebook' : 'Logout')
        },
            b = $('#tempLogin').html(),
            e = Handlebars.compile(b),
            d = e(a);
        $('#gridLogin').append(d);
        

        $('#postAudience > ul > li > a').on('click',function(e){
            var a = parseInt($(this).data('value'));
            if(a == 1){
                $('#postAudience > button > i:first-child').removeClass().addClass('uiIcon-gi-lock');
                $('#postAudience > button > span').html('Just Me');
            }
             if(a == 0){
                $('#postAudience > button > i:first-child').removeClass().addClass('uiIcon-gi-globe');
                $('#postAudience > button > span').html('Public');   
            }
            $('[name="fbAudience"]').val(a);
        });
        $(document).on('click', '.fb-login', function (e) {
            e.preventDefault();
            FB.getLoginStatus(function (a) {

                if (a.status === 'connected') {
                    PostPlanner.FB.checkLogin(a,true);
                } else {
                    console.log('else here');
                    if (Cookie.get('socA') == '') {
                        FB.login(function (a) {
                            if (a.status == 'connected') {
                                PostPlanner.FB.checkLogin(a);
                                console.log(a.authResponse.accessToken);
                                console.log(Cookie.get('socB'));
                            }
                        }, {
                            scope: ' email,' + ' publish_actions,' + ' user_birthday,' + ' xmpp_login,',
                            return_scopes: true
                        });
                    }
                }
            });
        });
    };
var nowTemp = new Date();
var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
var PPInputs = {
    textAreaAdjust: function (ad) {
        ad.style.height = '1px';
        ad.style.height = (25 + ad['scrollHeight']) + 'px';
    },
    setPostDate: function (a, b) {
        var c = new Date();
        if (typeof a == 'number') {
            c.setDate(c.getDate() + a);
        } else {
            if (typeof a == 'object' && typeof b == 'number') {
                c = a;
                c.setDate(c.getDate() + b);
            };
        };
        var b1 = c.getMonth() + 1,
            b2 = c.getDate(),
            b3 = c.getFullYear(),
            b4;
        b1 = b1 > 9 ? b1 : '0' + b1;
        b2 = b2 > 9 ? b2 : '0' + b2;
        b4 = b1 + '-' + b2 + '-' + b3;
        console.log(b4);
        return b4;
    },
    checkClock: function (a) {
        if (a.val().length>= 5) {
            var b5 = {},
                b6 = {};
            if (a.val().indexOf(':') == -1) {
                return false;
            };
            b5 = a.val().split(':');
            b6 = b5[1].split(' ');
            if (b5.length== 2 && b6.length== 2) {
                if (!isNaN(parseInt(b5[0])) && !isNaN(parseInt(b5[1]))) {
                    if (b6[1].length== 2 && (parseInt(b5[0]) <= 12 && parseInt(b5[1]) <= 59 && parseInt(b5[0]) > 0) 
                    		&& (b6[1] == 'PM' || b6[1] == 'pm' || b6[1] == 'AM' || b6[1] == 'am')) {
                        return true;
                    } else {
                        return false;
                    }
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}