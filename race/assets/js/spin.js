var Spin = function(){
	this.loopwheel = 5;
	this.countloopwheel=this.loopwheel;
	this.max_duration = 0.6;
	this.isFinish = false;
}
Spin.prototype.init = function($obj_spin,$finish_deg) {
	var $this = this;
	$this.obj_spin = $obj_spin;
	$this.finish_deg = $finish_deg;
	$this.doAnimate(360);
};

Spin.prototype.doAnimate = function(angle) {
	var $this = this;
	$this.countloopwheel = parseInt($this.countloopwheel)-1;
	$this.duration = (($this.loopwheel-$this.countloopwheel)/$this.loopwheel)*$this.max_duration;
	
	var duration=$this.duration*1000;

    var $elem = $($this.obj_spin);
    console.log(angle);
    $({deg: 0}).animate({deg: angle}, {
        duration: duration,
        easing: "linear",
        step: function(now) {
            $elem.css({
                'transform': 'rotate('+ now +'deg)'
            });
        },
        complete:function(){
        	if(!$this.isFinish){
        		if($this.countloopwheel>1){
	        		$this.doAnimate(360);
	        	}
	        	else if($this.countloopwheel == 1){
	        		$this.doAnimate($this.finish_deg);
	        	}
	        	else{
					game.curr_class.isStarting = true;
					game.curr_class.waktu_mulai = new Date();
					game.curr_class.isTime = false;
					// game.curr_class.max_time = 120;
					
					if(game.curr_class.isTime){
						game.curr_class.setCountTime();
					}
	        		$this.countloopwheel = $this.loopwheel;
	        		setTimeout(function(){
	        			game.curr_class.callback();	
	        		}, 800);
	        	}
        	}
        }
    });
};
