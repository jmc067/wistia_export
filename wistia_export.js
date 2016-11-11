$(function() {

	// GLOBALS
	var api_key = "825ab49ccbff4ab140e524cbb15918a285bf98e4b1ab44e6617a0574c1d0052a";
	var debug = false;

	function debugLog(message){

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

    function appendCSVDownloadButton(csv){

		var fileName = "events_export.csv"       	
		a=document.createElement('a');
		a.textContent='download';
		a.download=fileName;
		a.href='data:text/csv;charset=utf-8,'+escape(csv);
		document.getElementById("action_buttons").appendChild(a);									
    }

	function executeExport(start_date,end_date){
		updateStatus("Retrieving Selected Dates");
		debugLog(start_date + " -> " + end_date);

		updateStatus("Triggered Export");

		//////////////////////////////////////
		// Get Medias
		//////////////////////////////////////
		jQuery.ajax({
            url: "https://api.wistia.com/v1/medias.json?api_password=" + api_key,
            success: function(data) {
				debugLog("Downloaded Medias");


				//////////////////////////////////////
				// Store Medias in Hash for Later use
				//////////////////////////////////////
				var media_ids = {};
				for (var index=0; index<data.length;index++){
					var mediaObject = data[index];
					media_ids[mediaObject["hashed_id"]] = mediaObject;
				}
				debugLog(media_ids);



				//////////////////////////////////////
				// Get Visitors
				//////////////////////////////////////
				jQuery.ajax({
		            url: "https://api.wistia.com/v1/stats/visitors.json?api_password=" + api_key,
		            success: function(data) {
						updateStatus("Downloaded Visitors");


						//////////////////////////////////////
						// Store Visitors in Hash for Later use
						//////////////////////////////////////
						var visitor_ids = {};
						for (var index=0; index<data.length;index++){
							var visitorObject = data[index];
							visitor_ids[visitorObject["visitor_key"]] = visitorObject;
						}
						debugLog(visitor_ids);


							//////////////////////////////////////
							// Get Events
							//////////////////////////////////////
							jQuery.ajax({
								data: {
									"start_date":start_date,
									"end_date":end_date
								},
					            url: "https://api.wistia.com/v1/stats/events.json?api_password=" + api_key,
					            success: function(data) {
									updateStatus("Downloaded Events");

									
									//////////////////////////////////////
									// Store Events in Hash for Later use
									//////////////////////////////////////
									var events = [];
									for (var index=0; index<data.length;index++){
										var eventObject = data[index];
										var visitor_key = data[index]["visitor_key"];
										var visitor = visitor_ids[visitor_key];
										events.push({
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

										    // add visitor stuff
											"visitor_name": visitor["visitor_identity"]["name"],
											"visitor_email": visitor["visitor_identity"]["email"],
											"org_name": visitor["visitor_identity"]["org"]["name"],
											"org_title": visitor["visitor_identity"]["org"]["title"],
											"browser": visitor["user_agent_details"]["browser"],
											"browser_version": visitor["user_agent_details"]["browser_version"],
											"platform": visitor["user_agent_details"]["platform"],
											"mobile": visitor["user_agent_details"]["mobile"]
										});
										updateStatus("Formatted Events");
									}
									debugLog(events);

									//////////////////////////////////////
									// Conver to CSV
									//////////////////////////////////////
									updateStatus("Converting Events To CSV");
									csv = convertToCSV(events);
									debugLog(csv);

									//////////////////////////////////////
									// Append Download CSV Button
									//////////////////////////////////////
									updateStatus("Ready For Download");
									var fileName = start_date + "->" + end_date + "_events_export_download";
									appendCSVDownloadButton(csv,fileName);

					            }
					        }).fail(function(){
					        	updateStatus("Export Failed: Error Retrieving Events");
					        });  

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
		var start_date = picker.startDate.format('YYYY-MM-DD');
		var end_date = picker.endDate.format('YYYY-MM-DD');
			executeExport(start_date,end_date);
	});

	$("#daterangepicker").on('cancel.daterangepicker', function(ev, picker) {
		$(this).val('');
	});
});