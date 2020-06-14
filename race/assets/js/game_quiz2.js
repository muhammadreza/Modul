var GameQuiz = function(){
	var $this = this;

	// CUSTOM SETTINGS
	$this.type = "page";
	$this.isRandom = false;
	$this.showNumbering = true;
	$this.isTimer = false;
	$this.startNumber = 1;
}

GameQuiz.prototype.init = function(current_settings) {
	var $this = this;
	
	// INITIALIZE
	$this.current_settings = current_settings;
	$this.isswipe = false;
	$this.isStartTime = false;
	$this.question_data = [];
	$this.curr_soal=0;
	$this.isAppend=0;
	$this.count_benar=0;
	$this.curr_soal=0;
	$this.arr_alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
	$this.cek_jawaban_timeout = 900;

	// GET JSON
	$.get("config/setting_quiz_slide_"+$this.current_settings["slide"]+".json",function(e){
		
		// JIKA ADA SETTINGS DI JSON
		if(e["settings"]){
			$this.type = (e["settings"]["type"])?e["settings"]["type"]:$this.type;
			$this.isRandom = (e["settings"]["isRandom"])?e["settings"]["isRandom"]:$this.isRandom;
			$this.showNumbering = (e["settings"]["showNumbering"])?true:false;
			$this.isTimer = (e["settings"]["duration"])?true:false;
			$this.countTime = (e["settings"]["duration"])?e["settings"]["duration"]:$this.countTime;
			$this.startNumber = (e["settings"]["startNumber"])?e["settings"]["startNumber"]:$this.startNumber;
			if($this.type == "popup"){
				$this.popupType = (e["settings"]["popupType"])?e["settings"]["popupType"]:"order";
			}
			$this.totalQuestion = (e["settings"]["totalQuestion"])?e["settings"]["totalQuestion"]:e["list_question"].length;
		}
		$this.question_data = e["list_question"];

		// INITIALIZE GAME QUIZ TYPE
		if($this.type == "page" || $this.type == "slider"){
			$this.$clone = $(".slider-content").clone();
		}
		else if($this.type == "popup"){
			$this.$clone = $("#game_quiz_popup .game_quiz_popup").clone();
		}

		$this.$pilihan_clone = $($this.$clone).find(".pilihan").first().clone();
		$this.category_wrap = $($this.$clone).find(".category").first().clone();
		$this.select = $($this.$clone).find("select").first().clone();

		// INITIALIZE DRAG AND DROP
		$this.drop = $(".drop").first().clone();
		$this.drag = $(".drag").first().clone();
		$($this.drop).css({"display":"inline-block"});
		$($this.drag).css({"display":"inline-block"});
		$(".drop_wrapper").html("");
		$(".drag_wrapper").html("");

		// REMOVE ALL CONTENT
		$("#game_quiz_page").html("");
		$("#game_quiz_popup .modal-content").html("");

		$this.mulai_game();

	},'json');
};

