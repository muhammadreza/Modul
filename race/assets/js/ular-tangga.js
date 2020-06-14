var UlarTangga = function(){
   
}
   
UlarTangga.prototype.init = function(current_settings) {
    var $this = this;
    $this.current_settings = current_settings;
    $this.question_data = [];
    $this.curr_soal=0;
    $this.isAppend=0;
    $this.attemp=0;
    $this.count_benar=0;
    $this.curr_list_soal=1;
    $this.count_soal=0;     
    $this.isRandom = true;
    $this.modulreview = true;
    $this.feedback = false; //
    $this.arr_alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];
    $this.$pilihan_clone = $("#game_quiz_popup_ulartangga").find(".pilihan").first().clone();
    $this.drop = $(".drop").first().clone();
    $this.drag = $(".drag").first().clone();
    $this.setTutorial_ulartangga();
    $.get("config/setting_quiz_slide_"+$this.current_settings["slide"]+".json",function(e){
        $this.quiz = e;
        $this.question_data = e["list_question"];
        $this.list_logo_quiz = e["logo_soal"];
        setTimeout(function(){
          $this.mulai_game_ulartangga();
        },1000);
    },'json');
 };

 UlarTangga.prototype.getQuestion_ulartangga = function() {
    var $this = this;
    var arr_quest = [];
    var arr_rand = [];
    var other = [];
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

      if(!$this.modulreview){
        for (var j = 0; j < $this.question_data.length; j++) {
          if(j<game.total_soal){
            returnQuest.push(arr_rand[j]);
          }else{
            other.push(arr_rand[j]);
          }
        }
        game.scorm_helper.setSingleData("other",other);
      }else{
        returnQuest = arr_rand;
      }
    }
    else{
      if(!$this.modulreview){
        for (var j = 0; j < $this.question_data.length; j++) {
          if(j<game.total_soal){
            returnQuest.push(arr_quest[j]);
          }else{
            other.push(arr_quest[j]);
          }
        }
        game.scorm_helper.setSingleData("other",other);
      }else{
        returnQuest = arr_quest;
      }
    }

    var start = returnQuest.length-(returnQuest.length-$this.totalQuestion);
    var end = returnQuest.length-$this.totalQuestion;
    returnQuest.splice(start,end);

    return returnQuest;
};
 
//START GAME
UlarTangga.prototype.mulai_game_ulartangga = function() {
  var $this = this;
  var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
  game.temp = game.scorm_helper.getSingleData("temp");
   if(game.temp == 1 || ldata["answer"]== undefined || ldata["answer"]== null || (game.temp == 0 && ldata["answer"].length < $this.question_data.length)){
       game.scorm_helper.setSingleData("temp",0);
       var sdata = game.scorm_helper.setQuizData("game_slide_"+$this.current_settings["slide"],$this.getQuestion_ulartangga(),ldata);
       $this.list_soal = sdata["list_question"];
       $this.curr_soal = sdata["answer"].length;

       $this.setButton_ulartangga();
   }
   else{
       game.debug("complete game");
       game.scorm_helper.setSingleData("temp",1);
       game.nextSlide();
   }
};

