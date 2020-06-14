var Game = function(){
	var $this = this;
	this.audio = new Audio();
	this.max_score = 100;
	this.min_score = 100;
	this.attemp=0;
	this.isDebug = true;
	this.temp = 1;
	this.startDate = this.getCurrDateTimestamp();

	$.get("config/templete_content.json",function(e){
		$this.arr_content = e["list_slide"];
		$this.curr_module = e["module"];
		$this.curr_course = e["course"];
		$this.mode = e["mode"];
		$this.environment = e["environment"];
		$this.scorm_helper = new ScormHelper();
		$this.create_slide();
	},'json');
}

Game.prototype.create_slide = function() {

	var $this = this;
	var current = $this.scorm_helper.getCurrSlide();

	var str = $this.arr_content[current]["file"];
	var arr = str.split("/");
	if($this.environment == "game"){
		$(".modal").addClass("col-xs-12 col-sm-10 col-md-10 col-lg-4");
		$(".body-wrapper").addClass("col-xs-12 col-sm-10 col-md-10 col-lg-4");
		$(".body-wrapper").css({"width":"","left":"50%","transform":"translateX(-50%)"});
	}else{
		$(".body-wrapper").css({"width":"100%"});
	}
	if(arr[0] == "muse"){
		window.location = $this.arr_content[current]["file"];
	}
	else{
		$.get($this.arr_content[current]["file"],function(e){
			$this.curr_slide = $(e).clone();
			$this.curr_slide.find(".title-course").html($this.curr_course);
			$this.curr_slide.find(".title-module").html($this.curr_module);
			$("#content").html($this.curr_slide);

			if($this.arr_content[current]["class"]){
				$this.curr_class = new window[$this.arr_content[current]["class"]];
				$this.curr_class.init($this.arr_content[current]);
			}

			$(".next_page").click(function(e){
				$this.audio.audioButton.play();
				$this.nextSlide();
			});

			$(".prev_page").click(function(e){
				$this.audio.audioButton.play();
				$this.prevSlide();
			});
		});
	}
};

Game.prototype.setSlide = function(idx_slide) {
    console.log("setSlide");
    this.audio.audioButton.play();
    this.scorm_helper.setSlide(parseInt(idx_slide)-1);
    this.nextSlide();
};

Game.prototype.nextSlide = function() {
	if(this.scorm_helper.getCurrSlide()<this.arr_content.length-1){
		this.scorm_helper.nextSlide();
		this.create_slide();
	}
};
Game.prototype.prevSlide = function() {
	if(this.scorm_helper.getCurrSlide()<this.arr_content.length-1){
		this.scorm_helper.setSlide(this.scorm_helper.getCurrSlide()-2);
		this.scorm_helper.nextSlide();
		this.create_slide();
	}
};

Game.prototype.prev = function(prev) {
	var $this = this;
	if(prev){
        $( ":mobile-pagecontainer" ).pagecontainer( "change", prev, {
            transition: "slide",
            reverse: true
        });
    }
};

Game.prototype.next = function(next) {
	var $this = this;
	if(next){
        $( ":mobile-pagecontainer" ).pagecontainer( "change", next, {
            transition: "slide"
        });
    }
};

Game.prototype.getDate = function() {
	var months = [ "Januari", "Februari", "Maret", "April", "Mei", "Juni", "July", "Agustus", "September", "Oktober", "November", "Desember" ];
	var dateString = "";
	var newDate = new Date();  
	dateString += newDate.getDate() + " "; 
	dateString += (months[newDate.getMonth()]) + " "; 
	dateString += newDate.getFullYear();

	return dateString;
};
Game.prototype.getFullDate = function() {
	var months = [ "Januari", "Februari", "Maret", "April", "Mei", "Juni", "July", "Agustus", "September", "Oktober", "November", "Desember" ];
	var dateString = "";
	var newDate = new Date();  
	dateString += newDate.getDate() + " "; 
	dateString += (months[newDate.getMonth()]) + " "; 
	dateString += newDate.getFullYear() + " ";
	dateString += newDate.getHours()+":";
	dateString += newDate.getMinutes()+":";
	dateString += newDate.getSeconds();
	return dateString;
};

Game.prototype.StringToDate = function(str) {
	var arr = str.split(" ");
	var months = [ "Januari", "Februari", "Maret", "April", "Mei", "Juni", "July", "Agustus", "September", "Oktober", "November", "Desember" ];
	
	var get_month=0;
	for (var i = 0; i < months.length; i++) {
		if(months[i] == arr[1]){
			get_month = i+1;
			break;
		}
	}

	game.debug(get_month+"/"+arr[0]+"/"+arr[2]+" "+arr[3]);
	var date = new Date(get_month+"/"+arr[0]+"/"+arr[2]+" "+arr[3]);
	return date;
};

Game.prototype.getCurrDateTimestamp = function() {
	var date =  new Date();
	return date.getTime();
};

Game.prototype.parseTime = function(deff) {
	var str="";
	var diffHours = Math.floor(deff / (1000 * 3600))%24;
	var diffMunites = Math.floor(deff / (1000 * 60))%60;
	var diffSec = Math.floor(deff / 1000)%60;
	var diffMill = deff % 1000;

	if(diffHours<10){
		str=str+"0"+diffHours+":";
	}
	else{
		str=str+diffHours+":";
	}

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
		str=str+diffSec+".00";
	}

	this.debug(str);
	return str;
};

Game.prototype.debug = function(string) {
	if(this.isDebug){
		//alert(string);
		console.log(string);
	}
};