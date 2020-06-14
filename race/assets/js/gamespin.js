var GameSpin = function(){
	var $this = this;
	this.spin = new Spin();
}

GameSpin.prototype.init = function(current_settings) {
	var $this = this;
	$this.current_settings = current_settings;
	$this.attemp = game.attemp;
	$.get("config/setting_quiz_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.soal = e['list_question'];
		$this.max_time = e['settings']['duration'];
		$this.arr_max_soal = e["num_quest"];
		$this.mulai_game();
	},'json');
};

GameSpin.prototype.mulai_game = function() {
	var $this = this;
	$this.isRand = true;
	var arr_rand = [];
	var arr = [];
	$this.arr_deg = [45,315,225,135];
	$this.temp_num = [0,1,2,3];

	$this.pilihan_mc = $("#game_quiz_popup_ulartangga .pilihan").first().clone();
	$this.pilihan_mmc = $(".pilihan-mmc").first().clone();
	$this.pilihan_tf = $(".pilihan-tf").first().clone();
	//show modal tutorial
	//$(".modal#tutorial .tutorial").show();
    //$(".modal#tutorial").modal("show");
    // $('#ulasan').slick('unslick');
    $('#ulasan').not('.slick-initialized').slick({
	    dots: true,
       	infinite: false,
    });
    for (var i = 0; i < $this.soal.length; i++) {
		var arr2 = [];
		for (var j = 0; j < $this.soal[i].length; j++) {
			arr2.push(j);
		}
		arr.push(arr2);
	}
	if($this.isRand == true){
		var new_arr = [];
		for (var i = 0; i < arr.length; i++) {
			var temp = arr[i];
			var new_arr2 = [];
			do{
				var rand = Math.ceil(Math.random()*(temp.length-1));
				new_arr2.push(temp[rand]);
				temp.splice(rand,1);
			}while(temp.length>0 && new_arr2.length<$this.arr_max_soal[i]);
			new_arr.push(new_arr2);
		}

		arr_rand = new_arr;
	}
	else{
		arr_rand = arr;
	}
	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
	if(game.temp == 1 ){
		$this.arr_data = game.scorm_helper.setQuizDataSpinner("game_slide_"+$this.current_settings["slide"],arr_rand);
		console.log($this.arr_data);
		$this.list_quest = $this.arr_data["list_question"];
		console.log($this.list_quest);
		$this.first_initial();
	}
	else if(game.temp == 0 && !$this.isCompleteGame(ldata["list_question"])){
		$this.arr_data = ldata;
		$this.list_quest = ldata["list_question"];
		$this.first_initial();
	}
	else{
		$this.setDef();
		game.scorm_helper.pushCompleteSlide();
		game.nextSlide();
	}
};

GameSpin.prototype.setDef = function() {
	var $this = this;
	$(".pilihan-wrap").html("");
	$(".pilihan-wrap").append($this.pilihan_mmc);
	$(".pilihan-wrap").append($this.pilihan_tf);
	$(".pilihan-wrap").append($this.pilihan_mc);		
};

GameSpin.prototype.first_initial = function() {
	var $this = this;
	$this.waktu_mulai = new Date();
	//game.scorm_helper.set_start_time();
	$this.isTime = false;
	$this.show_question();
};

GameSpin.prototype.setCountTime = function() {
	var $this = this;
	$this.time = setInterval(function() {
		var str = $this.setTimer();
		if($this.isStarting){
			if($this.count>=0){
				$(".text_time").html(str);	
			}
			else{
				clearInterval($this.time);
				$this.time = null;
				$this.isStarting = false;
				$(".btn-pass").off();
				$(".btn-submit").off();
				var temp = $this.list_quest[$this.curr_category][$this.arr_data["answer"][$this.curr_category].length];
				$this.list_quest[$this.curr_category].splice($this.arr_data["answer"][$this.curr_category].length,1);
				$this.list_quest[$this.curr_category].push(temp);
				game.scorm_helper.setListQuest($this.list_quest);
				$this.show_question();
				$("#game_quiz_popup_ulartangga").modal("hide");
				clearInterval($this.time);
			}
		}
		
	},1000);
};

