/**
 * Scorm Helper is standardization of SCORM parameters.
 * there are : leasson status, duration, activity question, result per activity, score, and suspend data.  
 * @class
 * @author     NejiElYahya
 */
var ScormHelper = function(){
	var $this = this;
	this.scorm = pipwerks.SCORM;
	this.curr_slide = 0;
	this.category = 0;
	this.lastDuration = 0;

	// this use for local testing.
	if(game.environment == "development"){
		var tempSlide = localStorage.getItem("tempSlide");
		this.curr_slide=tempSlide;
	}

	try{
		// initial connection to scorm
		this.lmsConnected = this.scorm.init();
		
		if(this.lmsConnected){
			// get leason status
			var lastStatus = this.scorm.get("cmi.core.lesson_status");
			if(lastStatus!="passed" && lastStatus!="failed" && lastStatus!="completed"){
				this.setStatus("incomplete");
			}

			// get suspend
			var sus_data = this.scorm.get("cmi.suspend_data");
			$this.ldata = JSON.parse(sus_data);

			// last duration
			var prevduration = this.scorm.get("cmi.core.total_time");
			if(prevduration != undefined && prevduration == null){
				var arr=prevduration.split(":");
				var hours = parseInt(arr[0])*(1000 * 3600);
				var minutes = parseInt(arr[1])*(1000*60);
				var sec = parseInt(arr[2])*1000;
				
				this.lastDuration = hours+minutes+sec;
			}

			var sus_data = this.scorm.get("cmi.suspend_data");
			$this.ldata = JSON.parse(sus_data);
			if($this.ldata["curr_slide"] != undefined){
				$this.curr_slide = parseInt($this.ldata["curr_slide"]);	
				game.debug($this.curr_slide+" "+parseInt(game.arr_content.length-1));
				if($this.curr_slide == game.arr_content.length-1){
					$this.setSlide(0);
				}
			}
		}
		else{
			$this.ldata = {};
		}
	}catch(e){
		$this.ldata = {};
	}
}

/**
 * Sets the duration.
 */
ScormHelper.prototype.setDuration = function() {
	var duration = Math.abs(game.getCurrDateTimestamp() - game.startDate);
	var prevduration = new Date(this.lastDuration).getTime();
	var count =  Math.abs(duration + prevduration);
	//console.log(game.parseTime(count));
	this.scorm.set("cmi.core.session_time",game.parseTime(count));
};

/**
 * Gets the current slide.
 *
 * @return     {string} The current slide
 */
ScormHelper.prototype.getCurrSlide = function() {
	game.debug(this.curr_slide);
	return this.curr_slide;
};

/**
 * set to next slide.
 */
ScormHelper.prototype.nextSlide = function() {
	this.curr_slide = parseInt(this.curr_slide)+1;
	this.setSingleData("curr_slide",this.curr_slide);
};

/**
 * Sets the slide.
 *
 * @param      {number}  $slide  The slide
 */
ScormHelper.prototype.setSlide = function($slide) {
	this.curr_slide = $slide;
	this.setSingleData("curr_slide",$slide);
};

/**
 * Gets the single data.
 * 
 * @description this use for get value by index in suspend data.
 * @param      {string}  index   The index
 * @return     {number|string|Array}  The single data.
 */
ScormHelper.prototype.getSingleData = function(index) {
	var $this = this;
	return $this.ldata[index];
};

/**
 * Sets the single data.
 *
 * description this use for save or append index in suspend data.
 * @param      {string}  index   The index
 * @param      {string}  value   The value
 */
ScormHelper.prototype.setSingleData = function(index,value) {
	var $this = this;
	$this.ldata[index]=value;
	$this.scorm.set("cmi.suspend_data", JSON.stringify($this.ldata));
};


/**
 * Gets the last game.
 *
 * @param      {string}  category  index of game
 * @return     {Array}  The last game by category.
 */
ScormHelper.prototype.getLastGame = function(category) {
	var $this = this;
	var arr = [];
	if($this.ldata["quiz"] === undefined || $this.ldata["quiz"].length == 0){
		$this.ldata["quiz"] = [];
	}
	else{
		arr = $this.ldata["quiz"];
	}

	var idx = -1;
	for (var i = 0; i < arr.length; i++) {
		if(arr[i]["index"] == category){
			idx=i;
			break;
		}
	}

	$this.category = idx;

	return(arr.length>0)?arr[idx]:arr;
};

ScormHelper.prototype.getLengthListAns = function() {
	var $this = this;
	return $this.ldata["quiz"][$this.ldata["quiz"].length-1]["answer"].length;
};

