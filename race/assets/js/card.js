var Card = function(){
	var $this = this;
	// CUSTOM SETTINGS
	$this.isRandom = true;
	$this.isTimer = false;
	$this.countTime = 300;
	$this.type = "click";
	$this.pilihanType="text";
}

Card.prototype.init = function(current_settings) {
	var $this = this;
	$this.direction = 0;
	$this.current_settings = current_settings;
	if($this.isTimer){
		$this.countTime+=1;
		$(".timer").show();
		$(".timer .text_time").html($this.setTimer());
	}
	else{
		$(".timer").remove();
	}
	
	$.get("config/setting_card_slide_"+$this.current_settings["slide"]+".json",function(e){
		// JIKA ADA SETTINGS DI JSON
		if(e["settings"]){
			$this.type = (e["settings"]["type"])?e["settings"]["type"]:$this.type;
			$this.pilihanType = (e["settings"]["pilihanType"])?e["settings"]["pilihanType"]:$this.pilihanType;
			$this.isRandom = (e["settings"]["isRandom"])?e["settings"]["isRandom"]:$this.isRandom;
			$this.isTimer = (e["settings"]["duration"])?true:false;
			$this.countTime = (e["settings"]["duration"])?e["settings"]["duration"]:$this.countTime;
			$this.totalQuestion = (e["settings"]["totalQuestion"])?e["settings"]["totalQuestion"]:e["list_question"].length;
		}

		$this.question_data = e["list_question"];	
		$this.mulaiGame();
	},'json');
};

// random question
Card.prototype.getQuestion = function() {
	var $this = this;
	var arr_quest = [];
	var arr_rand = [];
	var returnQuest = [];

	for (var i = 0; i < $this.question_data.length; i++) {
		arr_quest.push(i);
	}

	if($this.isRandom == true){
		do{
			var rand = Math.ceil(Math.random()*(arr_quest.length-1));
			arr_rand.push(arr_quest[rand]);
			arr_quest.splice(rand,1);
		}while(arr_quest.length>0);

		returnQuest = arr_rand;
	}
	else{
		returnQuest = arr_quest;
	}

	var start = returnQuest.length-(returnQuest.length-$this.totalQuestion);
	var end = returnQuest.length-$this.totalQuestion;
	returnQuest.splice(start,end);

	return returnQuest;
};

Card.prototype.mulaiGame = function() {
	var $this = this;
	// ambil permainan terakhir user
	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
	game.temp = game.scorm_helper.getSingleData("temp");

	// baru pertama kali mulai atau resume
	if(game.temp == 1 || ldata["answer"]== undefined || ldata["answer"]== null || (game.temp == 0 && ldata["answer"].length < $this.question_data.length)){
		var sdata = game.scorm_helper.setQuizData("game_slide_"+$this.current_settings["slide"],$this.getQuestion(),ldata);
		$this.list_quest = sdata["list_question"];
		$this.curr_soal = sdata["answer"].length;
		$this.showQuestion();
	}
	else{
		// sudah selesai quiz
		game.nextSlide();
	}
};

Card.prototype.showQuestion = function() {
	var $this = this;
	
	$this.clone = $(".card").first().clone();
	$this.bullet_soal = $(".total_soal_wrapper .bullet_num").first().clone();

	$(".card_wrapper").html("");
	$(".total_soal_wrapper").html("");
	$(".text_time").html($this.setTimer());

	$("#tutorial .tutorial.card").addClass("done");
	$("#tutorial .tutorial.card").addClass("active");
			
	$("#tutorial").modal("show");

	$("#tutorial .start-game").click(function(e){
		if($this.isTimer){
			$this.time = setInterval(function() {
				if($this.countTime>0){
					$(".timer .text_time").html($this.setTimer());
				}
				else{
					$(".timer .text_time").html("00:00");
					$this.setResult();
				}
			},1000);
		}

		game.audio.audioButton.play();
		$(this).off();
		$("#tutorial").modal("hide");
	});

	for (var i = $this.list_quest.length-1; i >=0 ; i--) {
		
		var $bullet = $this.bullet_soal.clone();
		
		if(i>=$this.curr_soal){
			var $clone = $this.clone.clone();
			$($clone).css({
				'z-index':parseInt($this.list_quest.length-i),
				'top':parseInt(2*i)
		     });  
			$($clone).attr("question",parseInt(i));
			if($this.question_data[$this.list_quest[i]]["image"]){
				$($clone).find(".icon_card").attr("src","assets/image/card/list_soal_icon/"+$this.question_data[$this.list_quest[i]]["icon"]);
			}
			$($clone).find(".desc_card").html($this.question_data[$this.list_quest[i]]["desc"]);
			$(".card_wrapper").append($clone);
		}
		
		if(($this.list_quest.length-1)-i<$this.curr_soal){
			if(parseInt($this.arr_data["answer"][($this.list_quest.length-1)-i]) == 1){
				$($bullet).addClass("benar");
			}
			else{
				$($bullet).addClass("salah");
			}
		}
		$(".total_soal_wrapper").append($bullet);
		
	}
	$this.setPilihan();
};