UlarTangga.prototype.setButton_ulartangga = function() {
  var $this = this;
  if(game.scorm_helper.getSingleData("count_soal")!=undefined){
    $this.count_soal = game.scorm_helper.getSingleData("count_soal");
  }else{
    $this.count_soal = 0;
  }
  $(".button").removeClass("active");
  $(".button.btn-"+parseInt($this.count_soal+1)).removeClass("disabled");
  $(".button.btn-"+parseInt($this.count_soal+1)).addClass("active");
      
  if($this.curr_soal!=0){
    $(".man").addClass("walk-"+$this.count_soal);
    $(".button").each(function(idx){
      if(idx<=$this.count_soal){
        if(idx!=0){
          if(!$(".man").hasClass("walk-"+idx)){
            $(".man").addClass("walk-"+idx);  
          }
          if(parseInt($this.curr_soal-1)>=0){
            /*if($(".button.btn-"+parseInt($this.count_soal-1)).hasClass("disabled")){
              $(".button.btn-"+parseInt($this.count_soal-1)).removeClass("disabled");
            }*/
            if(!$(".button.btn-"+$this.count_soal).hasClass("success")){
              $(".button.btn-"+$this.count_soal).addClass("success");  
            }
          }
        }
        else{
          /*if($this.count_soal!=0){
            if(!$(".button.start_state").hasClass("disabled")){
              $(".button.start_state").addClass("disabled");  
            }
          }*/
        }
      }
    });
  }

  $(".button.btn-"+parseInt($this.count_soal+1)).click(function(e){
    if($this.curr_soal != $this.list_soal.length){
      $(this).off();
      $this.show_question_ulartangga();
    }
  });

  if($this.curr_soal == $this.list_soal.length){
    if(!$(".button.btn-"+$this.count_soal).hasClass("success")){
      $(".button.btn-"+$this.count_soal).addClass("success");  
    }else{
      $(".button.finish_state").removeClass("disabled");
      $(".button.finish_state").addClass("active");
    }

    /*setTimeout(function(){
      $(".button.finish_state,.girl").addClass("active");
      game.nextSlide();      
    },1000);*/
    $(".button.finish_state, .girl").click(function(e){
      //$("#popupFinish").modal("show");
      $("#modal_feedback").modal("hide");
      $("#game_quiz_popup_ulartangga").modal("hide");
      game.scorm_helper.setSingleData("temp",1);
      game.nextSlide();
    });
  }
};
 
UlarTangga.prototype.show_question_ulartangga = function() {
   var $this = this;

   var $clone = $("#game_quiz_popup_ulartangga");
   if(game.scorm_helper.getSingleData("curr_list_soal")!=undefined){
    $this.curr_list_soal = game.scorm_helper.getSingleData("curr_list_soal");
   }else{
    $this.curr_list_soal = 1;
   }
   /*var $cloneQuizWrap = $clone.find(".question-wrapper").clone();
   $clone.find(".game_quiz_slider").html("");
   for(var i=0;i<$this.quiz["num_quest"][$this.curr_soal];i++){
    $clone.find(".curr_soal").html(i+1);
    $clone.find(".total_soal").html($this.quiz["num_quest"][$this.curr_soal]);
    $clone.find(".text_question").html($this.question_data[$this.list_soal[$this.curr_soal]]["question"]);
   }
   $("#game_quiz_popup").modal("show");
   $this.runSlick($(".game_quiz_slider"));*/
   $($clone).addClass($this.question_data[$this.list_soal[$this.curr_soal]]["type"]);
   $($clone).attr("curr_soal",$this.curr_soal);
   $clone.parent().find(".header_quiz").find("img").attr("src","assets/image/ular-tangga/"+$this.list_logo_quiz[$this.count_soal]);
   $clone.find(".curr_soal").html(parseInt($this.curr_list_soal));
   $clone.find(".total_soal").html($this.quiz["num_quest"][$this.count_soal]);
   
   $clone.find(".pilihan_wrapper").html("");
   $clone.find(".category_wrapper").html("");
   $(".drop_wrapper").html("");
   $(".drag_wrapper").html("");
   if($this.question_data[$this.list_soal[$this.curr_soal]]["type"] == "dad"){
     $($this.drop).css({"display":"inline-block"});
     $($this.drag).css({"display":"inline-block"});
     $this.initDad($clone);
   }else{
     $clone.find(".text_question").html($this.question_data[$this.list_soal[$this.curr_soal]]["question"]);
     if($this.question_data[$this.list_soal[$this.curr_soal]]["image"]){
      $clone.find(".row.image").css("display","block");
      $clone.find(".row.image").attr("src","assets/image/ular-tangga/quiz-image/"+$this.question_data[$this.list_soal[$this.curr_soal]]["image"]);    
     }else{
      $clone.find(".row.image").css("display","none");
     }

     var arr = [];
     var arr_rand = [];

     for (var i = 0; i < $this.question_data[$this.list_soal[$this.curr_soal]]["pilihan"].length; i++) {
         arr.push(i);
     }

     for (var i = 0; i < $this.question_data[$this.list_soal[$this.curr_soal]]["pilihan"].length; i++) {
         var rand = Math.floor((Math.random() * (arr.length-1)));
         arr_rand.push(arr[rand]);
         arr.splice(rand, 1);
     }

     for (var i = 0; i < arr_rand.length; i++) {
         $app_pilihan = $this.$pilihan_clone.clone();

         $app_pilihan.find(".txt_pilihan").html($this.question_data[$this.list_soal[$this.curr_soal]]["pilihan"][arr_rand[i]]["text"]);
         $app_pilihan.attr("index",$this.question_data[$this.list_soal[$this.curr_soal]]["pilihan"][arr_rand[i]]["index"]);
         
         if($this.question_data[$this.list_soal[$this.curr_soal]]["type"] == "mc"){
             $($app_pilihan).addClass("mc");
             $($app_pilihan).find(".bul_abjad").html($this.arr_alphabet[i]);
         }
         else if($this.question_data[$this.list_soal[$this.curr_soal]]["type"] == "mmc"){
             $($app_pilihan).addClass("mmc");
         }

         $clone.find(".pilihan_wrapper").append($app_pilihan);
      }
      if($this.question_data[$this.list_soal[$this.curr_soal]]["type"] == "dadsequence"){
         $clone.find(".pilihan_wrapper").sortable();
      }
      $this.setEvent($clone);
    }
};

