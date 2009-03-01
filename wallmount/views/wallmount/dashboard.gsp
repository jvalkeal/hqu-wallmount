<html>
    <head>
    <script type="text/javascript" src="/js/dojo/1.1/dojo/dojo.js.uncompressed.js" djConfig="isDebug:false, parseOnLoad: true" ></script>
   	<script type="text/javascript" src="/js/dojo/1.1/dojo/dnd/Container.js"></script>
	<script type="text/javascript" src="/js/dojo/1.1/dojo/dnd/Selector.js"></script>
	<script type="text/javascript" src="/js/dojo/1.1/dojo/dnd/Source.js"></script>
	<script type="text/javascript" src="/js/dojo/1.1/dojo/dnd/Avatar.js"></script>
	<script type="text/javascript" src="/js/dojo/1.1/dojo/dnd/Manager.js"></script>

    
    <script type="text/javascript">
		dojo.require("dojox.layout.FloatingPane"); 
		dojo.require("dijit.layout.TabContainer");
		dojo.require("dijit.form.ComboBox"); 
		dojo.require("dijit.form.Button"); 
		dojo.require("dijit.form.TextBox");
		dojo.require("dojo.parser");
		dojo.require("dojo.dnd.Source");
		dojo.require("dijit.Menu");
		dojo.require("dijit.Dialog");
		dojo.require("dojox.timing._base");
		dojo.require("dijit.InlineEditBox");
		function init(){		
		
			<%
			if(useLayout != null) {
				out.write("Wallmount_LoadLayout('${useLayout}');")
			}
			%>
		};

		timer = new dojox.timing.Timer(30000);
		timer.start();
		dojo.connect(timer, "onTick", function(obj){Wallmount_UpdateValues();});
		// connect onStart after timer has started.
		dojo.connect(timer, "onStart", function(obj){Wallmount_UpdateValues();});
		// update statuses after dnd operations
		dojo.subscribe("/dnd/drop", function(source, nodes, copy, target){
			Wallmount_UpdateValues();
		});
		
        
        // keeping track how many times request to server
        // has failed. This allows as to stop timer and
        // give warning.
        failedUpdateRequests = 0;

		dojo.addOnLoad(init);
	</script>
	
	<script type="text/javascript" src="/hqu/wallmount/public/js/dashboard.js"></script>



	<style type="text/css">
		@import "/js/dojo/1.1/dojo/resources/dojo.css"; 
		@import "/js/dojo/1.1/dojo/resources/dnd.css";
		@import "/js/dojo/1.1/dijit/themes/dijit.css";
		@import "/js/dojo/1.1/dijit/themes/tundra/tundra.css";
		@import "/js/dojo/1.1/dojox/layout/resources/FloatingPane.css"; 
		@import "/js/dojo/1.1/dojox/layout/resources/ResizeHandle.css"; 
		<%
			out.write('@import "../public/css/' + css + '";')
		
		%>
		.container {
			display: block;
		} 
		.dojoDndItem {
			width:64px;
			height:64px;
			height/**/:auto;
			background:transparent url(../public/images/unknown-64.png) no-repeat;
			margin:6px;
	
			display:-moz-inline-block;
			display:-moz-inline-box;
			display:inline-block;

			text-align:center;
			padding:66px 0 0 0;
			vertical-align:top;
		}
		
		#root {
		height:100%;
		margin:0;
		padding:0;
		width:100%;
		}
	</style>

    
    </head>


	<body class="tundra">
	<div id="root">
		<div id="timestamp" class="timestampContainer">--:--:--</div>
	</div>
		
		<div dojoType="dijit.Menu" id="windowContextMenu" contextMenuForWindow="true" style="display: none;">
			<div dojoType="dijit.PopupMenuItem">
				<span>Open Layout</span>
				<div dojoType="dijit.Menu">
					<%
					templates.each{
					out.write('<div dojoType="dijit.MenuItem" onClick="Wallmount_LoadLayout(' + 
								"'" + it + "'" + 
								');">' +
								it +
								'</div>')
					}
					%>
				</div>
			</div>
			<div dojoType="dijit.MenuItem" onClick="Wallmount_ShowSaveLayoutDialog();">Save Layout</div>
			<div dojoType="dijit.MenuSeparator"></div>
			<div dojoType="dijit.MenuItem" onClick="Wallmount_NewWindow('platforms','0');">Platform Types</div>
			<div dojoType="dijit.MenuItem" onClick="Wallmount_NewWindow('servers','0');">Server Types</div>
			<div dojoType="dijit.MenuItem" onClick="Wallmount_NewWindow('services','0');">Service Types</div>
			<div dojoType="dijit.MenuItem" onClick="Wallmount_NewWindow('empty','0');">Empty</div>
			<div dojoType="dijit.PopupMenuItem">
				<span>Platforms</span>
				<div dojoType="dijit.Menu">
					<%
					viewableTypes.getPlatforms().each{
					def p = "'resource','1:" + it.id + "'" 
					out.write('<div dojoType="dijit.MenuItem" onClick="Wallmount_NewWindow(' + p + ');">' +
								it.name +
								'</div>')
					}
					%>
				</div>
			</div>
			<div dojoType="dijit.PopupMenuItem">
				<span>Servers</span>
				<div dojoType="dijit.Menu">
					<%
					viewableTypes.getServers().each{
					def p = "'resource','2:" + it.id + "'" 
					out.write('<div dojoType="dijit.MenuItem" onClick="Wallmount_NewWindow(' + p + ');">' +
								it.name +
								'</div>')
					}
					%>
				</div>
			</div>
			<div dojoType="dijit.PopupMenuItem">
				<span>Services</span>
				<div dojoType="dijit.Menu">
					<%
					viewableTypes.getServices().each{
					def p = "'resource','3:" + it.id + "'" 
					out.write('<div dojoType="dijit.MenuItem" onClick="Wallmount_NewWindow(' + p + ');">' +
								it.name +
								'</div>')
					}
					%>
				</div>
			</div>
			<div dojoType="dijit.MenuItem" onClick="Wallmount_NewWindow('cgroups','0');">Compatible Groups</div>
			<div dojoType="dijit.PopupMenuItem">
				<span>Groups</span>
				<div dojoType="dijit.Menu">
					<%
					viewableTypes.getGroups().each{
					def p = "'gmembers','5:" + it.id + "'" 
					out.write('<div dojoType="dijit.MenuItem" onClick="Wallmount_NewWindow(' + p + ');">' +
								it.resourceGroupValue.name +
								'</div>')
					}
					%>
				</div>
			</div>
		</div>
		
		<div dojoType="dijit.Dialog" 
			jsId="saveLayoutDialog" 
			id="saveLayoutDialog"
			title="Save Layout"
	 		execute="Wallmount_SaveLayout(dojo.byId('lname').value);">
			<table>
			<tr>
			<td><label for="name">Name: </label></td>
			<td><input dojoType="dijit.form.TextBox" type="text" name="lname" id="lname"></td>
			</tr>
			<tr>
			<td colspan="2" align="center">
			<button dojoType="dijit.form.Button" type="submit">OK</button></td>
			</tr>
			</table>
		</div>		
	
	</body>


</html>