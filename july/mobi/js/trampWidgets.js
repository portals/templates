//  This file is part of Trampoline Project
// 
//  	Copyright (C) 2010 shawill
// 
// 	Authors:
// 		Giampaolo Mancini <giampaolo@trampolineup.com>
// 		Francesco Varano <francesco@trampolineup.com>
// 
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
// 
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
// 
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

function trampAddQueryParam(q, par, val)
{
	return (q?q:"") + (val ? (q?"&":"")+par+"="+val : "");
}

function TrampWidget(url, target, parameters)
{
	$(target).html('<div class="loading" />');
	//$(document).ready(function() {
	    $(target).load(url, parameters);
	//});
}

/*
options:
feed,
items
*/
function TrampWidgetRss(target, options)
{
	TrampWidget("mobi/rss.html", target, (options.feed?"Feed="+options.feed+(options.items?"&":""):"")+(options.items?"MaxItems="+options.items:""));
}

function TrampWidgetERates(target)
{
	TrampWidget("mobi/erates.html", target);
}

/*
options:
lat,
lng,
width,
height,
zoom
*/
function TrampWidgetMap(target, options)
{
	// if lat and lng were null WidgetMap will get values from zone or global portal settings
	var q = trampAddQueryParam(null, "Lat", options.lat);
	q = trampAddQueryParam(q, "Lng", options.lng);
	q = trampAddQueryParam(q, "W", options.width);
	q = trampAddQueryParam(q, "H", options.height);
	q = trampAddQueryParam(q, "Zoom", options.zoom);

	TrampWidget("mobi/map.html", target, q);
}

function TrampWidgetPlayme(target)
{
	TrampWidget("mobi/playme.html", target);
}
