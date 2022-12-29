$("#rsTog").click(function(){
    $(this).toggleClass("open");
    if($(this).hasClass("open")==true){
    $(this).text("Hide Refine Feed Search Menu");
    $(this).css("color", "orange");
    $(this).mouseover(function(){
    $(this).css("color", "white")
    });
    $("#sOpt").css("padding-right", "30px");
    $("#Scol").css("border","4px solid #428BC0");
    $("#Scol").css("margin","4px");
    $("#Scol").css("border-radius","3px");
    $("#Scol").css("width","100%");
    $("#Scol").css("padding","15px 5px 15px 5px");
    $("#Scol").css("margin","5px 15px 5px 15px");
    $("#Scol").css("background-color","white");
    $("#Scol").css("color","black");      
  }
  if($(this).hasClass("open")==false){
      $(this).text("Refine Your Feed!");
      $(this).css("color", "white");
  }
});




var geocoder;
// error map
var emap;
// location results map
var map;
// info window with address
var locInfoWindow;
//infowindow with coordinates
var geoInfoWindow;
var findAddressInfoWindow;
// error info winow
var eInfoWindow; 
//Map marker to drag
var marker;
var mapDiv;
var resAddress;
//lat long for geocode
var latlng = {lat: 10, lng: 10};
// lat long for init and error
var myLatLng = {lat: 10, lng: 10};

function close_info_window(iw) {
	  iw.close()
	  } 

function cts_tag_click(){
        document.getElementById('resTitle').scrollIntoView(); 
      }

$("#scrollToTop").click(function(){
  document.getElementById('mapSide').scrollIntoView(); 
})

function load_tweets_html(get_tweet_html, resAddress, findLocationSuccessData, scrollToFeed){
            console.log("load tweets html with loc lookup date ~ ", findLocationSuccessData)
                    $("#successDiv").html('');
                    $("#twitterFeed").html('<div class="tc_out">'+get_tweet_html+'</div>');
                   
	            var rad_sel_val_san = $("#radSel").val();
        		if (rad_sel_val_san == "%2e5"){
                		rad_sel_val_san = ".5"
       			 }
                    var resTitleString = " Tweets within "+rad_sel_val_san+" miles of "+resAddress

                    if($("#textSearch").val() != "" && $("#textSearch").val() != undefined  ){
                      resTitleString += " associated with the keywords: "+$("#textSearch").val();
                      }
                    
                    $("#resTitle").text(resTitleString);

                    if (scrollToFeed){
                    document.getElementById('twitterFeed').scrollIntoView();
                    }
                    if (findLocationSuccessData != null){

                        $("#successDiv").html('<div class="alert alert-success" role="alert">Full address information found for '
                        +findLocationSuccessData.formatted_address)
                    }
}


 

function load_no_tweets_html(resAddress, findLocationSuccessData){
                      console.log("no tweets found")
                      $("#successDiv").html('');
                      var resTitleString = "No Tweets found within "+$("#radSel").val()+" miles of "+resAddress
                      if($("#textSearch").val() != "" && $("#textSearch").val() != undefined  ){
                        resTitleString += " associated with the keywords: "+$("#textSearch").val();
                        }

                      $("#resTitle").text(resTitleString);

                      if (findLocationSuccessData != null){
                        $("#successDiv").html('<div class="alert alert-success" role="alert">Full address information found for '
                        +findLocationSuccessData.formatted_address)
                    }
}


function geocodeLatLng(geocoder, map,  marker) {

latlng = marker.getPosition();
geocoder.geocode({'location': latlng}, function(results, status) {

if (status === 'OK') {
    if (results[1]) {       
      console.log(results);
      resAddress = results[0].formatted_address;  

if (locInfoWindow == null){
   locInfoWindow = new google.maps.InfoWindow({map:map});
    }
locInfoWindow.setContent('<p class="winfo">The address found for your coordinates is '+resAddress+'. <div class="winfo"> Click <button type="submit" class="btn btn-info" onclick=cts_tag_click()> View Feed</button><br> Or scroll down to see the local Twitter feed</div></p><div><button type="submit" class="btn btn-secondary" onclick="close_info_window(locInfoWindow)">Close</button></div>');
      locInfoWindow.open(map, marker);
      map.setCenter(latlng); 

      $.ajax({
                type: "POST",
                url: "http://localhost:5858/tw_geo_tweet",
                data:{userLat:  latlng.lat, userLong: latlng.lng,
                   radiusPost: $("#radSel").val(), count: $("#countSel").val(),  keyWord:$("#textSearch").val()},
                success:function(data)
                {
                  $("#twitterFeed").html('');
                  console.log("get tweets response ~ " + data.toString())
                  var data_json_loads = JSON.parse(data)
                  console.log("data json load ~ " + data_json_loads.toString)
                  var get_tweet_html = data_json_loads["html_build_tweet_divs"]
                  console.log("got tweets html ~ " + get_tweet_html)
                  
                  if (get_tweet_html == ""){
                    load_no_tweets_html(resAddress, null)
                  }
                  else{
                    load_tweets_html(get_tweet_html, resAddress, null,false)                          
                      }
                    }
              })

    } 
    else {
       locInfoWindow.setContent('<p class="winfo">No results found. Try another location</p>');
       locInfoWindow.open(map, marker);
       map.setCenter(latlng);      
    }
  } else {
       locInfoWindow.setContent('<p class="winfo">No results found. A server might be down. Please try again later</p>');
       locInfoWindow.open(map, marker);
       map.setCenter(latlng);     
       
  }
});
}