GameQuiz.prototype.getQuestion = function() {
	var $this = this;
	var arr_quest = [];
	var arr_rand = [];
	var returnQuest = [];

	for (var i = 0; i < $this.question_data.length; i++) {
		arr_quest.push(i);
	}

	if($this.isRandom == true || ($this.type == "popup" && $this.popupType == "random")){
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

GameQuiz.prototype.mulai_game = function() {
	var $this = this;
	
	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
	game.temp = game.scorm_helper.getSingleData("temp");
	if(ldata == undefined){
		ldata = [];
	}
	
	if(game.temp == 1 || ldata["answer"]== undefined || ldata["answer"]== null || (game.temp == 0 && ldata["answer"].length < $this.question_data.length)){
		game.scorm_helper.setSingleData("temp",0);
		var sdata = game.scorm_helper.setQuizData("game_slide_"+$this.current_settings["slide"],$this.getQuestion(),ldata);
		$this.list_question = sdata["list_question"];
		$this.list_answer = sdata["answer"];
		$this.curr_soal = sdata["answer"].length;
		if($this.type == "page" || $this.type == "slider"){
			$this.show_question();
		}
		else if($this.type == "popup"){
			$this.init_button();
		}

	}
	else{
		game.scorm_helper.setSingleData("temp",0);
		game.nextSlide();
	}
};

GameQuiz.prototype.init_button = function() {
	var $this = this;
	var index = 0;

	// INITIAL TIME
	if($this.isTimer){
		$this.countTime+=1;
		$(".timer .text_time").html($this.setTimer());
		$(".timer").show();
	}
	else{
		$(".timer").remove();
	}
	$this.startGameTimer();

	$this.temp_button = game.scorm_helper.getSingleData("temp_button");
	if($this.temp_button == null || $this.temp_button == undefined){
		$this.temp_button = [];
	}

	$(".game_quiz_popup_pilihan").each(function(e){
		if($(this).attr("index") == undefined){
			$(this).attr("index",index);
		}
		index +=1;

		if($this.popupType == "order"){
			for (var i = 0; i < $this.temp_button.length; i++) {
				if(parseInt($(this).attr("index")) == $this.temp_button[i]){
					if($this.list_answer[i] == 1){
						$(this).addClass("done right");
					}
					else if($this.list_answer[i] == 0){
						$(this).addClass("done wrong");
					}
				}
			}
		}
		else{
			if($this.list_answer[parseInt($(this).attr("index"))] == 1){
				$(this).addClass("done right");
			}
			else if($this.list_answer[parseInt($(this).attr("index"))] == 0){
				$(this).addClass("done wrong");
			}
		}

		if(!$(this).hasClass("done")){
			$(this).click(function(e){
				// remove styling feedback
				$(".modal_feedback").removeClass("benar");
				$(".modal_feedback").removeClass("salah");

				if($this.popupType == "consistent" || $this.popupType == "random"){
					$this.curr_soal = parseInt($(this).attr("index"));
				}
				else{
					$this.curr_soal = $this.list_answer.length;
				}
				$this.show_question();
			});
		}
	});

	
};

GameQuiz.prototype.show_question = function() {
	var $this = this;
	var $clone;

	$clone = $this.$clone.first().clone();

	// get current soal
	var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];

	if(!$this.showNumbering){
		$clone.find(".number_question").hide();
	}
	// setting question numbering
	$clone.find(".curr_soal").html(parseInt($this.startNumber-1)+parseInt($this.curr_soal+1));
	$clone.find(".total_soal").html(($this.startNumber-1)+$this.list_question.length);
	
	// remove all content
	$clone.find(".pilihan_wrapper").html("");
	$clone.find(".category_wrapper").html("");

	// if image is available -> setting image
	if($current_soal["image"]){
		$clone.find("#img_soal").show();
		$clone.find("#img_soal").attr("src","assets/image/game_quiz/list_img/"+$current_soal["image"]);
	}
	else{
		$clone.find("#img_soal").hide();
	}

	$($clone).addClass($current_soal["type"]);

	if($current_soal["type"] == "mc"||
		$current_soal["type"] == "mmc"||
		$current_soal["type"] == "dadsequence"||
		$current_soal["type"] == "dadseqcat" ||
		$current_soal["type"] == "tf")
	{
		// setting question
		if($current_soal["question"]){
			$clone.find(".text_question").html($current_soal["question"]);
		}

		// random pilihan
		var arr_temp = [];
		var arr_rand = [];

		for (var i = 0; i < $current_soal["pilihan"].length; i++) {
			arr_temp.push(i);
		}

		for (var i = 0; i < $current_soal["pilihan"].length; i++) {
			var rand = Math.floor((Math.random() * (arr_temp.length-1)));
			arr_rand.push(arr_temp[rand]);
			arr_temp.splice(rand, 1);
		}

		console.log(arr_rand);
		// console.log($current_soal["type"]);
		if($current_soal["type"] != "tf"){
			// console.log("tf");
			$clone.find(".pilihan_wrapper").removeClass('hide');
			for (var i = 0; i < arr_rand.length; i++) {
				$app_pilihan = $this.$pilihan_clone.clone();
				$app_category = $this.category_wrap.clone();

				$app_pilihan.find(".txt_pilihan").html($current_soal["pilihan"][arr_rand[i]]["text"]);
				$app_pilihan.attr("index",$current_soal["pilihan"][arr_rand[i]]["index"]);
				$($app_pilihan).addClass($current_soal["type"]);
				$($app_pilihan).find(".bul_abjad").html($this.arr_alphabet[i]);

				$clone.find(".pilihan_wrapper").append($app_pilihan);

				if($this.question_data[$this.curr_soal]["type"] == "dadseqcat"){
					$($app_category).html($this.question_data[$this.curr_soal]["category"][i]);
					$clone.find(".category_wrapper").append($app_category);
				}
			}
		}else{
			$clone.find(".truefalse_wrapper").removeClass('hide');

			var flagTrueFalseText = 1;
			if(flagTrueFalseText == 1){
				$clone.find("#text_wrap-1").html($current_soal["pilihan"][0]["text"]);
				$clone.find("#text_wrap-2").html($current_soal["pilihan"][1]["text"]);
			}
		}
	}
	else if($current_soal["type"] == "dad"){
		$this.initDad($clone);
	}
	else if($current_soal["type"] == "dpd"){
		$this.initDpD($clone);
	}

	if($this.type == "page" || $this.type == "slider"){
		$("#game_quiz_page").append($clone);
		$($clone).attr("id","slide_"+"_"+$this.curr_soal);
		$($clone).attr("curr_soal",$this.curr_soal);
	}
	else if($this.type == "popup"){
		$("#game_quiz_popup .modal-content").html($clone);
		$("#game_quiz_popup").modal("show");
	}

	if($this.isAppend == 0){
		$this.isAppend = 1;

		if($this.type != "popup"){
			// INITIAL TIME
			if($this.isTimer){
				$this.countTime+=1;
				$(".timer .text_time").html($this.setTimer());
			}
			else{
				$(".timer").remove();
			}
		}

		if($this.type == "page"){
			$this.setTutorial();
			$.getScript( "assets/js/jquery.mobile-1.4.5.min.js", function( data, textStatus, jqxhr ) {
				$this.settingPage($clone);
			});
		}
		else{
			if($this.type!="popup"){
				$this.startGameTimer();
			}
			$this.settingPage($clone);
		}
		
	}
	else{
		$this.settingPage($clone);
	}

	if($this.type == "slider"){
		$this.curr_soal+=1;
		if($this.curr_soal<$this.list_question.length){
			$this.show_question();	
		}
		else{
			$('#game_quiz_page').slick({
		        dots: true,
		        infinite: false,
		        speed: 500,
		        adaptiveHeight:true,
		        slidesToShow: 1,
        		slidesToScroll: 1
	      	});
		}
	}

	if($this.isTimer && $this.type != "popup"){
		$(".timer").show();
	}
};

GameQuiz.prototype.initDad = function(slider_content) {
	var $this = this;
	var start=0;
	var width=0;
	var width_2 = 0;

	// get current soal
	var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];

	$(slider_content).find(".question-wrapper").remove();

	var word = $current_soal["question"];
	for (var i = 0; i < $current_soal["jawaban"].length; i++) {
		var idx = word.toLowerCase().indexOf($current_soal["jawaban"][i].toLowerCase());
		
		if(idx!=0){
			var sub_str = word.substring(start, idx);
			$(slider_content).find(".drop_wrapper").append("<span>"+sub_str+"</span>");
		}

		var $clone_drop = $($this.drop).first().clone();
		$clone_drop.attr("index",i);
		$clone_drop.css({"background":"white"});
		$(slider_content).find(".drop_wrapper").append($clone_drop);

		if(width==0){
			width = $current_soal["jawaban"][i].length*8;
			width = width+40;
		}
		$clone_drop.css({"width":width+"px"});

		start = idx+($current_soal["jawaban"][i].length);
		
		if(start<word.length && i == $current_soal["jawaban"].length-1){
			var sub_str = word.substring(start, word.length);
			$(slider_content).find(".drop_wrapper").append("<span>"+sub_str+"</span>");

			if((i+1) == $current_soal["jawaban"].length){
				$(slider_content).find(".drop_wrapper span").css({"height":"unset"});
			}
		}
	}

	for (var j = 0; j < $current_soal["pilihan"].length; j++) {
		var idx = -1;
		for (var k = 0; k < $current_soal["jawaban"].length; k++) {
			if($current_soal["pilihan"][j]["text"].toLowerCase() == $current_soal["jawaban"][k].toLowerCase()){
				idx = k;
				break;
			}
		}

		// if(width_2==0){
			// width_2 = $current_soal["pilihan"][j]["text"].length*8;
			// width_2 = width_2+40;
		// }

		var $clone = $($this.drag).first().clone();
		$($clone).attr("index",idx);
		$($clone).find(".txt_drag").html($current_soal["pilihan"][j]["text"]);
		$($clone).css({"width":width+"px"});
		$(slider_content).find(".drag_wrapper").append($clone);
	}
};

