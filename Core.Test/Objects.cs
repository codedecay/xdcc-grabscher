// 
//  Objects.cs
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

using System;

#if !WINDOWS
using NUnit.Framework;
#else
using Microsoft.VisualStudio.TestTools.UnitTesting;
#endif

namespace XG.Core.Test
{
#if !WINDOWS
	[TestFixture()]
#else
    [TestClass]
#endif
	public class Objects
	{
		bool _childAdded = false;

#if !WINDOWS
        [Test()]
#else
        [TestMethod]
#endif
		public void Test ()
		{
			Core.Objects parent = new Core.Objects();
			parent.Added += delegate {
				_childAdded = true;
			};
			parent.Guid = Guid.NewGuid();

			AssertChildAdded(false);

			Core.Object obj = new Core.Object();
			Assert.AreEqual(Guid.Empty, obj.ParentGuid);
			parent.Add(obj);

			AssertChildAdded(true);
			Assert.AreEqual(parent.Guid, obj.ParentGuid);
		}

		void AssertChildAdded(bool childAdded)
		{
			Assert.AreEqual(this._childAdded, childAdded);
			this._childAdded = false;
		}
	}
}

