# JS Motion Detection

Motion detection implementation in front-end Javascript (with a node.js backend).
Currently only tested in Google Chrome Canary.
Uses the `getUserMedia()` API to read from the webcam, then manipulates the pixel data
via `canvas`'s `ImageData`. Features blob detection and a rudimentary path detection
algorithm to scroll the page in the direction of the path of the blob.
Use green objects as the green color is used to detect blobs.


## TODO

There's still an awful lot to do and everything looks quite ugly.
Algorithms are quite heavy, should be optimized and anyway aren't really precise
yet; thresholds must be made adjustable or at least must be adjusted.

## Demo

There's a short screencast [here](http://youtu.be/XzjZc-d7TWA).