GameQuiz.prototype.initDpD = function(slider_content) {
	var $this = this;
	// get current soal
	var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];
	
	$(slider_content).find(".question-wrapper").remove();

	var word = $current_soal["question"];
	$(slider_content).find(".drop_down_wrapper").html("");

	var start=0;
	for (var i = 0; i < $current_soal["jawaban"].length; i++) {
		var idx = word.toLowerCase().indexOf($current_soal["jawaban"][i].toLowerCase());
		if(idx!=0){
			var sub_str = word.substring(start, idx);
			$(slider_content).find(".drop_down_wrapper").append("<span>"+sub_str+"</span>");
		}
		
		var $clone_select = $($this.select).first().clone();
		var width = $current_soal["jawaban"][i].length*4;
		width+=80;

		$clone_select.css({"width":width+"px"})
		$clone_select.attr("index",i);
		$clone_select.attr("name","pilihan_"+i);
		$(slider_content).find(".drop_down_wrapper").append($clone_select);
		start = idx+($current_soal["jawaban"][i].length);
		
		if(start<word.length && i == $current_soal["jawaban"].length-1){
			var sub_str = word.substring(start, word.length);
			$(slider_content).find(".drop_down_wrapper").append("<span>"+sub_str+"</span>");
		}
	}

	$(slider_content).find("select").each(function(e){
		var $t_idx = parseInt($(this).attr("index"));
		for (var j = 0; j < $current_soal["pilihan"][$t_idx].length; j++) {
			var val = $current_soal["pilihan"][$t_idx][j];
			$(this).append("<option value='"+val+"'>"+val+"</option>");
		}
	});
};

