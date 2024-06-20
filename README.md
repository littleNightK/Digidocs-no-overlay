# Digidocs-no-overlay
This is a "no table detection overlay" version of my Digidocs repo. 
The current version uses a transparent canvas to draw table detection bounding boxes over a live camera feed. The problem is that the table detection process plus the time to draw the canvas makes the bounding boxes lag behind the camera feed by large margin. While the camera feed look smooth the lagging bounding boxes make the entire process to capture the img alot less intuitive.
This version will revert back to only drawing the result canvas and although this is really slow and laggy atleast the img and the bounding boxes will be less displaced.
Until I can get a YOLOv10 or quantize a YOLOv8 model going, we can use use this version instead.
I might even have to try and get a quantize YOLOv10 model tbh.
