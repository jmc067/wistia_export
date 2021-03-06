$(function() {

	// GLOBALS
	var start_date,end_date;
	var debug = false;
	var num_requests_made = 0;
	var media_ids = {};
	var visitor_ids = {};
	var events = [];
	var eventDates = {};  // used to check duplicate events
	var page = 1;
	var MILLISECONDS_IN_A_MINUTE = 1000;

	// SETTINGS	
	var api_key = "7ea1206fc22043174d677592dad08c53488821253376ef1adad77c75a9b586e1";
	var NUM_SECONDS_TO_WAIT = 70;         // how long to wait before the next request
	var WAIT_TIME = MILLISECONDS_IN_A_MINUTE*NUM_SECONDS_TO_WAIT;
	var NUM_REQUESTS_BEFORE_WAITING = 2; // rate allows for 100 but let's be safe so the account doesn't get blocked
	var NUM_REQUESTS_BEFORE_EXPORT = 20;  // this allows for 100 * 20 rows of events per file.  Let's keep it small so the network doesn't error out on download


	// HELPER FUNCTIONS
	function randomString(){
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 5; i++ ){
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }

	    return text;
	}

	function debugLog(message){
		console.log(message);
	}

	function updateStatus(message) {
		$("#status").html(message + "...");
	}

	function convertToCSV(objArray){

        var str = '';

        // Add line for csv header
        var line = '';
        for (var field in objArray[0]) {
        	var obj = objArray[0];
            if (line != '') line += ','

            line += field;
        }
        str += line + '\r\n';

        // Add line for each object in the array
        for (var i = 0; i < objArray.length; i++) {
            var line = '';
            for (var field in objArray[i]) {
            	var obj = objArray[i];
                if (line != '') line += ','

                line += obj[field];
            }

            str += line + '\r\n';
        }

        return str;
    }		

    function appendCSVDownloadButton(csv,fileName){
		a=document.createElement('a');
		a.textContent=fileName;
		a.download=fileName;
		a.href='data:text/csv;charset=utf-8,'+escape(csv);
		document.getElementById("action_buttons").appendChild(a);									
    }

    function appendDownloadButton(){
		updateStatus("Converting Events To CSV");
		csv = convertToCSV(events);

		//////////////////////////////////////
		// Convert to CSV
		//////////////////////////////////////
		updateStatus("Converting Events To CSV");
		var firstFileDate = events[0].received_at;
		var lastFileDate = events[events.length-1].received_at;
		var fileName = firstFileDate + "->" + lastFileDate + "_events_export_download-"+randomString()+".csv";
		csv = convertToCSV(events);
		events = [];  // reset events

		//////////////////////////////////////
		// Append Download CSV Button
		//////////////////////////////////////
		updateStatus("Ready For Download");
		appendCSVDownloadButton(csv,fileName);

    }

    function updateEvents(eventObject,visitor){
 		var formattedEvent = {
			// event stuff
		    "received_at" : eventObject["received_at"],
		    "ip" : eventObject["ip"],
		    "country" : eventObject["country"],
		    "region" : eventObject["region"],
		    "city" : eventObject["city"],
		    "lat" : eventObject["lat"],
		    "lon" : eventObject["lon"],
		    "percent_viewed" : eventObject["percent_viewed"],
		    "embed_url" : eventObject["embed_url"],
		    "media_id":eventObject["media_id"],
		    "media_name":eventObject["media_name"],
		    "media_url":eventObject["media_url"],
		    "email":eventObject["email"],
		};

		// add visitor stuff
		if (visitor){
			formattedEvent.visitor_name= visitor["visitor_identity"]["name"],
			formattedEvent.visitor_email= visitor["visitor_identity"]["email"],
			formattedEvent.org_name= visitor["visitor_identity"]["org"]["name"],
			formattedEvent.org_title= visitor["visitor_identity"]["org"]["title"],
			formattedEvent.browser= visitor["user_agent_details"]["browser"],
			formattedEvent.browser_version= visitor["user_agent_details"]["browser_version"],
			formattedEvent.platform= visitor["user_agent_details"]["platform"],
			formattedEvent.mobile= visitor["user_agent_details"]["mobile"]
		} else {
			formattedEvent.visitor_name= null;
			formattedEvent.visitor_email= null;
			formattedEvent.org_name= null;
			formattedEvent.org_title= null;
			formattedEvent.browser= null;
			formattedEvent.browser_version= null;
			formattedEvent.platform= null;
			formattedEvent.mobile= null;
		}

		if ((eventDates[formattedEvent.received_at]) || (eventDates[formattedEvent.received_at]==formattedEvent.received_at) ){
			debugLog("Repeated Data.  Removing...");
		} else {
			debugLog(formattedEvent.received_at);
			eventDates[formattedEvent.received_at] = formattedEvent.ip;
			events.push(formattedEvent);
		}
		updateStatus("Formatted Events Page: " + page);   	
    }

    function getEvents(){
    	// Append Download Button
		if (num_requests_made==NUM_REQUESTS_BEFORE_EXPORT)	{
			appendDownloadButton();
		}

		// Request more events if below rate limit
    	if (num_requests_made<NUM_REQUESTS_BEFORE_WAITING){

			//////////////////////////////////////
			// Get Events
			//////////////////////////////////////
			jQuery.ajax({
				data: {
					"start_date":start_date,
					"end_date":end_date,
					"per_page":100,
					"page":page,
					"sort_by":"created",
					"sort_direction":1
				},
	            url: "https://api.wistia.com/v1/stats/events.json?api_password=" + api_key,
	            success: function(data) {
	            	// Increase Number of Requests made
	            	num_requests_made+=1;
					updateStatus("Downloaded Events.  Page: " + page);

					// Keep track of previous number of events
					var previous_events_length = events.length;

					//////////////////////////////////////
					// Store Events in Hash for Later use
					//////////////////////////////////////
					for (var index=0; index<data.length;index++){
						var eventObject = data[index];
						var visitor_key = data[index]["visitor_key"];
						var visitor = visitor_ids[visitor_key];
						updateEvents(eventObject,visitor);
						
					}

					// IFF no events were added
					if (previous_events_length!=events.length){   
						// Increase current page count
						page += 1;
						debugLog("page!!!!!!!!!! " + page);

						// Process new page events
						getEvents();
					} else {
						// we're out of events to process!  Let's download 
						appendDownloadButton();
					}
	            }
	        }).fail(function(){
	        	updateStatus("Export Failed: Error Retrieving Events");
	        });     	
    	} else {
    		updateStatus("Reached Request Limit.  Waiting 60 seconds....")
    		// wait for 60 seconds	
			setTimeout(function(){
				// Reset number of requests made
				num_requests_made = 0;

				// Process events
				getEvents();
			}, WAIT_TIME);
    	}
    }

	function executeExport(){
		updateStatus("Retrieving Selected Dates");
		// debugLog(start_date + " -> " + end_date);

		updateStatus("Triggered Export");

		//////////////////////////////////////
		// Get Medias
		//////////////////////////////////////
		jQuery.ajax({
            url: "https://api.wistia.com/v1/medias.json?api_password=" + api_key,
            success: function(data) {
            	num_requests_made+=1;

				//////////////////////////////////////
				// Store Medias in Hash for Later use
				//////////////////////////////////////
				for (var index=0; index<data.length;index++){
					var mediaObject = data[index];
					media_ids[mediaObject["hashed_id"]] = mediaObject;
				}

				//////////////////////////////////////
				// Get Visitors
				//////////////////////////////////////
				jQuery.ajax({
		            url: "https://api.wistia.com/v1/stats/visitors.json?api_password=" + api_key,
		            success: function(data) {
		            	num_requests_made+=1;
						updateStatus("Downloaded Visitors");

						//////////////////////////////////////
						// Store Visitors in Hash for Later use
						//////////////////////////////////////
						for (var index=0; index<data.length;index++){
							var visitorObject = data[index];
							visitor_ids[visitorObject["visitor_key"]] = visitorObject;
						}

						getEvents();
		            }
		        }).fail(function(){
		        	updateStatus("Export Failed: Error Retrieving Visitors");
		        });  				

            }
        }).fail(function(){
        	updateStatus("Export Failed: Error Retrieving Medias");
        });  		
	}


	// Define daterangepicker functionality
	$("#daterangepicker").daterangepicker({
		autoUpdateInput: false,
		locale: {
		  cancelLabel: 'Clear'
		}
	});

	$("#daterangepicker").on('apply.daterangepicker', function(ev, picker) {
		start_date = picker.startDate.format('YYYY-MM-DD');
		end_date = picker.endDate.format('YYYY-MM-DD');
		$("#start_date_display").text("Start Date: " + start_date);
		$("#end_date_display").text("End Date: " + end_date);
		executeExport();
	});

	$("#daterangepicker").on('cancel.daterangepicker', function(ev, picker) {
		$(this).val('');
	});
});