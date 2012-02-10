//  This file is part of Trampoline Project
// 
//      Copyright (C) 2010 Trampoline
// 
//  Authors:
//      Giampaolo Mancini <giampaolo@trampolineup.com>
//      Francesco Varano <francesco@trampolineup.com>
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
//

TrampWidgetRss("#widget-rss", {feed: "http://news.google.com/news?pz=1&cf=all&ned=it&hl=it&output=rss", items: 3});

TrampWidgetEditable("#widget-editable");

TrampWidgetUserInfo("#widget-userinfo");

TrampWidgetMap("#widget-map", {width: 930, height: 350, zoom: 15, kml: "http://maps.google.com/maps/ms?authuser=0&vps=2&ie=UTF8&msa=0&output=nl&msid=206487044174936716444.0004b62bad8d23e9daae2"});
TrampWidgetMap("#widget-map-right", {width: 260, height: 350, zoom: 15, kml: "http://maps.google.com/maps/ms?authuser=0&vps=2&ie=UTF8&msa=0&output=nl&msid=206487044174936716444.0004b62bad8d23e9daae2"});
// TrampWidgetMap("#widget-map", {width: 260, height: 350, zoom: 15});

TrampWidgetERates("#widget-e-rates");

