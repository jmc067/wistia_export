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
4.  Iterate all events, fill in Visitor and Media data into each event
5.  Compiles all videos into normalized format for CSV
6.  Download CSV button


## Notes
- UI allows selection of date range 
    - BE CAREFUL, large date ranges are suspect to LONG wait times.  MUST adhere to 100 requests/min request rate
- Periodically creates csv files as it goes
- removes duplicate rows to reduce memory use
- waits for 60 seconds to bypass rate limit
- opening up developer tools will show more details to data retrieval




