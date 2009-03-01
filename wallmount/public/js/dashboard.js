
/**
 * Custom node creator which are used during
 * dnd operations.
 */
var nodeCreator = function(item){
	var node = dojo.doc.createElement("span");
	node.id = dojo.dnd.getUniqueId();
	node.setAttribute("eid", item['id']);
	var hyptype = item['hyptype'];
	node.setAttribute("hyptype", hyptype);
	node.innerHTML = item['name'];
	node.setAttribute("hypicon", item['hypicon']);
	var size = item['hypiconsize'];
	node.setAttribute("hypiconsize", size);
	dojo.style(node, "width", size + "px");
	var s = parseInt(size)+2;
	dojo.style(node, "padding", s + "px" + " 0 0");
	dojo.style(node, "background", "transparent url(../public/images/unknown-" + size + "-" + hyptype + ".png) no-repeat");
	var inlineEdit = new dijit.InlineEditBox({width: size+"px"}, node);
	
	// attach size selector popup to item
	Wallmount_AttachSizeSelector([node]);
	// return the stuff
	return {node: node, data: item, type: ["text"]};
};

/**
 * Creating new floating window to dashboard. 
 */ 
function Wallmount_NewDashItem(dashitem){
	var node = document.createElement('div');
	dojo.body().appendChild(node);
	var container = document.createElement('div');
	
	var source = new dojo.dnd.Source(container, {creator: nodeCreator});
	dojo.addClass(container,"container");
	node.appendChild(container);

	var imagesize = dashitem.imagesize;
	
	// create needed monitor components
	for(var i = 0; i < dashitem.entries.length; i++) {
		var id = dashitem.entries[i]['aeid'];
		var hyptype = dashitem.entries[i]['hyptype'];
		var name = dashitem.entries[i]['name'];
		var hypicon = dashitem.entries[i]['hypicon'];
		var hypiconsize = dashitem.entries[i]['hypiconsize'];
		source.insertNodes(null,[{id:id,name:name,hyptype:hyptype,hypicon:hypicon,hypiconsize:hypiconsize}]);
	}
	
	var style = "position: absolute; " + 
		"width: " + dashitem.width + "px;" +
		"height: " + dashitem.height + "px;" +
		"top: " + dashitem.top + "px;" +
		"left: " + dashitem.left + "px;";
	
	var pane = new dojox.layout.FloatingPane({
		title: dashitem.title,
		dockable: false,
		maxable: false,
		closable: true,
		resizable: true,
		style: style 
	},node);
	
	pane.startup();
	pane.resize({ w: dashitem.width, h: dashitem.height });
	pane.bringToTop();	
	var titleWidth = parseInt(dashitem.width) - 35;
	if(titleWidth < 1) titleWidth = 20;
	var titleNodeQuery = 'div#' + pane.id + ' span.dijitTitleNode';
	var titleNode = dojo.query(titleNodeQuery);
	var inlineEdit = new dijit.InlineEditBox({width: "auto"}, titleNode[0]);
}

/**
 * Attach icon size selector to item.
 */
function Wallmount_AttachSizeSelector(nodes) {
	// available icon sizes
	var sizes = [32,64,128,256];
	for(var i = 0; i < nodes.length; i++) {
		var pMenu = new dijit.Menu({
			targetNodeIds:[nodes[i]]
		});		
		for(var j = 0; j < sizes.length; j++) {
			var pMenuItem = new dijit.MenuItem({
				label:sizes[j]
			}); 
			pMenu.addChild(pMenuItem);
			dojo.connect(pMenuItem, "onClick", dojo.hitch(this, "Wallmount_ChangeIconSize", nodes[i].id,sizes[j])); 			
		}		
		pMenu.startup();
	}	
}

/**
 * Changes icon size.
 */
function Wallmount_ChangeIconSize(id,size) {
	var item = dojo.byId(id);
	var oldHypicon = item.getAttribute('hypicon');
	var oldHyptype = item.getAttribute('hyptype');
	dojo.style(item, "background", "transparent url(../public/images/" + oldHypicon + "-" + size + "-" + oldHyptype + ".png) no-repeat");
	dojo.style(item, "width", size + "px");
	var s = size+2;
	dojo.style(item, "padding", s + "px" + " 0 0");	
    item.setAttribute("hypiconsize", size);
}

