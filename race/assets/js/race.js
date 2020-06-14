var Race = function(){
	
}

Race.prototype.init = function(current_settings) {
	var $this = this;
	$this.current_settings = current_settings;
	$this.curr_soal = 0;

	$this.jeda_soal = 0;
	$this.jeda_list = 0;
	$this.jeda_mobil_1 = 0;
	$this.jeda_mobil_2 = 0;
	$this.jeda_mobil_3 = 0;
	$this.speed_road = 0;
	$this.mobilboss = 0;
	$this.health_boss = 0;

	$this.img_soal = $("#soal").first().clone();
	$this.list1 = $("#list1").first().clone();
	$this.list2 = $("#list2").first().clone();
	$this.list3 = $("#list3").first().clone();
	$this.mobil1 = $("#mobil1").first().clone();
	$this.mobil2 = $("#mobil2").first().clone();
	$this.mobil3 = $("#mobil3").first().clone();
	$this.road1 = $("#road1").first().clone();
	$this.road2 = $("#road2").first().clone();
	$this.road3 = $("#road3").first().clone();
	$this.health = $(".health_bar").first().clone();
	$this.hati = $(".hati img").first().clone();
	$this.soal_wrapper = $("#popupSoalRaceShooter .soal_wrapper").first().clone();
	$this.button_wrapper = $("#popupSoalRaceShooter .button_wrapper").first().clone();
	$this.choice = $("#popupSoalRaceShooter").find(".choice").first().clone();
	$(".soal").html("");
	$(".object").html("");
	$(".car").html("");
	$(".road").html("");
	$(".hati").html("");
	$(".health_wrapper").html("");
	$.get("config/setting_race_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.settings = e["settings"];
		$this.type = e["settings"]["type"];
		$this.isRandom = e["settings"]["random"];
		$this.colorbar = e["settings"]["color_bar"];
		$this.time = e["settings"]["duration"];
		$this.countsoal = e["count_soal"];
		$this.listmobil = e["mobil"];
		$this.logo_soal = e["logo_soal"];
		$this.soal = e["soal_balap"]?e["soal_balap"]:e["soal_eva"];
		$this.setTutorial();
	},"json");
};

Race.prototype.setTutorial = function() {
	var $this = this;
	console.log($this.soal);
	$("#tutorial .tutorial.race").addClass("done");
  	$("#tutorial .tutorial.race").addClass("active");
  	$("#tutorial").modal({backdrop: 'static',keyboard: true,show: true});
  	$("#tutorial .tutorial.race").find("div").first().slick({
      	dots: true,
      	infinite: false,
      	speed: 500,
      	prevArrow: false,
      	nextArrow: false
  	});
  	$("#tutorial .tutorial.race").find(".start-game").click(function(e){
    	$("#tutorial").modal('hide');
    	$this.checkData();
  	});
};

Race.prototype.checkData = function() {
	var $this = this;
	var x = 0;
	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
	if(ldata == undefined || ldata["answer"]== undefined || ldata["answer"]== null || ldata["answer"].length < $this.soal.length){
		var sdata = game.scorm_helper.setQuizData("game_slide_"+$this.current_settings["slide"],$this.getQuestion(),ldata);
		$this.list_question = sdata["list_question"];
		$this.curr_soal = sdata["answer"].length;
		$this.time = game.scorm_helper.getSingleData("timer")?game.scorm_helper.getSingleData("timer"):$this.time;
		$("#popupTimego").modal({backdrop: 'static',keyboard: true,show: true});
		setTimeout(function(){
			var cd = setInterval(function(){
				//game.audio.audioCountdown.play();
				x++;
				if(x==3){
					clearInterval(cd);
				}
			},1000);
		},1000);
		setTimeout(function(){
			$("#popupTimego").modal("hide");
			$this.createRoad();
			$this.controlBike();
		  	$this.updateSoal();
		  	if($this.type == "game" || $this.type == undefined){
		  		$(".distance_wrapper").show();
		  		$(".amunisi").hide();
		  		$this.setLife();
		  		$this.setDistance();
		  		$this.showMobil1();
			  	$this.showMobil2();
			  	$this.showMobil3();
		  	}else{
		  		$(".distance_wrapper").hide();
		  		$(".amunisi").show();
		  		if($this.time){
		  			$(".time").show();
		  			$this.startGameTimer();
		  		}else{
		  			$(".time").hide();
		  		}
		  		$this.setAmunisi();
		  		$this.setMobilBoss();
		  		$this.setHealth();
		  	}
		},6000);
	}else{
		game.nextSlide();
	}
};