UlarTangga.prototype.initDad = function(slider_content) {
  var $this = this;
  var start=0;
  var width=0;

  // get current soal
  var $current_soal = $this.question_data[$this.list_soal[$this.curr_soal]];

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
 
UlarTangga.prototype.setEvent = function($clone) {
  var $this = this;

  if($this.question_data[$this.list_soal[$this.curr_soal]]["type"] == "mc"){
    $clone.find(".btn-submit").hide();
    $clone.find(".btn-pass").hide();
    $clone.find(".pilihan").click(function(e){

      $clone.find(".pilihan").off();
      $($clone).find(".next-soal").show();

      if(!$(this).hasClass("active")){
        $(this).addClass("active"); 
      }
      else{
        $(this).removeClass("active");  
      }
      $this.cek_jawaban_ulartangga($clone,"mc");
    });
  }
  else if($this.question_data[$this.list_soal[$this.curr_soal]]["type"] == "mmc"){
    $clone.find(".btn-submit").show();
    $clone.find(".btn-pass").hide();
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
      $this.cek_jawaban_ulartangga($clone,"mmc");
    });
  }else if($this.question_data[$this.list_soal[$this.curr_soal]]["type"] == "dad"){
    $clone.find(".btn-submit").show();
    $clone.find(".btn-pass").hide();
    $($clone).find(".btn-submit").click(function(e){
      $(this).off();
      $this.cek_jawaban_ulartangga($clone,"dad");
    });
  }else if($this.question_data[$this.list_soal[$this.curr_soal]]["type"] == "dadsequence"){
    $clone.find(".btn-submit").show();
    $clone.find(".btn-pass").hide();
    $($clone).find(".btn-submit").click(function(e){
      $(this).off();
      $clone.find(".pilihan_wrapper").sortable("disable");
      $this.cek_jawaban_ulartangga($clone,"dadsequence");
    });
  }

  $("#game_quiz_popup_ulartangga").modal({backdrop: 'static',keyboard: true,show: true});
  //$this.runSlick($(".game_quiz_slider"));
};

UlarTangga.prototype.runSlick = function(elem) {
  elem.slick({
      dots: true,
      infinite: false,
      speed: 500
  });
};
 
UlarTangga.prototype.prev = function(prev) {
   var $this = this;
   if(prev){
       $( ":mobile-pagecontainer" ).pagecontainer( "change", prev, {
           transition: "slide",
           reverse: true
       });
   }
};
 
UlarTangga.prototype.next = function() {
   var $this = this;
   var next = $(".ui-page-active").jqmData("next");

   $(".button_next_page").removeClass("active");
   var $this = this;

   if($this.curr_soal == $this.list_soal.length){
       game.nextSlide();
   }
   else{
       game.next(next);	
   }
   
};