/**
 * Creates new layout structure using stored json data.
 */
function Wallmount_CreateLayout(jsonData) {
	var d = jsonData.dashboard;
	for(var index=0; index<d.length; index++) {
		Wallmount_NewDashItem(d[index]);		
	}
}

/**
 * This creates new window which is requested from qui. These
 * are basic building blocks for used in layouts.
 */
function Wallmount_NewWindow(type,id) {
	var url;
	if (type == 'platforms') {
		url = '/hqu/wallmount/wallmount/getPlatformTypes.hqu';
	} else if (type == 'servers'){
		url = '/hqu/wallmount/wallmount/getServerTypes.hqu';
	} else if (type == 'services'){
		url = '/hqu/wallmount/wallmount/getServiceTypes.hqu';
	} else if (type == 'resource'){
		url = '/hqu/wallmount/wallmount/getResources.hqu?rtype=' + id;
	} else if (type == 'gmembers'){
		url = '/hqu/wallmount/wallmount/getGroupMembers.hqu?rtype=' + id;
	} else if (type == 'cgroups'){
		url = '/hqu/wallmount/wallmount/getCompatibleGroups.hqu';
	} else if (type == 'empty'){
		var data = {
		"dashboard": [
			{
				"width": "400",
				"height": "500",
				"top": "100",
				"left": "100",
				"title": "Empty",
				"type": "ft",
				"entries": []
				}
			]
		};
		Wallmount_CreateLayout(data);
		return;
	}
	dojo.xhrGet({
		url: url,
		handleAs: "json-comment-filtered",
		timeout: 5000,
		preventCache: true,
		load: function(response, ioArgs) {
			Wallmount_CreateLayout(response);
			Wallmount_KickTimer();
			return response;
		},
		error: function(response, ioArgs) {
			alert('error ' + response);
			return response;
		}
	});		

}

/**
 * Requests stored layout data from server.
 */
function Wallmount_LoadLayout(name) {
	
	Wallmount_CloseAllWindows();
	
	dojo.xhrGet({
		url: '/hqu/wallmount/wallmount/getLayout.hqu?layout=' + name,
		handleAs: "json-comment-filtered",
		timeout: 5000,
		preventCache: true,
		load: function(response, ioArgs) {
			Wallmount_CreateLayout(response);
			Wallmount_KickTimer();
			return response;
		},
		error: function(response, ioArgs) {
			alert('error ' + response);
			return response;
		}
	});
}

/**
 * Requests new component statuses from server.
 */
function Wallmount_UpdateValues() {

	var nodes = dojo.query(".dojoDndItem");
	var contentObject = {};
	var jsonData = {};
	var nodeList = [];
	for(var i = 0; i < nodes.length; i++){
		var data = {};
		data['aeid'] = nodes[i].getAttribute('eid');
		data['type'] = nodes[i].getAttribute('hyptype');
		nodeList.push(data);
	}
	jsonData['items'] = nodeList;
	contentObject['jsonData'] = dojo.toJson(jsonData);
	
	dojo.xhrPost({
		url: '/hqu/wallmount/wallmount/getAlerts.hqu',
		handleAs: "json-comment-filtered",
		timeout: 10000,
		content: contentObject,
		load: function(response, ioArgs) {
			for (var i = 0; i < response.items.length; i++) {
				var item = response.items[i];
				Wallmount_HandleUpdate(item.aeid,item.status,item.hyptype);
			}
			Wallmount_UpdateTimestamp();
			// reset counter
			failedUpdateRequests = 0;
			return response;
		},
		error: function(response, ioArgs) {
			failedUpdateRequests++;
			// too many failures. Just Give up.
			if(failedUpdateRequests > 10) {
				timer.stop();
				alert('Too many failures to request new alerts. Alert updater stopped.');
			}
			return response;
		}
	});
};

/**
 * Finds all floatingpanes and request
 * closing operation on them.
 */
function Wallmount_CloseAllWindows() {
	var windowQuery = 'div[id^="dojox_layout_FloatingPane"]'
	dojo.query(windowQuery).forEach(
		function(item) {
			dijit.byId(item.id).close();
		}
	);
}