Race.prototype.getQuestion = function() {
	var $this = this;
	var arr_quest = [];
	var arr_rand = [];
	var returnQuest = [];

	for (var i = 0; i < $this.soal.length; i++) {
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

	return returnQuest;
};

Race.prototype.checkLive = function() {
	var $this = this;
	$(".hati img").first().remove();
	game.scorm_helper.setSingleData("health",$(".hati img").length);
	if($(".hati img").length == 0){
		game.nextSlide();
	}
};

Race.prototype.controlBike = function() {
	var $this = this;
	var kanan = 25/100*$(".road_wrapper").outerWidth();
	var tengah = 50/100*$(".road_wrapper").outerWidth();
	var kiri = 75/100*$(".road_wrapper").outerWidth();

	game.audio.audioBackground.volume = 0;
	game.audio.audioMotor.volume = 0;
	game.audio.audioCrash.volume = 0;
	game.audio.audioBenar.volume = 0;
	game.audio.audioSalah.volume = 0;
	game.audio.audioGetItem.volume = 0;
	game.audio.audioCountdown.volume = 0;

	game.audio.audioBackground.play();
	game.audio.audioBackground.loop = true;
	game.audio.audioMotor.play();
	game.audio.audioMotor.loop = true;

	$this.bike = new Hammer(document.getElementById('road_wrapper'));
	$this.bike.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
	$("body").on('keydown',function(e){
		if(e.keyCode == 37){
			if(parseInt($(".motor").css("left")) == parseInt(tengah)){
				$(".motor").css("left",kanan);
	    	}else if(parseInt($(".motor").css("left")) == parseInt(kiri)){
	    		$(".motor").css("left",tengah);
	    	}
		}else if(e.keyCode == 39){
			if(parseInt($(".motor").css("left")) == parseInt(tengah)){
	    		$(".motor").css("left",kiri);
	    	}else if(parseInt($(".motor").css("left")) == parseInt(kanan)){
	    		$(".motor").css("left",tengah);
	    	}
		}
	});
	$this.bike.on("swipeleft swiperight", function(ev) {
		if(ev.type == "swipeleft"){
	    	if(parseInt($(".motor").css("left")) == parseInt(tengah)){
				$(".motor").css("left",kanan);
	    	}else if(parseInt($(".motor").css("left")) == parseInt(kiri)){
	    		$(".motor").css("left",tengah);
	    	}
	    }else if(ev.type == "swiperight"){
	    	if(parseInt($(".motor").css("left")) == parseInt(tengah)){
	    		$(".motor").css("left",kiri);
	    	}else if(parseInt($(".motor").css("left")) == parseInt(kanan)){
	    		$(".motor").css("left",tengah);
	    	}
	    }
	});
};

Race.prototype.updateSoal = function() {
	var $this = this;
	$this.index_soal = Math.floor(Math.random() * 3);
	$this.img_soal.attr("src","assets/image/cover/"+$this.logo_soal);
	if(!$(".soal").hasClass("pause")){
		if($this.index_soal == 0){
			$($this.img_soal).css("left","25%");
		}else if($this.index_soal == 1){
			$($this.img_soal).css("left","50%");
		}else{
			$($this.img_soal).css("left","75%");
		}
		if($this.jeda_soal > 1){
			$(".soal").append($this.img_soal);
			$($this.img_soal).css("top",parseInt($($this.img_soal).outerHeight())*-1);
			$($this.img_soal).animate({"top":$(window).outerHeight()},{duration:4000,easing:"linear",step:function(now, fx){
				$this.collisionSoal();
			}});
			if($this.type == "evaluation"){
				$this.swipeSoal();
			}
			setTimeout(function(){
				$this.jeda_soal = 0;
				$this.updateSoal();
			},4000);
		}else{
			setTimeout(function(){
				$($this.img_soal).remove();
				$this.jeda_soal++;
				$this.updateSoal();
			},2000);
		}
	}else{
		setTimeout(function(){
			$this.updateSoal();
		},2000);
	}
};

Race.prototype.swipeSoal = function() {
	var $this = this;
	if(!$(".soal").hasClass("pause")){
		setTimeout(function(){
			var geser = Math.floor(Math.random() * 3);
			if(geser == 0){
				$("#soal").css("left","25%");
			}else if(geser == 1){
				$("#soal").css("left","50%");
			}else{
				$("#soal").css("left","75%");
			}
			$this.swipeSoal();
		},2000);
	}
};

Race.prototype.collisionSoal = function() {
	var $this = this;
	var hits_soal = $(".motor").collision("#soal");
	if(hits_soal.length == 1){
		game.audio.audioGetItem.play();
		game.audio.audioBackground.pause();
		game.audio.audioMotor.pause();
		$($this.img_soal).remove();
		$(".car img").pause();
		$(".road_wrapper").pause();
		$("#road_wrapper").addClass("pause");
		$("#road_wrapper").addClass("list_come");
		$(".soal").addClass("pause");
		$(".car").addClass("pause");
		if($this.type == "game" || $this.type == undefined){
			$("#popupSoalRace img").attr("src","assets/image/cover/"+$this.soal[$this.list_question[$this.curr_soal]]["header"]);
			$("#popupSoalRace p").html($this.soal[$this.list_question[$this.curr_soal]]["text"]);
			$("#popupSoalRace .start-game").html($this.soal[$this.list_question[$this.curr_soal]]["button"]);
			$("#popupSoalRace").modal({backdrop: 'static',keyboard: true,show: true});
			var progress_bar = 100;
			$(".progress-bar").css("width",progress_bar+"%");
			$(".progress-bar").animate({"width":"0%"},5000,"linear",function(){
				game.audio.audioBackground.play();
				game.audio.audioMotor.play();
				$(".car img").resume();
				$(".road_wrapper").resume();
				$("#road_wrapper").removeClass("pause");
				$("#popupSoalRace").modal("hide");
				$(".object").removeClass("pause");
				$this.showList();
			});
		}else{
			if($this.soal[$this.list_question[$this.curr_soal]]["konteks"]){
				$this.setKonteks();
			}else{
				$this.setQuestion();
			}
			$("#popupSoalRaceShooter").modal({backdrop: 'static',keyboard: true,show: true});
		}
	}
};

Race.prototype.showList = function() {
	var $this = this;
	$($this.list1).attr("src","assets/image/cover/"+$this.soal[$this.list_question[$this.curr_soal]]["listimage"][0]["image"]);
	$($this.list2).attr("src","assets/image/cover/"+$this.soal[$this.list_question[$this.curr_soal]]["listimage"][1]["image"]);
	$($this.list3).attr("src","assets/image/cover/"+$this.soal[$this.list_question[$this.curr_soal]]["listimage"][2]["image"]);
	if(!$(".object").hasClass("pause")){
		if($this.jeda_list > 1){
			$(".object").append($this.list1);
			$(".object").append($this.list2);
			$(".object").append($this.list3);
			$($this.list1).css("top",parseInt($($this.list1).outerHeight())*-1);
			$($this.list2).css("top",parseInt($($this.list2).outerHeight())*-1);
			$($this.list3).css("top",parseInt($($this.list3).outerHeight())*-1);
			var ran = Math.floor(Math.random() * 3);
			if(ran == 0){
				var speed = 2000;
			}else if(ran == 1){
				var speed = 3000;
			}else if(ran == 2){
				var speed = 4000;
			}
			$($this.list1).animate({"top":$(window).outerHeight()},{duration:speed,easing:"linear",step:function(now, fx){
				$this.collisionList();
			}});
			var ran = Math.floor(Math.random() * 3);
			if(ran == 0){
				var speed = 2000;
			}else if(ran == 1){
				var speed = 3000;
			}else if(ran == 2){
				var speed = 4000;
			}
			$($this.list2).animate({"top":$(window).outerHeight()},{duration:speed,easing:"linear",step:function(now, fx){
				$this.collisionList();
			}});
			var ran = Math.floor(Math.random() * 3);
			if(ran == 0){
				var speed = 2000;
			}else if(ran == 1){
				var speed = 3000;
			}else if(ran == 2){
				var speed = 4000;
			}
			$($this.list3).animate({"top":$(window).outerHeight()},{duration:speed,easing:"linear",step:function(now, fx){
				$this.collisionList();
			}});
			setTimeout(function(){
				$this.jeda_list = 0;
				$this.showList();
			},4000);
		}else{
			setTimeout(function(){
				$($this.list1).remove();
				$($this.list2).remove();
				$($this.list3).remove();
				$this.jeda_list++;
				$this.showList();
			},2000);
		}
	}
};

Race.prototype.collisionList = function() {
	var $this = this;
	var right = true;
	var hits_list = $(".motor").collision(".object img");
	if(hits_list.length == 1){
		game.audio.audioGetItem.play();
		game.audio.audioBackground.pause();
		game.audio.audioMotor.pause();
		$("#road_wrapper").addClass("pause");
		$(".object").addClass("pause");
		$(".road_wrapper").pause();
		$($this.list1).remove();
		$($this.list2).remove();
		$($this.list3).remove();
		if(parseInt($(hits_list).attr("index")) == $this.soal[$this.list_question[$this.curr_soal]]["jawaban"]){
			game.audio.audioBenar.play();
			game.scorm_helper.pushAnswer(1,$this.soal[$this.list_question[$this.curr_soal]]["text"]);
			$(".modal_feedback").addClass("benar");
			$(".modal_feedback p").html($this.soal[$this.list_question[$this.curr_soal]]["feedback_benar"]);
			$this.curr_soal++;
			right = true;
		}else{
			game.audio.audioSalah.play();
			game.scorm_helper.pushAnswer(0,$this.soal[$this.list_question[$this.curr_soal]]["text"]);
			$(".modal_feedback").addClass("salah");
			$(".modal_feedback p").html($this.soal[$this.list_question[$this.curr_soal]]["feedback_salah"]);
			$this.curr_soal++;
			right = false;
		}
		$("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
		$("#modal_feedback").find(".close_feedback").click(function(e){
			$(this).off();
			game.audio.audioBackground.play();
			game.audio.audioMotor.play();
			$this.setDistance();
			$(".modal_feedback").removeClass("benar");
			$(".modal_feedback").removeClass("salah");
			$("#modal_feedback").modal("hide");
			$("#road_wrapper").removeClass("pause");
			$("#road_wrapper").removeClass("list_come");
			$(".road_wrapper").resume();
			$(".soal").removeClass("pause");
			$(".car").removeClass("pause");
			if(!right){
				$this.checkLive();
			}
			if($(".hati img").length == 0 || $this.curr_soal == $this.soal.length){
				game.nextSlide();
			}
		});
	}
};

Race.prototype.setLife = function() {
	var $this = this;
	var health = game.scorm_helper.getSingleData("health")?game.scorm_helper.getSingleData("health"):$this.settings["health"];
	for(var i = 0; i < $this.settings["health"]; i++){
		var $clone = $($this.hati).clone();
		$(".hati").append($clone);
	}
};

Race.prototype.setDistance = function() {
	var $this = this;
	var distance = 100/$this.soal.length;
	var total = $this.curr_soal*distance;
	$(".current_position").animate({"width":total+"%"},{duration:1000,easing:"linear",step:function(now, fx){
		var men_distance = $(".current_position").width()-4;
		$(".men").css("left",men_distance);
	}});
};

Race.prototype.showMobil1 = function() {
	var $this = this;
	var index = Math.floor(Math.random() * 8);
	if(!$(".car").hasClass("pause")){
		$($this.mobil1).attr("src","assets/image/cover/"+$this.listmobil[index]);
		if($this.jeda_mobil_1 > 3  && ($this.index_soal != 0 && $(".object img").length < 1 && ($("#mobil2").length < 1 || $("#mobil3").length < 1))){
			$(".car").append($this.mobil1);
			$($this.mobil1).css("top",parseInt($($this.mobil1).outerHeight())*-1);
			$($this.mobil1).animate({"top":$(window).outerHeight()},{duration:3000,easing:"linear",step:function(now, fx){
				$this.collisionCar();
			}});
			$this.jeda_mobil_1 = 0;
			setTimeout(function(){
				$this.showMobil1();
			},3000);
		}else{
			$($this.mobil1).remove();
			$this.jeda_mobil_1++;
			setTimeout(function(){
				$this.showMobil1();
			},2000);
		}
	}else{
		setTimeout(function(){
			$this.showMobil1();
		},2000);
	}
};

Race.prototype.showMobil2 = function() {
	var $this = this;
	var index = Math.floor(Math.random() * 8);
	if(!$(".car").hasClass("pause")){
		$($this.mobil2).attr("src","assets/image/cover/"+$this.listmobil[index]);
		if($this.jeda_mobil_2 > 2 && ($this.index_soal != 1 && $(".object img").length < 1 && ($("#mobil1").length < 1 || $("#mobil3").length < 1))){
			$(".car").append($this.mobil2);
			$($this.mobil2).css("top",parseInt($($this.mobil2).outerHeight())*-1);
			$($this.mobil2).animate({"top":$(window).outerHeight()},{duration:4000,easing:"linear",step:function(now, fx){
				$this.collisionCar();
			}});
			$this.jeda_mobil_2 = 0;
			setTimeout(function(){
				$this.showMobil2();
			},4000);
		}else{
			$($this.mobil2).remove();
			$this.jeda_mobil_2++;
			setTimeout(function(){
				$this.showMobil2();
			},2000);
		}
	}else{
		setTimeout(function(){
			$this.showMobil2();
		},2000);
	}
};

Race.prototype.showMobil3 = function() {
	var $this = this;
	var index = Math.floor(Math.random() * 8);
	if(!$(".car").hasClass("pause")){
		$($this.mobil3).attr("src","assets/image/cover/"+$this.listmobil[index]);
		if($this.jeda_mobil_3 > 2 && ($this.index_soal != 2 && $(".object img").length < 1 && ($("#mobil2").length < 1 || $("#mobil1").length < 1))){
			$(".car").append($this.mobil3);
			$($this.mobil3).css("top",parseInt($($this.mobil3).outerHeight())*-1);
			$($this.mobil3).animate({"top":$(window).outerHeight()},{duration:5000,easing:"linear",step:function(now, fx){
				$this.collisionCar();
			}});
			$this.jeda_mobil_3 = 0;
			setTimeout(function(){
				$this.showMobil3();
			},5000);
		}else{
			$($this.mobil3).remove();
			$this.jeda_mobil_3++;
			setTimeout(function(){
				$this.showMobil3();
			},2000);
		}
	}else{
		setTimeout(function(){
			$this.showMobil3();
		},2000);
	}
};

Race.prototype.collisionCar = function() {
	var $this = this;
	var hits_mobil = $(".motor").collision(".car img");
	if(hits_mobil.length == 1){
		game.audio.audioCrash.play();
		game.audio.audioBackground.pause();
		game.audio.audioMotor.pause();
		$this.bike.get('swipe').set({ enable: Hammer.DIRECTION_ALL });
		$(hits_mobil).remove();
		$(".soal").addClass("pause");
		$(".car").addClass("pause");
		$(".car img").pause();
		$("#soal").pause();
		$("#road_wrapper").addClass("pause");
		$(".road_wrapper").pause();
		$("#popupCrash").modal({backdrop: 'static',keyboard: true,show: true});
		setTimeout(function(){
			$this.checkLive();
			game.audio.audioBackground.play();
			game.audio.audioMotor.play();
			$(".car img").resume();
			$("#soal").resume();
			$("#road_wrapper").removeClass("pause");
			$(".road_wrapper").resume();
			if(!$("#road_wrapper").hasClass("list_come")){
				$(".soal").removeClass("pause");
				$(".car").removeClass("pause");
			}
			$("#popupCrash").modal("hide");
		},1000);
	}
};

Race.prototype.createRoad = function() {
	var $this = this;
	$(".road_wrapper").css({"background-position-y":"0vh"});
	$(".road_wrapper").animate({"background-position-y":"100vh"},1000,"linear",function(){
		$this.createRoad();
	});
};

Race.prototype.setAmunisi = function() {
	var $this = this;
	var total_amunisi = $this.list_question.length-$this.curr_soal;
	if(total_amunisi.toString().length > 1){
		$(".amunisi span").html(total_amunisi);
	}else{
		$(".amunisi span").html("0"+total_amunisi);
	}
};

Race.prototype.setMobilBoss = function() {
	var $this = this;
	/*if(!$this.time){
		if(game.scorm_helper.getSingleData("boss") == undefined){
			$this.mobilboss = 0;
		}else{
			$this.mobilboss = game.scorm_helper.getSingleData("boss");
		}
	}*/	
	if(game.scorm_helper.getSingleData("boss") == undefined){
		$this.mobilboss = 0;
	}else{
		$this.mobilboss = game.scorm_helper.getSingleData("boss");
	}
	$($this.mobil2).attr("src","assets/image/cover/"+$this.listmobil[$this.mobilboss]);
	$(".car").append($this.mobil2);
	$($this.mobil2).css("top",parseInt($($this.mobil2).outerHeight())*-1);
	$($this.mobil2).animate({"top":"10vh"},2000,"linear");
	//var move = setInterval();
};

Race.prototype.showRocket = function($flag) {
	var $this = this;
	var position_motor = parseInt($(".motor").css("left"))+40;
	var position_mobil = $("#mobil2").position();
	game.scorm_helper.setSingleData("boss",$this.mobilboss);
	$(".road_wrapper").resume();
	$(".bike").append("<img class='rocket' src='assets/image/cover/rocket.gif' style='left:"+position_motor+"px'>");
	setTimeout(function(e){
		var height_roket = $(".rocket").outerHeight();
		if($flag == 0){
			$(".rocket").animate({"left":position_mobil.left,"top":position_mobil.top},{duration:2000,easing:"linear",step:function(now, fx){
				game.audio.audioJet.play();
				var dor = $(".rocket").collision("#mobil2");
				var tinggi_mobil = parseInt(position_mobil.top+$("#mobil2").outerHeight())-65;
				if(dor.length == 1){
					game.audio.audioJet.pause();
					game.audio.audioExplode.play();
					$(".rocket").remove();
					$(".health_bar").last().remove();
					if($(".health_bar").length >0){
						game.scorm_helper.setSingleData("health_boss",$this.countsoal[$this.mobilboss+1]);
						$(".car").append("<img class='ledakan' src='assets/image/cover/ledakan.gif' id='mobil2' style='top: "+tinggi_mobil+"px;width: 35%;'>");
					}else{
						game.scorm_helper.setSingleData("health_boss",$(".health_bar").length);
						$(".car").find("img").first().remove();
						$(".car").append("<img class='ledakan' src='assets/image/cover/ledakan-besar-loop.gif' id='mobil2' style='top: 6vh;width: 70%;'>");
					}
					setTimeout(function(){
						$(".car").find(".ledakan").remove();
						$(".soal").removeClass("pause");
						$this.setAmunisi();
						game.audio.audioBackground.play();
						game.audio.audioMotor.play();
						if($(".health_bar").length < 1){
							$this.mobilboss++;
							game.scorm_helper.setSingleData("boss",$this.mobilboss);
							//game.scorm_helper.setSingleData("health",$this.mobilboss);
							$this.setMobilBoss();
							$this.setHealth();
						}
					},1000);
				}
			},complete:function(){
				if($this.curr_soal >= $this.list_question.length){
					game.nextSlide();
				}
			}});
		}else{
			$(".rocket").animate({"left":position_mobil.left,"top":(-1*height_roket)},{duration:2000,easing:"linear",start:function(){
				setTimeout(function(e){
					$(".car").append("<img class='miss' src='assets/image/cover/miss.gif' id='mobil2' style='top: 15vh;'>");
					setTimeout(function(e){
						$(".car").find(".miss").remove();
					},1000);
				},1000);
			},step:function(now, fx){
				game.audio.audioJet.play();
			},complete:function(e){
				game.audio.audioJet.pause();
				$(".rocket").remove();
				$(".soal").removeClass("pause");
				$this.setAmunisi();
				setTimeout(function(){
					if($this.curr_soal >= $this.list_question.length){
						game.nextSlide();
					}
				});
			}});
		}
	},1000);
};

Race.prototype.setHealth = function() {
	var $this = this;
	/*if(!$this.time){
		if(game.scorm_helper.getSingleData("health") == undefined){
			$this.health_boss = 0;
		}else{
			$this.health_boss = game.scorm_helper.getSingleData("health");
		}
	}*/
	if(game.scorm_helper.getSingleData("boss") == undefined){
		$this.health_boss = 0;
	}else{
		$this.health_boss = game.scorm_helper.getSingleData("boss");
	}
	if(game.scorm_helper.getSingleData("health_boss") == undefined){
		$this.health_boss2 = $this.countsoal[$this.health_boss];
	}else{
		$this.health_boss2 = game.scorm_helper.getSingleData("health_boss");
	}
	var width = (100/$this.countsoal[$this.health_boss])-1;
	for(var i = 0; i < $this.countsoal[$this.health_boss]; i++){
		var $clone = $this.health.clone();
		$($clone).css({"width":width+"%","background":$this.colorbar[i]});
		$(".health_wrapper").append($($clone));
	}
	for(var i = 0; i < $this.countsoal[$this.health_boss]-$this.health_boss2; i++){
		$(".health_bar").last().remove();
	}
	$(".health").show();
};

Race.prototype.startGameTimer = function() {
	var $this = this;
	$this.timer = setInterval(function() {
		if($this.time>0){
			$(".time span").html($this.setTimer());
			$(".time_soal span").html($(".time span").text());
		}
		else{
			clearInterval($this.timer);
			$this.timer = null;
			$(".time span").html("00:00");
			$(".time_soal span").html("00:00");
			$("#popupSoalRaceShooter").modal("hide");
			game.nextSlide();
		}
	},1000);
};

Race.prototype.setTimer = function() {
	var $this = this;
	
	$this.time = $this.time-1;
	game.scorm_helper.setSingleData("timer",$this.time);
	var diffMunites = Math.floor($this.time/60);
	var diffSec = Math.floor($this.time%60);

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

Race.prototype.setKonteks = function() {
	var $this = this;
	var $clone = $this.soal_wrapper.clone();
	var $clone_button = $this.button_wrapper.clone();
	$("#popupSoalRaceShooter .soal_wrapper").remove("");
	$("#popupSoalRaceShooter .button_wrapper").remove("");
	/*$clone.parent().removeClass("quiz");
	$clone.parent().addClass("konteks");*/
	if($this.soal[$this.list_question[$this.curr_soal]]["konteks"]["title"]){
		$clone.find(".title_soal").html($this.soal[$this.list_question[$this.curr_soal]]["konteks"]["title"]);
	}else{
		$clone.find(".title_soal").remove();
	}
	if($this.soal[$this.list_question[$this.curr_soal]]["konteks"]["text"]){
		$clone.find(".intro_soal").html($this.soal[$this.list_question[$this.curr_soal]]["konteks"]["text"]);
	}else{
		$clone.find(".intro_soal").remove();
	}
	$clone_button.find(".btn_next_submit").html($this.soal[$this.list_question[$this.curr_soal]]["konteks"]["button"]);
	$clone_button.find(".btn_next_submit").click(function(e){
		$(this).off();
		$this.setQuestion();
	});
	$("#popupSoalRaceShooter .modal_wrapper").removeClass("quiz");
	$("#popupSoalRaceShooter .modal_wrapper").addClass("konteks");
	$("#popupSoalRaceShooter .modal_wrapper").append($clone);
	$("#popupSoalRaceShooter .modal_wrapper").append($clone_button);
};

Race.prototype.setQuestion = function() {
	var $this = this;
	var $clone = $this.soal_wrapper.clone();
	var $clone_button = $this.button_wrapper.clone();
	$("#popupSoalRaceShooter .soal_wrapper").remove("");
	$("#popupSoalRaceShooter .button_wrapper").remove("");
	/*$clone.removeClass("konteks");
	$clone.addClass("quiz");*/
	if($this.soal[$this.list_question[$this.curr_soal]]["konteks"]){
		$clone.find(".btn-back_game").show();
	}else{
		$clone.find(".btn-back_game").hide();
	}
	if($this.soal[$this.list_question[$this.curr_soal]]["question"]["title"]){
		$clone.find(".title_soal").html($this.soal[$this.list_question[$this.curr_soal]]["question"]["title"]);
	}else{
		$clone.find(".title_soal").remove();
	}
	if($this.soal[$this.list_question[$this.curr_soal]]["question"]["image"]){
		$clone.find(".image_soal img").attr("src","assets/image/cover/"+$this.soal[$this.list_question[$this.curr_soal]]["question"]["image"]);
	}else{
		$clone.find(".image_soal").remove();
	}
	if($this.soal[$this.list_question[$this.curr_soal]]["question"]["text"]){
		if($this.soal[$this.list_question[$this.curr_soal]]["question"]["image"]){
			$clone.find(".text_soal").css("margin-top","3.183023872679045vh");
		}
		$clone.find(".text_soal").html($this.soal[$this.list_question[$this.curr_soal]]["question"]["text"]);
	}else{
		$clone.find(".text_soal").remove();
	}
	$clone.find(".choices").html("");
	var arr_temp = [];
	var arr_rand = [];

	for (var i = 0; i < $this.soal[$this.list_question[$this.curr_soal]]["question"]["pilihan"].length; i++) {
		arr_temp.push(i);
	}

	for (var i = 0; i < $this.soal[$this.list_question[$this.curr_soal]]["question"]["pilihan"].length; i++) {
		var rand = Math.floor((Math.random() * (arr_temp.length-1)));
		arr_rand.push(arr_temp[rand]);
		arr_temp.splice(rand, 1);
	}
	for(var i = 0; i < arr_rand.length; i++){
		var $choice = $this.choice.clone();
		$choice.addClass($this.soal[$this.list_question[$this.curr_soal]]["question"]["type"]);
		$choice.attr("index",$this.soal[$this.list_question[$this.curr_soal]]["question"]["pilihan"][arr_rand[i]]["index"]);
		$choice.html($this.soal[$this.list_question[$this.curr_soal]]["question"]["pilihan"][arr_rand[i]]["text"]);
		$clone.find(".choices").append($choice);
	}
	$this.settingChoice($clone,$clone_button);
	$clone_button.find(".btn-back_game").click(function(e){
		$(this).off();
		$this.setKonteks();
	});
	$("#popupSoalRaceShooter .modal_wrapper").removeClass("konteks");
	$("#popupSoalRaceShooter .modal_wrapper").addClass("quiz");
	$("#popupSoalRaceShooter .modal_wrapper").append($clone);
	$("#popupSoalRaceShooter .modal_wrapper").append($clone_button);
};

Race.prototype.settingChoice = function($clone,$clone_button) {
	var $this = this;
	if($this.soal[$this.list_question[$this.curr_soal]]["question"]["type"] == "mc"){
		$clone_button.find(".btn_next_submit").hide();
		$clone.find(".choice").click(function(e){
			$clone.find(".choice").off();
			if(!$(this).hasClass("active")){
				$(this).addClass("active");	
			}else{
				$(this).removeClass("active");
			}
			$this.cekJawaban($clone);
		});
	}else if($this.soal[$this.list_question[$this.curr_soal]]["question"]["type"] == "mmc"){
		$clone_button.find(".btn_next_submit").show();
		$clone.find(".choice").click(function(e){
			if(!$(this).hasClass("active")){
				$(this).addClass("active");	
			}else{
				$(this).removeClass("active");
			}
		});
		$clone_button.find(".btn_next_submit").click(function(e){
			$(this).off();
			$this.cekJawaban($clone);
		});
	}else if($this.soal[$this.list_question[$this.curr_soal]]["question"]["type"] == "tf"){
		$clone_button.find(".btn_next_submit").hide();
		$clone_button.find(".truefalse_wrapper").show();
		$clone_button.find("btn_true").click(function(e){
			$(this).off();
			$(this).addClass("active");
			$clone_button.find("btn_false").off();
			$this.cekJawaban($(this));
		});
		$clone_button.find("btn_false").click(function(e){
			$(this).off();
			$(this).addClass("active");
			$clone_button.find("btn_true").off();
			$this.cekJawaban($(this));
		});
	}
};

Race.prototype.cekJawaban = function($clone) {
	var $this = this;
	var $flag = 0;
	var $type = $this.soal[$this.list_question[$this.curr_soal]]["question"]["type"];
	if($type == "mc"|| $type == "mmc"){
		$($clone).find(".choice").each(function(index){
			if($(this).hasClass("active")){
				$(this).removeClass("active");
				var $cek=0;
				for (var i = 0; i < $this.soal[$this.list_question[$this.curr_soal]]["question"]["jawaban"].length; i++) {
					if($this.soal[$this.list_question[$this.curr_soal]]["question"]["jawaban"][i] == $(this).attr("index")){
						$cek=1;
						break;
					}
				}
				if($cek == 0){
					$flag=1;
					$(this).addClass("wrong");
				}
				else{
					$flag=0;
					$(this).addClass("right");
				}
			}
		});
	}else if($type == "tf"){
		if($clone.attr("index") == $this.soal[$this.list_question[$this.curr_soal]]["question"]["jawaban"][0]){
			$clone.addClass("right");
		}else{
			$clone.addClass("wrong");
		}
	}

	if($flag == 0){
		game.scorm_helper.pushAnswer(1,$this.soal[$this.list_question[$this.curr_soal]]["question"]["text"]);
		if($this.soal[$this.list_question[$this.curr_soal]]["question"]["feedback_benar"]){
			$(".modal_feedback").addClass("benar");
			$(".modal_feedback p").html($this.soal[$this.list_question[$this.curr_soal]]["question"]["feedback_benar"]);
			$("#popupSoalRaceShooter").modal("hide");
			$("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
			$("#modal_feedback .btn-game").click(function(e){
				$this.showRocket($flag);
			});
		}else{
			$("#popupSoalRaceShooter").modal("hide");
			$this.showRocket($flag);
		}
	}else{
		game.scorm_helper.pushAnswer(0,$this.soal[$this.list_question[$this.curr_soal]]["question"]["text"]);
		if($this.soal[$this.list_question[$this.curr_soal]]["question"]["feedback_salah"]){
			$(".modal_feedback").addClass("salah");
			$(".modal_feedback p").html($this.soal[$this.list_question[$this.curr_soal]]["question"]["feedback_salah"]);
			$("#popupSoalRaceShooter").modal("hide");
			$("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
			$("#modal_feedback .btn-game").click(function(e){
				$this.showRocket($flag);
			});
		}else{
			$("#popupSoalRaceShooter").modal("hide");
			$this.showRocket($flag);
		}
	}
	$this.curr_soal++;
};