var Swipe = function(){

}
Swipe.prototype.first_init = function(current_settings) {
	var $this = this;
	game.score = 0;
	$this.current_settings = current_settings;
	$this.curr_his = 0;
	$this.curr_misteri=1;
	$this.init_slider=false;
	$this.idx_pilih=-1;
	$this.curr_peti=null;
	$this.curr_jawab = -1;
	$this.time_peti = null;
	$this.time_feedback = null;
	$this.isTutorialSwipe = false;
	$this.modulReview = true;
	$this.feedback = false;
	$this.slick = false;
	$this.alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q"];

	$(".result_wrapper .result").removeClass("benar");
	$(".result_wrapper .result").removeClass("salah");
};
Swipe.prototype.init = function(current_settings) {
	var $this = this;
	$this.setTutorial();
	$this.first_init(current_settings);

	game.audio.audioBackground.loop = true;
	game.audio.audioBackground.play();

	$this.width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
	$this.height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
	var margin_width = $this.width*10/100;
	$this.width = $this.width - margin_width;
	if($this.width > 660){
		$(".sliderQuestion").css("width",660);
		$(".quest_clone").first().css("width",660);
	}else{
		$(".sliderQuestion").css("width",$this.width);
		$(".quest_clone").first().css("width",$this.width);
	}

	window.addEventListener("orientationchange", function() {
    	$this.width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		$this.height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    	if($this.height > 660){
			$(".sliderQuestion").css("width",660);
			$(".quest_clone").css("width",660);
		}else{
			$(".sliderQuestion").css("width",$this.height);
			$(".quest_clone").css("width",$this.height);
		}
		$this.quest_clone = $(".quest_clone").first().clone();
		$($this.quest_clone).find(".btn_submit").remove();
		$($this.quest_clone).find(".alert_jawab").remove();
	}, false);

	$this.history_wrap = $(".history_wrapper").first().clone();
	$this.alert_jwb = $("#popupQuestion .question_wrapper").find(".alert_jawab").first().clone();
	$this.btn_submit = $("#popupQuestion .question_wrapper").find(".btn_submit").first().clone();
	$this.quest_clone = $("#popupQuestion .quest_clone").first().clone();
	$this.pilihan_clone = $($this.quest_clone).find(".pilihan").first().clone();
	$this.point_dad_clone = $($this.quest_clone).find(".point-dad").first().clone();
	$this.pilihan_popup_clone = $("#game_quiz_popup").find(".pilihan").first().clone();

	$($this.quest_clone).find(".btn_submit").remove();
	$($this.quest_clone).find(".alert_jawab").remove();

	$("#how_to_play").modal({backdrop: 'static',keyboard: true,show: true});
	$("#how_to_play .btn_tutup").click(function(e){
        game.audio.audioButton.play();
        $("#how_to_play").modal("hide");
    });

	// $("#mystery_box .close").click(function(e){
	// 	game.audio.audioButton.play();
		
	// });

	$.get("config/setting_quiz_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.arr_data = e;
		$this.history = $this.arr_data["history"];
		$this.soal = $this.arr_data["list_question"];
		$this.settings = $this.arr_data["settings"];
		$this.mulai_game();
	},'json');
};

Swipe.prototype.mulai_game = function() {
	var $this = this;
	$this.isRand = $this.settings["random"];
	var arr_rand = [];
	var arr = [];

	for (var i = 0; i < $this.soal.length; i++) {
		arr.push(i);
	}

	if($this.isRand == true){
		do{
			var rand = Math.ceil(Math.random()*(arr.length-1));
			arr_rand.push(arr[rand]);
			arr.splice(rand,1);
		}while(arr.length>0);
	}
	else{
		arr_rand = arr;
	}

	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);

	if(game.temp == 1){
		$this.ldata_new = game.scorm_helper.setQuizData("game_slide_"+$this.current_settings["slide"],arr_rand);
		$this.list_quest = $this.ldata_new["list_question"];
		$this.curr_soal = $this.ldata_new["answer"].length;
		game.scorm_helper.setSingleData("curr_his",$this.curr_his);

		$this.first_initial();
	}
	else if(game.temp == 0 && ldata["answer"].length < game.total_soal){
		$this.ldata_new = ldata;
		$this.list_quest = ldata["list_question"];
		$this.curr_soal = ldata["answer"].length;
		$this.curr_his = parseInt(game.scorm_helper.getSingleData("curr_his"));
		$this.first_initial();
	}
	else{
		game.audio.audioBackground.pause();
		game.audio.audioBackground.currentTime = 0;

		game.scorm_helper.pushCompleteSlide();
		game.nextSlide();
	}
};