function initMap() {
  console.log("initMap called") 
      // var myLatLng = {lat: 0, lng: 0}; 

// Styles a map in night mode. 
   map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        scrollwheel: false,
        center: myLatLng,
        styles: darkStyleArray
      });   

    google.maps.event.addListener(map, "idle", function()
          {
            google.maps.event.trigger(map, 'resize');
          });

    $( "#mapWrap" ).resizable({handles:{ "se":"#segrip"}});             
    $( "#mapWrap" ).resize(function(){
          var center = map.getCenter();
          google.maps.event.trigger(map, 'resize');           
          map.setCenter(center);
      });             

    console.log("try get navigator geolocation")
      // Try HTML5 geolocation.
    if (navigator.geolocation) 
   {
     console.log("navigator geolocation enabled")
      navigator.geolocation.getCurrentPosition(
        function(position) 
      {
        console.log("got nav geolocation ~ " + position.toString())
         pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
	google.maps.event.addListener(map, 'zoom_changed', function() {
    map.setCenter({lat: pos.lat, lng: pos.lng});
})

	      
	 var posm = {
            lat: position.coords.latitude - .03,
            lng: position.coords.longitude-.02,
          };         
        marker = new google.maps.Marker({
           position: posm,
           map: map,
           draggable:true,
           title: ''
           });
           google.maps.event.addListener(marker, 'dragend', function(ev)
     {		console.log("Drag end event ~ ", ev)
	     pos = ev.latLng
             geocodeLatLng(geocoder, map,  marker);
     });
      	  geoInfoWindow = new google.maps.InfoWindow({map:map});
          geoInfoWindow.setPosition(posm);  
           geoInfoWindow.setContent(' <p class="winfo">Your location is '+marker.position.lat()+'latitude and '+marker.position.lng()+' longitude. Drag the red marker to see tweets from somewhere else</p><div class="winfo">Click <button class="btn btn-info" onclick=cts_tag_click() >View feed</button></div><br><p class="winfo"> Or scroll down to see the local Twitter feed for this lcoation</p><br><div><button type="submit" class="btn btn-secondary" onclick="close_info_window(geoInfoWindow)">Close</button></div>');

     map.setCenter(pos);
     geocodeLatLng(geocoder, map,  marker);
     
  },     function() {
          console.log("Get current position error function called")
          handleLocationError(true,  map.getCenter());
                    }
    );
}     
else {
        // Browser doesn't support Geolocation    
        console.log("no navigator geolocation")   
        handleLocationError(false,   map.getCenter());
   }
}

function initMapError() {
        
      // var myLatLng = {lat: 0, lng: 0}; lat 0 lng 0 causes fatal

// init to random location in london
   myLatLng = {lat: 51.50, lng: -.13};        
        emap = new google.maps.Map(document.getElementById('map'), {
            zoom: 8,
            center: myLatLng,
            styles: darkStyleArray
          });
      
	google.maps.event.addListener(emap, "idle", function()
          {
            google.maps.event.trigger(emap, 'resize');
          });
      $( "#mapWrap" ).resizable();
      $( "#mapWrap" ).resize(function(){
          var center = emap.getCenter();
          google.maps.event.trigger(emap, 'resize');                
          emap.setCenter(center);
      });

   
    var myLatLngMark = { lat: myLatLng['lat'] - .03,
                          lng: myLatLng['lng'] - .03
      };

	// still init map marker and function in case user turns on location later
    var marker = new google.maps.Marker({
           position: myLatLngMark,
           map: emap,
           draggable:true,
           title: ''
           });

           google.maps.event.addListener(marker, 'dragend', function(ev){
           geocodeLatLng(geocoder, emap, marker);
          });         
}

