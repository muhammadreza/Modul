/**
* this is a class for generate game results either star or score.
* @class
* @author     NejiElYahya
*/

var Result = function(){

}


Result.prototype.init = function(current_settings) {
	var $this = this;
	$this.current_settings = current_settings;
	$.get("config/setting_result_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.win = e["win"];
		$this.lose = e["lose"];
		$this.setResult();
	},'json');
};

Result.prototype.setResult = function() {
	var $this = this;
	// remove jquery mobile
	$("html").removeClass("ui-mobile");
	game.audio.audioBackground.pause();
	game.audio.audioMotor.pause();
		
	// setting start or score
	var isScore = true;
	// get last game from scorm
	/*comment by elim*/
	var game_quiz = game.scorm_helper.getQuizResult(["game_slide_0"]);
	// count all game score range 0-5 for the star
	var score = parseInt(game_quiz["score"])/parseInt(game_quiz["total_soal"])*game.max_score;
	/*end comment by elim*/
	// count score range 0-100 for save to cmi.raw.score
	var count = score/game.max_score*100;
	// for score in text
	$(".result_score").html(Math.round(score));
	if(isScore){
		$(".star-wrapper").hide();
		$(".score_wrapper").show();
	}else{
		$(".star-wrapper").show();
		$(".score_wrapper").hide();
	}
	//$(".img-result-wrapper").css("padding-top",$(".div_header").innerHeight()-20);
	setTimeout(function(){
		var ribbon = $(".div_header").outerHeight();
		var image = $(".img-result-wrapper").outerHeight();
		var button = $(".button-wrapper").outerHeight();
		var device = $(window).outerHeight();
		var height_text = device-(image+button)+20;
		$(".result_wrapper").css("height",height_text+"px");
	},1000);
	// save score to to cmi.raw.score
	game.scorm_helper.sendResult(Math.round(count));
	// set duration and save to scorm
	game.scorm_helper.setDuration();
	// if score larger than minimum grade
	if(Math.round(score) >= game.min_score){
		// set to win
		// $(".slider-content").css({"background":"url('assets/image/result/bg-win.png') no-repeat center","background-size":"cover"});
		game.audio.audioMenang.play();
		game.scorm_helper.setStatus("passed");
		$(".btn-next-result").css({"display":"block"});
		$(".slider-content").addClass("win");
		$(".slider-content").css("background",$this.win["background_text"]);
		$(".ribbon_result .ribbon_win").attr("src","assets/image/result/"+$this.win["ribbon_image"]);
		$(".ribbon_result .title-result").html($this.win["ribbon_text"]);
		$(".ribbon_result .title-result").css("color",$this.win["ribbon_color"]);
		$(".img-menang img").attr("src","assets/image/result/"+$this.win["image"]);
		$(".div_header").css("background",$this.win["ribbon_background"]);
		$(".result_wrapper.win_wapper").css("background",$this.win["background_text"]);
		$(".result_wrapper.win_wapper .desc").html($this.win["text"]);
		$(".result_wrapper.win_wapper .desc").css("color",$this.win["color"]);
		$(".result_wrapper.win_wapper").css("color",$this.win["color"]);
		$(".slider-content.win").css("color",$this.win["color"]);
		$(".button").html($this.win["button_text"]);
		$(".button").css($this.win["button_css"]);
		// go to next slide
		$(".btn-next-result").click(function(e){
			game.audio.audioButton.play();
			//$(this).off();
			try{
	            var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
	            btn_back.click();
	        }
	        catch(e){
	            top.window.close();
	        }
		});
	}
	else{
		// set to lose
		// $(".slider-content").css({"background":"url('assets/image/result/bg-lose.png') no-repeat center","background-size":"cover"});
		game.scorm_helper.setStatus("failed");
		game.audio.audioKalah.play();
		$(".btn-tryagain").css({"display":"block"});
		$(".slider-content").addClass("lose");
		$(".slider-content").css("background",$this.lose["background_text"]);
		$(".ribbon_result .ribbon_lose").attr("src","assets/image/result/"+$this.lose["ribbon_image"]);
		$(".ribbon_result .title-result").html($this.lose["ribbon_text"]);
		$(".ribbon_result .title-result").css("color",$this.lose["ribbon_color"]);
		$(".img-kalah img").attr("src","assets/image/result/"+$this.lose["image"]);
		$(".div_header").css("background",$this.lose["ribbon_background"]);
		$(".result_wrapper.lose_wapper").css("background",$this.lose["background_text"]);
		$(".result_wrapper.lose_wapper .desc").html($this.lose["text"]);
		$(".result_wrapper.lose_wapper .desc").css("color",$this.lose["color"]);
		$(".result_wrapper.lose_wapper").css("color",$this.lose["color"]);
		$(".slider-content.lose").css("color",$this.lose["color"]);
		$(".button").html($this.lose["button_text"]);
		$(".button").css($this.lose["button_css"]);
		// click try again button
		$(".btn-tryagain").click(function(e){
			game.audio.audioButton.play();
			//$(this).off();
			try{
	            var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
	            btn_back.click();
	        }
	        catch(e){
	            top.window.close();
	        }
		});
	}

	// set star
	var flag=0;
	var count_star=0;

	var time_star = setInterval(function() {
		count_star++;
		if(count_star<=game.max_score){
			if(count_star<=score){
				$(".star-wrapper .star:nth-child("+count_star+")").addClass("active");	
			}
			$(".star-wrapper .star:nth-child("+count_star+")").fadeIn(1000);
			$(".star-wrapper .star:nth-child("+count_star+")").css({"display":"inline-block"});
			
		}
		else{
			clearInterval(time_star);
		}
	},200);
};