import os
import urllib
import datetime
import json
import jinja2
import webapp2
import logging
import sched
import time
import threading

from google.appengine.api import users
from google.appengine.api import urlfetch
from google.appengine.ext import ndb
from google.appengine.ext import db
from datetime import datetime, timedelta

#VARIABLES
FB_AID = "704513729631955"
FB_ASE = "c6cf3ccc279e225f90da48129ed5ea04"
FB_API_URI = "https://graph.facebook.com/v2.1"
FB_OAUTH_URI = "https://graph.facebook.com/oauth/access_token"
JINJA_ENV = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

def contentFetchFromApp(a):
    data = {
        "method" : "post",
        "message" : a.content,
        "access_token" : a.accessToken
    }
    return data

def contentPostToFacebook(a,b):
    #a is data b is id
    form_data = urllib.urlencode(a)
    url = FB_API_URI + "/" + b + "/feed"
    result = urlfetch.fetch(
        url=url,
        payload=form_data,
        method=urlfetch.POST
    )
    content = json.loads(result.content)
    return content

def facebookGetCurrentToken(a):
    b = a.split("&")[0].split("=")[1]
    return {
        "access_token" : b
    }

def facebookTokenConvert(a,self):
    data = {
        "grant_type" : "fb_exchange_token",
        "fb_exchange_token" : a,
        "client_id" : FB_AID,
        "client_secret" : FB_ASE
    }
    form_data = urllib.urlencode(data)
    result = urlfetch.fetch(
        url =FB_OAUTH_URI,
        payload = form_data,
        method = urlfetch.POST
    )
    converted = facebookGetCurrentToken(result.content)
    return converted

class MainHandler(webapp2.RequestHandler):
    def get(self):
        getDate = datetime.now() + timedelta(hours=8) + timedelta(days=1)
        fetchContents = SPContents.query(ndb.AND(
                SPContents.postStatus == "Pending",
                SPContents.postDate > getDate
            )
            ).order(SPContents.postDate).fetch()
        fetchToday = SPContents.query(
            ndb.AND(
                SPContents.postStatus == "Pending",
                ndb.AND(
                    SPContents.postDate >= datetime.today(),
                    SPContents.postDate <= getDate
                    )
                )
            ).order(SPContents.postDate).fetch()
        getUser = self.request.cookies.get('socC')
        getID = self.request.cookies.get('socA')

        if getUser == "Guest" or not getUser:
            page = JINJA_ENV.get_template('pages/indexLoggedIn.html')
            self.response.write(page.render())
        else:
            values = {
                'fetchedPending': fetchContents,
                'fetchedToday': fetchToday,
                'userID' : getID
            }
            page = JINJA_ENV.get_template('pages/index.html')
            self.response.write(page.render(values))

class TosHandler(webapp2.RequestHandler):
    def get(self):
    	page = JINJA_ENV.get_template('pages/tos.html')
        self.response.write(page.render())

class PrivacyHandler(webapp2.RequestHandler):
    def get(self):
    	page = JINJA_ENV.get_template('pages/pp.html')
        self.response.write(page.render())

class SaveHandler(webapp2.RequestHandler):
    def post(self):
        saveContent = SPContents()
        saveContent.userFullName = self.request.get('fbName')
        saveContent.userID = self.request.get('fbID')

        getToken = self.request.get('fbAccessToken')
        longToken = facebookTokenConvert(getToken, self)
        saveContent.accessToken = longToken["access_token"]

        saveContent.content = self.request.get('fbMsg')
        saveContent.postAudience = self.request.get('fbAudience')

        formatDate = self.request.get('fbDate') + " " + self.request.get('fbClock')
        saveContent.postDatePrinted = formatDate
        saveContent.postDate = datetime.strptime(formatDate, "%m-%d-%Y %I:%M %p")

        saveContent.postExpires = self.request.get('fbMsgExpire')
        saveContent.put()

class UpdateTokenHandler(webapp2.RequestHandler):
    def get(self):
        getCurrentToken= self.request.cookies.get('socB')
        getCurrentName = self.request.cookies.get('socC')
        getCurrentID = self.request.cookies.get('socA')
        longToken = facebookTokenConvert(getCurrentToken, self)

        #self.response.write(longToken)
        a = SPContents()
        b = SPContents.query(
                ndb.AND(
                    SPContents.userID==getCurrentID)
            ).fetch()
        for c in b:
           c.accessToken = longToken['access_token']
           c.put()

class PostScheduledHandler(webapp2.RequestHandler):
    def get(self):
        a = SPContents()
        a.postDate = datetime.now()
        b = SPContents.query(
            ndb.AND(
                SPContents.postDate <= datetime.now()+timedelta(hours=8),
                SPContents.postStatus=="Pending"
                )
            ).fetch()
        for c in b:
            data = contentFetchFromApp(c)
            contentPostToFacebook(data, c.userID)
            c.postStatus = "Completed"
            c.put()

class EditHandler(webapp2.RequestHandler):
    def get(self,postid):
        getID = int(postid)
        getUserID = self.request.cookies.get('socA')
        getPosts = SPContents.query().fetch()
        values = {
            'postList' : getPosts,
            'postID' : getID,
            'user' :    getUserID
        }
        template = JINJA_ENV.get_template('pages/editPost.html')
        self.response.write(template.render(values))

    def post(self,postid):
        getID = int(postid)
        getUserID = self.request.cookies.get('socA')
        getPosts = SPContents.get_by_id(getID)
        formatDate = self.request.get('fbDate') + " " + self.request.get('fbClock')

        getPosts.content = self.request.get('fbMsg')
        getPosts.postDate = datetime.strptime(formatDate, "%m-%d-%Y %I:%M %p")
        getPosts.postDatePrinted = formatDate
        getPosts.put()
        time.sleep(3)
        self.redirect('/')

class DeleteHandler(webapp2.RequestHandler):
    def get(self,postid):
        getID = int(postid)
        ndb.Key(SPContents, getID).delete()
        time.sleep(2)
        self.redirect('/')

class PostHandler(webapp2.RequestHandler):
    def get(self,postid):
        getID = int(postid)
        a = ndb.Key(SPContents, getID).get()
        b = contentFetchFromApp(a)
        contentPostToFacebook(b, a.userID)
        a.postStatus = "Completed"
        a.put()
        time.sleep(1)
        self.redirect('/')
        
#Field Fetchers
class SPContents(ndb.Model):
    post_date = ndb.DateTimeProperty(auto_now_add=True)
    userFullName = ndb.StringProperty(indexed=True)
    userID = ndb.StringProperty(indexed=True)
    accessToken = ndb.StringProperty(indexed=False)
    content = ndb.StringProperty(indexed=False)
    postDate = ndb.DateTimeProperty()
    postDatePrinted = ndb.StringProperty(indexed=True)
    postExpires = ndb.StringProperty(indexed=False)
    postStatus = ndb.StringProperty(default="Pending")
    postAudience = ndb.StringProperty(default="1")

app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/terms', TosHandler),
    ('/terms/', TosHandler),
    ('/privacy', PrivacyHandler),
    ('/privacy/', PrivacyHandler),
    ('/save', SaveHandler),
    ('/bootposts',PostScheduledHandler),
    ('/bootupdatetoken', UpdateTokenHandler),
    ('/edit/(\d+)/', EditHandler),
    ('/delete/(\d+)/', DeleteHandler),
    ('/post/(\d+)/',PostHandler)
], debug=True)
