var VideoSlider = function(){
	
}

VideoSlider.prototype.init = function(current_settings) {
	var $this = this;
	$this.current_settings = current_settings;
	$this.videoclone = $(".video").first().clone();
	$.get("config/setting_video_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.video = e["listvideo"];
		$this.text = e["text"];
		$this.button = e["button"];
		$this.mulai();
	});
};

VideoSlider.prototype.mulai = function() {
	var $this = this;
	var index_pause = 0;
	var pause = true;
	if($this.text.indexOf("[first name]") != -1){
		var txt_name = $this.text;
        var name = game.scorm_helper.getName();
        var firstname = name.split(", ");
        var real_name = txt_name.replace("[first name]",firstname[1]);
        $(".keterangan").html(real_name);
	}else{
		$(".keterangan").html($this.text);
	}
	$(".button_next").html($this.button["text"]);
	$(".button_next").css($this.button["css"]);
	$(".col_md_two").css("width",$(window).width());
	$(".col_md_two").html("");
	for(var i = 0; i < $this.video.length; i++){
		var clone = $this.videoclone.clone();
		$(clone).attr("index",i);
		$(clone).find(".cover").attr("src","assets/image/slider/"+$this.video[i]["image"]);
		$(".col_md_two").append(clone);
	}
	$(".col_md_two").slick({
		dots: false,
	    infinite: false,
	    speed: 500,
	    arrows: false,
	    centerMode: true,
	    centerPadding: '6.0882800608828vh'
	});
	$(".video").click(function(e){
		$this.this_video = $(this);
		try{
            moleawiz.sendCommand("cmd.force_orientation");
        }catch(e){
        	console.log(e);
        }
        if($("#videoslider #video2")[0].hasAttribute("controls")) {
            $("#videoslider #video2")[0].removeAttribute("controls")   
        }
        $("#videoslider").find("source").attr("src","assets/video/"+$this.video[$this.this_video.attr("index")]["video"]);
		$("#videoslider #video2")[0].load();
		$("#videoslider #video2")[0].volume = 0;
		$this.playVideo();
		$this.setPause(index_pause);
	});
	$(".choices_wrapper .btn_true").click(function(e){
		e.preventDefault();
		console.log(index_pause);
		if($this.video[$this.this_video.attr("index")]["pause"] == undefined || $this.video[$this.this_video.attr("index")]["pause"][index_pause] == parseInt($("#videoslider #video2")[0].duration) || (parseInt($("#videoslider #video2")[0].currentTime) >= parseInt($("#videoslider #video2")[0].duration) && index_pause == $this.video[$this.this_video.attr("index")]["pause"].length)){
			try{
	            moleawiz.sendCommand("cmd.force_potrait");
	        }catch(e){
	        	console.log(e);
	        }
	        $(".bg_choices").hide();
			$this.stopVideo();
			index_pause = 0;
		}else{
			$(".bg_choices").hide();
			index_pause++;
			$this.setPause(index_pause);
			$this.playVideo();
		}
	});
	$(".choices_wrapper .btn_false").click(function(e){
		$(".bg_choices").hide();
		if($this.video[$this.this_video.attr("index")]["pause"] == undefined){
			$("#videoslider #video2")[0].currentTime = 0;
		}else{
			if($this.video[$this.this_video.attr("index")]["pause"][index_pause] != undefined || $this.video[$this.this_video.attr("index")]["pause"][index_pause] == parseInt($("#videoslider #video2")[0].duration)){
				$("#videoslider #video2")[0].currentTime = parseInt($this.video[$this.this_video.attr("index")]["pause"][index_pause])-30;
			}else{
				$("#videoslider #video2")[0].currentTime = parseInt($this.video[$this.this_video.attr("index")]["pause"][index_pause-1]);
			}
		}
		$this.setPause(index_pause);
		$this.playVideo();
	});
	$(".button_next").click(function(e){
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
};

VideoSlider.prototype.playVideo = function() {
	$("#videoslider").show();
	$("#videoslider #video2").show();
	$("#videoslider video").get(0).play();
};

VideoSlider.prototype.stopVideo = function() {
	$("#videoslider").hide();
	$("#videoslider #video2")[0].pause();
	$("#videoslider #video2")[0].currentTime = 0;
}

VideoSlider.prototype.setPause = function(index_pause) {
	var $this = this;
	var interval = setInterval(function(){
		if($this.video[$this.this_video.attr("index")]["pause"] != undefined){
			if(parseInt($("#videoslider #video2")[0].currentTime) >= parseInt($("#videoslider #video2")[0].duration) || parseInt($("#videoslider #video2")[0].currentTime) > $this.video[$this.this_video.attr("index")]["pause"][index_pause]){
				$this.showChoices(interval);
			}
		}else{
			if($("#videoslider #video2")[0].currentTime >= $("#videoslider #video2")[0].duration){
				$this.showChoices(interval);
			}
		}
	},1000);
};

VideoSlider.prototype.showChoices = function(interval) {
	var $this = this;
	clearInterval(interval);
	$(".bg_choices").show();
	$("#videoslider #video2")[0].pause();
};