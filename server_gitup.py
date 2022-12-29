"""twittermap_server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import requests


@csrf_exempt
def google_maps_api_js(request):

    url = 'https://maps.googleapis.com/maps/api/js?key=APIKEY'

    r = requests.get(url)

    return HttpResponse(r.text, headers={"content-type":"text/javascript"})

@csrf_exempt
def google_maps_address_revgeo(request):
    print("google maps address revgeo called")
    print("Req post data" + str(request.POST))
    pdata = dict(request.POST)
    print("pdata dict ~ " + str(pdata))
    penc_address = pdata["enc_address"][0]

    url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+penc_address+'&key=APIKEY'


    r = requests.get(url)
    print("google revgeo response ~ " )
    print(str(r.text))

    headers = {"Access-Control-Allow-Origin": "*",
            "content-type":"application/json"
            }
    return HttpResponse(r.text, headers= headers)



@csrf_exempt
def tw_geo_tweet(request):
    print("tw_geo_tweet called")
    print("Req post data" + str(request.POST))
    pdata = dict(request.POST)
    print("pdata dict ~ " + str(pdata))
    plat = pdata["userLat"][0].replace("-","%2d")
    plong = pdata["userLong"][0].replace("-","%2d")
    pradi = pdata["radiusPost"][0]
    pcount = pdata["count"][0]
    pkeywords = ""
    if "keyWord" in pdata.keys():
        pkeywords = pdata["keyWord"][0].split(" ")

    kw_string = ""
    kw_idx = 0
    if len(pkeywords) > 0:
        for kw in pkeywords:
            kw_string += kw
            if kw_idx < len(pkeywords):
                kw_string += "%20"
            kw_idx +=1
   
    #if len(kw_string)>0:
    #    kw_string = kw_string + "&"
    #kw_string
    print("kw string ~ " + kw_string )
    
    url = "https://api.twitter.com/1.1/search/tweets.json?q=" +kw_string+ "geocode%3a"+str(plat)+"%2c"+str(plong)+"%2c"+str(pradi)+"mi&count="+str(pcount)+"&tweet_mode=extended&%2dfilter%3aretweets"

    print("built query url ~ " + url)
    headers = {'Authorization': 'Bearer APITOKEN'}
    r = requests.get(url, headers=headers)
    print("get twitter geo resp ~")
    print(r.text)

    jl_resp = json.loads(r.text)

    get_statuses = jl_resp["statuses"]

    tweet_status_ids = []
    tweet_create_times = []
    tweet_texts = []
    tweet_user_names = []
    tweet_screen_names = []
    tweet_locations = []

    for status in get_statuses:
        print("got status ~ ")
        for k,v in status.items():
            if k == "id_str":
                print("get status id ~ " + str(v))
                tweet_status_ids.append(v)
            if k == "created_at":
                print("got tweet create time ~" + v)
                tweet_create_times.append(v)
            if k == "full_text":
                print("got tweet text" + v)
                tweet_texts.append(v)
            if k == "user":
                for ky,vl in v.items():
                    if ky == "name":
                        print("got tweet name ~ " + vl)
                        tweet_user_names.append(vl)
                    if ky == "screen_name":
                        print("got tweet screen name ~ " + vl)
                        tweet_screen_names.append(vl)
                    if ky == "location":
                        print("got tweet location ~ " + vl)
                        tweet_locations.append(vl)


    print("tweet status ids list ~ " + str(tweet_status_ids))
    print("tweet create times list ~ " + str(tweet_create_times))
    print("tweet texts list ~ " + str(tweet_texts))
    print("tweet user names list ~ " + str(tweet_user_names))
    print("tweet screen names list ~ " + str(tweet_screen_names))
    print("tweet locations list ~ " + str(tweet_locations))
    
    html_build_divs = ""

    tweet_idx = 0
    for ts_id in tweet_status_ids:
        html_build_divs += '<small class="tweetLocation">'+ tweet_locations[tweet_idx]+'</small><div><blockquote class="twitter-tweet"><p lang="en" dir="ltr">'+tweet_texts[tweet_idx].replace("'","\'")+'</p>—'+ tweet_user_names[tweet_idx].replace("'","\'") +' (@'+ tweet_screen_names[tweet_idx].replace("'","\'") +') <a href="https://twitter.com/'+ tweet_screen_names[tweet_idx].replace("'","\'") +'/status/'+ tweet_status_ids[tweet_idx]  +'?ref_src=twsrc^tfw"></a></blockquote>\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></div>'

        tweet_idx +=1


    #response = HttpResponse()
    #response.headers["Access-Control-Allow-Origin"] = "*"
    #response.headers["Access-Control-Allow-Methods"] = "GET,POST, OPTIONS"
    #response["Access-Control-Max-Age"] = "1000"
    #response["Access-Control-Allow-Headers"] = "X-Requested-With, Content-Type"
    #return HttpResponse(json.dumps({"htlm_build_tweet_divs":html_build_divs}))

    #san_html_build_divs = html_build_divs.replace("\\","")
    #html_build_divs = "test"

    headers = {"Access-Control-Allow-Origin": "*"}
    return HttpResponse(json.dumps({"html_build_tweet_divs":html_build_divs}),headers=headers)


urlpatterns = [
    #path('admin/', admin.site.urls),
    
    path('google_maps_api_js', google_maps_api_js),

    path('tw_geo_tweet', tw_geo_tweet),
    
    path('google_maps_address_revgeo', google_maps_address_revgeo)

       ]