Swipe.prototype.first_initial = function() {
	var $this = this;
	$(".list_history").html("");
	$this.history_wrap.show();
	$this.first = false;
	$this.timer = false;
	$this.type = "slider";
	if($this.arr_data["settings"]["duration"] != undefined){
		$this.isTimer = true;
		$this.timer = true;
	}
	if($this.arr_data["settings"]["type"] != undefined){
		$this.type = $this.arr_data["settings"]["type"];
	}
	if($this.settings["all"] == undefined || !$this.settings["all"]){
		if(!$this.history[$this.curr_his]["is_box"] || ($this.history[$this.curr_his]["is_box"] && game.scorm_helper.getLengthListAns()>=$this.history[$this.curr_his]["count"])){
			$this.appendSlide();
		}
		$this.appendSlide();
	}else{
		$(".ava").hide();
		for(var i = 0; i < $this.history.length; i++){
			$this.appendSlide();
		}
	}

	$this.initSlider();
};

Swipe.prototype.appendSlide = function() {
	var $this = this;

	var $clone = $this.history_wrap.clone();
	$this.countTime = $this.arr_data["settings"]["duration"];
	$($clone).attr("index",$this.curr_his);
	//console.log("assets/image/swipe/building/page"+$this.curr_his+"/"+$this.history[$this.curr_his]["build1_m"]);
	/*$clone.find(".building .build_1 img").attr("src","assets/image/swipe/building/page"+$this.curr_his+"/"+$this.history[$this.curr_his]["build1_m"]);
	$clone.find(".building .build_1 source").attr("srcset","assets/image/swipe/building/page"+$this.curr_his+"/"+$this.history[$this.curr_his]["build1"]);
	$clone.find(".building .build_2 img").attr("src","assets/image/swipe/building/page"+$this.curr_his+"/"+$this.history[$this.curr_his]["build2_m"]);
	$clone.find(".building .build_2 source").attr("srcset","assets/image/swipe/building/page"+$this.curr_his+"/"+$this.history[$this.curr_his]["build2"]);*/
	$clone.find(".building .build_3 img").attr("src","assets/image/swipe/building/page"+$this.curr_his+"/"+$this.history[$this.curr_his]["build3_m"]);
	$clone.find(".building .build_3 source").attr("srcset","assets/image/swipe/building/page"+$this.curr_his+"/"+$this.history[$this.curr_his]["build3"]);
	
	$clone.find(".txt_sej span span").html($this.history[$this.curr_his]["tahun"]);

	if(!$this.first){
		if($this.history[$this.curr_his]["is_box"] && game.scorm_helper.getLengthListAns()<$this.history[$this.curr_his]["count"]){
			$(".img-people").attr("src","assets/image/swipe/people/"+$this.arr_data["people_idle"]);
			$(".pnjk_swipe").hide();
		}

		if(!$this.history[$this.curr_his]["is_box"]){
			$(".pnjk_swipe").show();
		}
		
		$this.first = true;
	}

	if($this.history[$this.curr_his]["is_box"]){
		$(".man").show();
		$clone.find(".box").show();
		$clone.find(".box").attr("idx",$this.curr_his);
		//console.log();
		if(game.scorm_helper.getLengthListAns()<$this.history[$this.curr_his]["count"]){
			$clone.find(".box .img_box").attr("src","assets/image/swipe/list_object/"+$this.history[$this.curr_his]["icon"]);
			$clone.find(".box").click(function(e){
				$(".man").hide();
				$(this).hide();
				if($this.modulReview){
					$this.init_soal($clone,$(this).attr("idx"));
				}else{
					$this.showQuestion();
				}
			});

			$this.curr_obj = $clone;
		}
		else{
			$clone.find(".box .img_box").attr("src","assets/image/swipe/list_object/"+$this.history[$this.curr_his]["icon_finish"]);
			$clone.find(".box .ptnjk_klik").hide();
		}

		$clone.find(".box").css($this.history[$this.curr_his]["box_css"]);
		
	}
	else{
		$clone.find(".box").hide();
		if($this.history[$this.curr_his]["icon"]){
			$clone.find(".box").show();
			$clone.find(".box").css($this.history[$this.curr_his]["box_css"]);
			$clone.find(".box .img_box").attr("src","assets/image/swipe/list_object/"+$this.history[$this.curr_his]["icon"]);
			$clone.find(".box .ptnjk_klik").hide();
		}
	}

	if(!$this.init_slider){
		$(".list_history").append($clone);
		$this.curr_his+=1;
	}
	else{
		$(".list_history").slick('slickAdd',$clone);
		$this.curr_his+=1;
	}
};

