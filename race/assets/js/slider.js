var Slider = function(){

}
Slider.prototype.init = function(current_settings) {
	var $this = this;
	game.temp = 1;
	$this.current_settings = current_settings;
	$this.list_slider = $(".list_slider").first().clone();
	$this.popupList = $("#popupList").find(".description").first().clone();
	$this.button = $(".button").first().clone();
	$this.ccButton = $(".click_and_show_wrapper .button_click_and_show").first().clone();
	$this.ccButton_image = $(".click_and_show_image .button_click_and_show").first().clone();
	$this.cloneList = $("#popupList .point_wrapper_block").first().clone();
	$this.cloneWrapper = $("#popupList .point_wrapper").first().clone();
	$this.total_slide;

	$("#ulasan").html("");
	$($this.list_slider).find(".button_wrapper").html("");
	$($this.list_slider).find(".click_and_show_wrapper").html("");
	$($this.list_slider).find(".click_and_show_image").html("");

	$.get("config/setting_slider_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.background = e["background"];
		$this.listSlider = e["list_slider"];
		$this.total_slide = e["list_slider"].length;
		$this.createSlider();
	  },'json');
};

Slider.prototype.addVideoEvent = function(clone) {
	var $this = this;
	$(clone).find(".video").click(function(e){
	    $(this).off();
	    $("#video .btn-close").click(function(e){
	      $(this).off();
	      $this.stopVideo();
	      $this.addVideoEvent(clone);
	    });
	    $this.playVideo();
	});
};
Slider.prototype.playVideo = function() {
	$("#video").show();
	$("#video1").show();
	$("video").get(0).play();
};
Slider.prototype.stopVideo = function() {
	$("#video").hide();
	$("#video1")[0].pause();
	$("#video1")[0].currentTime = 0;
}

