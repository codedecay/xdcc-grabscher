// 
//  dataview.js
//  This file is part of XG - XDCC Grabscher
//  http://www.larsformella.de/lang/en/portfolio/programme-software/xg
//  
//  Author:
//       Lars Formella <ich@larsformella.de>
// 
//  Copyright (c) 2012 Lars Formella
// 
//  This program is free software; you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation; either version 2 of the License, or
//  (at your option) any later version.
// 
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
//  GNU General Public License for more details.
//  
//  You should have received a copy of the GNU General Public License
//  along with this program; if not, write to the Free Software
//  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
// 

var XGDataView = (function ()
{
	var servers, channels, bots, packets, externalSearch, searches, notifications, files;
	var botFilterGuids = [];

	/**
	 * @return {Slick.Data.DataView}
	 */
	function buildDataView ()
	{
		var dataView = new Slick.Data.DataView({ inlineFilters: false });
		dataView.setItems([], "Guid");
		dataView.setFilter(filterObjects);
		return dataView;
	}

	function filterObjects (item, args)
	{
		var result = true;

		if (args != undefined)
		{
			if (args.OfflineBots != undefined && args.OfflineBots)
			{
				switch (item.DataType)
				{
					case Enum.Grid.Bot:
						result = result && item.Connected;
						break;
					case Enum.Grid.Packet:
						result = result && item.BotConnected;
						break;
				}
			}

			if (args.ParentGuid != undefined)
			{
				if (item.ParentGuid != args.ParentGuid)
				{
					result = result && false;
				}
			}

			if (item.DataType == Enum.Grid.Bot)
			{
				var currentResult = false;
				$.each(botFilterGuids, function (i, guid)
				{
					if (item.Guid == guid)
					{
						currentResult = true;
						return false;
					}
					return true;
				});
				result = result && currentResult;
			}

			if (item.DataType == Enum.Grid.Packet || item.DataType == Enum.Grid.ExternalSearch)
			{
				if (args.SearchGuid != undefined)
				{
					switch (args.SearchGuid)
					{
						case "00000000-0000-0000-0000-000000000001":
							result = result && item.Enabled;
							break;

						case "00000000-0000-0000-0000-000000000002":
							result = result && item.Connected;
							break;

						default:
							var names = args.Name.toLowerCase().split(" ");
							$.each(names, function (i, name)
							{
								if (item.Name.toLowerCase().indexOf(name) == -1)
								{
									result = result && false;
									return false;
								}
								return true;
							});
							break;
					}

					if (item.DataType == Enum.Grid.Packet && result && botFilterGuids.indexOf(item.ParentGuid) == -1)
					{
						botFilterGuids.push(item.ParentGuid);
					}
				}
			}
		}

		return result;
	}

	var self = {
		onAdd: new Slick.Event(),
		onRemove: new Slick.Event(),
		onUpdate: new Slick.Event(),
		onSet: new Slick.Event(),

		initialize: function ()
		{
			servers = buildDataView();
			channels = buildDataView();
			bots = buildDataView();
			packets = buildDataView();
			externalSearch = buildDataView();
			searches = buildDataView();
			notifications = buildDataView();
			files = buildDataView();
		},

		/**
		 * @param {string} name
		 * @return {Slick.Data.DataView}
		 */
		getDataView: function (name)
		{
			switch (name)
			{
				case Enum.Grid.Server:
					return servers;
				case Enum.Grid.Channel:
					return channels;
				case Enum.Grid.Bot:
					return bots;
				case Enum.Grid.Packet:
					return packets;
				case Enum.Grid.Search:
					return searches;
				case Enum.Grid.Notification:
					return notifications;
				case Enum.Grid.ExternalSearch:
					return externalSearch;
				case Enum.Grid.File:
					return files;
			}

			return null;
		},

		getItem: function (view, guid)
		{
			var obj = null;

			var dataView = this.getDataView(view);
			if (dataView != null)
			{
				var items = dataView.getItems();
				$.each(items, function (i, item)
				{
					if (item.Guid == guid)
					{
						obj = item;
						return false;
					}
					return true;
				});
			}

			return obj;
		},

		addItem: function (json)
		{
			var dataView = this.getDataView(json.DataType);
			if (dataView != null)
			{
				if (json.DataType == Enum.Grid.Notification)
				{
					dataView.insertItem(0, json.Data);
				}
				else
				{
					dataView.addItem(json.Data);
				}
				self.onAdd.notify(json, null, self);
			}
		},

		removeItem: function (json)
		{
			var dataView = this.getDataView(json.DataType);
			if (dataView != null)
			{
				dataView.deleteItem(json.Data.Guid);
				self.onRemove.notify(json, null, self);
			}
		},

		updateItem: function (json)
		{
			var dataView = this.getDataView(json.DataType);
			if (dataView != null)
			{
				try
				{
					dataView.updateItem(json.Data.Guid, json.Data);
				}
				catch (e) {}
				self.onUpdate.notify(json, null, self);
			}
		},

		setItems: function (json)
		{
			var dataView = this.getDataView(json.DataType);
			if (dataView != null)
			{
				dataView.setItems(json.Data);
				self.onSet.notify(json, null, self);
			}
		},

		resetBotFilter: function ()
		{
			botFilterGuids = [];
		},
		
		beginUpdate: function (type)
		{
			var dataView = this.getDataView(type);
			if (dataView != null)
			{
				dataView.beginUpdate();
			}
		},
		
		endUpdate: function (type)
		{
			var dataView = this.getDataView(type);
			if (dataView != null)
			{
				dataView.endUpdate();
			}
		}
	};
	return self;
}());