Swipe.prototype.init_soal = function($clone,idx) {
	var $this = this;
	$this.curr_idx = parseInt(idx);
	/*console.log("curr idx "+$this.curr_idx);
	console.log("curr soal "+$this.curr_soal);
	console.log("curr his "+$this.curr_his);*/
	var curr_quest = $this.soal;
	if($this.slick){
		$this.slick = false;
		$(".sliderQuestion").slick("unslick");
	}
	$(".sliderQuestion").html("");
	if($this.settings["all"] == undefined || !$this.settings["all"]){
		$this.setSliderOne($clone,idx);
	}else{
		$this.setSliderAll($clone,idx);
	}
	if(!$this.slick){
		$this.slick = true;
		$this.runSlick($(".sliderQuestion"));
	}
	if($this.timer){
		$(".timer .txt_timer .text_time").html($this.setTimer());
		$this.startGameTimer($(".sliderQuestion"));
	}

	$($this.btn_submit).click(function(e){
		if($this.timer){
			$this.isTimer = true;
			clearInterval($this.time);
		}
		$this.check_complete($clone);
	});

	$(".box .ptnjk_klik").hide();
	$("#popupQuestion").modal({backdrop: 'static',keyboard: true,show: true});
};

Swipe.prototype.setSliderAll = function($clone,idx) {
	var $this = this;
	var curr_quest = $this.soal;
	$this.curr_idx = parseInt(idx);

	for (var i = $this.curr_soal; i < $this.curr_soal+$this.history[$this.curr_idx]["num_quest"]; i++) {
		var clone_slider = $($this.quest_clone).clone();
		var idx_quest = parseInt($this.list_quest[i]);

		$(clone_slider).attr("index",idx_quest);
		$(clone_slider).find(".img_quiz").attr("src","assets/image/swipe/other/"+$this.history[$this.curr_idx]["logo"]);
   		$(clone_slider).find(".inst-question p").html(curr_quest[idx_quest]["title"]);
		$(clone_slider).find(".question").html(curr_quest[idx_quest]["question"]);
		$(clone_slider).find(".question_wrapper").addClass(curr_quest[idx_quest]["type"]);

		if($this.timer){
			$(clone_slider).find(".timer").show();
		}else{
			$(clone_slider).find(".timer").hide();
		}

		if(curr_quest[idx_quest]["type"] == "mc" || curr_quest[idx_quest]["type"] == "mmc" || curr_quest[idx_quest]["type"] == "dad"){
			
			$(clone_slider).find(".pilihan-wrapper").html("");
			$(clone_slider).find(".dad-wrapper").html("");
			
			for (var j = 0; j < curr_quest[idx_quest]["pilihan"].length; j++) {
				var pilihan = $($this.pilihan_clone).clone();
				var point_dad = $($this.point_dad_clone).clone();

				$(pilihan).find(".alphabet").html($this.alphabet[j]);
				$(point_dad).find("span").html(parseInt(j+1)+".");
				$(pilihan).find(".txt_pilhan").html(curr_quest[idx_quest]["pilihan"][j]["text"]);
				$(clone_slider).find(".pilihan-wrapper").append(pilihan);
				$(clone_slider).find(".dad-wrapper").append(point_dad);

			}
		}

		$(".sliderQuestion").append(clone_slider);

		if(i == $this.curr_soal+$this.history[$this.curr_idx]["num_quest"]-1){
			$(clone_slider).find(".question_wrapper").append($this.btn_submit);
		}

		$(clone_slider).find(".pilihan").click(function(e){
			if(curr_quest[parseInt($(this).parents(".quest_clone").attr("index"))]["type"] == "mmc"){
				if(!$(this).hasClass("active"))
					$(this).addClass("active");
				else
					$(this).removeClass("active");
			}
			else if(curr_quest[parseInt($(this).parents(".quest_clone").attr("index"))]["type"] == "mc"){
				$(this).parent().find(".pilihan").removeClass("active");
				$(this).addClass("active");
			}
		});

		if(curr_quest[idx_quest]["type"] == "dad"){
			$(clone_slider).find(".pilihan-wrapper").sortable();
		}

		if(curr_quest[idx_quest]["type"] == "tf"){
			$(clone_slider).find(".pilihan_tf_wrapper>div").click(function(e){
				$(this).parent().parent().find(".pilihan_tf_wrapper>div").removeClass("active");
				$(this).addClass("active");
			});
		}
	}
};