GameQuiz.prototype.setTutorial = function() {
	var $this = this;
	
	// get current soal
	var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];

	if($this.curr_soal<$this.question_data.length){
		$("#tutorial .tutorial").removeClass("active");
		if(!$("#tutorial .tutorial."+$current_soal["type"]).hasClass("done")){
			$("#tutorial .tutorial."+$current_soal["type"]).addClass("done");
			$("#tutorial .tutorial."+$current_soal["type"]).addClass("active");
			$("#tutorial").modal('show');
		}
		$("#tutorial .start-game").click(function(e){
			$this.startGameTimer();
			game.audio.audioButton.play();
	        $("#tutorial").modal('hide');
	    });
	}
};

GameQuiz.prototype.startGameTimer = function() {
	var $this = this;
	if(!$this.isStartTime){
		$this.isStartTime = true;
		if($this.isTimer){
			$this.time = setInterval(function() {
				if($this.countTime>0){
					$(".timer .text_time").html($this.setTimer());
				}
				else{
					clearInterval($this.time);
					$this.time = null;
					$(".timer .text_time").html("00:00");
					game.scorm_helper.setSingleData("temp",0);
					game.nextSlide();
				}
			},1000);
		}
	}
};
GameQuiz.prototype.setTimer = function() {
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

GameQuiz.prototype.settingPage = function($clone) {
	var $this = this;
	// get current soal
	var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];

	if($this.type == "page"){
		// setting prev
		if($this.curr_soal>0){
			$($clone).attr("data-prev","#slide_"+"_"+(parseInt($this.curr_soal)-1));	
		}else{
			$($clone).attr("data-prev","");	
		}
		// setting next
		if(parseInt($this.curr_soal)+1<$this.question_data.length){
			$($clone).attr("data-next","#slide_"+"_"+(parseInt($this.curr_soal)+1));
		}
		else{
			$($clone).attr("data-next","#result");
		}

		if($this.curr_soal == 0){
			$.mobile.changePage( "#slide_"+"_"+$this.curr_soal, { transition: "none"} );
		}

		$($clone).swipeleft(function( event ) {
		    $this.next();  
		});

		$($clone).find(".next-soal").click(function(e){
			$this.next();
		});
	}

	if($current_soal["type"] == "dadsequence" || $current_soal["type"] == "dadseqcat"){
		$clone.find(".pilihan_wrapper").sortable();
	}
	else if($current_soal["type"] == "tf"){
		console.log("tf");
		$clone.find(".btn-submit").hide();
		$clone.find(".btn-standard--true-2").click(function(e){
			$('.pilihan_2').off();
			$(this).css('background','#445566');
			$(this).addClass('selected');
			var index = $(this).attr("index");

			setTimeout(function(){
				// alert('true');
				$($clone).find(".btn-standard--false-2").off();
				$($clone).find(".next-soal").show();
				$this.cek_jawaban(index,"tf");
			},$this.cek_jawaban_timeout);
		});
		$clone.find(".btn-standard--false-2").click(function(e){
			$('.pilihan_2').off();
			$(this).css('background','#445566');
			$(this).addClass('selected');
			var index = $(this).attr("index");

			setTimeout(function(){
				// alert('false');
				$($clone).find(".btn-standard--true-2").off();
				$($clone).find(".next-soal").show();
				$this.cek_jawaban(index,"tf");
			},$this.cek_jawaban_timeout);
		});
	}
	else if($current_soal["type"] == "mc"){
		console.log('test');
		$clone.find(".btn-submit").hide();
		$clone.find(".pilihan").click(function(e){
			$clone.find(".pilihan").off();
			if(!$(this).hasClass("active")){
				$(this).addClass("active");	
				$(this).addClass("selected_2");	
			}
			else{
				$(this).removeClass("active");	
			}
			var element = $(this);
			// element.css('background','#1D8BEC');
			// alert('test');
			setTimeout(function(){
				if($this.type != "slider"){
					// alert('test 2');
					element.removeClass('selected_2');
					$clone.find(".pilihan").off();
					$($clone).find(".next-soal").show();
					console.log($clone);
					$this.cek_jawaban($clone,"mc");
				}
			},$this.cek_jawaban_timeout);
		});
	}
	else if($current_soal["type"] == "mmc"){
		$clone.find(".pilihan").click(function(e){
			if(!$(this).hasClass("active")){
				$(this).addClass("active");	
			}
			else{
				$(this).removeClass("active");	
			}
		});
	}
	else if($current_soal["type"] == "dad"){
		$(".drag").draggable({
			cursor: 'move',
			revert : function(event, ui) {
				if(!$this.isDrop){
					return true;
				}
				else{
					$(this).css({"top":"0","left":"0"});
				}
	        },
			drag: function( event, ui ) {
				$(".drop").css({"z-index":0});
				$(this).parent().css({"z-index":1});
				$this.isDrop = false;
				$this.selectedDrag = $(this);
			}
	    });

	    $('.drop').droppable({
		  drop: function( event, ui ) {
		  	$this.isDrop = true;
		  	if($(this).find(".drag").length>0){
		  		var target = $(this).find(".drag");
		  		$($clone).find(".drag_wrapper").append(target);
		  		$(this).append($this.selectedDrag);	
		  	}
		  	else{
		  		$(this).append($this.selectedDrag);	
		  	}
		  }
		});
	}

	if($this.type != "slider"){
		$($clone).find(".btn-submit").click(function(e){
			$(this).off();
			$(this).hide();

			if($current_soal["type"] == "dad"){
				$clone.find(".drag").draggable('disable');
			}
			else if($current_soal["type"] == "dadsequence" || $current_soal["type"] == "dadseqcat"){
				$clone.find(".pilihan_wrapper").sortable("disable");
			}

			$clone.find(".pilihan").off();
			$($clone).find(".next-soal").show();
			$this.cek_jawaban($clone,$current_soal["type"]);

			if($current_soal["type"] == "dadsequence" || $current_soal["type"] == "dadseqcat"){
				// kasi jawaban benarnya
				$clone.find(".pilihan_wrapper").html("");
				for (var i = 0; i < $current_soal["jawaban"].length; i++) {
					$app_pilihan = $this.$pilihan_clone.clone();
					$app_pilihan.find(".txt_pilihan").html($current_soal["pilihan"][$current_soal["jawaban"][i]]["text"]);
					$clone.find(".pilihan_wrapper").append($app_pilihan);
				}
			}
		});
	}
	else{
		if($this.curr_soal<$this.list_question.length-1){
			$($clone).find(".btn-submit").remove();
		}
		else{
			$($clone).find(".btn-submit").show();
			$($clone).find(".btn-submit").click(function(e){
				$(this).off();
				$this.cek_jawaban_slider();
			});
		}
	}
	
	$($clone).css({'visibility':'visible'});
};

