// 
//  ClosingConnection.cs
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

using System.Text.RegularExpressions;

using XG.Core;

namespace XG.Server.Plugin.Core.Irc.Parser.Types.Xdcc
{
	public class ClosingConnection : AParserWithExistingBot
	{
		protected override bool ParseInternal(IrcConnection aConnection, Bot aBot, string aMessage)
		{
			string[] regexes =
			{
				Helper.Magicstring + " (Closing Connection|Transfer Completed)(?<reason>.*)",
				Helper.Magicstring + " (Schlie.e Verbindung)(?<reason>.*)"
			};
			var match = Helper.Match(aMessage, regexes);
			if (match.Success)
			{
				if (aBot.State != Bot.States.Active)
				{
					aBot.State = Bot.States.Idle;
				}
				else
				{
					// kill that connection if the bot sends a close message , but our real bot 
					// connection is still alive and hangs for some crapy reason - maybe because 
					// some admins do some network fu to stop my downloads (happend to me)
					FireRemoveDownload(this, new EventArgs<XG.Core.Server, Bot>(aConnection.Server, aBot));
				}
				FireQueueRequestFromBot(this, new EventArgs<XG.Core.Server, Bot, int>(aConnection.Server, aBot, Settings.Instance.CommandWaitTime));

				match = Helper.Match(aMessage, @".*\s+JOIN (?<channel>[^\s]+).*");
				if (match.Success)
				{
					string channel = match.Groups["channel"].ToString();
					if (!channel.StartsWith("#"))
					{
						channel = "#" + channel;
					}
					FireJoinChannel(this, new EventArgs<XG.Core.Server, string>(aConnection.Server, channel));
				}

				UpdateBot(aBot, aMessage);
				return true;
			}
			return false;
		}
	}
}