Swipe.prototype.setSliderOne = function($clone,idx) {
	var $this = this;
	var curr_quest = $this.soal;
	$this.curr_idx = parseInt(idx);
	
	for (var i = $this.curr_soal; i < $this.curr_soal+$this.history[$this.curr_his-1]["num_quest"]; i++) {
		var clone_slider = $($this.quest_clone).clone();
		var idx_quest = parseInt($this.list_quest[i]);

		$(clone_slider).attr("index",idx_quest);
		$(clone_slider).find(".img_quiz").attr("src","assets/image/swipe/other/"+$this.history[$this.curr_idx]["logo"]);
   		$(clone_slider).find(".inst-question p").html(curr_quest[idx_quest]["title"]);
		$(clone_slider).find(".question").html(curr_quest[idx_quest]["question"]);
		$(clone_slider).find(".question_wrapper").addClass(curr_quest[idx_quest]["type"]);

		if($this.timer){
			$(clone_slider).find(".timer").show();
		}else{
			$(clone_slider).find(".timer").hide();
		}

		if(curr_quest[idx_quest]["type"] == "mc" || curr_quest[idx_quest]["type"] == "mmc" || curr_quest[idx_quest]["type"] == "dad"){
			
			$(clone_slider).find(".pilihan-wrapper").html("");
			$(clone_slider).find(".dad-wrapper").html("");
			
			for (var j = 0; j < curr_quest[idx_quest]["pilihan"].length; j++) {
				var pilihan = $($this.pilihan_clone).clone();
				var point_dad = $($this.point_dad_clone).clone();

				$(pilihan).find(".alphabet").html($this.alphabet[j]);
				$(point_dad).find("span").html(parseInt(j+1)+".");
				$(pilihan).find(".txt_pilhan").html(curr_quest[idx_quest]["pilihan"][j]["text"]);
				$(clone_slider).find(".pilihan-wrapper").append(pilihan);
				$(clone_slider).find(".dad-wrapper").append(point_dad);

			}
		}

		$(".sliderQuestion").append(clone_slider);

		if(i == $this.curr_soal+$this.history[$this.curr_his-1]["num_quest"]-1){
			$(clone_slider).find(".question_wrapper").append($this.btn_submit);
		}

		$(clone_slider).find(".pilihan").click(function(e){
			if(curr_quest[parseInt($(this).parents(".quest_clone").attr("index"))]["type"] == "mmc"){
				if(!$(this).hasClass("active"))
					$(this).addClass("active");
				else
					$(this).removeClass("active");
			}
			else if(curr_quest[parseInt($(this).parents(".quest_clone").attr("index"))]["type"] == "mc"){
				$(this).parent().find(".pilihan").removeClass("active");
				$(this).addClass("active");
			}
		});

		if(curr_quest[idx_quest]["type"] == "dad"){
			$(clone_slider).find(".pilihan-wrapper").sortable();
		}

		if(curr_quest[idx_quest]["type"] == "tf"){
			$(clone_slider).find(".pilihan_tf_wrapper>div").click(function(e){
				$(this).parent().parent().find(".pilihan_tf_wrapper>div").removeClass("active");
				$(this).addClass("active");
			});
		}
	}
};

Swipe.prototype.showQuestion = function() {
	var $this = this;
	console.log($this.curr_his);
   	var $clone = $("#game_quiz_popup");
   	if(game.scorm_helper.getSingleData("curr_list_soal")!=undefined){
    	$this.curr_list_soal = game.scorm_helper.getSingleData("curr_list_soal");
  	}else{
    	$this.curr_list_soal = 1;
   	}
   	if(game.scorm_helper.getSingleData("count_soal")!=undefined){
    	$this.count_soal = game.scorm_helper.getSingleData("count_soal");
  	}else{
    	$this.count_soal = 1;
  	}

   	$($clone).addClass($this.soal[$this.list_quest[$this.curr_soal]]["type"]);   
   	$($clone).attr("curr_soal",$this.curr_soal);
   	$clone.find(".img_quiz").attr("src","assets/image/swipe/other/"+$this.history[$this.count_soal]["logo"]);
   	$clone.find(".inst-question p").html($this.soal[$this.list_quest[$this.curr_soal]]["title"]);
   	$clone.find(".curr_soal").html(parseInt($this.curr_list_soal));
   	$clone.find(".total_soal").html($this.history[$this.count_soal]["num_quest"]);

   	if($this.timer){
		$($clone).find(".timer").show();
	}else{
		$($clone).find(".timer").hide();
	}

   	$clone.find(".pilihan_wrapper").html("");
   	$clone.find(".category_wrapper").html("");
   	$(".drop_wrapper").html("");
   	$(".drag_wrapper").html("");
   	if($this.soal[$this.list_quest[$this.curr_soal]]["type"] == "dad"){
     	$($this.drop).css({"display":"inline-block"});
     	$($this.drag).css({"display":"inline-block"});
     	$this.initDad($clone);
   	}else{
     	$clone.find(".text_question").html($this.soal[$this.list_quest[$this.curr_soal]]["question"]);
     	if($this.soal[$this.list_quest[$this.curr_soal]]["image"]){
      		$clone.find(".row.image").css("display","block");
      		$clone.find(".row.image").attr("src","assets/image/ular-tangga/quiz-image/"+$this.soal[$this.list_quest[$this.curr_soal]]);
      	}else{
      		$clone.find(".row.image").css("display","none");
     	}

     	var arr = [];
     	var arr_rand = [];

     	for (var i = 0; i < $this.soal[$this.list_quest[$this.curr_soal]]["pilihan"].length; i++) {
         	arr.push(i);
     	}

     	for (var i = 0; i < $this.soal[$this.list_quest[$this.curr_soal]]["pilihan"].length; i++) {
         	var rand = Math.floor((Math.random() * (arr.length-1)));
         	arr_rand.push(arr[rand]);
         	arr.splice(rand, 1);
     	}

     	for (var i = 0; i < arr_rand.length; i++) {
         	$app_pilihan = $this.pilihan_popup_clone.clone();

         	$app_pilihan.find(".txt_pilihan").html($this.soal[$this.list_quest[$this.curr_soal]]["pilihan"][arr_rand[i]]["text"]);
         	$app_pilihan.attr("index",$this.soal[$this.list_quest[$this.curr_soal]]["pilihan"][arr_rand[i]]["index"]);
         
         	if($this.soal[$this.list_quest[$this.curr_soal]]["type"] == "mc"){
             	$($app_pilihan).addClass("mc");
             	$($app_pilihan).find(".bul_abjad").html($this.alphabet[i]);
         	}
         	else if($this.soal[$this.list_quest[$this.curr_soal]]["type"] == "mmc"){
             	$($app_pilihan).addClass("mmc");
         	}

         	$clone.find(".pilihan_wrapper").append($app_pilihan);
      	}
      	if($this.soal[$this.list_quest[$this.curr_soal]]["type"] == "dadsequence"){
         	$clone.find(".pilihan_wrapper").sortable();
      	}
      	if($this.timer){
			$(".timer .txt_timer .text_time").html($this.setTimer());
			$this.startGameTimer($clone);
		}
      	$this.setEvent($clone);
    }
};