ScormHelper.prototype.pushCompleteSlide = function() {
	var $this = this;
	if($this.ldata["arr_slide_complete"] === undefined){
		$this.ldata["arr_slide_complete"] = [];
	}

	var flag = 0;
	for (var i = 0; i < $this.ldata["arr_slide_complete"].length; i++) {
		if($this.ldata["arr_slide_complete"][i] == $this.curr_slide){
			flag=1;
			break;
		}
	}

	if(flag == 0){
		$this.ldata["arr_slide_complete"].push($this.curr_slide);
	}

	game.debug("push : "+$this.curr_slide);
	$this.scorm.set("cmi.suspend_data", JSON.stringify($this.ldata));
	//pipwerks.SCORM.save();
};

/**
 * Sets the quiz data.
 *
 * @param      {sting}		category  index of game
 * @param      {Array}		arr_rand  The question list.
 * @return     {Object}		current game object.
 */
ScormHelper.prototype.setQuizData = function(category,arr_rand,type) {
	var $this = this;
	var arr = $this.getLastGame(category);
	var result = {index:category,answer:[], list_question:arr_rand, start_date:game.getFullDate(), end_date:"",is_complete:false};
	// if index already exist and game was completed
	if((game.startGame == 1 && arr!=undefined && arr.length!=0)  || (arr!=undefined && arr.length!=0 && arr["answer"].length == arr["list_question"].length)){
		$this.ldata["quiz"].splice($this.category,1);	
		$this.ldata["quiz"].push(result);
		$this.category = $this.ldata["quiz"].length-1;
	}
	else if(parseInt($this.category) == -1){
		$this.ldata["quiz"].push(result);
		$this.category = $this.ldata["quiz"].length-1;
	}
	else{
		result = arr;
	}

	$this.scorm.set("cmi.suspend_data", JSON.stringify($this.ldata));

	return result;
};

ScormHelper.prototype.setQuizDataSpinner = function(category,arr_rand) {
	var $this = this;
	var temp = [];
	var result = {
		index:category,
		answer:[[],[],[],[]],
		list_question:arr_rand,
		start_date:game.getFullDate(),
		end_date:"",
		is_complete:false,
		// attemp: game.attemp
	};
	temp.push(result);

	$this.category = 0;
	$this.ldata["quiz"].push(temp);

	$this.scorm.set("cmi.suspend_data", JSON.stringify($this.ldata));

	return result;
};


/**
 * Pushes an answer.
 * push every user answer question by question. 
 *
 * @param      {number}  answer    The current activity answer (0 incorrect, 1 correct)
 * @param      {string}  response  The current activity question 
 */
ScormHelper.prototype.pushAnswer = function(answer,response) {
	var $this = this;
	$this.ldata["quiz"][$this.category]["answer"].push(answer);
	var str=(answer == 0)?"wrong":"correct";
	
	var index = 0;
	if($this.category>0){
		for (var i = 0; i < $this.category; i++) {
			index = index+$this.ldata["quiz"][i]["answer"].length;
		}
	}

	var index = index+$this.ldata["quiz"][$this.category]["answer"].length-1;

	$this.scorm.set("cmi.interactions."+index+".result", str);
	$this.scorm.set("cmi.interactions."+index+".student_response",response);
	console.log($this.ldata["quiz"]);
	if($this.ldata["quiz"][$this.category]["answer"].length == $this.ldata["quiz"][$this.category]["list_question"].length){
		$this.ldata["quiz"][$this.category]["end_date"] = game.getFullDate();
		$this.ldata["quiz"][$this.category]["is_complete"] = true;
	}

	$this.scorm.set("cmi.suspend_data", JSON.stringify($this.ldata));
};


/**
 * Sets the answer.
 * set all the answer of current question game.  
 * 
 * @param      {Array}  answer    The answer
 * @param      {Array}  question  The question
 */
ScormHelper.prototype.setAnswer = function(answer,question) {
	var $this = this;
	var count = 0;
	$this.ldata["quiz"][$this.category]["answer"] = answer;

	for (var i = 0; i < question.length; i++) {
		var str = "";
		if(answer[i] == 1){
			count+=1;
			str = "correct";
		}
		else if(answer[i] === 0){
			count+=1;
			str = "incorrect";
		}
		else{
			str = "unanticipated";
		}
		$this.scorm.set("cmi.interactions."+i+".result", str);
		$this.scorm.set("cmi.interactions."+i+".student_response",question[i]);
	}
	
	if(count == question.length){
		$this.ldata["quiz"][$this.category]["end_date"] = game.getFullDate();
		$this.ldata["quiz"][$this.category]["is_complete"] = true;
	}
	$this.scorm.set("cmi.suspend_data", JSON.stringify($this.ldata));
};


/**
 * Gets the result by category.
 *
 * @param      {string}	slide
 * return      {Array}	The result by category.
 */
