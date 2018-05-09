//The alert is modified from https://www.formget.com/how-to-create-pop-up-contact-form-using-javascript/
function startQuizUpload() {
if(document.getElementById('ra1').checked==false&&document.getElementById('ra2').checked==false
	&&document.getElementById('ra3').checked==false&&document.getElementById('ra4').checked==false){
alert("Please check one circle button!");
}
else {
	alert ("start answer upload");
	//upload questionid 
	var questionnode = document.getElementById("question");
	//extract the text in changed div
	var textquestion=questionnode.textContent;
    var textquestionid = document.getElementById("questionid").textContent;
	//convert the text format to string so that it can be inserted into database through server
	var question=String(textquestion);
	var questionid=String(textquestionid);
	
	alert(question);	
	var postStringQz = "questionid="+questionid;
	
    //user's phoneid can be extracted by a function named device.uuid i.e. var phoneid=device.uuid
	//cordova.js is required, which is obtained from https://phonegap.com/getstarted/
	//navigate to dir: Desktop\resources\app.asar.unpacked\node_modules\cordova-js\src
    			
	
	// now get the radio button values
	if (document.getElementById("ra1").checked) {
 		var answer=document.getElementById("ra1").value;
		postStringQz=postStringQz+"&answer="+answer;
	}
	if (document.getElementById("ra2").checked) {
 		var answer=document.getElementById("ra2").value;
		postStringQz=postStringQz+"&answer="+answer;
	}
    if (document.getElementById("ra3").checked) {
 		var answer=document.getElementById("ra3").value;
		postStringQz=postStringQz+"&answer="+answer;
	}
	if (document.getElementById("ra4").checked) {
 		var answer=document.getElementById("ra4").value;
		postStringQz=postStringQz+"&answer="+answer;
	}
	
	processData(postStringQz);
}
}

//using the URL 'http://developer.cege.ucl.ac.uk:30276/uploadDataQz' to upload data to httpServer.
var client;
function processData(postStringQz) {
   client = new XMLHttpRequest();
   client.open('POST','http://developer.cege.ucl.ac.uk:30276/uploadDataQz',true);
   client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   client.onreadystatechange = dataUploaded;  
   client.send(postStringQz);
}
// create the code to wait for the response from the data server, and process the response once it is received
function dataUploaded() {
  // this function listens out for the server to say that the data is ready - i.e. has state 4
  if (client.readyState == 4) {
    // change the DIV to show the response
    document.getElementById("dataUploadResult").innerHTML = client.responseText;
    }
}