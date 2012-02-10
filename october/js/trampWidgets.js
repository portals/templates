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
	},
	userinfo: {
		url: "/ajax/userinfo"
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

		var postOpts = {
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
				var successPost = null;

				if (options) {
					processPost = options.processPost;
					finalizePost = options.finalizePost;
					successPost = options.success;
				}

				if (processPost && processPost(this) === false)
					return false;
					
				ajaxPost(url, postTarget, parameters, options);

				$(postTarget).children(postTarget).each(function() {
					this.id += "-in";
				});

				if (finalizePost && finalizePost(this) === false)
					return;

				if (successPost)
					successPost(this, statusText, xhr);
			}
		};

		if (options && options.beforeSubmit)
			postOpts.beforeSubmit = options.beforeSubmit;

		$(this).ajaxForm(postOpts);
	});
}

// standard function to rebase links of an ajax loaded div
function ajaxRebaseLinks(data)
{
    var h = $(data).find('a[target!="_blank"][ajax!="skip"]');
    h.each(function() {
        var href = $(this).attr('href');
        $(this).click(function() {
            TrampWidget('/ajax'+href, /*'#widget-identity'*/ data, null, {success: ajaxRebaseLinks/*, processPost: ajaxRebaseLinks*/});
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

			if (options && options.success && options.success(this, status, xhr) === false)
				return xhr;

			ajaxPost(url, /*(options && options.postTarget ) ? options.postTarget :*/ target, parameters, options);

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
				if (!$(data).hasClass("modal"))
					$(data)
						.addClass("modal fade hide")
		                .modal({
			                backdrop: "static",
			                keyboard: true,
			                show: true
			            });
		        $('#e-rates .e-rate button.buy-e-rate').button('reset');
				$(data)
	                .one('hidden', function () {
		                $(this).removeClass("modal fade hide").empty();
		                /*
		                if ($(this).data('mustReload')) {
		                    wi.modal('hide');
		                    window.location.href = '/';
		                    return false;
		                }
		                */
				    })
				    .one('shown', function () {
				        $(window).scrollTop(0);
				    });
		            //.find(":submit:not(.buy-e-rate)").click(function() {$(this).button('loading');});
			    //ajaxRebaseLinks(data);
			},
	        beforeSubmit: function(arr, $form, options) {
	            $form.find(":submit").button('loading');
			}
		});
}

/*
options:
lat,
lng,
width,
height,
zoom,
kml
*/
function TrampWidgetMap(target, options)
{
	// if lat and lng were null WidgetMap will get values from zone or global portal settings
	var q = trampAddQueryParam(null, "Lat", options.lat);
	q = trampAddQueryParam(q, "Lng", options.lng);
	q = trampAddQueryParam(q, "W", options.width);
	q = trampAddQueryParam(q, "H", options.height);
	q = trampAddQueryParam(q, "Zoom", options.zoom);

	if (options.kml)
		q = trampAddQueryParam(q, "Kml", encodeURIComponent(encodeURIComponent(options.kml)));

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

function TrampWidgetUserInfo(target)
{

// some utils for TrampWidgetUserInfo
	function zeroPad(n)
	{
		return ("00"+n).slice(-2);
	}
	
	function TimeFormat(target, inputtime)
	{
	
		if (!inputtime)
			return;
	
		if (+inputtime.Days)
			$(target).find(".days").prepend(inputtime.Days);
		else
			$(target).find(".days").remove();
	
		if (+inputtime.Hours || +inputtime.Minutes) {
			var hour=zeroPad(inputtime.Hours)+':'+zeroPad(inputtime.Minutes)+':'+zeroPad(inputtime.Seconds);
			$(target).find(".secs").append(hour);
		} else {
			$(target).find(".secs").remove();
		}

		if (!$(target).find(".days, .secs").size())
			$(target).remove();
	}
// ENDOF utils

    $(document).ready(function() {
        var juser=$("#widget-identity").data('jUser');

        if (!juser)
            return;

        TrampWidget(TrampWidgets.userinfo.url, target, null, {
        success: function(data) {
	        if (juser.Username) {
	            $(data).find('#widgetuserinfo').show();
	            $(data).find('#username .value').append(juser.Username);
	            if (juser.Name) $(data).find('#name .value').append(juser.Name).show();
	            if (juser.Mobile) $(data).find('#mobile .value').append(juser.Mobile).show();
	        }

	        if (juser.CurSess) {
	            $(data).find('#nocursession').remove();

                $(data).find('#cur_start').each(function() {
		            if (juser.CurSess.SessTime)
			            $(this).find('.value').append(juser.CurSess.SessTime.Start);
		            else
			            $(this).remove();
                });

	            $(data).find('#cur_url .value').append(juser.CurSess.SUrl);

                $(data).find('#cur_ip').each(function() {
		            if (juser.CurSess.Ip)
			            $(this).find('.value').append(juser.CurSess.Ip);
		            else
			            $(this).remove();
                });

                $(data).find('#cur_sess_time_left').each(function() {
		            if (juser.CurSess.SessTimeLeft) {
		                TimeFormat($(this).find('.value'), juser.CurSess.SessTimeLeft);
		                $(this).show();
	                } else
		                $(this).remove();
                });

                $(data).find('#cur_sess_time').each(function() {
	                if (juser.CurSess.SessTime) {
			            TimeFormat($(this).find('.value'), juser.CurSess.SessTime);
		                $(this).show();
		            } else
		                $(this).remove();
                });

	            $(data).find('#cursession').show();
	        } else {
	            $(data).find('#cursession').remove();
	            $(data).find('#nocursession').show();
	        }

			if (juser.CursSess && juser.CursSess.length) {
                $(data).find('#cursessions').show();
                if (juser.CurSess) $(data).find('#othersess').show();
		        for (x in juser.CursSess) {
		            var cursess_elem;
		            var tmpid;

		            cursess_elem='#cursessions_elem_'+x;
		            tmpid='cursessions_elem_'+(+x+1);
					$(data).find(cursess_elem).clone().insertAfter(cursess_elem).attr('id',tmpid);
					$(data).find(cursess_elem).show();

		            tmpid=cursess_elem+' #curs_start .value';
					$(data).find(tmpid).append(juser.CursSess[x].SessTime.Start);
		            tmpid=cursess_elem+' #curs_url .value';
		            $(data).find(tmpid).append(juser.CursSess[x].SUrl);
		            tmpid=cursess_elem+' #curs_ip .value';
		            $(data).find(tmpid).append(juser.CursSess[x].Ip);

		            tmpid = cursess_elem+' #curs_sess_time .value';
	                $(data).find(tmpid).each(function() {
			            TimeFormat(this, juser.CursSess[x].SessTime);
		            });
		        }
			} else {
				$(data).find('#cursessions').remove();
			}

	        if (juser.LastSess) {
	            $(data).find('#lastsession').show();

	            $(data).find('#last_start .value').append(juser.LastSess.SessTime.Start);
	            $(data).find('#last_stop .value').append(juser.LastSess.SessTime.Stop);
	            $(data).find('#last_url .value').append(juser.LastSess.SUrl);
	            $(data).find('#last_ip .value').append(juser.LastSess.Ip);
                $(data).find('#last_sess_time .value').each(function() {
		            TimeFormat(this, juser.LastSess.SessTime);
	            });
	        } else
	            $(data).find('#lastsession').remove();

		    $(data).parent().hover(function() {
		        $(this).find(".showOnHover:not(:empty)").slideDown();
		    }, function() {
		        $(this).find(".showOnHover:not(:empty)").slideUp();
		    });
        }});
	});
}
