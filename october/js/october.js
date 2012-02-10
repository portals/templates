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


function profileOpen(tab) {
    var wi = $('#widget-identity');
    if (!tab)
        tab = '/ajax/profile';

    function rebaseLinks(data)
    {
        var h = data.id == "profile-container" ? $(data).find('a[target!="_blank"][ajax!="skip"]') : $(data).find('#profile-container a[target!="_blank"][ajax!="skip"]');
        h.each(function() {
            var href = $(this).attr('href');
            $(this).click(function() {
	            TrampWidget('/ajax'+href, '#profile-container', null, {
                    processPost: processPost,
                    success: rebaseLinks,
			        beforeSubmit: function(arr, $form, options) {
			            $form.find(":submit").button('loading');
					}
                });
	            return false;
            });
            $(this).attr("href", "#");
	        $(this).attr("onclick", "return false;");
        });
        /*
        $(data).find("form").submit(function() {
            $(this).find(":submit").button('loading');
        });
        */
    }

    function processPost(data)
    {
        /*
        if ($(data).find(".ajaxPOSTok").length) {
            wi.modal('hide');
            window.location.href = '/';
            return false;
        }
        */
        /*
        var new_wi = $(wi).find('#widget-identity');

        if (new_wi.length) {
            var new_wi = new_wi.detach()[0];
            wi.empty().append(new_wi);
			new_wi.id += "-in";
        }
        */
    }

    function loadSuccess(data)
    {
        $(data).find('#profile-menu ul li a').each(function() {
            var href = $(this).attr('href');

            $(this).click(function() {
                $("#profile-menu ul li").removeClass("active");
                $(this).parent().addClass("active");
	            TrampWidget('/ajax'+href, '#profile-container', null, {
                    processPost: processPost,
                    success: rebaseLinks,
			        beforeSubmit: function(arr, $form, options) {
			            $form.find(":submit").button('loading');
					}
                });
            });
            $(this).attr("href", "#");
	        $(this).attr("onclick", "return false;");
        });
        rebaseLinks(data);
    }

    TrampWidget(tab, '#widget-identity', null, {
        postTarget: '#profile-container',
        processPost: processPost,
        success: loadSuccess,
        beforeSubmit: function(arr, $form, options) {
            $form.find(":submit").button('loading');
		}
    });

    wi.addClass("modal fade hide");
    var mwi = wi.modal({
        backdrop: "static",
        keyboard: true,
        show: true
    });


    wi.one('hidden', function () {
        $(this).removeClass("modal fade hide").empty();
        if ($(this).data('mustReload')) {
            //wi.modal('hide');
            window.location.href = '/';
            return false;
        }
    }).one('shown', function () {
        $(window).scrollTop(0);
    });

    return false;
}


function wiOpen(url, processPost) {
    var wi = $('#widget-identity');
    var tb = $("#wok-header");

    var fl = wi.find('#form-login').detach();
    wi.data('form-login', fl);

    TrampWidget(url, '#widget-identity', null, {
        success: ajaxRebaseLinks,
        processPost: processPost/* ? processPost : ajaxRebaseLinks*/,
        beforeSubmit: function(arr, $form, options) {
            $form.find(":submit").button('loading');
		}
    });

    wi.addClass("modal fade hide");
    var mwi = wi.modal({
        backdrop: "static",
        keyboard: true,
        show: true
    });

    tb.removeClass("big");

    wi.one('hidden', function () {
        if ($(this).data('mustReload')) {
            window.location.href = '/';
            return false;
        }
        tb.addClass("big");
        $(this)
            .removeClass("modal fade hide")
            .empty()
            .append(wi.data('form-login'))
            .show()
            .removeData('form-login');

			$("meta[name='viewport']").attr("content", function(i, val) {
				return val ? val.replace(/(, *)?maximum-scale *=[^,]*/, '$1maximum-scale=100.0') : null;
			});
    }).one('shown', function () {
        $(window).scrollTop(0);
		$("meta[name='viewport']").attr("content", function(i, val) {
			return val ? val.replace(/(, *)?maximum-scale *=[^,]*/, '') + ", maximum-scale=1.0" : null;
		});
    });

    return false;
}

function newUserOpen() {
	wiOpen('/ajax/new-user', function (data) {
        if ($(data).find('#new-user-page').length == 0) {
			$('#widget-identity').data('mustReload', true);
        }
        //ajaxRebaseLinks(data)
    });

}

function pwdLostOpen() {
	wiOpen('/ajax/password-lost');
}

function recoveryInfoDialog(type) {
	var wi = $("#widget-identity").data('recoveryinfo', type ? type : 'question').data('recoveryskipped', false);

	if (wi.hasClass('modal')) {
		return;
	}

	wi.addClass("modal fade hide").modal({
        backdrop: "static",
        keyboard: true,
        show: true
    });

	function myAjaxRebaseLinks(data)
	{
        if (wi.data('recoveryinfoIsLast'))
            return false;

        var h = $(data).find('a[target!="_blank"][ajax!="skip"]');
	    h.each(function() {
	        var href = $(this).attr('href');
	        $(this).click(function() {
	            TrampWidget('/ajax'+href, /*'#widget-identity'*/ data, null, {
	                success: myAjaxRebaseLinks,
	                processPost: myAjaxRebaseLinks,
	                finalizePost: function() { return false; },
			        beforeSubmit: function(arr, $form, options) {
			            $form.find(":submit").button('loading');
					}
                });
	            return false;
	        });
	        $(this).attr("href", "#");
	        $(this).attr("onclick", "return false;");
	    });
	    return true;
	}

	if (myAjaxRebaseLinks('#widget-identity'))
		ajaxPost(null, '#widget-identity', null, {
			success: myAjaxRebaseLinks,
			processPost: myAjaxRebaseLinks,
            finalizePost: function() { return false; },
	        beforeSubmit: function(arr, $form, options) {
	            $form.find(":submit").button('loading');
			}
		});

    wi.bind('hidden', function () {
        $(this).empty();
        //$(this).removeClass("modal fade hide").empty();
        if ($(this).data('recoveryinfoIsLast')) {
            // console.log('isLast');
            window.location.href = '/activate/recoveryinfo?skip='+$(this).data('recoveryinfo');
        } else if (!$(this).data('recoveryskipped')) {
            // console.log('skip');
		    TrampWidget('/ajax/activate/recoveryinfo?skip='+$(this).data('recoveryinfo'), '#widget-identity', null, {
		        success: myAjaxRebaseLinks,
		        processPost: myAjaxRebaseLinks,
                finalizePost: function() { return false; },
		        beforeSubmit: function(arr, $form, options) {
		            $form.find(":submit").button('loading');
				}
	        });
		    $(this).modal('show');
            $(this).data('recoveryskipped', true);
        }
        //$('#skipQuestion').click();
        //window.location.href = '/ajax/activate/recoveryinfo?skip=question';
        return false;
    }).one('shown', function () {
        $(window).scrollTop(0);
    });
}