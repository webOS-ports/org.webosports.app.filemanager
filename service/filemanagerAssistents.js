/*
* Copyright (C) 2012 Simon Busch <morphis@gravedo.de>
*
* This program is free software; you can redistribute it and/or
* modify it under the terms of the GNU General Public License
* as published by the Free Software Foundation; either version 2
* of the License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program; if not, write to the Free Software
* Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
*
*/

if(typeof require === 'undefined') {
   require = IMPORTS.require;
}

fs = require('fs');

var removeDirAssistant = function() { }
var mkDirAssistant = function() { }
var removeFileAssistant = function() { }
var getFileSizeAssistant = function() { }
var moveFileAssistant = function() { }
var GetDirectoriesAssistant = function() { }

removeDirAssistant.prototype.run = function(future) {
	var path = this.controller.args.path;
	fs.rmdirSync(path);
	future.result = {
       	"returnValue": true,
		"succes": true,
    };
}

mkDirAssistant.prototype.run = function(future) {
	var path = this.controller.args.path;
	fs.mkdirSync(path, 0777);
	future.result = {
       	"returnValue": true,
		"succes": true,
    };
}

removeFileAssistant.prototype.run = function(future) {
	var path = this.controller.args.path;
	fs.unlinkSync(path);
	future.result = {
       	"returnValue": true,
		"succes": true,
    };
}

getFileSizeAssistant.prototype.run = function(future) {
	var path = this.controller.args.path;
	var stats = fs.statSync(path)
	var fileSizeInBytes = stats["size"]
	//Convert the file size to megabytes (optional)
	// var fileSizeInMegabytes = fileSizeInBytes / 1000000.0
	future.result = {
       	"returnValue": true,
		"succes": true,
		"size":fileSizeInBytes,
    };
}

moveFileAssistant.prototype.run = function(future) {
	fs.renameSync(this.controller.args.oldPath, this.controller.args.newPath);
	//Convert the file size to megabytes (optional)
	future.result = {
       	"returnValue": true,
		"succes": true,
    };
}

GetDirectoriesAssistant.prototype.run = function(future) {
	
	var dirToRead = this.controller.args.dir;
	var contents = fs.readdirSync(dirToRead);
		
	var dirs = []
	var files = []
	
	for (var i = 0; i < contents.length; i++) {
		var fileInfo = fs.statSync(dirToRead+"/"+contents[i]);
		if (fileInfo.isDirectory()) {
			dirs.push(contents[i]);
		} else {
			files.push(contents[i]);
		}
	}
	
	future.result = {
       	"returnValue": true,
		"dirs": dirs.toString(),
		"files": files.toString(),
    };
}