Slider.prototype.createSlider = function() {
	var $this = this;
	$(".slider-content").css({"background":$this.background});
	for (var i = 0; i < $this.listSlider.length; i++) {
		var clone = $this.list_slider.clone();
		
		//content image
		if($this.listSlider[i]["image"]){
			if($this.listSlider[i]["image"]){
				/*if(!$this.listSlider[i]["click_and_show_image"]){
					$(clone).find(".right-container").addClass("absolute");
				}*/
				$(clone).find(".right-container").addClass("absolute");
				$(clone).find(".img-load").attr("src","assets/image/slider/"+$this.listSlider[i]["image"]);
				$(clone).find(".col_md_two").css("max-width","100%");
			}
			if($this.listSlider[i]['image_click'] != undefined){
				$(clone).find(".img-load").click(function(e){
					game.nextSlide();
				});
			}
			if($this.listSlider[i]['image_background'] != undefined){
				$(clone).find(".col_md_two .video").css("background",$this.listSlider[i]['image_background']);
			}
		}
		else{
			$(clone).find(".keterangan").css("padding","3.183023872679045vh");
			$(clone).find(".img-load").remove();	
		}

		if($this.listSlider[i]["ribbon"]){
			$(clone).find(".ribbon-content").html($this.listSlider[i]["ribbon"]);
			if($this.listSlider[i]["ribbon_css"]){
				$(clone).find(".ribbon_header").css($this.listSlider[i]["ribbon_css"]);
			}
		}
		else{
			$(clone).find(".rb-wrap").remove();
		}

		//content text
		if($this.listSlider[i]["text"]){
			if(!$this.listSlider[i]["image"] && !$this.listSlider[i]["ribbon"]){
				$(clone).find(".left-container").hide();
			}
			if($this.listSlider[i]["text"].indexOf("[first name]") != -1){
				var txt_name = $this.listSlider[i]["text"];
                var name = game.scorm_helper.getName();
                var firstname = name.split(", ");
                var real_name = txt_name.replace("[first name]",firstname[0]);
                $(clone).find(".keterangan").html(real_name);
			}else{
				$(clone).find(".keterangan").html($this.listSlider[i]["text"]);
			}
		}
		else{
			$(clone).find(".keterangan").remove();	
		}

		//content video
		if($this.listSlider[i]["video"]){
			$("#video").find("source").attr("src","assets/video/"+$this.listSlider[i]["video"]);
			$("#video1")[0].load();
			$this.addVideoEvent(clone);
		}
		else{
			$(clone).find(".bg-video").remove();
		}

		//content click and show
		if($this.listSlider[i]["click_and_show"]){
			var list = $this.listSlider[i]["click_and_show"];
			for (var l = 0; l < list.length; l++) {
				var cButton = $($this.ccButton).first().clone();
				$(cButton).find(".text").html(list[l]["title"]);
				$(clone).find(".click_and_show_wrapper").append(cButton);
				$(cButton).attr("index",l);
				$(cButton).click(function(e){
					$("#popupList").find(".slider_wrapper").html("");
					$("#popupList .title").html($(this).find(".text").html());
					for (var m = 0; m < list[parseInt($(this).attr("index"))]["list"].length; m++) {
						var cWrapper = $($this.cloneWrapper).first().clone();
						cWrapper.html("");
						for(var n = 0; n < list[parseInt($(this).attr("index"))]["list"][m].length; n++){
							var cList = $($this.cloneList).first().clone();
							$(cList).find(".point_desc").html(list[parseInt($(this).attr("index"))]["list"][m][n]);
							$(cWrapper).append(cList);
						}
						$("#popupList").find(".slider_wrapper").append(cWrapper);
					}
					$("#popupList .btn-close").click(function(e){
						$(this).off();
						$("#popupList").modal("hide");
						$("#popupList").find(".slider_wrapper").slick('unslick');
					});

					$("#popupList").modal({backdrop: 'static',keyboard: true,show: true});
					if(list[parseInt($(this).attr("index"))]["list"].length > 1){
						$this.sliderPopup();
					}
				});
			}
		}
		else{
			$(clone).find(".click_and_show_wrapper").remove();
		}
		if($this.listSlider[i]["click_and_show_image"]){
			if($this.listSlider[i]["click_and_show_image_background"]){
				$(clone).find(".click_and_show_image").css("background",$this.listSlider[i]["click_and_show_image_background"]);
			}
			var list = $this.listSlider[i]["click_and_show_image"];
			$($this.ccButton_image).find(".text").html($this.listSlider[i]["text"]);
			for (var l = 0; l < list.length; l++) {
				var cButton = $($this.ccButton_image).find(".image_click_and_show").first().clone();
				$(cButton).find(".text_icon").find("p").html(list[l]["title"]);
				if(list[l]["css"]){
					$(cButton).css(list[l]["css"]);
				}
				if(list[l]["invisible_title"]){
					$(cButton).find(".text_icon").hide();
				}else{
					$(cButton).find(".text_icon").show();
				}
				$(cButton).find(".icon_image").attr("src","assets/image/slider/"+list[l]["image"]);
				$(clone).find(".click_and_show_image").append(cButton);
				$(cButton).attr("index",l);
				if(list[l]["noclick"] != undefined || !list[l]["noclick"]){
					$(cButton).click(function(e){
						if($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["nextslide"]){
							game.audio.audioButton.play();
							game.setSlide($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["nextslide"]);
						}else{
							$("#popupList").find(".slider_wrapper").html("");
							$("#popupList .title").html($(this).find(".text_icon").html());
							$this.countSlide = $this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"].length;
							if($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["image_logo"]){
								$("#popupList .logo_image").find("img").attr("src","assets/image/slider/"+$this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["image_logo"]);
								$("#popupList").find(".logo_image").show();
							}else{
								$("#popupList").find(".logo_image").hide();
							}
							for (var m = 0; m < $this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"].length; m++) {
								var cWrapper = $($this.cloneWrapper).first().clone();
								cWrapper.html("");
								for(var n = 0; n < $this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"][m].length; n++){
									var cList = $($this.cloneList).first().clone();
									$(cList).find(".point_desc").html($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"][m][n]);
									$(cWrapper).append(cList);
								}
								$("#popupList").find(".slider_wrapper").append(cWrapper);
							}
							$("#popupList .button_wrapper").click(function(e){
								$(this).off();
								$("#popupList").modal("hide");
								$("#popupList").find(".slider_wrapper").slick('unslick');
							});

							$("#popupList").modal({backdrop: 'static',keyboard: true,show: true});
							if($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"].length > 1){
								$this.sliderPopup();
								$("#popupList .button_wrapper").hide();
							}
						}
					});
				}
			}
		}
		else{
			$(clone).find(".click_and_show_image").remove();
		}
		if($this.listSlider[i]["tutorial"]){
			$("#tutorial .tutorial").removeClass("active");
			if(!$("#tutorial .tutorial."+$this.listSlider[i]["tutorial"]["tutorial"]).hasClass("done")){
				$("#tutorial .tutorial."+$this.listSlider[i]["tutorial"]["tutorial"]).addClass("done");
				$("#tutorial .tutorial."+$this.listSlider[i]["tutorial"]["tutorial"]).addClass("active");
				$("#tutorial .tutorial."+$this.listSlider[i]["tutorial"]["tutorial"]+" .btn-standard").css($this.listSlider[i]["tutorial"]["button_css"]);
				$("#tutorial").modal({backdrop: 'static',keyboard: true,show: true});
			}
			$("#tutorial .start-game").click(function(e){
				game.audio.audioButton.play();
		        $("#tutorial").modal('hide');
		    });
		}

		$("#ulasan").append(clone);
		if($this.listSlider[i]["ribbon"]){
			var rb_height = $(clone).find(".ribbon_header").innerHeight();
			if($this.listSlider[i]["image"]){
				/*if($this.listSlider[i]["click_and_show_image"]){
					$(clone).find(".col_md_two").css("margin-top",rb_height+"px");
				}else{
					var pd_img_rb = $(clone).find(".ribbon_header").innerHeight()-20;
					$(clone).find(".col_md_two").css("margin-top",pd_img_rb+"px");
				}*/
				var pd_img_rb = $(clone).find(".ribbon_header").innerHeight()-20;
				$(clone).find(".col_md_two").css("margin-top",pd_img_rb+"px");
			}else{
				$(clone).find(".col_md_two").css("margin-top",rb_height+"px");
			}
		}

		if($this.listSlider[i]["button"]){
			for (var j = 0; j < $this.listSlider[i]["button"].length; j++) {
				var cloneBtn = $this.button.clone();
				var show_button = true;
				$(cloneBtn).html($this.listSlider[i]["button"][j]["text"]);
				if($this.listSlider[i]["button"][j]["css"]){
					$(cloneBtn).css($this.listSlider[i]["button"][j]["css"]);
				}
				$(clone).find(".button_wrapper").append(cloneBtn);
				if($this.listSlider[i]["click_and_show_image"]){
					var list_clone = $this.listSlider[i]["click_and_show_image"];
					for(var k = 0; k < list_clone.length; k++){
						if(list_clone[k]["rmpt"] == undefined){
							show_button = true;
							break;
						}else if(game.scorm_helper.getSingleData(list_clone[k]["text"]) == undefined){
							console.log(list_clone[k]["text"]);
							show_button = false;
							break;
						}
					}
					if(show_button){
						$(cloneBtn).show();
					}else{
						$(cloneBtn).hide();
					}
				}
				if($this.listSlider[i]["button"][j]["gotoSlide"]){
					$(cloneBtn).attr("gotoSlide",$this.listSlider[i]["button"][j]["gotoSlide"]);
					$(cloneBtn).click(function(e){
						$(this).off();
						game.audio.audioButton.play();
						game.scorm_helper.setSlide(parseInt($(this).attr("gotoSlide"))-1);
						game.nextSlide();
					});
				}
				else{
					if($this.listSlider[i]["video"]){
						$(cloneBtn).click(function(e){
							e.preventDefault();
							$("#popupAlertVideo").modal({backdrop: 'static',keyboard: true,show: true});
							$("#popupAlertVideo .popupalert-yes").click(function(e){
							    $(this).off();
							    $("#popupAlertVideo").modal("hide");
							    game.audio.audioButton.play();
							    game.nextSlide();
							});
							$("#popupAlertVideo .popupalert-no").click(function(e){
								$(this).off();
								$("#popupAlertVideo .popupalert-yes").off();
								game.audio.audioButton.play();
							    $("#popupAlertVideo").modal("hide");
							});
							$("#popupAlertVideo .img-popup").click(function(e){
								$(this).off();
								$("#popupAlertVideo .popupalert-yes").off();
								game.audio.audioButton.play();
							    $("#popupAlertVideo").modal("hide");
							});
						});
					}
					else{
						if($this.listSlider[i]["button"][0]["popup"]){
							if($this.listSlider[i]["button"][0]["popup_gotoSlide"]){
								var popup_nextslide = $this.listSlider[i]["button"][0]["popup_gotoSlide"];
							}
							var pop = $this.listSlider[i]["button"][0]["popup"];
							$(cloneBtn).click(function(e){
								$("#"+pop).modal({backdrop: 'static',keyboard: true,show: true});
								$("#"+pop+" .popupalert-yes").click(function(e){
								    $(this).off();
								    $("#"+pop).modal("hide");
								    game.audio.audioButton.play();
								    if(popup_nextslide){
								    	game.scorm_helper.setSlide(parseInt(popup_nextslide)-1);
										game.nextSlide();
								    }else{
								    	game.nextSlide();
									}
								});
								$("#"+pop+" .popupalert-no").click(function(e){
									$(this).off();
									$("#"+pop+" .popupalert-yes").off();
									game.audio.audioButton.play();
								    $("#"+pop).modal("hide");
								});
								$("#"+pop+" .img-popup").click(function(e){
									$(this).off();
									$("#"+pop+" .popupalert-yes").off();
									game.audio.audioButton.play();
								    $("#"+pop).modal("hide");
								});
							});
						}else{
							var tutorial = $this.listSlider[i]["button"][0]["tutorial"];
							var link = $this.listSlider[i]["button"][0]["link"];
							$(cloneBtn).click(function(e){
								if(tutorial){
									$("#tutorial .tutorial").removeClass("active");
									$("#tutorial .tutorial.link_web").addClass("done");
									$("#tutorial .tutorial.link_web").addClass("active");
									$("#tutorial").modal('show');
									$("#tutorial .start-game").click(function(e){
										$("#tutorial").modal('hide');
										$(this).off();
										game.audio.audioButton.play();
										window.open(link);
								    });
								}else{
									game.audio.audioButton.play();
									game.nextSlide();
								}
							});
						}
					}
				}
			}
		}
		else{
			$(clone).find(".button_wrapper").remove();
		}
	}
	setTimeout(function(){
		$(".list_slider").each(function(index){
			var image = $(this).find(".img-load").outerHeight()?$(this).find(".img-load").outerHeight():0;
			var ribbon = $(this).find(".rb-wrap").outerHeight()?$(this).find(".rb-wrap").outerHeight():0;
			var button = $(this).find(".button_wrapper").outerHeight()?$(this).find(".button_wrapper").outerHeight():0;
			var keterangan = $(this).find(".keterangan").outerHeight()?$(this).find(".keterangan").outerHeight():0;
			var device = $(window).outerHeight();
			if(!$this.listSlider[index]["click_and_show_image"]){
				if($this.listSlider[index]["image"] && $this.listSlider[index]["ribbon"]){
					var height_text = device-(image+ribbon+button)+40;
				}else if($this.listSlider[index]["image"]){
					var height_text = device-(image+ribbon+button)+20;
				}else{
					var height_text = device-(image+ribbon+button);
				}
				$(this).find(".right-container").css("max-height",height_text+"px");
			}else if($this.listSlider[index]["click_and_show_image"] && !$this.listSlider[index]["image"]){
				var height_cas = device-(image+ribbon+button+keterangan+20);
				$(this).find(".click_and_show_image").css("height",height_cas+"px");
			}
		});
	},1000);
	$('#ulasan').slick({
        dots: true,
        infinite: false,
        speed: 500,
        arrows: false
    });
      /*$("#ulasan").on('afterChange', function(event, slick, currentSlide, nextSlide){
         $(".img-load").each(function(e){
           var src = $(this).attr("src");
           $(this).attr("src",src);
         });
     });*/

    /*$("#popupList").slick({
    	dots: true,
    	infinite: false,
    	speed: 500
    });*/
};

Slider.prototype.sliderPopup = function() {
	var $this = this;
	$("#popupList").find(".slider_wrapper").slick({
		slidesToShow: 1,
		dots: true,
        infinite: false,
        speed: 500,
        arrows: false,
        variableWidth: true
	});
	$("#popupList").find(".slider_wrapper").on("afterChange", function(event, slick, currentSlide, nextSlide){
		if(currentSlide+1 == $this.countSlide){
			$("#popupList .button_wrapper").show();
		}else{
			$("#popupList .button_wrapper").hide();
		}
	});
	//$("#popupList").find(".slider_wrapper")[0].slick.refresh();
	/*$('.modal').on('shown.bs.modal', function (e) {
		$("#popupList").find(".slider_wrapper").resize();
	});*/
};