Card.prototype.setTimer = function() {
	$this = this;
	
	$this.countTime = $this.countTime-1;
	var diffMunites = Math.floor($this.countTime/60);
	var diffSec = Math.floor($this.countTime%60);

	var str = '';
	if(diffMunites<10){
		str=str+"0"+diffMunites+":";
	}
	else if(diffMunites>=10){
		str=str+diffMunites+":";
	}

	if(diffSec<10){
		str=str+"0"+diffSec;
	}
	else if(diffSec>=10){
		str=str+diffSec;
	}

	return str;
};

Card.prototype.setPilihan = function() {
	var $this = this;
	
	var pilihan = $this.question_data[$this.list_quest[$this.curr_soal]]["pilihan"];

	$(".slider-content").find(".pilihan").each(function(e){
		console.log(pilihan[parseInt($(this).attr("index"))]);
		if($this.pilihanType == "text"){
			$(this).addClass("text");
			$(this).find(".text_wrap>span>span").html(pilihan[parseInt($(this).attr("index"))]);
		}
		else{
			$(this).addClass("image");
			$(this).find(".image_wrap .idle").attr("src","assets/image/card/"+pilihan[parseInt($(this).attr("index"))]["idle"]);
			$(this).find(".image_wrap .active").attr("src","assets/image/card/"+pilihan[parseInt($(this).attr("index"))]["active"]);	
		}		
	});

	$(".pilihan").removeClass("active");
	$(".pilihan").click(function(e){
		$(".pilihan").off();
		$(this).addClass("active");
		$this.cekJawaban($(this).attr("index"));
	});
};

Card.prototype.cekJawaban = function(index) {
	var $this = this;
	$(".card").each(function(e){
		if(parseInt($(this).attr("question")) == $this.curr_soal){
			$this.curr_card = $(this);
			if($this.direction == 0){
				$(this).addClass("quitLeft");
				$this.direction=1;
			}
			else{
				$(this).addClass("quitRight");
				$this.direction=0;
			}
		}
	});

	var response = $this.question_data[$this.list_quest[$this.curr_soal]]["desc"];

	if(parseInt(index) == $this.question_data[$this.list_quest[$this.curr_soal]]["jawaban"]){
		// benar
		$(".total_soal_wrapper>div:nth-child("+($this.curr_soal+1)+")").addClass("benar");
		game.scorm_helper.pushAnswer(1,response);
		game.audio.audioBenar.play();
		$(".alert").addClass("benar");
	}
	else{
		// salah
		game.scorm_helper.pushAnswer(0,response);
		$(".total_soal_wrapper>div:nth-child("+($this.curr_soal+1)+")").addClass("salah");
		game.audio.audioSalah.play();
		$(".alert").addClass("salah");
	}

	setTimeout(function() {
		$($this.curr_card).hide();
		$(".alert").removeClass("salah");
		$(".alert").removeClass("benar");
		$this.curr_soal=$this.curr_soal+1;

		if($this.curr_soal<$this.list_quest.length){
			$this.setPilihan();
		}
		else{
			$this.setResult();
		}
	},800);
};


Card.prototype.setResult = function() {
	var $this = this;
	$(".pilihan").off();
	game.nextSlide();
};