/**
 * Just wrapper to kick timer. There's callback to onStart
 * to update values immediately after timer has started.
 */
function Wallmount_KickTimer() {
	timer.stop();
	timer.start();
}

/**
 * Show dialog to select name for new layout.
 */
function Wallmount_ShowSaveLayoutDialog() {
	dijit.byId('saveLayoutDialog').show();
}

/**
 * Saves current visible layout structure to server.
 */
function Wallmount_SaveLayout(name) {

	var data = Wallmount_GetLayoutAsJSON();
	var contentObject = {};
	contentObject['layoutdata'] = data;	
	contentObject['layoutname'] = name;	
	dojo.xhrPost({
		url: '/hqu/wallmount/wallmount/saveLayout.hqu',
		handleAs: "json-comment-filtered",
		timeout: 5000,
		content: contentObject,
		load: function(response, ioArgs) {
			//console.debug("load1:" + response);
			return response;
		},
		error: function(response, ioArgs) {
			alert('error ' + response);
			return response;
		}
	});
};


/**	
 * 
 */
function Wallmount_HandleUpdate(aeid,status,type) {
	// first find all components which has relative eid value
	// note: resource and resource type may have same id
	// this case is handled later
	var itemQuery = 'span[eid="' + aeid + '"]'; 
	var items = dojo.query(itemQuery);
	for(var i = 0; i < items.length; i++){
		var oldHypiconSize = items[i].getAttribute('hypiconsize');
		
		// stop if we have wrong type
		var oldHypType = items[i].getAttribute('hyptype');
		if(type != oldHypType)
			continue;
		
		items[i].setAttribute("hypicon", status);
		dojo.style(items[i], "background", "transparent url(../public/images/" + status + "-" + oldHypiconSize + "-" + oldHypType + ".png) no-repeat");
	}	
};

/**
 * Builds json type data which contain layout structure.
 */
function Wallmount_GetLayoutAsJSON() {
	// find containers(windows) holding alert items
	var windowQuery = 'div[id^="dojox_layout_FloatingPane"]'
	var windowNodes = dojo.query(windowQuery);
	var dashboard = {}; // main json object
	var windowNodeList = [];
	// iterate windows
	for(var i = 0; i < windowNodes.length; i++){
		var wn = windowNodes[i];
		var entriesList = []; 
		var windowSettings = {}; 
		windowSettings['width'] = wn.offsetWidth;
		windowSettings['height'] = wn.offsetHeight;
		windowSettings['top'] = wn.offsetTop;
		windowSettings['left'] = wn.offsetLeft;
		windowSettings['imagesize'] = "64";
		// Need to query window title name from
		// dom tree. We expect to find exactly one section.
		var titleQuery = 'div#' + wn.id + ' span.dijitTitleNode';
		var titleItems = dojo.query(titleQuery);
		windowSettings['title'] = titleItems[0].innerHTML;
		
		// finding alert items under node we're currently 
		// processing
		var alertItemQuery = 'div#' + wn.id + ' span.dojoDndItem';
		var alertItems = dojo.query(alertItemQuery);
		for(var j = 0; j < alertItems.length; j++){
			var en = alertItems[j];
			var entry = {};
			entry['aeid'] = en.getAttribute('eid');
			entry['name'] = en.innerHTML;
			entry['hyptype'] = en.getAttribute('hyptype');
			entry['hypicon'] = en.getAttribute('hypicon');
			entry['hypiconsize'] = en.getAttribute('hypiconsize');
			entriesList.push(entry);
		}
		windowSettings['entries'] = entriesList;
		windowNodeList.push(windowSettings);
		
	}
	dashboard['dashboard'] = windowNodeList;
	return dojo.toJson(dashboard);
};	

/**
 * Simple tracking function to update small timestamp
 * on screen to check if background update loops are
 * not stucked.
 */
function Wallmount_UpdateTimestamp() {
	var d = new Date();
	var h = d.getHours();
	var m = d.getMinutes();
	if(m < 10)
		m = '0' + m;
	var s = d.getSeconds();
	if(s < 10)
		s = '0' + s;
	
	dojo.byId('timestamp').innerHTML = h + ':' + m + ':' + s;
}