GameSpin.prototype.setTimer = function() {
	var $this = this;
	var date1 = $this.waktu_mulai;
	var date2 = new Date();

	var diff = date2.getTime() - date1.getTime();

	var msec = diff;
	var hh = Math.floor(msec / 1000 / 60 / 60);
	msec -= hh * 1000 * 60 * 60;
	var mm = Math.floor(msec / 1000 / 60);
	msec -= mm * 1000 * 60;
	var ss = Math.floor(msec / 1000);
	msec -= ss * 1000;

	var tes = (hh*60*60)+(mm*60)+(ss);
	$this.count = parseInt($this.max_time-tes);
	
	var str = "";
	if(Math.floor($this.count/60)<10){
		str+="0"+Math.floor($this.count/60);
	}
	else{
		str+=Math.floor($this.count/60);
	}
	str += ":";
	if($this.count%60<10){
		str+="0"+($this.count%60);
	}
	else{
		str+=($this.count%60);
	}
	return str;
};

GameSpin.prototype.shuffle = function(arra1){
	var ctr = arra1.length, temp, index;

// While there are elements in the array
    while (ctr > 0) {
// Pick a random index
        index = Math.floor(Math.random() * ctr);
// Decrease ctr by 1
        ctr--;
// And swap the last element with it
        temp = arra1[ctr];
        arra1[ctr] = arra1[index];
        arra1[index] = temp;
    }
    return arra1;
}

GameSpin.prototype.show_question = function() {
	var $this = this;
	if(!$this.isCompleteGame($this.list_quest)){
		var rand = Math.floor(Math.random()*$this.temp_num.length);
		var randarr = $this.shuffle($this.temp_num);
		$this.curr_category = randarr[0];
		console.log($this.curr_category);
		
		$(".btn_spins").click(function(e){
			$(this).off();
			$(".btn_hand_click").hide();
			$this.spin.init(".wheel-spin",$this.arr_deg[$this.curr_category]);
		});	

		$(".btn-pass").click(function(e){
			$this.isStarting = false;
			clearInterval($this.time);
			$(".btn-pass").off();
			$(".btn-submit").off();
			var temp = $this.list_quest[$this.curr_category][$this.arr_data["answer"][$this.curr_category].length];
			$this.list_quest[$this.curr_category].splice($this.arr_data["answer"][$this.curr_category].length,1);
			$this.list_quest[$this.curr_category].push(temp);
			game.scorm_helper.setListQuest($this.list_quest);
			$this.show_question();
			$("#game_quiz_popup_ulartangga").modal("hide");
		});

		$(".btn-submit").click(function(e){
			$this.isStarting = false;
			clearInterval($this.time);
			$(".btn-pass").off();
			$(".btn-submit").off();
			if($this.cekJawaban()){
				//benar
				game.audio.audioBenar.play();
				$(".alert").addClass("benar");
				$this.arr_data["answer"][$this.curr_category].push(1);
			}
			else{
				//salah
				game.audio.audioSalah.play();
				$(".alert").addClass("salah");
				$this.arr_data["answer"][$this.curr_category].push(0);
			}
			
			var time_feedback = setInterval(function() {
				$(".alert").removeClass("salah");
				$(".alert").removeClass("benar");
				clearInterval(time_feedback);
				time_feedback = null;
			},500);
			
			game.scorm_helper.setListAnswer($this.arr_data["answer"]);
			$("#game_quiz_popup_ulartangga").modal("hide");
			
			var saveditem = $this.arr_data["answer"][$this.curr_category].length;
			var totalitem = $this.arr_max_soal[$this.curr_category];
			
			
			if(totalitem==saveditem){
				$("#popupItem img").attr("src","assets/image/spinner/"+$this.curr_soal["icon_finish"]);
				$("#popupItem").modal({backdrop: 'static',keyboard: true,show: true});
				$this.time_feedback = setInterval(function() {
					$("#popupItem").modal("hide");
					$(".img_anim img").attr("src","assets/image/spinner/"+$this.curr_soal["icon"]);

					$(".img_anim").removeClass("hide");
					$(".img_anim").addClass("anim"+$this.curr_category);
					clearInterval($this.time_feedback);
					$this.time_feedback = null;
					$this.time_feedback2 = setInterval(function() {
						$(".img_anim").addClass("hide");
						$(".img_anim").removeClass("anim"+$this.curr_category);
						$(".item-complete.item-"+$this.curr_category).find(".img-item").addClass("active");
						$this.show_question();
						clearInterval($this.time_feedback2);
						$this.time_feedback2 = null;
					},300);
					
				},2000);
			}else{
				$this.show_question();
			}
			
			// bkin animasi masuk ke list baru di show question lagi	
		});
	}
	else{
		$this.setDef();
		game.debug("complete game");
		game.scorm_helper.pushCompleteSlide();
		game.nextSlide();
	}
};