ScormHelper.prototype.getResultByCategory = function(slide) {
	var $this = this;
	var arr = $this.ldata["quiz"];
	var result = [];
	result["score"]=0;
	result["total_soal"]=0;
	console.log(arrSlide);
	for (var i = 0; i < arr.length; i++) {
		var cek = 0;
		if(arr[i]["index"] == slide){
			result["total_soal"] = parseInt(result["total_soal"])+arr[i]["list_question"].length;	
			for (var j = 0; j < arr[i]["answer"].length; j++) {
				if(arr[i]["answer"][j]==1){
					result["score"] = parseInt(result["score"])+1;
				}
			}
		}
	}

	return result;
};


/**
 * Gets the quiz result.
 *
 * @param      {Array}   arrSlide  list slide that score will be accumulated.
 * @return     {Array}   The result will return score and total question.
 */
ScormHelper.prototype.getQuizResult = function(arrSlide) {
	var $this = this;
	var arr = $this.ldata["quiz"];
	var result = [];
	result["score"]=0;
	result["total_soal"]=0;
	console.log(arrSlide);
	for (var i = 0; i < arr.length; i++) {
		var cek = 0;
		if(arrSlide!=undefined){			
			for (var k = 0; k < arrSlide.length; k++) {
				console.log(arr[i]["index"]+" "+arrSlide[k]);
				if(arr[i]["index"] == arrSlide[k]){
					cek=1;
					break;
				}
			}
		}
		else{
			cek = 1;
		}
		if(cek == 1){
			result["total_soal"] = parseInt(result["total_soal"])+arr[i]["list_question"].length;	
			for (var j = 0; j < arr[i]["answer"].length; j++) {
				if(arr[i]["answer"][j]==1){
					result["score"] = parseInt(result["score"])+1;
				}
			}
		}
	}

	return result;
};

ScormHelper.prototype.getQuizResultSpinner = function(category) {
	var $this = this;
	var count=0;
	console.log($this.ldata["quiz"]);
	var arr = $this.ldata["quiz"][$this.ldata["quiz"].length-1];
	game.debug(arr);

	var idx = -1;
	console.log(arr.length);
	for (var i = 0; i < arr.length; i++) {
		console.log(arr[i]["index"] +' - '+ category)
		if(arr[i]["index"] == category){
			idx=i;
			$this.category = idx;
			break;
		}
	}
	game.debug(idx);

	var ans = arr[idx]["answer"];
	console.log(ans);
	for (var i = 0; i < ans.length; i++) {
		for (var j = 0; j<ans[i].length; j++) {
			if(ans[i][j] == 1){
				count = parseInt(count)+1;
			}
		}
	}

	game.debug(arr[idx]);

	return count;
};

ScormHelper.prototype.getQuizAnswer = function(category) {
	var $this = this;
	var arr = $this.ldata["quiz"][$this.ldata["quiz"].length-1];
	console.log(arr);
	console.log($this.ldata["quiz"]);
	console.log(arr);
	var idx = -1;
	for (var i = 0; i < arr.length; i++) {
		if(arr[i]["index"] == category){
			idx=i;
			$this.category = idx;
			break;
		}
	}
	console.log(arr[idx]["answer"]);
	return arr[idx]["answer"];
};


/**
 * Sends a result.
 *
 * @param      {number}  score   The score
 */
ScormHelper.prototype.sendResult = function(score) {
	var $this = this;
	$this.scorm.set("cmi.core.score.raw", score);
};


/**
 * Sets the leasson status.
 *
 * @param      {string}  value   passed or failed
 */
ScormHelper.prototype.setStatus = function(value) {
	var $this = this;
   if($this.lmsConnected){
   	 var success = $this.scorm.set("cmi.core.lesson_status", value);
	  pipwerks.SCORM.save();
   }
}

ScormHelper.prototype.setListAnswer = function(arr_new_ans) {
	var $this = this;
	$this.ldata["quiz"][$this.ldata["quiz"].length-1][$this.category]["answer"] = arr_new_ans;
	$this.scorm.set("cmi.suspend_data", JSON.stringify($this.ldata));
};

ScormHelper.prototype.setListQuest = function(arr_new_list) {
	var $this = this;
	$this.ldata["quiz"][$this.ldata["quiz"].length-1][$this.category]["list_question"] = arr_new_list;
	$this.scorm.set("cmi.suspend_data", JSON.stringify($this.ldata));
};

ScormHelper.prototype.getName = function() {
	var $this = this;
	var name = $this.scorm.get("cmi.core.student_name");
	return name;
};

ScormHelper.prototype.getID = function() {
	var $this = this;
	var username = $this.scorm.get("cmi.core.student_id");
	return username;
};