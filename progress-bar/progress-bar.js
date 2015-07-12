
var ProgressBar = function() {
    this.onStartCallback = null;
    this.onProgressCallback = null;
    this.onEndCallback = null;
    this.progress = 0;
};

ProgressBar.prototype.onStart = function(callback) {
    this.onStartCallback = callback;
};

ProgressBar.prototype.onProgress = function(callback) {
    this.onProgressCallback = callback;
};

ProgressBar.prototype.onEnd = function(callback) {
    this.onEndCallback = callback;
};

ProgressBar.prototype.start = function() {
    if (!this.onStartCallback) {
        return;
    }
    this.onStartCallback();
};


var progressBar = new ProgressBar();

progressBar.onStart(function() {
    console.log('Start');
    while(this.progress<=100){
        if((this.progress %10) === 0){
            this.onProgressCallback(this.progress);
        }
        if(this.progress == 100){
            this.onEndCallback();
        }
        this.progress++;
    }
});

progressBar.onProgress(function(current_progress){
    console.log('Progress: ' + current_progress + '%');
});

progressBar.onEnd(function(){
    console.log('End');
});

progressBar.start();