Swipe.prototype.initDad = function(slider_content) {
  var $this = this;
  var start=0;
  var width=0;

  // get current soal
  var $current_soal = $this.soal[$this.list_quest[$this.curr_soal]];

  $(slider_content).find(".row.image").css("display","none");

  var word = $current_soal["question"];
  for (var i = 0; i < $current_soal["jawaban"].length; i++) {
    var idx = word.toLowerCase().indexOf($current_soal["jawaban"][i].toLowerCase());
    
    if(idx!=0){
      var sub_str = word.substring(start, idx);
      $(slider_content).find(".drop_wrapper").append("<span>"+sub_str+"</span>");
    }

    var $clone_drop = $($this.drop).first().clone();
    $clone_drop.attr("index",i);
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

    var $clone = $($this.drag).first().clone();
    $($clone).attr("index",idx);
    $($clone).find(".txt_drag").html($current_soal["pilihan"][j]["text"]);
    $($clone).css({"width":width+"px"});
    $(slider_content).find(".drag_wrapper").append($clone);
  }
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
  $this.setEvent(slider_content);
};

Swipe.prototype.setEvent = function($clone) {
  	var $this = this;

	if($this.soal[$this.list_quest[$this.curr_soal]]["type"] == "mc"){
	    $clone.find(".btn-submit").hide();
	    $clone.find(".pilihan").click(function(e){
	    	$clone.find(".pilihan").off();
	    	$($clone).find(".next-soal").show();
	    	if(!$(this).hasClass("active")){
	    		$(this).addClass("active"); 
	    	}else{
	        	$(this).removeClass("active");  
	    	}
	    	$this.cek_jawaban($clone,"mc");
	    });
	}else if($this.soal[$this.list_quest[$this.curr_soal]]["type"] == "mmc"){
	    $clone.find(".btn-submit").show();
	    $clone.find(".pilihan").click(function(e){
	      	if(!$(this).hasClass("active")){
	        	$(this).addClass("active"); 
	      	}
	      	else{
	        	$(this).removeClass("active");  
	      	}
	    });

	    $($clone).find(".btn-submit").click(function(e){
	      	$(this).off();
	     	$clone.find(".pilihan").off();
	      	$this.cek_jawaban($clone,"mmc");
	    });
	}else if($this.soal[$this.list_quest[$this.curr_soal]]["type"] == "dad"){
	    $clone.find(".btn-submit").show();
	    $($clone).find(".btn-submit").click(function(e){
	      	$(this).off();
	      	$this.cek_jawaban($clone,"dad");
	    });
	}else if($this.soal[$this.list_quest[$this.curr_soal]]["type"] == "dadsequence"){
	    $clone.find(".btn-submit").show();
	    $clone.find(".pilihan_wrapper").sortable("enable");
	    $($clone).find(".btn-submit").click(function(e){
	    	$(this).off();
	    	$clone.find(".pilihan_wrapper").sortable("disable");
	    	$this.cek_jawaban($clone,"dadsequence");
		});
	}

	$("#game_quiz_popup").modal({backdrop: 'static',keyboard: true,show: true});
};

