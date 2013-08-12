define(['Util'], function(Util) {

    var Blob = {

        Blob: function() {
            this._positions = [];

            this.addPoint = function(x, y, j) {
                this._positions.push({x:x,y:y,j:j});
            }

            this.isAdjacent = function(x, y) {
                for(var i in this._positions) {
                    var p = this._positions[i];
                    if(Math.abs(p.x - x) < 2 && Math.abs(p.y - y) < 2)
                        return true;
                }
            }

            this.centerOfMass = function() {
                var _x = 0;
                var _y = 0;

                for(var i in this._positions) {
                    _x += this._positions[i].x;
                    _y += this._positions[i].y;
                }

                _x /= this._positions.length;
                _y /= this._positions.length;

                return { x : parseInt(_x), y : parseInt(_y) };
            }

            this.getLength = function() {
                return this._positions.length;
            }
        },

        BlobHistory: function() {

            /**
             * [
             *   { blob: Blob, history: [ list of centers of masses ] },
             *   ...
             * ]
             * @type {Array}
             * @private
             */
            this._hist = [];
            var _self = this;

            this.addBlobFrame = function(blob, thresh) {
                var com = blob.centerOfMass();

                if(thresh == undefined)
                    thresh = 25;

                for(var i in _self._hist) {
                    var bli = _self._hist[i];
                    var d = Util.PointDistance(bli.history[bli.history.length - 1], com);
                    if(d < thresh) {
                        bli.history.push(com);
                        return;
                    }
                }

                _self._hist.push({ blob: blob, history: [com] });
            }

            this.getHistory = function() {
                return _self._hist;
            }

            this.resetHistory = function(blob) {
                for(var i in _self._hist)
                    _self._hist[i].history =
                        [_self._hist[i].history[ _self._hist[i].history.length - 1 ]];
                /*if(blob == undefined) {
                    for(var i in _self._hist)
                        if(_self._hist[i].blob != undefined)
                            _self.resetHistory(_self._hist[i].blob);
                    return;
                }

                for(var i in _self._hist)
                    if(_self._hist[i].blob == blob)
                        _self._hist[i].history = [];*/
            }

        }
    };

    return Blob;
});