define(function() {

    /**
     * Private requestAnimationFrame wrapper.
     */
    var _reqAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    return function() {

        var _self = this; // let's use it instead of `this` to avoid .call() problems
        this.videoSource = null;
        this.canvasActions = [];

        this.initialize = function(_videoSrc) {

            _self.videoSource = _videoSrc;

            if (navigator.getUserMedia) {

                navigator.getUserMedia({audio: false, video: true}, function(stream) {
                    _self.videoSource.src = stream;
                    _self.loop();
                });
            } else if (navigator.webkitGetUserMedia) {

                navigator.webkitGetUserMedia({audio: false, video:true}, function(stream) {
                    _self.videoSource.src = window.webkitURL.createObjectURL(stream);
                    _self.loop();
                });
            }
        }; // initialize

        /**
         * Call each canvas action callback, which must be defined like this:
         * function callback(video_source, currently_loaded_canvases, index) { ... }
         * `index` is the name of the canvas associated with the callback
         * in the currently_loaded_canvases array. `this` is also the aforementioned
         * canvas.
         */
        this.loop = function() {

            var currentCanvases = [];
            for(i in _self.canvasActions)
                currentCanvases[i] = _self.canvasActions[i].canvas;

            for(i in _self.canvasActions) {
                var action = _self.canvasActions[i];
                if(action.active)
                    action.callback.call(action.canvas, _self.videoSource, currentCanvases, i);
            }

            // Reissue callback
            //setTimeout(function() { _reqAnimFrame(_self.loop); }, 200);
            _reqAnimFrame(_self.loop);
        }; // loop

        /**
         * Push a new canvas action
         * @param name      a unique name that identifies the canvas
         * @param canvas    the canvas upon which execute operations
         * @param callback  operation to be executed
         */
        this.addCanvasAction = function(name, canvas, callback) {
            _self.canvasActions[name] = { canvas: canvas, callback: callback, active: true };
            console.log(_self.canvasActions);
        }; // addCanvasAction

        /**
         * Remove the specified canvas action
         * @param name      the name of the canvas action to be popped
         */
        this.removeCanvasAction = function(name) {
            delete _self.canvasActions[name];
            console.log(_self.canvasActions);
        }

        /**
         * Toggle the canvas action's active state
         * @param name      the name of the canvas action to be popped
         */
        this.toggleCanvasAction = function(name) {
            _self.canvasAcions[name].active = !_self.canvasAcions[name].active;
        }
    };
});