UlarTangga.prototype.cek_jawaban_ulartangga = function($clone,$type) {
   var $this = this;
   var $flag=0;
   var count = 0;

   if($type != "dad"){
      $($clone).find(".pilihan").each(function(index){
         if($(this).hasClass("active")){
             $(this).removeClass("active");
             
             var $cek=1;
             for (var i = 0; i < $this.question_data[$this.list_soal[parseInt($($clone).attr("curr_soal"))]]["jawaban"].length; i++) {
                 if($this.question_data[$this.list_soal[parseInt($($clone).attr("curr_soal"))]]["jawaban"][i] != $(this).attr("index")){
                     $cek=0;
                     break;
                 }
             }

             if($cek == 0){
                $(this).addClass("wrong");
             }
             else{
                count++;
                $(this).addClass("right");
             }	
         }
      });

      if(count == $this.question_data[$this.list_soal[parseInt($($clone).attr("curr_soal"))]]["jawaban"].length){
         $flag=0;
      }
      else{
        $($clone).find(".pilihan").each(function(e){
           if($type != "dadsequence"){
             $flag=1;
             if(!$this.modulreview){
               for (var i = 0; i < $this.question_data[$this.list_soal[parseInt($($clone).attr("curr_soal"))]]["jawaban"].length; i++) {
                   if($this.question_data[$this.list_soal[parseInt($($clone).attr("curr_soal"))]]["jawaban"][i] != $(this).attr("index")){
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
             if($(this).attr("index") != $this.question_data[$this.list_soal[parseInt($($clone).attr("curr_soal"))]]["jawaban"][e]){
               $flag=1;
             }
             if(!$this.modulreview){
               $clone.find(".pilihan_wrapper").html("");
               for (var i = 0; i < $this.question_data[$this.list_soal[parseInt($($clone).attr("curr_soal"))]]["jawaban"].length; i++) {
                 $app_pilihan = $this.$pilihan_clone.clone();
                 $app_pilihan.find(".txt_pilihan").html($this.question_data[$this.curr_soal]["pilihan"][$this.question_data[$this.curr_soal]["jawaban"][i]]["text"]);
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
    }
    else{
      $($clone).find(".drop").each(function(e){
        $(this).find(".drag").addClass("right");
      });
    }
   }

   $("#modal_feedback").find(".modal_feedback").removeClass("salah");
   $("#modal_feedback").find(".modal_feedback").removeClass("benar");
   $("#modal_feedback").find(".modal_feedback .description p").html($this.question_data[$this.list_soal[parseInt($($clone).attr("curr_soal"))]]["feedback"]);
       
   if($flag==0){
       var response = $this.question_data[$this.list_soal[parseInt($($clone).attr("curr_soal"))]]["question"];
       game.scorm_helper.pushAnswer(1,response);
       if(!$this.modulreview){
        game.audio.audioBenar.play();
        $(".alert").addClass("benar");
       }
       $("#modal_feedback").find(".modal_feedback").addClass("benar");
       $this.curr_list_soal = parseInt($this.curr_list_soal)+1;
       $this.curr_soal = parseInt($this.curr_soal)+1;
       game.scorm_helper.setSingleData("curr_list_soal",$this.curr_list_soal);
   }
   else{
       var response = $this.question_data[$this.list_soal[parseInt($($clone).attr("curr_soal"))]]["question"];
       if(!$this.modulreview){
         game.audio.audioSalah.play();
         $(".alert").addClass("salah");
         var arr_temp_soal = game.scorm_helper.getSingleData("other");
         $this.list_soal.splice($this.curr_soal,0,arr_temp_soal[0]);
         var temp2 = $this.list_soal[$this.list_soal.length-1];
         $this.list_soal.splice($this.list_soal.length-1,1);

         arr_temp_soal.splice(0,1);
         arr_temp_soal.push(temp2);

         game.scorm_helper.setSingleData("other",arr_temp_soal);
         game.scorm_helper.setUlangQuest($this.list_soal);
       }else{
        game.scorm_helper.pushAnswer(0,response);       
        $this.curr_soal = parseInt($this.curr_soal)+1;
       }
       $this.curr_list_soal = parseInt($this.curr_list_soal)+1;
       game.scorm_helper.setSingleData("curr_list_soal",$this.curr_list_soal);
       $("#modal_feedback").find(".modal_feedback").addClass("salah");
   }
  if($this.curr_list_soal != parseInt($this.quiz["num_quest"][$this.count_soal])+1){
    if(!$this.modulreview){
      setTimeout(function(){
        $clone.removeClass($type);
        $(".alert").removeClass("salah");
        $(".alert").removeClass("benar");
        if($this.feedback){
          $("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
          $("#game_quiz_popup_ulartangga").modal("hide");
          $("#modal_feedback").find(".btn-standard--submit").click(function(e){
            $(this).off();
            $("#modal_feedback").modal("hide");
            $("#game_quiz_popup_ulartangga").modal({backdrop: 'static',keyboard: true,show: true});
            $this.show_question_ulartangga();
          });
        }else{
          $this.show_question_ulartangga();
        }
      },800);
    }else{
      if($this.feedback){
        $("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
        $("#game_quiz_popup_ulartangga").modal("hide");
        $("#modal_feedback").find(".btn-standard--submit").click(function(e){
          $(this).off();
          $("#modal_feedback").modal("hide");
          $("#game_quiz_popup_ulartangga").modal({backdrop: 'static',keyboard: true,show: true});
          $clone.removeClass($type);
          $this.show_question_ulartangga();
        });
      }else{
        $clone.removeClass($type);
        $this.show_question_ulartangga();
      }
    }
  }else{
    if(!$this.modulreview){
      setTimeout(function(){
        $($this.curr_card).hide();
        $clone.removeClass($type);
        $(".alert").removeClass("salah");
        $(".alert").removeClass("benar");
        $("#game_quiz_popup_ulartangga").modal("hide");
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
            $this.setButton_ulartangga();
          });
        }else{
          $this.curr_list_soal = 1;
          if($flag == 0){
            $this.count_soal = parseInt($this.count_soal)+1;
          }
          game.scorm_helper.setSingleData("curr_list_soal",$this.curr_list_soal);
          game.scorm_helper.setSingleData("count_soal",$this.count_soal);
          $this.setButton_ulartangga();
        }
      },800);
    }else{
      $clone.removeClass($type);
      if($this.feedback){
        $("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
        $("#game_quiz_popup_ulartangga").modal("hide");
        $("#modal_feedback").find(".btn-standard--submit").click(function(e){
          $(this).off();
          $("#modal_feedback").modal("hide");
          $this.curr_list_soal = 1;
          $this.count_soal = parseInt($this.count_soal)+1;
          game.scorm_helper.setSingleData("curr_list_soal",$this.curr_list_soal);
          game.scorm_helper.setSingleData("count_soal",$this.count_soal);
          $this.setButton_ulartangga();
        });
      }else{
        $("#game_quiz_popup_ulartangga").modal("hide");
        $this.curr_list_soal = 1;
        $this.count_soal = parseInt($this.count_soal)+1;
        game.scorm_helper.setSingleData("curr_list_soal",$this.curr_list_soal);
        game.scorm_helper.setSingleData("count_soal",$this.count_soal);
        $this.setButton_ulartangga();
      }
    }
  }

   $(".button_next_page").addClass("active");
};

UlarTangga.prototype.setTutorial_ulartangga = function() {
  $("#tutorial .tutorial.snake").addClass("done");
  $("#tutorial .tutorial.snake").addClass("active");
  $("#tutorial").modal({backdrop: 'static',keyboard: true,show: true});
  $("#tutorial .tutorial.snake").find("div").first().slick({
      dots: true,
      infinite: false,
      speed: 500,
      prevArrow: false,
      nextArrow: false
  });
  $("#tutorial .tutorial.snake").find(".start-game-snake").click(function(e){
    $("#tutorial").modal('hide');
  });
};
