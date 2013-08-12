define(function() {

    var idh = function(obj, w, h) {

        this.initialize = function(imageData, w, h) {
            this.imageData = imageData;
            this.width = w;
            this.height = h;
        }; // initialize

        this.getPixelAt = function(x, y) {

            var px = [];

            for(var i = 0; i < 4; i++)
                px[i] = this.imageData.data[(y * this.width + x) * 4 + i];

            return px;
        }; // getPixelAt

        this.setPixelAt = function(x, y, pixel, scalex, scaley) {

            if(scalex < 1) scalex = 1;
            if(scaley < 1) scaley = 1;

            for(var i = 0; i < 4; i++)
                this.imageData.data[(y * this.width + x) * 4 + i] = pixel[i];
        }; // setPixelAt

        this.getData = function() {
            return this.imageData;
        }

        if(obj !== undefined)
            this.initialize(obj, w, h);
    };

    idh.pixelValue = function(px) {
        return px[0] + px[1] + px[2] + px[3];
    }; // pixelValue

    return idh;

});