GameQuiz.prototype.prev = function(prev) {
	var $this = this;
	if(prev){
        $( ":mobile-pagecontainer" ).pagecontainer( "change", prev, {
            transition: "slide",
            reverse: true
        });
    }
};

GameQuiz.prototype.next = function() {
	var $this = this;
	$(".modal_feedback").removeClass("benar");
	$(".modal_feedback").removeClass("salah");

	$this.setTutorial();

	var next = $(".ui-page-active").jqmData("next");

	$(".button_next_page").removeClass("active");
	var $this = this;

	if($this.isswipe){
		$this.isswipe = false;
		if($this.cekComplete()){
			game.scorm_helper.setSingleData("temp",1);
			game.nextSlide();
		}
		else{
			game.next(next);	
		}
	}
	
};

GameQuiz.prototype.cek_jawaban = function($clone,$type) {
	var $this = this;
	var $flag=0;
	var count = 0;
	$this.isswipe = true;
	// get current soal
	var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];

	// CEK JAWABAN BERDASARKAN TIPE NYA
	if($type == "mc"|| $type == "mmc"|| $type == "dadsequence" || $current_soal["type"] == "dadseqcat")
	{
		$($clone).find(".pilihan").each(function(index){
			if($type == "dadsequence" || $type == "dadseqcat"){
				if($(this).attr("index") != $current_soal["jawaban"][index]){
					$flag=1;
				}
			}
			else{
				if($(this).hasClass("active")){
					$(this).removeClass("active");
					var $cek=0;
					for (var i = 0; i < $current_soal["jawaban"].length; i++) {
						console.log($current_soal["jawaban"][i]);
						console.log($(this).attr("index"));
						if($current_soal["jawaban"][i] == $(this).attr("index")){
							$cek=1;
							break;
						}
					}

					if($cek == 0){
						$flag=1;
						$(this).addClass("wrong");
					}
					else{
						count++;
						$(this).addClass("right");
					}
				}
			}
		});
	}
	else if($type == "dad"){
		$($clone).find(".drop").each(function(e){
			if($(this).attr("index") != $(this).find(".drag").attr("index")){
				$flag=1;
			}
		});

		if($flag == 1){
			$(".ui-page-active .drag").each(function(e){
				$($clone).find(".drag_wrapper").append($(this));
			});

			$($clone).find(".drop").each(function(e){
				var $that = $(this);
				$(".drag").each(function(f){
					if($that.attr("index") == $(this).attr("index")){
						$($that).html($(this));
					}
				});
			});
		}
		else{
			$($clone).find(".drop").each(function(e){
				$(this).find(".drag").addClass("right");
			});
		}
	}
	else if($type == "dpd"){
		$($clone).find("select").each(function(e){
			if($(this).val().toLowerCase() != $current_soal["jawaban"][parseInt($(this).attr("index"))].toLowerCase()){
				$flag = 1;
			}
		});

		$($clone).find("select").each(function(e){
			var no = e;
			$(this).attr("disabled","disabled");
			$(this).find("option").each(function(el){
				for (var i = 0; i < $current_soal["jawaban"].length; i++) {
					console.log($(this).html().toLowerCase()+' <- '+$current_soal["jawaban"][no].toLowerCase());
					if($(this).html().toLowerCase() == $current_soal["jawaban"][no].toLowerCase()){
						$(this).attr("selected","selected");
					}
				}
			});
		});
	}
	else if($type == "tf"){
		// console.log($clone+" - "+$current_soal["jawaban"][0]);
		console.log($clone);
		console.log($current_soal["jawaban"][0]);
		if($clone != $current_soal["jawaban"][0]){
			$(".pilihan_2.selected").css("background","#EE2749");
			$flag = 1;
		}else{
			$(".pilihan_2.selected").css("background","#10BC63");
		}
	}

	if($type == "mc" || $type == "mmc"){
		if(count != $current_soal["jawaban"].length){
			$flag=1;
			$($clone).find(".pilihan").each(function(e){
				for (var i = 0; i < $current_soal["jawaban"].length; i++) {
					if($current_soal["jawaban"][i] == $(this).attr("index")){
						$(this).addClass("right");
						$($clone).find(".num_pilihan.point-"+$(this).attr("index")).addClass("right");
					}
				}
			});
		}
	}
	// END

	var arr_response = [];
	for (var i = 0; i < $this.list_question.length; i++) {
		arr_response.push($this.question_data[$this.list_question[i]]["question"]);
	}

	if($flag==0){
		$(".modal_feedback").addClass("benar");
		$(".game_quiz_popup_pilihan[index='"+$this.curr_soal+"']").addClass("right");
		$this.list_answer[$this.curr_soal]=1;
		game.audio.audioBenar.play();
		$(".alert").addClass("benar");
	}
	else{
		$(".modal_feedback").addClass("salah");
		$(".game_quiz_popup_pilihan[index='"+$this.curr_soal+"']").addClass("wrong");
		$this.list_answer[$this.curr_soal]=0;
		game.audio.audioSalah.play();
		$(".alert").addClass("salah");
	}
	game.scorm_helper.setAnswer($this.list_answer,arr_response);

	$(".game_quiz_popup_pilihan").off();
	$(".game_quiz_popup_pilihan[index='"+$this.curr_soal+"']").addClass("done");

	if($this.popupType == "order"){
		$this.temp_button.push($this.curr_soal);	
	}

	// SHOW FEEDBACK JIKA TERDAPAT FEEDBACK
	var isFeedback = false;
	if($current_soal["feedback"]){
		isFeedback = true;
		$("#modal_feedback .description p").html($current_soal["feedback"]);
	}
	else if($current_soal["feedback_benar"] && $current_soal["feedback_salah"]){
		isFeedback = true;
		if($flag == 0){
			$("#modal_feedback .description p").html($current_soal["feedback_benar"]);
		}
		else{
			
			$("#modal_feedback .description p").html($current_soal["feedback_salah"]);
		}
	}
	
	if(isFeedback){
		$("#modal_feedback").modal("show");
		$("#modal_feedback .close_feedback").click(function(e){
			$("#modal_feedback").modal("hide");
			/*if($this.cekComplete()){
				game.scorm_helper.setSingleData("temp",0);
				game.nextSlide();
			}*/
		});
	}
	// END

	setTimeout(function() {
		$($this.curr_card).hide();
		$(".alert").removeClass("salah");
		$(".alert").removeClass("benar");

		if(!$this.cekComplete()){
			if($this.type == "page"){
				if($this.curr_soal<$this.list_question.length-1){
					$this.curr_soal = $this.curr_soal+1;
					$this.show_question();
				}
			}
			else if($this.type == "popup"){
				$(".game_quiz_popup_pilihan").off();
				$this.init_button();
			}
		}
		else{
			if(!isFeedback && $this.type != "page"){
				game.scorm_helper.setSingleData("temp",0);
				game.nextSlide();
			}
		}
		$("#game_quiz_popup").modal("hide");

	},800);

	if($this.type == "page"){
		$(".button_next_page").addClass("active");
	}
};

