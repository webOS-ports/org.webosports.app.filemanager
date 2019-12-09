/*

	Copyright 2014 Jan Thiemen Postema

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.

*/

enyo.kind({
	name: "App",
	kind: "Panels",
	classes: "panels-sample-panels enyo-unselectable enyo-fit",
	arrangerKind: "CollapsingArranger",
	components: [
		{kind: "enyo.Signals", onbackbutton: "handleBackGesture"},
		{layoutKind: "FittableRowsLayout", components: [
			{kind: "PortsHeader", title: "File Manager", classes: "enyo-fill", taglines: [
				"Really, I hate taglines'",
				"Look at all those files!",
				"why don\'t you mkdir?",
			]},
			{kind: "List", name: "mainList", fit: true, touch: true, onSetupItem: "buildList", components: [
                {name: "item", style: "padding: 10px;", dir: false, classes: "panels-sample-item enyo-border-box", onhold: "itemHold", ontap: "itemTap", components: [
					{name: "thumbnail", kind: "Image", classes: "panels-sample-thumbnail"},
					{name: "title", classes: "panels-sample-title"}
				]}
			]}
		]},
		{name: "itemView", fit: true, kind: "FittableRows", classes: "enyo-fit", components: [
			{kind: "onyx.Toolbar", components: [
				{name: "file_title", content: "Header"},
			]},
			{tag: "br"},
			{kind: "Scroller", horizontal: "hidden", classes: "scroller", fit: true, touch: true, components:[
				{kind: "onyx.Groupbox", components: [
					{kind: "onyx.GroupboxHeader", content: "File information"},
					{name: "type", content: "Type: ", style: "padding: 8px; color: black;"},
					{name: "size", content: "Size: ", style: "padding: 8px; color: black;"},
					{name: "fileExtension", content: "File extension: ", style: "padding: 8px; color: black;"},
					{name: "full_path", content: "Full path: ", style: "padding: 8px; color: black;"},
				]},
				{kind:"onyx.Button", disabled: true, name: "removeButton", ontap: "remove", content: "Remove", classes: "onyx-negative"},
				{name: "mkDirPopup", kind: "onyx.Popup", floating: true, centered: true, style: "padding: 10px", components: [
					{kind: "onyx.InputDecorator", style: "color: black;", name: "newDirContainer", components: [
						{kind: "onyx.Input", style: "color: black;", name: "newDir",  placeholder: "Enter new folder name"}
					]},
					{kind:"onyx.Button", name: "createDirButton", ontap: "createDir", content: "Create folder", classes: "onyx-dark"}
				]},
				{kind:"onyx.Button", name: "createDirPopupButton", disabled: true, ontap: "createDirPopup", content: "New folder", classes: "onyx-dark"},
				{kind:"onyx.Button", name: "openFileButton", disabled: true, ontap: "openFileTap", content: "Open file", classes: "onyx-dark"},
				//move item list part
				{kind:"onyx.Button", name: "moveItemButton", disabled: true, ontap: "moveItemOpen", content: "Move", classes: "onyx-dark"},
				{name: "moveItemPopup", kind: "onyx.Popup", fit: true, floating: true,  style: "height: 95%; width: 100%;", components: [
					{kind:"onyx.Button", name: "moveItemListCloseButton", ontap: "moveItemCloseButton", fit: true, content: "Back"},
					{kind:"onyx.Button", name: "moveItemListButton", ontap: "moveItemSelectButton", fit: true, content: "Select folder"},
					{kind: "List", name: "moveList", style: "height: 90%; width: 95%;", touch: true, onSetupItem: "buildMoveList", components: [
						{name: "itemMove", style: "padding: 10px;", dir: false, classes: "panels-sample-item enyo-border-box", ontap: "moveItemTap", components: [
							{name: "thumbnailMove", kind: "Image", classes: "panels-sample-thumbnail"},
							{name: "titleMove", classes: "panels-sample-title"}
						]}
					]}
				]},
				{tag: "br"},
				{tag: "br"},
				{kind: "onyx.Groupbox", showing: false, name: "imageContainer", components: [
					{kind: "onyx.GroupboxHeader", content: "Image"},
						{name: "imageItem", kind: "Image", style: "max-width: 100%; max-height: 100%;"},
				]},

				//end of move item list part
				{name: "errorPopupBase", kind: "onyx.Popup", floating: true, centered: true, style: "padding: 10px", components: [
					{name: "errorPopup", content: "Popup..."}
				]}
			]}
		]},
		{
			name: "getDirs",
			kind: "enyo.PalmService",
			service: "luna://org.webosports.service.filemanager",
			method: "GetDirectories",
			subscribe: true,
			onComplete: "getDirsComplete"
        },
		{
			name: "removeDir",
			kind: "enyo.PalmService",
			service: "luna://org.webosports.service.filemanager",
			method: "removeDir",
			subscribe: true,
			onComplete: "removeDirComplete"
        },
		{
			name: "mkDir",
			kind: "enyo.PalmService",
			service: "luna://org.webosports.service.filemanager",
			method: "mkDir",
			subscribe: true,
			onComplete: "mkDirComplete"
        },
		{
			name: "removeFile",
			kind: "enyo.PalmService",
			service: "luna://org.webosports.service.filemanager",
			method: "removeFile",
			subscribe: true,
			onComplete: "removeFileComplete"
        },
		{
			name: "getFileSize",
			kind: "enyo.PalmService",
			service: "luna://org.webosports.service.filemanager",
			method: "getFileSize",
			subscribe: true,
			onComplete: "getFileSizeComplete"
        },
		{
			name: "moveFile",
			kind: "enyo.PalmService",
			service: "luna://org.webosports.service.filemanager",
			method: "moveFile",
			subscribe: true,
			onComplete: "moveFileComplete"
        },
		{
			name: "openFile",
			kind: "enyo.PalmService",
			service: "luna://com.palm.applicationManager",
			method: "open",
			subscribe: true,
			onComplete: "openFileComplete"
        }
	],
	handleBackGesture: function(inSender, inEvent) {
		inEvent.stopPropagation();
		inEvent.preventDefault();
		this.$.moveItemPopup.hide();
		this.$.errorPopupBase.hide();
		this.$.mkDirPopup.hide();
		this.setIndex(0);
	},
	//Move file list
	moveItemCloseButton: function(inSender, inEvent) {
		this.$.moveItemPopup.hide();
	},
	moveItemOpen: function(inSender, inEvent) {
		this.$.moveItemPopup.show();
		this.currentList = "move";
		this.currentMoveDir = "/media/internal";
		this.currentRequest = this.$.getDirs.send({"dir":this.currentMoveDir});
	},
	moveItemTap: function(inSender, inEvent) {
		this.selectedMoveItem = this.moveResults[inEvent.index];
		this.currentList = "move";
		
		if (this.selectedMoveItem.dir) {
			if (this.selectedMoveItem.title == "../") {
				//build the path of the underlying directory
				dirsArray = this.currentMoveDir.substring(1).split("/");
				var currentDirTemp = "";
				for (var i = 0; i < dirsArray.length-1; i++) {
					currentDirTemp += "/"+dirsArray[i];
				}
				if (currentDirTemp == "") currentDirTemp = "/";
				this.currentMoveDir = currentDirTemp;
			} else {
				this.currentMoveDir += "/"+this.selectedMoveItem.title;
			}
			this.currentRequest = this.$.getDirs.send({"dir":this.currentMoveDir});
		}
	},
	moveItemSelectButton: function(inSender, inEvent) {
		this.currentRequest = this.$.moveFile.send({"oldPath": this.selectedItem.full_path, "newPath": this.currentMoveDir+"/"+this.selectedItem.title});
	},
	initMoveList: function() {
		this.$.moveList.setCount(this.moveResults.length);
		this.$.moveList.reset();
	},
	buildMoveList: function(inSender, inEvent) {
		var i = inEvent.index;
		var item = this.moveResults[i];
		this.$.itemMove.addRemoveClass("onyx-selected", inSender.isSelected(inEvent.index));
        this.$.itemMove.dir = item.dir;
		this.$.thumbnailMove.setSrc(item.thumbnail);
		this.$.titleMove.setContent(item.title || "Untitled");
	},
	moveFileComplete: function(inSender, inEvent) {
		this.$.moveItemPopup.hide();
		if (inEvent.data.succes) this.$.errorPopup.setContent("Item moved!");
		else this.$.errorPopup.setContent("Item not moved!");
		this.$.errorPopupBase.show();
	},
	//End of move file list
	createDirPopup: function() {
		this.$.mkDirPopup.show();
	},
	initList: function() {
		this.$.mainList.setCount(this.results.length);
		this.$.mainList.reset();
	},
	rendered: function() {
		this.inherited(arguments);
		this.currentList = "main";
		this.currentDir = "/media/internal";
		this.currentRequest = this.$.getDirs.send({"dir":this.currentDir});
	},
	reflow: function() {
		this.inherited(arguments);
	},
	buildList: function(inSender, inEvent) {
		var i = inEvent.index;
		var item = this.results[i];
		this.$.item.addRemoveClass("onyx-selected", inSender.isSelected(inEvent.index));
        this.$.item.dir = item.dir;
		this.$.thumbnail.setSrc(item.thumbnail);
		this.$.title.setContent(item.title || "Untitled");
	},
	enableButtons: function() {
		this.$.removeButton.setDisabled(false);
		this.$.createDirPopupButton.setDisabled(false);
		this.$.openFileButton.setDisabled(false);
	},
	
	handleItemTap: function() {
		this.currentList = "main";
		this.$.moveItemButton.setDisabled(false);
		this.enableButtons();
		
		if (this.selectedItem.dir) {
			if (this.selectedItem.title == "../") {
				//build the path of the underlying directory
				dirsArray = this.currentDir.substring(1).split("/");
				var currentDirTemp = "";
				for (var i = 0; i < dirsArray.length-1; i++) {
					currentDirTemp += "/"+dirsArray[i];
				}
				if (currentDirTemp == "") currentDirTemp = "/";
				this.currentDir = currentDirTemp;
				this.$.file_title.setContent(this.currentDir);
			} else {
				this.currentDir += "/"+this.selectedItem.title;
				this.$.file_title.setContent(this.selectedItem.title);
			}
			this.currentRequest = this.$.getDirs.send({"dir":this.currentDir});
			this.selectedItem['full_path'] = this.currentDir;
			this.$.type.setContent("Type: folder");
			this.$.fileExtension.hide();
			this.$.createDirButton.show();
			this.$.newDirContainer.show();
			this.$.openFileButton.hide();
			this.$.imageContainer.hide();
		} else {
			this.selectedItem['full_path'] = this.currentDir+"/"+this.selectedItem.title;
			this.$.file_title.setContent(this.selectedItem.title);
			//Check if item is an image
			var fileExtensionArr =  this.selectedItem.title.split(".");
			var fileExtension = fileExtensionArr[fileExtensionArr.length -1].toLowerCase();
			this.$.fileExtension.show();
			this.$.fileExtension.setContent("File extension: "+fileExtension);
			if (fileExtension.toLowerCase() == "png" || fileExtension.toLowerCase() == "jpg" || fileExtension.toLowerCase() == "bmp" || fileExtension.toLowerCase() == "gif" || fileExtension.toLowerCase() == "jpeg") {
				this.$.imageContainer.show();
				this.$.openFileButton.hide();
				this.$.imageItem.setSrc("file://"+this.selectedItem.full_path);
			} else {
				this.$.openFileButton.show();
				this.$.imageContainer.hide();
			}
			this.$.type.setContent("Type: file");
			this.$.createDirButton.hide();
			this.$.newDirContainer.hide();
			this.$.openFileButton.show();
		}
		this.$.full_path.setContent(this.selectedItem.full_path);
		this.currentRequest = this.$.getFileSize.send({"path":this.selectedItem.full_path});
	},
	
	itemTap: function(inSender, inEvent) {
		this.selectedItem = this.results[inEvent.index];
		this.handleItemTap();
	},
	itemHold: function(inSender, inEvent) {
		this.selectedItem = this.results[inEvent.index];
		this.handleItemTap();
		this.setIndex(1);
	},
	getDirsComplete: function(inSender, inEvent) {
		var result = inEvent.data;
		var dirs = result.dirs.split(","); 
		var files = result.files.split(","); 
		if (this.currentList == "main") {
			this.results = [];
			this.results.push({'thumbnail': 'assets/icon_folder.png','title':"../","dir":true});
			for (var i = 0; i < dirs.length; i++) {
				if (!dirs[i] == "") this.results.push({'thumbnail': 'assets/icon_folder.png','title':dirs[i],"dir":true});
			}
			for (var i = 0; i < files.length; i++) {
				if (!files[i] == "") this.results.push({'thumbnail': 'assets/icon_file.png','title':files[i],"dir":false});
			}
			this.initList();
		} else {
			this.moveResults = [];
			this.moveResults.push({'thumbnail': 'assets/icon_folder.png','title':"../","dir":true});
			for (var i = 0; i < dirs.length; i++) {
				if (!dirs[i] == "") this.moveResults.push({'thumbnail': 'assets/icon_folder.png','title':dirs[i],"dir":true});
			}
			this.initMoveList();
		}
	},
	remove: function(inSender, inEvent) {
		if (this.selectedItem.dir) {
			this.currentRequest = this.$.removeDir.send({"path":this.selectedItem.full_path});
		} else {
			this.currentRequest = this.$.removeFile.send({"path":this.selectedItem.full_path});
		}
		this.$.errorPopup.setContent('Folder deleted. Press "../" to go back.');
		this.$.errorPopupBase.show();
	},
	getFileSizeComplete: function(inSender, inEvent) {
            var size = inEvent.data.size;
            var result;
            var sizes = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
	    if (size == 0) {
                result = "0 bytes";
            } else if (size == 1) {
                result = "1 byte";
            } else {
	        var i = Math.min(sizes.length - 1, parseInt(Math.floor(Math.log(size) / Math.log(1024))));
	        if (i == 0) {
                    result = size + ' ' + sizes[i];
                } else {
                    result = (size / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
		}
	    }
            this.$.size.setContent("Size: "+result);
	},
	createDir: function(inSender, inEvent) {
		this.currentRequest = this.$.mkDir.send({"path":this.selectedItem.full_path+"/"+this.$.newDir.getValue()});
		this.$.mkDirPopup.hide();
		this.$.errorPopup.setContent("Folder created");
		this.$.errorPopupBase.show();
	},
	openFileTap: function(inSender, inEvent) {
		this.currentRequest = this.$.openFile.send({"target":"file://"+this.selectedItem.full_path});
	},
	openFileComplete: function(inSender, inEvent) {
		if (!inEvent.data.returnValue) {
			this.$.errorPopup.setContent(inEvent.data.errorText);
			this.$.errorPopupBase.show();
		}
	},
	showList: function() {
		this.setIndex(0);
	}
});
