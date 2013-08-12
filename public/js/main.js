require(['AnimationHandler', 'ImageDataHandler', 'Blob', 'Util'], function(AnimationHandler, ImageDataHandler, Blob, Util) {

    var R = 0;
    var G = 255;
    var B = 0;
    var Thresh = 10;

	var blobHist = new Blob.BlobHistory();
    var currentBlobs = [];

    var video = $('#webcam')[0];
    var canvasSource = $("#canvas-src")[0];
    var canvasThreshold = $("#canvas-thresh")[0];

    var ah = new AnimationHandler();
    ah.initialize(video);

    var contextSource = canvasSource.getContext('2d');
    var contextThreshold = canvasThreshold.getContext('2d');

    contextSource.translate(canvasSource.width, 0);
    contextSource.scale(-1, 1);
    contextThreshold.translate(canvasThreshold.width, 0);
    contextThreshold.scale(-1, 1);

    setInterval(function() {

        for(var i in currentBlobs)
            blobHist.addBlobFrame(currentBlobs[i].blob);

    }, 250);

    setInterval(function() {

        blobHist.resetHistory();

    }, 5000);

    $(window).on('detect-scroll', function(evt, data) {

        if($(window).data('detect-scroll-lock') == true)
            return;

        $(window).data('detect-scroll-lock', true);

        blobHist.resetHistory();
        var nparag = window.location.hash.replace(/^.*parag(\d+)$/, '$1');

        if(data.direction == 'up') {
            nparag--;
            if(nparag < 1) nparag = 1;
        } else if(data.direction == 'down') {
            nparag++;
            if(nparag > 8) nparag = 8;
        }

        $('html, body').animate({
            'scrollTop': $('#parag' + nparag).offset().top
        }, function() {
            location.href = '#parag' + nparag;
        });

        setTimeout(function() {
            $(window).data('detect-scroll-lock', false);
        }, 1000);

    });

    ah.addCanvasAction('Source', canvasSource, function(video, canvases, index) {
        this.getContext('2d').drawImage(video, 0, 0, this.width, this.height);

    });

    ah.addCanvasAction('RGBClassBlDetCentMass', canvasThreshold, function(video, canvases, index) {

        var R = 0;
        var G = 255;
        var B = 0;
        var Thresh = 10;

        var src = canvases['Source'];
        var blobs = [];

        var imageData = src.getContext('2d').getImageData(0, 0, src.width, src.height);
        var outData = this.getContext('2d').createImageData(this.width, this.height);

        var srcIDH = new ImageDataHandler(imageData, src.width, src.height);
        var outIDH = new ImageDataHandler(outData, this.width, this.height);

        for(var y = 0; y < src.height; y++) {
            for(var x = 0; x < src.width; x++) {

                var j = (y * src.width + x) * 4;

                var px = srcIDH.getPixelAt(x,y);
                var r = px[0],
                    g = px[1],
                    b = px[2];

                if(r >= g && r >= b) { r = 255; g = 0; b = 0; }
                if(g >= r && g >= b) { r = 0; g = 255; b = 0; }
                if(b >= r && b >= g) { r = 0; g = 0; b = 255; }

                if(
                    Math.abs(r - R) < Thresh &&
                        Math.abs(g - G) < Thresh &&
                        Math.abs(b - B) < Thresh
                    ) {

                    var foundBlob = false;
                    for(var i in blobs) {
                        if(blobs[i].isAdjacent(x, y)) {
                            blobs[i].addPoint(x, y, j);
                            foundBlob = true;
                            break;
                        }
                    }

                    if(!foundBlob) {
                        var b = new Blob.Blob();
                        b.addPoint(x,y);
                        blobs.push(b);
                    }
                }
                outIDH.setPixelAt(x, y, [0,0,0,200]);
            }
        }

        currentBlobs = [];

        for(var i in blobs) {

            if(blobs[i].getLength() > 300) {

                var poss = blobs[i]._positions;
                for(var j in poss) {
                    outData.data[poss[j].j] = 0;
                    outData.data[poss[j].j + 1] = 255;
                    outData.data[poss[j].j + 2] = 0;
                }

                var p = blobs[i].centerOfMass();
                for(var _y = p.y; _y < p.y+5; _y++) {
                    for(var _x = p.x; _x < p.x+5; _x++) {
                        outData.data[_y * video.width * 4 + _x * 4] = 0;
                        outData.data[_y * video.width * 4 + _x * 4+1] = 0;
                        outData.data[_y * video.width * 4 + _x * 4+2] = 255;
                    }
                }

                currentBlobs.push({ blob: blobs[i], centerOfMass: p });
            }
        }

        this.getContext('2d').putImageData(outData,0,0);

        var hist = blobHist.getHistory();

        var ctx = this.getContext('2d');

        if($(window).data('detect-scroll-lock') != true) {
            for(var j = 0; j < hist.length; j++) {

                var cBlob = hist[j];

                var directions = [];

                ctx.beginPath();
                ctx.moveTo(this.width - cBlob.history[0].x, cBlob.history[0].y);

                for(var i = 1; i < cBlob.history.length; i++) {
                    ctx.lineTo(this.width - cBlob.history[i].x, cBlob.history[i].y);

                    var d = Util.Direction(cBlob.history[i], cBlob.history[i-1]);
                    if(Math.abs(d.x) < 20) {
                        if(d.y > 5)
                            directions.push(1);
                        else if(d.y < -5)
                            directions.push(-1);
                        else
                            directions.push(0);
                    } else directions.push(0);

                    if(directions.length > 8)
                        directions.splice(0);
                }

                for(var di = 0; di < 6; di++) {
                    if(directions[di] == 1 && directions[di+1] == 1/* && directions[di+2] == 1*/) {

                        $(window).trigger('detect-scroll', { direction: 'down' });
                        directions = [];

                    } else if(directions[di] == -1 && directions[di+1] == -1 /*&& directions[di+2] == -1*/) {

                        $(window).trigger('detect-scroll', { direction: 'up' });
                        directions = [];
                    }

                }

                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    });

    /**
     * Pixel Classification
     */
    /*ah.addCanvasAction('RGBClassify', canvasThreshold, function(video, canvases, index) {

        var src = canvases['Source'];

        var imageData =
            src
                .getContext('2d')
                .getImageData(0, 0, src.width, src.height);
        var outData = this.getContext('2d').createImageData(src.width, src.height);

        for(var j = 0; j < imageData.data.length; j += 4) {

            var r = imageData.data[j],
                g = imageData.data[j+1],
                b = imageData.data[j+2];

            outData.data[j] = outData.data[j + 1] = outData.data[j + 2] = 0;

            if(r >= g && r >= b) outData.data[j] = 255;
            if(g >= r && g >= b) outData.data[j+1] = 255;
            if(b >= r && b >= g) outData.data[j+2] = 255;

            outData.data[j+3] = 255;
        }

        this.getContext('2d').putImageData(outData,0,0);
    });*/

    /**
     * Blob detection
     */
    /*ah.addCanvasAction('BlobDetect', canvasThreshold, function(video, canvases, index) {

        var src = canvases['Source'];

        var imageData =
            src
                .getContext('2d')
                .getImageData(0, 0, src.width, src.height);
        var d = imageData.data;
        var outData = this.getContext('2d').createImageData(src.width, src.height);

        for(var j = 0; j < imageData.data.length; j += 4) {

            if(
                Math.abs(d[j] - R) < Thresh &&
                Math.abs(d[j+1] - G) < Thresh &&
                Math.abs(d[j+2] - B) < Thresh
              )
                outData.data[j] = outData.data[j+1] = outData.data[j+2] = 255;
            else
                outData.data[j] = outData.data[j+1] = outData.data[j+2] = 0;

            outData.data[j+3] = 200;
        }
        this.getContext('2d').putImageData(outData, 0, 0);
    });*/

    /**
     * Edge detection with auto-adjusting threshold
     */
    /*ah.addCanvasAction('EdgeDetect', canvasThreshold, function(video, canvases, index) {

        var src = canvases['Source'];
        this.edgeThreshold = 40;

        var imageData =
            src
                .getContext('2d')
                .getImageData(0, 0, src.width, src.height);

        var outData = this.getContext('2d').createImageData(src.width, src.height);

        //var srcIDH = new ImageDataHandler(imageData, src.width, src.height);
        //var outIDH = new ImageDataHandler(outData, src.width, src.height);

        var around = [
            - 1 - src.width, - src.width, 1 - src.width
            - 1,                          1
            - 1 + src.width,   src.width, 1 + src.width
        ]

        var avg = 0;

        for(var j = 0; j < imageData.data.length; j += 4) {

            var darkest = undefined;
            var lightest = undefined;

            for(var i in around) {
                var offset = around[i] * 4;
                //if(index.x >= 0 && index.y >= 0) {
                if(j + offset > 0 && j + offset < imageData.data.length) {
                    //var px = srcIDH.getPixelAt(index.x, index.y);
                    //var pv = ImageDataHandler.pixelValue(px);
                    var pv = imageData.data[j + offset]
                        + imageData.data[j + offset + 1]
                        + imageData.data[j + offset + 2]
                        + imageData.data[j + offset + 3];

                    if(darkest === undefined || pv < darkest)
                        darkest = pv;
                    if(lightest === undefined || pv > lightest)
                        lightest = pv;
                }
            }

            if(Math.abs(lightest - darkest) > this.edgeThreshold) {
                outData.data[j] = outData.data[j+1] = outData.data[j+2] = 0;
                avg++;
                //outIDH.setPixelAt(x, y, [255,255,255,255]);
            }
            else {
                outData.data[j] = outData.data[j+1] = outData.data[j+2] = 255;
                //outIDH.setPixelAt(x, y, [0,0,0,255]);
            }
            outData.data[j+3] = 255;

            var avgThresh = imageData.data.length / 4;
            var percent = avg / avgThresh;

            this.edgeThreshold = percent * 400;

            //$('#log').html(avg + ', ' + imageData.data.length / 4 + ', ' + this.edgeThreshold);

        }

        this.getContext('2d').putImageData(outData, 0, 0);

    });*/

    /**
     * Auto-adjusting threshold: produces a BW image with roughly
     * 50% of the pixels white and 50% black
     */

    /*ah.addCanvasAction('Threshold', canvasThreshold, function(video, canvases, index) {

        var src = canvases['Source'];
        if(this.threshold === undefined)
            this.threshold = 127;

        var imageData =
            src
                .getContext('2d')
                .getImageData(0, 0, src.width, src.height);

        var outData = this.getContext('2d').createImageData(src.width, src.height);

        var avg = 0;

        for(var i = 0; i < imageData.data.length; i += 4) {
            if(   imageData.data[i]
                + imageData.data[i+1]
                + imageData.data[i+2]
                + imageData.data[i+3]
                >
                4 * this.threshold
            ) {
                outData.data[i] = outData.data[i+1] = outData.data[i+2] = 255;
                avg++;
            }
            else {
                outData.data[i] = outData.data[i+1] = outData.data[i+2] = 0;
            }

            outData.data[i+3] = 127; // alpha
        }

        var avgThresh = imageData.data.length / 8;

        if(Math.abs(avg - avgThresh) > 1000) {
            if(avg > avgThresh)
                this.threshold++;
            else
                this.threshold--;
        }


        $('#log').html(avg+', '+ avgThresh+', '+ this.threshold);

        this.getContext('2d').putImageData(outData, 0, 0);

    });*/

});