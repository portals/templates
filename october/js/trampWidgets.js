//  This file is part of Trampoline Project
// 
//  	Copyright (C) 2010 Trampoline
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

// Force non cached data (IE issue)
$.ajaxSetup({
     cache: false
});

var TrampWidgets = {
	rss: {
		url: "/ajax/atom"
	},
	erates: {
		url: "/ajax/erates"
	},
	map: {
		url: "/ajax/map"
	},
	playme: {
		url: "/ajax/playme"
	},
	editable: {
		url: "/ajax/editable"
	}
};

function trampAddQueryParam(q, par, val)
{
	return (q?q:"") + (val ? (q?"&":"")+par+"="+val : "");
}

/* unmaintained anymore
function ajaxPost(url, target, parameters, options)
{
	$(target).find("form").submit(function(event) {
		// stop form from submitting normally
		//event.preventDefault();

		var $form = $(this);
		var postData = $(this).serialize();
		//url = TrampWidgets.editable.url+$form.attr('action');
		// TODO: manage actions in a better way
		var act = $form.attr('action');
		if (act !== undefined)
			url += act;

		$.post( url, postData, function( data ) {
			if (options && options.processPost && options.processPost(data) === false)
				return false;

			$(target).empty().append(data);
			ajaxPost(url, target, parameters, options);

			if (options && options.finalizePost)
				options.finalizePost(data);
		});
		return false;
	});
}
*/
function ajaxPost(url, target, parameters, options)
{
	$(target).find('form[ajax!="skip"]').each(function() {
		var act = $(this).attr('action');

		var postTarget = (options && options.postTarget) ? options.postTarget : target;
		var postAction = url ? url : "/ajax"+location.pathname;
		if (act) {
			if (act.match(/^ *\//))
				// must set the prefix
				postAction = "/ajax"+act;
			else if (!act.match(/^ *(http|https):\/\//))
				postAction += act;
			else
				return;
		}

		$(this).ajaxForm({
			// url: url+(act ? act : ""),
			url: postAction,
			target: postTarget,
			//replaceTarget: true,
			/*
			beforeSend: function (xhr) {
				xhr.done(function(data, status, xhr) {
					console.log("ajax success " + xhr.status);
				});
			},
			*/
			success: function(responseText, statusText, xhr, $form) {
				var processPost = null;
				var finalizePost = null;

				if (options) {
					processPost = options.processPost;
					finalizePost = options.finalizePost;
				}

				if (processPost && processPost(this) === false)
					return false;
					
				ajaxPost(url, postTarget, parameters, options);

				$(postTarget).children(postTarget).each(function() {
					this.id += "-in";
				});

				if (finalizePost)
					finalizePost(this);
			}
		});
	});
}

// standard function to rebase links of an ajax loaded div
function ajaxRebaseLinks(data)
{
    var h = $(data).find('a[target!="_blank"][ajax!="skip"]');
    h.each(function() {
        var href = $(this).attr('href');
        $(this).click(function() {
            TrampWidget('/ajax'+href, /*'#widget-identity'*/ data, null, {success: ajaxRebaseLinks, processPost: ajaxRebaseLinks});
            return false;
        });
        $(this).attr("href", "#");
        $(this).attr("onclick", "return false;");
    });
}

function TrampWidget(url, target, parameters, options)
{
	$(target).html('<div class="loading"></div>');
	//$(document).ready(function() {
    $(target).load(url, parameters, function(response, status, xhr) {
		if (status == "error") {
			$(target).html('<div class="ajax-error">error loading data ('+xhr.status + ' ' + xhr.statusText+')</div>');
		} else {
			$(this).children('#'+this.id).each(function() {
				this.id += "-in";
			});

			ajaxPost(url, /*(options && options.postTarget ) ? options.postTarget :*/ target, parameters, options);

			if (options && options.success)
				options.success(this, status, xhr);

			return xhr;
		}
	});
	//});
}

/*
options:
feed,
items
*/
function TrampWidgetRss(target, options)
{
	return TrampWidget(TrampWidgets.rss.url, target, (options.feed?"Feed="+escape(options.feed)+(options.items?"&":""):"")+(options.items?"MaxItems="+options.items:""));
}

function TrampWidgetERates(target)
{
	return TrampWidget(TrampWidgets.erates.url, target, null, {
		postTarget: "#widget-identity",
        success: ajaxRebaseLinks,
		processPost: function (data) {
				//var wi =$("#widget-identity");
				$(data).addClass("modal fade hide")
	                .modal({
		                backdrop: "static",
		                keyboard: true,
		                show: true
		            })
	                .bind('hidden', function () {
		                $(this).removeClass("modal fade hide").empty();
		                /*
		                if ($(this).data('mustReload')) {
		                    wi.modal('hide');
		                    window.location.href = '/';
		                    return false;
		                }
		                */
				    })
				    .bind('shown', function () {
				        $(window).scrollTop(0);
				    });
			    ajaxRebaseLinks(data);
			}
		});
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

	return TrampWidget(TrampWidgets.map.url, target, q);
}

function TrampWidgetPlayme(target)
{
	/*$(documenet).ready(function() {

		$.getJSON("http://api.playme.com/track.getRandom?pMethodName=?",
	      {
	        apikey: "466c49395368554705" ,
	        format: "jsonp"
	      },
	      function(data) {

			$(data.response.track.embeddedPlayer).appendTo(target);

	      });
	});*/
	//$('<iframe style="width:100%;height:300px;" src="/ajax/playme"><p>Your browser does not support iframes.</p></iframe>').appendTo(target);
	return TrampWidget(TrampWidgets.playme.url, target);
}

function TrampWidgetEditable(target, options)
{
	return TrampWidget(TrampWidgets.editable.url, target, (options && options.edit ? "_action=edit" : null));
}
