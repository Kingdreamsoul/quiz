//adapted from practical 2
var mymap
// load the map and set the view
mymap = L.map('mapid').setView([51.52421, -0.13418], 15.5);
// load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                       maxZoom: 18,
                       attribution: 'Map data &copy; <ahref="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' +
                                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                         id: 'mapbox.streets'
                 }).addTo(mymap);
				 


 
// create a variable that will hold the XMLHttpRequest() - this must be done outside a function sothat all the functions can use the same variable
var client;
// and a variable that will hold the layer itself – we need to do this outside the function so that we can use it to remove the layer later on
var questionslayer;
// create the code to get the data about using an XMLHttpRequest
function getQuetions() {
 client = new XMLHttpRequest();
client.open('GET','http://developer.cege.ucl.ac.uk:30276/getGeoJSON/questions/geom');
 client.onreadystatechange = questionsResponse; 
 client.send();
}
// create the code to wait for the response from the data server, and process the response once it is received
function questionsResponse() {
 // this function listens out for the server to say that the data is ready - i.e. has state 4
 if (client.readyState == 4) {
 // once the data is ready, process the data
 var questiondata = client.responseText;
 loadQuestionslayer(questiondata);
 }
}



// convert the received data - which is text - to JSON format and add it to the map
//also include a pop-up that shows the question id and question
function loadQuestionslayer(questiondata) {
 // convert the text to JSON
 var questionsjson = JSON.parse(questiondata);
 // add the JSON layer onto the map - it will appear using the default icons
questionslayer = L.geoJson(questionsjson,
{
pointToLayer: function (feature, latlng)
{return L.marker(latlng).bindPopup("<b>"+feature.properties.questionid+". "
+feature.properties.question+"</b>" );
},
}).addTo(mymap);
 // change the map zoom so that all the data is shown
mymap.fitBounds(questionslayer.getBounds());
}


//to achive the synchromous loading of both map and question viusually
document.addEventListener('DOMContentLoaded', function() {
getQuetions();
}, false);


// create a custom popup to obtain the location of questions for geom(i.e.latitude and longitude) uploading
var popup = L.popup();
// create an event detector to wait for the user's click event and then use the popup to show them where they clicked
// note that you don't need to do any complicated maths to convert screen coordinates to real world coordiantes - the Leaflet API does this for you
function onMapClick(e) {
popup
.setLatLng(e.latlng)
.setContent("You click at " + e.latlng.toString())
.openOn(mymap);
}
// now add the click event detector to the map
mymap.on('click', onMapClick);





//*******Only click one button one time, four functions (show current position, track real time location, calculate distance between user and each question, update the quiz based on location)
// will be trigger due to the linkage between them (e.g. variables)******//
//track location in real time trough watchposition() 
function trackLocation() {
 if (navigator.geolocation) 
                {navigator.geolocation.watchPosition(showPosition);} 
 else           {document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";}
 
 navigator.geolocation.watchPosition(getDistanceFromPoint);
}

//using red circle marker to show the user's real time position
function showPosition(position) {
 document.getElementById('showLocation').innerHTML = "Latitude: " + position.coords.latitude +"<br>Longitude: " + position.coords.longitude;
 L.circle([position.coords.latitude, position.coords.longitude], 5, {
                      color: 'red',
                      fillColor: 'red',
                      fillOpacity: 1}
	     ).addTo(mymap).bindPopup(position.coords.latitude.toString()+","+position.coords.longitude.toString()+"<br />I am here.").openPopup();
}

//using for loop to calculate each distance beween user's current location and the question's location
//set a distance to filter the question for pop up 
function getDistanceFromPoint(position) {
var geoJSONString = getQuetiondata('http://developer.cege.ucl.ac.uk:30276/getGeoJSON/questions/geom');
var geoJSON = JSON.parse(geoJSONString);
//geoJSON[0].features.length is the number of question so that each question will be used to calculate the distance via this loop
for(var i = 0; i < geoJSON[0].features.length; i++) {
      var feature = geoJSON[0].features[i];
          for (component in feature){
	          if (component =="geometry"){
	        	    for (geometry in feature[component]){
						//using position (i.e. [0][1]) in coordinates matrix can extract the lng and lat seperately
		    	             var lng=feature[component][geometry][0];
				             var lat=feature[component][geometry][1];
                             // return the distance in kilometers
                             var distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
							 // assign the real time calculated distance to the 'showDistance' div 
                                 document.getElementById('showDistance').innerHTML = "Distance: " + distance;
                                       if (distance<0.04){
										//considering the accuracy of position for android, relatively longer distance were selected 
										//to test the location-based pop-up.  For more practical application, a shorter distance is 
                                        //more timeliness and targeted (e.g. location-based advertisement) 										
	                                       L.marker([lat, lng]).addTo(mymap).bindPopup("<b>Within 40m</b>").openPopup();
									    //under the <0.04 dondition, the triggerQuiz function will be used to update the quiz, which satisfy this condition to achive the location based service   
										   triggerQuiz(i);}
											  }
                              }
                     }
           }
}

//reveal the question within a certain distance (i.e.based on if condition of distance) by changing the div
//data can be extracted based on the structure of JSON data (e.g. object, values), i means the total number of question in database 
function triggerQuiz(i) {
var geoJSONString = getQuetiondata('http://developer.cege.ucl.ac.uk:30276/getGeoJSON/questions/geom');
var geoJSON = JSON.parse(geoJSONString);
    document.getElementById("questionid").innerHTML =geoJSON[0].features[i].properties.questionid;
    document.getElementById("question").innerHTML =geoJSON[0].features[i].properties.question;
    document.getElementById("a").innerHTML =geoJSON[0].features[i].properties.answer1;
    document.getElementById("b").innerHTML =geoJSON[0].features[i].properties.answer2;
    document.getElementById("c").innerHTML =geoJSON[0].features[i].properties.answer3;
    document.getElementById("d").innerHTML =geoJSON[0].features[i].properties.answer4;
}

//extract the data from 'http://developer.cege.ucl.ac.uk:30272/getGeoJSON/questions/geom'
//the data captured from database cannot be assigned to var geoJSONString directly
//define this function so that data can be extracted to calculate the distance
function getQuetiondata(url) {
        var dataQ ;
        var xmlHttp ;
        dataQ  = '' ;
        xmlHttp = new XMLHttpRequest();
        if(xmlHttp != null)
            {xmlHttp.open( "GET", url, false );
             xmlHttp.send( null );
             dataQ = xmlHttp.responseText;}
           return dataQ ;
}

// code adapted from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
 var radlat1 = Math.PI * lat1/180;
 var radlat2 = Math.PI * lat2/180;
 var radlon1 = Math.PI * lon1/180;
 var radlon2 = Math.PI * lon2/180;
 var theta = lon1-lon2;
 var radtheta = Math.PI * theta/180;
 var subAngle = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
 subAngle = Math.acos(subAngle);
 subAngle = subAngle * 180/Math.PI; // convert the degree value returned by acos back to degrees from radians
 dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subtended angle in degrees)/360) * 2 * pi * radius )
// where radius of the earth is 3956 miles
 if (unit=="K") { dist = dist * 1.609344 ;} // convert miles to km
 if (unit=="N") { dist = dist * 0.8684 ;} // convert miles to nautical miles
 return dist;
 }
