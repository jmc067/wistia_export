# Wistia Export
Exports all videos with associated metadata

## Process
1.  Get list of all visitors.  Store in memory hash
	- need visitor-key
2.  Get list of all medias.  Store in memory hash
	- need media-id
	- need hashed-media-id
3.  Gets list of all events
	- https://api.wistia.com/v1/medias.json?api_password=825ab49ccbff4ab140e524cbb15918a285bf98e4b1ab44e6617a0574c1d0052a 
4.  Iterate all events, fill in Visitor and Media data into each even 
5.  Compiles all videos into normalized format for CSV
6.  Exports CSV to... 


## Tasks
1.  Look thru wistia docs (https://wistia.com/doc/data-api#medias_list)
	- /medias/ api seems to have everything we need
2.  determine how to get all videos (or best way to achieve csv data)
	- /medias/list
3.  create queries
	- done 
4.  determine proper workflow 
	- language
	- where to host


## Notes
1.  100 Requests Per Minute
2. Required Fields: 
	- "Date"
	- "IP"
	- "Country"
	- "Region"
	- "City"
	- "Latitude"
	- "Longitude"
	- "Organization"
	- "Employment Organization"
	- "Title"
	- "Email"
	- "Name"
	- "Tagline"
	- "Gender"
	- "Twitter Handle"
	- "LinkedIn Handle"
	- "Facebook Handle"
	- "Percent Viewed"
	- "Embed URL"
	- "Links Clicked"
	- "Browser"
	- "Browser Version"
	- "Platform"
	- "Device"
3.  Only Aziz will run it
4.  1st round backfill, subsequent rounds will only need recent data
5.  Needs to be able to buffer around the 100 request limit 


## Final Solutions
In terms of workflow, I know we discussed this on the phone but there are a few options: 

1.  Hosted Site, Database, File
	- contains download button
		- downloads cvs into local file system
	- pros
		- readily available
		- 
	- cons
		- additional costs
			- may require maintenance for uptime
			- additional cost of hosting and DNS Routing (url name)
			- additional dev work of hosting and routing
2.  File Handoff
	- contains code for the hosted site described above
	- pros
		- no additional cost of hosting and DNS Routing
		- no maintenance for uptime
	- cons
		- not readily available
		- requires file handoff in order to share "download to csv" functionality
		- limited to 100 downloads 
3.  Hosted Background Proccess, Database, Autosync Hosted File
	- continuously running background process that periodically syncs and updates csv file
	- pros
		- readily available
		- global file accessible from anywhere/anyone
		- no file passing
		- no limit on number of downloads
	- cons
		- additional cost of hosting file 
		- additional cost of hosting background process
		- may require maintenance for uptime 
		- accessible from anyone (unless job extension to add security)



