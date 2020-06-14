var Audio = function(){
	this.audioButton = document.createElement('audio');
    this.audioButton.setAttribute('src', 'assets/audio/sound_button.wav');

   	this.audioBenar = document.createElement('audio');
	this.audioBenar.setAttribute('src', 'assets/audio/SFX Benar.mp3');

	this.audioSalah = document.createElement('audio');
	this.audioSalah.setAttribute('src', 'assets/audio/SFX Salah.mp3');

	this.audioKalah = document.createElement('audio');
	this.audioKalah.setAttribute('src', 'assets/audio/SFX Kalah.mp3');

	this.audioMenang = document.createElement('audio');
	this.audioMenang.setAttribute('src', 'assets/audio/SFX Menang.mp3');

	this.audioBackground = document.createElement('audio');
	this.audioBackground.setAttribute('src', 'assets/audio/backsound.mp3');

	this.audioMotor = document.createElement('audio');
	this.audioMotor.setAttribute('src', 'assets/audio/SFX Motor Jalan.mp3');

	this.audioCrash = document.createElement('audio');
	this.audioCrash.setAttribute('src', 'assets/audio/SFX Nabrak.mp3');	

	this.audioGetItem = document.createElement('audio');
	this.audioGetItem.setAttribute('src', 'assets/audio/SFX Ambil Item.mp3');

	this.audioCountdown = document.createElement('audio');
	this.audioCountdown.setAttribute('src', 'assets/audio/SFX Countdown.mp3');

	this.audioExplode = document.createElement('audio');
	this.audioExplode.setAttribute('src', 'assets/audio/Explosion.mp3');

	this.audioJet = document.createElement('audio');
	this.audioJet.setAttribute('src', 'assets/audio/Jet Pack.mp3');
}