Swipe.prototype.cek_jawaban = function($clone,$type) {
	var $this = this;
   	var $flag=0;
   	var count = 0;

   	if($type != "dad"){
      	$($clone).find(".pilihan").each(function(index){
        	if($(this).hasClass("active")){
            	$(this).removeClass("active");
             
             	var $cek=0;
             	for (var i = 0; i < $this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["jawaban"].length; i++) {
                	if($this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["jawaban"][i] == $(this).attr("index")){
                    	$cek=1;
                    	break;
                	}
            	}

            	if($cek == 0){
            		$(this).addClass("wrong");
            	}else{
            		count++;
            		$(this).addClass("right");
            	}
        	}
    	});
      	if(count == $this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["jawaban"].length){
        	$flag=0;
      	}else{
        	$($clone).find(".pilihan").each(function(e){
        		if($type != "dadsequence"){
            		$flag=1;
            		if(!$this.modulreview){
               			for (var i = 0; i < $this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["jawaban"].length; i++) {
               				if($this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["jawaban"][i] != $(this).attr("index")){
               					$(this).removeClass("right");
               					$(this).addClass("wrong");
               					$($clone).find(".num_pilihan.point-"+$(this).attr("index")).addClass("wrong");
               					$(this).find(".bul_ceklis").addClass("glyphicon-remove");
               				}else{
               					$(this).removeClass("wrong");
               					$(this).find(".bul_ceklis").removeClass("glyphicon-remove");
               					$(this).addClass("right");
               					$($clone).find(".num_pilihan.point-"+$(this).attr("index")).addClass("right");
               					break;
               				}
               			}
               		}
               	}else{
               		if($(this).attr("index") != $this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["jawaban"][e]){
               			$flag=1;
               		}
               		if(!$this.modulreview){
               			$clone.find(".pilihan_wrapper").html("");
               			for (var i = 0; i < $this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["jawaban"].length; i++) {
               				$app_pilihan = $this.pilihan_popup_clone.clone();
               				$app_pilihan.find(".txt_pilihan").html($this.soal[$this.list_quest[$this.curr_soal]]["pilihan"][$this.soal[$this.list_quest[$this.curr_soal]]["jawaban"][i]]["text"]);
               				$clone.find(".pilihan_wrapper").append($app_pilihan);
               			}
               		}
               	}
            });
        }
    }else{
    	$($clone).find(".drop").each(function(e){
    		if($(this).attr("index") != $(this).find(".drag").attr("index")){
    			$flag=1;
    		}
    	});

    	if(!$this.modulreview){
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
    	}else{
    		$($clone).find(".drop").each(function(e){
    			$(this).find(".drag").addClass("right");
    		});
    	}
    }

    $("#modal_feedback").find(".modal_feedback").removeClass("salah");
    $("#modal_feedback").find(".modal_feedback").removeClass("benar");

    if($flag == 0){
    	var response = $this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["question"];
    	game.scorm_helper.pushAnswer(1,response);
    	game.audio.audioBenar.play();
    	$(".alert").addClass("benar");
    	$("#modal_feedback").find(".modal_feedback").addClass("benar");
    	$("#modal_feedback").find(".img_feedback").attr("src","assets/image/swipe/people/"+$this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["feedback_benar"][0]);
    	$("#modal_feedback .description").find(".benar").html($this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["feedback_benar"][1]);
    	$this.curr_list_soal = parseInt($this.curr_list_soal)+1;
    	$this.curr_soal = parseInt($this.curr_soal)+1;
    	game.scorm_helper.setSingleData("curr_list_soal",$this.curr_list_soal);
    }else{
    	var response = $this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["question"];
    	game.scorm_helper.pushAnswer(0,response);
    	game.audio.audioSalah.play();
    	$(".alert").addClass("salah");
    	$("#modal_feedback").find(".modal_feedback").addClass("salah");
    	$("#modal_feedback").find(".img_feedback").attr("src","assets/image/swipe/people/"+$this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["feedback_salah"][0]);
    	$("#modal_feedback .description").find(".salah").html($this.soal[$this.list_quest[parseInt($($clone).attr("curr_soal"))]]["feedback_salah"][1]);
    	$this.curr_list_soal = parseInt($this.curr_list_soal)+1;
    	$this.curr_soal = parseInt($this.curr_soal)+1;
    	game.scorm_helper.setSingleData("curr_list_soal",$this.curr_list_soal);
    }
    if($this.curr_list_soal != parseInt($this.history[$this.count_soal]["num_quest"])+1){
    	setTimeout(function(){
	        $clone.removeClass($type);
	        $(".alert").removeClass("salah");
	        $(".alert").removeClass("benar");
	        clearInterval($this.time);
	        $this.countTime = $this.arr_data["settings"]["duration"];
	        $this.isTimer = true;
	        if($this.feedback){
	        	$("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
	        	$("#game_quiz_popup").modal("hide");
	          	$("#modal_feedback").find(".btn-standard--submit").click(function(e){
	            $(this).off();
	            $("#modal_feedback").modal("hide");
	            $("#game_quiz_popup").modal({backdrop: 'static',keyboard: true,show: true});
	            $this.showQuestion();
	          });
	        }else{
	          $this.showQuestion();
	        }
      	},800);
    }else{
    	setTimeout(function(){
	        $($this.curr_card).hide();
	        $clone.removeClass($type);
	        $(".alert").removeClass("salah");
	        $(".alert").removeClass("benar");
	        $("#game_quiz_popup").modal("hide");
	        clearInterval($this.time);
	        $this.countTime = $this.arr_data["settings"]["duration"];
	        $this.isTimer = true;
	        /*if($this.curr_his<$this.history.length){
	        	$this.curr_his += 1;
	        	game.scorm_helper.setSingleData("curr_soal",$this.curr_his);
	    	}*/
	        if($this.feedback){
	        	$("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
	        	$("#modal_feedback").find(".btn-standard--submit").click(function(e){
	            $(this).off();
	            $("#modal_feedback").modal("hide");
	            $this.curr_list_soal = 1;
	            if($flag == 0){
	              $this.count_soal = parseInt($this.count_soal)+1;
	            }
	            game.scorm_helper.setSingleData("curr_list_soal",$this.curr_list_soal);
	            game.scorm_helper.setSingleData("count_soal",$this.count_soal);
	            if($this.curr_soal < $this.list_quest.length){
	            	$this.appendSlide();
	        	}else{
	        		game.nextSlide();
	        	}
	          });
	        }else{
	        	$this.curr_list_soal = 1;
	        	if($flag == 0){
	        		$this.count_soal = parseInt($this.count_soal)+1;
	        	}
	        	game.scorm_helper.setSingleData("curr_list_soal",$this.curr_list_soal);
	        	game.scorm_helper.setSingleData("count_soal",$this.count_soal);
	        	if($this.curr_soal < $this.list_quest.length){
	            	$this.appendSlide();
	        	}else{
	        		game.nextSlide();
	        	}
	        }
      	},800);
    }
};

Swipe.prototype.setTimer = function() {
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

Swipe.prototype.startGameTimer = function($clone) {
	var $this = this;
	if($this.isTimer){
		$this.isTimer = false;
		if($this.timer){
			$this.time = setInterval(function() {
				if($this.countTime>0){
					$(".timer .txt_timer .text_time").html($this.setTimer());
				}else{
					clearInterval($this.time);
					$this.isTimer = true;
					$this.time = null;
					$(".timer .txt_timer .text_time").html("00:00");
					if($this.modulReview){
						$this.check_complete();
					}else{
						$this.countTime = $this.arr_data["settings"]["duration"];
						$this.cek_jawaban($clone,$this.soal[$this.list_quest[$this.curr_soal]]["type"]);
					}
				}
			},1000);
		}
	}
};

Swipe.prototype.check_complete = function($clone) {
	var arr_jwb = [];
	var arr_quest = [];
	var is_jawab = true;
	var $this = this;
	$(".quest_clone").each(function(num_soal){

		var idx = parseInt($(this).attr("index"));
		var curr_soal = $this.soal[idx];
		var is_salah = false;

		for (var i = 0; i < curr_soal["jawaban"].length; i++) {
			var flag = 0;
			if(curr_soal["type"]=="mc" || curr_soal["type"]=="mmc"){
				if(is_jawab && $(this).find(".pilihan.active").length == 0){
					is_jawab = false;
				}

				$(this).find(".pilihan").each(function(num_pilihan){
					if($(this).hasClass("active") && curr_soal["jawaban"][i] == parseInt(num_pilihan)){
						flag=1;
					}
				});
			}
			else if(curr_soal["type"]=="tf"){
				if(is_jawab && $(this).find(".btn_tf.active").length == 0){
					is_jawab = false;
				}

				$(this).find(".btn_tf").each(function(num_pilihan){
					if($(this).hasClass("active") && curr_soal["jawaban"][i] == parseInt(num_pilihan)){
						flag=1;
					}
				});
			}

			if(flag == 0){
				is_salah = true;
				break;
			}
		}

		if(!is_salah){
			arr_jwb.push(1);
			arr_quest.push(curr_soal["question"]);
		}
		else{
			arr_jwb.push(0);
			arr_quest.push(curr_soal["question"]);
		}
	});

	if(is_jawab){
		console.log("if");
		// lanjut
		$($this.btn_submit).off();
		for (var i = 0; i < arr_jwb.length; i++) {
			game.scorm_helper.pushAnswer(arr_jwb[i],arr_quest[i]);
		}
		$this.curr_soal = $this.curr_soal + arr_jwb.length;
		
		$(".alert_jawab").remove();
		$(".img-people").attr("src","assets/image/swipe/people/"+$this.arr_data["people_idle"]);
		$clone.find(".box .img_box").attr("src","assets/image/swipe/list_object/"+$this.history[$this.curr_his-1]["icon_finish"]);
		$clone.find(".box .ptnjk_klik").hide();

		$clone.find(".box").off();
		$("#popupQuestion").modal('hide');
		if($this.settings["all"] != undefined && $this.settings["all"]){
			if($this.curr_soal == $this.soal.length){
				game.scorm_helper.pushCompleteSlide();
				game.nextSlide();
			}
		}else{
			if($this.curr_his<$this.history.length){
				$this.appendSlide();
				//$this.curr_his+=1;
			}
			else{
				$(".sliderQuestion").html("");
				$(".sliderQuestion").append($this.quest_clone);
				$($this.quest_clone).find(".question_wrapper").append($this.btn_submit);
				$($this.quest_clone).find(".question_wrapper").append($this.alert_jwb);
				game.debug("complete game");
				
				game.audio.audioBackground.pause();
				game.audio.audioBackground.currentTime = 0;

				game.scorm_helper.pushCompleteSlide();
				game.nextSlide();
			}
		}
	}
	else{
		console.log("else");
		if(!$this.timer){
			$($this.alert_jwb).insertBefore(".btn_submit");
		}else{
			for (var i = 0; i < arr_jwb.length; i++) {
				game.scorm_helper.pushAnswer(arr_jwb[i],arr_quest[i]);
			}
			$this.curr_soal = $this.curr_soal + arr_jwb.length;
			
			$(".alert_jawab").remove();
			$(".img-people").attr("src","assets/image/swipe/people/"+$this.arr_data["people_idle"]);
			$this.curr_obj.find(".box .img_box").attr("src","assets/image/swipe/list_object/"+$this.history[$this.curr_his-1]["icon_finish"]);
			$this.curr_obj.find(".box .ptnjk_klik").hide();

			$this.curr_obj.find(".box").off();
			$("#popupQuestion").modal('hide');
			if($this.settings["all"] != undefined && $this.settings["all"]){
				if($this.curr_soal == $this.soal.length){
					game.scorm_helper.pushCompleteSlide();
					game.nextSlide();
				}
			}else{
				if($this.curr_his<$this.history.length){
					$this.appendSlide();
					//$this.curr_his+=1;
				}
				else{
					$(".sliderQuestion").html("");
					$(".sliderQuestion").append($this.quest_clone);
					$($this.quest_clone).find(".question_wrapper").append($this.btn_submit);
					$($this.quest_clone).find(".question_wrapper").append($this.alert_jwb);
					
					game.audio.audioBackground.pause();
					game.audio.audioBackground.currentTime = 0;

					game.scorm_helper.pushCompleteSlide();
					game.nextSlide();
				}
			}
		}
	}
};

Swipe.prototype.initSlider = function() {
	var $this = this;
	$this.init_slider = true;
	$('.list_history').slick({
	    slidesToShow: 1,
	    slidesToScroll: 1,
	    arrows: false,
	    infinite:false
	});
	$('.list_history').on('beforeChange', function(event, slick, currentSlide, nextSlide){
		if(!$this.isTutorialSwipe){
			$this.isTutorialSwipe = true;
			$(".pnjk_swipe").hide();
		}
	   $(".img-people").attr("src","assets/image/swipe/people/"+$this.arr_data["people_run"]);
	});
	$('.list_history').on('afterChange', function(event, slick, currentSlide, nextSlide){
		game.scorm_helper.setSingleData("curr_his",($this.curr_his-1));

		if(($this.curr_his-1) == currentSlide){
			if($this.curr_his < $this.history.length){
				if(!$this.history[currentSlide]["is_box"]){
					$this.appendSlide();
					$this.curr_his+=1;
				}
			}

			if(!$this.history[currentSlide]["is_box"]){
				$(".img-people").attr("src","assets/image/swipe/people/"+$this.arr_data["people_idle"]);
			}
			else{
				$(".img-people").attr("src","assets/image/swipe/people/"+$this.arr_data["people_idle"]);
			}
		}
		else{
			if($this.history[parseInt($this.curr_his-1)]["is_box"] && game.scorm_helper.getLengthListAns()<$this.history[parseInt($this.curr_his-1)]["count"]){
				$(".img-people").attr("src","assets/image/swipe/people/"+$this.arr_data["people_idle"]);
			}
			else{
				$(".img-people").attr("src","assets/image/swipe/people/"+$this.arr_data["people_idle"]);
			}
		}
	   
	});
};

Swipe.prototype.setTutorial = function() {
	$("#tutorial .tutorial.swipe").addClass("done");
  	$("#tutorial .tutorial.swipe").addClass("active");
  	$("#tutorial").modal({backdrop: 'static',keyboard: true,show: true});
  	$("#tutorial .tutorial.swipe").find("div").first().slick({
      	dots: true,
      	infinite: false,
      	speed: 500,
      	prevArrow: false,
      	nextArrow: false
  	});
  	$("#tutorial .tutorial.swipe").find(".start-game").click(function(e){
    	$("#tutorial").modal('hide');
  	});
};

Swipe.prototype.runSlick = function(elem) {
	elem.slick({
		dots: true,
		arrows: true,
		infinite: false,
		speed: 500,
		variableWidth: true
    });
    //elem[0].slick.refresh();
};