/*function check game is complete, 
if array answer length same with array curr_game length, splace curr_game in soal*/
GameSpin.prototype.isCompleteGame = function(curr_game) {
	var $this = this;
	var answer = game.scorm_helper.getQuizAnswer("game_slide_"+$this.current_settings["slide"]);
	var flag = 0;
	if(curr_game.length == answer.length){
		for (var i = 0; i < answer.length; i++) {
			$(".item-complete.item-"+i+" .curr-count").html(answer[i].length);
			$(".item-complete.item-"+i+" .total-item").html(curr_game[i].length);
			
			if(answer[i].length < curr_game[i].length){
				flag=1;
			}
			else if(answer[i].length == curr_game[i].length){
				var idx_splice = -1;
				for (var k = 0; k < $this.temp_num.length; k++) {
					if($this.temp_num[k] == i){
						idx_splice = k;
						break;
					}
				}

				if(idx_splice != -1){
					$this.temp_num.splice(idx_splice,1);
				}
			}
		}
	}else{
		return 0;
	}
	return(flag==0)?true:false;
};

GameSpin.prototype.callback = function() {
	var $this = this;
	var temp = $this.list_quest[$this.curr_category][$this.arr_data["answer"][$this.curr_category].length];
	$this.curr_soal = $this.soal[$this.curr_category][temp];
	console.log($this.curr_soal);
	var num_alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

	$("#game_quiz_popup_ulartangga .header_quiz img").attr("src","assets/image/spinner/"+$this.curr_soal["icon"]);
	$("#game_quiz_popup_ulartangga .text_question").html($this.curr_soal["question"]);
	$("#game_quiz_popup_ulartangga .pilihan_wrapper").html("");
	if($this.curr_soal["type"] != "tf"){
		for (var i = 0; i < $this.curr_soal["pilihan"].length; i++) {
			if($this.curr_soal["type"] == "mc"){
				var clone = $this.pilihan_mc.clone();
				$(clone).addClass($this.curr_soal["type"]);
				$(clone).find(".bul_abjad").html(num_alphabet[i]);
			}
			else{
				var clone = $this.pilihan_mmc.clone();
			}

			$(clone).find(".txt_pilihan").html($this.curr_soal["pilihan"][i]);
			$("#game_quiz_popup_ulartangga .pilihan_wrapper").append($(clone));
			$(clone).attr("index",i);
			$(clone).show();

			$(clone).click(function(e){
				if($this.curr_soal["type"] == "mc"){
					$(".pilihan").removeClass("active");
					$(this).addClass("active");
				}
				else if($this.curr_soal["type"] == "mmc"){
					if($(this).hasClass("active")){
						$(this).removeClass("active");
					}
					else{
						$(this).addClass("active");
					}
				}
			});
		}
	}
	else{
		var clone = $this.pilihan_tf.clone();
		$("#game_quiz_popup_ulartangga .pilihan_wrapper").append($(clone));
		$(clone).show();
		$(clone).find(".btn-true").click(function(e){
			$(clone).removeClass("false");
			$(clone).addClass("true");	
		});
		$(clone).find(".btn-false").click(function(e){
			$(clone).removeClass("true");
			$(clone).addClass("false");	
		});
	}

	$("#game_quiz_popup_ulartangga").modal({backdrop: 'static',keyboard: true,show: true});
	// $this.isStarting = true;
};

GameSpin.prototype.cekJawaban = function(arr) {
	var $this = this;
	if($this.curr_soal["type"] == "mc"){
		if(parseInt($(".pilihan.active").attr("index")) == parseInt($this.curr_soal["jawaban"])){
			return true;
		}
		else{
			return false;
		}
	}
	else if($this.curr_soal["type"] == "mmc"){
		var isBenar = true;
		for (var i = 0; i < $this.curr_soal["jawaban"].length; i++) {
			var flag = 0;
			$(".pilihan.active").each(function(e){
				if(parseInt($(this).attr("index")) == $this.curr_soal["jawaban"][i]){
					flag = 1;
				}
			});
			if(flag == 0){
				isBenar = false;
				break;
			}
		}

		if(isBenar){
			return true;
		}
		else{
			return false;
		}
	}
	else if($this.curr_soal["type"] == "tf"){
		if($this.curr_soal["jawaban"] == 0 && $(".pilihan").hasClass("true") || $this.curr_soal["jawaban"] == 1 && $(".pilihan").hasClass("false")){
			return true;
		}
		else{
			return false;
		}
	}
};