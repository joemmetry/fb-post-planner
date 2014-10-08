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
        fetchContents = SPContents.query().fetch()
        getUser = self.request.cookies.get('socA')
        getID = self.request.cookies.get('socC')
        values = {
            'fetched': fetchContents
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

class PostScheduledHandler(webapp2.RequestHandler):
    def get(self):
        a = SPContents()
        a.postDate = datetime.now()
        b = SPContents.query(
                ndb.AND(SPContents.postDate <= datetime.now() + timedelta(hours=8),
                    SPContents.postStatus=="Pending")
            ).fetch()
        for c in b:
            data = contentFetchFromApp(c)
            contentPostToFacebook(data, c.userID)
            c.postStatus = "Completed"
            c.put()

#Field Fetchers
class SPContents(ndb.Model):
    post_date = ndb.DateTimeProperty(auto_now_add=True)
    userFullName = ndb.StringProperty(indexed=False)
    userID = ndb.StringProperty(indexed=False)
    accessToken = ndb.StringProperty(indexed=False)
    content = ndb.StringProperty(indexed=False)
    postDate = ndb.DateTimeProperty()
    postDatePrinted = ndb.StringProperty(indexed=False)
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
    ('/bootposts',PostScheduledHandler)
], debug=True)
