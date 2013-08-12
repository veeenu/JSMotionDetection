define(function() {

    var Util = {
        PointDistance: function(a,b) {
            return Math.sqrt(
                Math.pow(a.x - b.x, 2)
                +
                Math.pow(a.y - b.y, 2)
            );
        },
        Direction: function(a, b) {
            return { x: a.x - b.x, y: a.y - b.y };
        }
    };

    return Util;

});