function handleLocationError(browserHasGeolocation) {
        initMapError();
       einfowindow = new google.maps.InfoWindow({map:emap});
        einfowindow.setPosition(myLatLng);
        einfowindow.setContent('<p class="winfo">Location services error</p><div><button type="submit" class="btn btn-primary" onclick="close_info_window(einfowindow)">Close</button></div>')
		
		browserHasGeolocation ?
             alert( 'The Geolocation service failed. Please make sure location services is enabled if you\'d like to start out at your location.') :
             alert('Your browser doesn\'t seem to support geolocation services.');
    };
        


  $("#findAddress").click(function(event){
    event.preventDefault();
      if($("#address").val()==""){
          $("#successDiv").html('<div class="alert alert-info" role="alert"> Please enter a full or partial address</div>');          
      }
      else{ 

        $("#twitterFeed").html('');
  
        var loc_lookup_data;
  
        $.ajax({
          url: "http://localhost:5858/google_maps_address_revgeo",
      type:"POST",
      data: {"enc_address":encodeURIComponent($("#address").val()) },
      success: 
      
        function(data){
          console.log("revgeo success response ~ " + JSON.stringify(data))

            if (data.results.length <1){
              $("#successDiv").html('');
              $("#resTitle").text(" Address Information not found for " + $("#address").val() );
              document.getElementById('resTitle').scrollIntoView(); 
            }
            else{
              console.log("address lookup results geo ~ " , data.results[0].geometry.location);
              console.log("address lookup results address ~ " , data.results[0].address_components); 
              console.log("address lookup results formatted address ~ " , data.results[0].formatted_address); 
                loc_lookup_data = data.results[0];

              map.setCenter(data.results[0].geometry.location)
              marker = new google.maps.Marker({
                  position: data.results[0].geometry.location,
                  map: map,
                  draggable:true,
                  title: ''
                  });
             

		 findAddressInfoWindow = new google.maps.InfoWindow({map:map});
		    findAddressInfoWindow.setPosition(data.results[0].geometry.location)
		    findAddressInfoWindow.setContent('<p class="winfo">The Address found for your coordinates is '+data.results[0].formatted_address+'</p><div class="winfo">Click <button class="btn btn-info" onclick=cts_tag_click() >View feed</button></div><br><p class="winfo"> Or scroll down to see the local Twitter feed</p><br><div><button type="submit" class="btn btn-secondary" onclick="close_info_window(findAddressInfoWindow)">Close</button></div>');
                google.maps.event.addListener(marker, 'dragend', function(ev){
                  geocodeLatLng(geocoder, map, marker);
                });
      
           resAddress = data.results[0].formatted_address
        //    $("#successDiv").html('<div class="alert alert-success" role="alert">Full address information found for '
        //             +data.results[0].formatted_address)
           if(data.status != "OK"){

            $("#successDiv").html('<div class="alert alert-info" role="alert">Could not find Location Information for '
              +$("#address").val()+' </div>');
           
          }else{

             $.ajax({
                type: "POST",
                url: "http://localhost:5858/tw_geo_tweet",
                data:{userLat:  data.results[0].geometry.location.lat, userLong: data.results[0].geometry.location.lng,
                   radiusPost: $("#radSel").val(), count: $("#countSel").val(), keyWord:$("#textSearch").val() },
                success:function(data)
                {
                  console.log("get tweets response ~ " + data.toString())
              

                  
                  var data_json_loads = JSON.parse(data)
                  console.log("data json load ~ " + data_json_loads.toString)
                  var get_tweet_html = data_json_loads["html_build_tweet_divs"]
                  console.log("got tweets html ~ " + get_tweet_html)
                  if (get_tweet_html == ""){
                      load_no_tweets_html(resAddress, loc_lookup_data)
                  }
                  else{
                      load_tweets_html(get_tweet_html, resAddress, loc_lookup_data, true )
                      }
                    }
                  })

                 
                                 
           $.each(data.results[0].address_components, function(key,value){
             // console.log(data.results[0]);
                         
                  if(value.types[0]=='postal_code'){
                      $("#successDiv").html('<div class="alert alert-success" role="alert">Full address information found for '+data.results[0].formatted_address)
                        // +' the zipcode for this location is '+value.long_name+'</div>');
              }          
          });
        }
      }       
    }
  });
}
});


$('#reForm').on('submit', function(e) {
  e.preventDefault();

$.ajax({
   type: "POST",
   url: "http://localhost:5858/tw_geo_tweet",
   data:{userLat: latlng.lat, userLong: latlng.lng, radiusPost: $("#radSel").val(), count: $("#countSel").val(),
    keyWord: $("#textSearch").val()},
   success:function(data)
   {
    $("#twitterFeed").html('');
     console.log("get tweets response ~ " + data.toString())
     
     var data_json_loads = JSON.parse(data)
     console.log("data json load ~ " + data_json_loads.toString)
     var get_tweet_html = data_json_loads["html_build_tweet_divs"]
     console.log("got tweets html ~ " + get_tweet_html)
    if (get_tweet_html == ""){
          load_no_tweets_html(resAddress, null)
    }
    else{
          load_tweets_html(get_tweet_html, resAddress, null, true)
        }
      }
     })
    });



$( document ).ready(function() {
    $.getScript('http://localhost:5858/google_maps_api_js', function() {
          console.log('google maps script loaded.');
          geocoder = new google.maps.Geocoder;
          initMap();

        });
    });