GameQuiz.prototype.cek_jawaban_slider = function() {
	var $this = this;
	$(".slider-content").each(function(e){
		var $flag=0;
		var count = 0;
		var $current_soal = $this.question_data[$this.list_question[parseInt($(this).attr("curr_soal"))]];

		if($current_soal["type"] == "mc"|| $current_soal["type"] == "mmc"|| $current_soal["type"] == "dadsequence" || $current_soal["type"] == "dadseqcat")
		{
			$(this).find(".pilihan").each(function(index){
				if($current_soal["type"] == "dadsequence" || $current_soal["type"] == "dadseqcat"){
					if($(this).attr("index") != $current_soal["jawaban"][index]){
						$flag=1;
					}
				}
				else{
					if($(this).hasClass("active")){
						$(this).removeClass("active");
						var $cek=0;
						for (var i = 0; i < $current_soal["jawaban"].length; i++) {
							if($current_soal["jawaban"][i] == $(this).attr("index")){
								$cek=1;
								break;
							}
						}

						if($cek == 0){
							$flag=1;
						}
						else{
							count++;
						}
					}
				}
			});
		}
		else if($current_soal["type"] == "dad"){
			$(this).find(".drop").each(function(e){
				if($(this).attr("index") != $(this).find(".drag").attr("index")){
					$flag=1;
				}
			});
		}
		else if($current_soal["type"] == "dpd"){
			$(this).find("select").each(function(e){
				if($(this).val().toLowerCase() != $current_soal["jawaban"][parseInt($(this).attr("index"))].toLowerCase()){
					$flag = 1;
				}
			});
		}
		
		if($current_soal["type"] == "mc" || $current_soal["type"] == "mmc"){
			if(count != $current_soal["jawaban"].length){
				$flag=1;
			}
		}

		if($flag==0){
			$this.list_answer[$this.curr_soal]=1;
		}
		else{
			$this.list_answer[$this.curr_soal]=0;
		}
	});

	var arr_response = [];
	for (var i = 0; i < $this.list_question.length; i++) {
		arr_response.push($this.question_data[$this.list_question[i]]["question"]);
	}

	game.scorm_helper.setAnswer($this.list_answer,arr_response);
	game.scorm_helper.setSingleData("temp",0);
	game.nextSlide();
};

GameQuiz.prototype.cekComplete = function() {
	var $this = this;
	var flag = 0;
	for (var i = 0; i < $this.list_question.length; i++) {
		if($this.list_answer[i] == undefined || $this.list_answer[i] == null){
			flag = 1;
			break;
		}
	}

	return (flag == 1)?false:true;
};