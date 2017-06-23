
//#region Animation controller
function AnimationController() {
    this.frames = [];
    this.startTime = null;
    this.index = 0;
    this.state = State.PLAYING;
    this.lastTime = 0;
    this.currentTime = 0;
}
AnimationController.prototype.requestAnimFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

AnimationController.prototype.addCallback = function (object) {
    if (this.frames.indexOf(object) == -1)
        this.frames.push(object);
}

AnimationController.prototype.createFrame = function (element) {
    var frame = {
        elements: [],
        animation: {}
    };

    for (var eIndex = 0; eIndex < element.attributes.length; eIndex++)
        frame[element.attributes[eIndex].name] = element.attributes[eIndex].value;
    //console.log("Creating animation object for " + object.id);
    var animationObject = new Animation().getAnimationController("frame");
    animationObject.start = parseFloat(frame.stime) * 1000;
    // Set the end time
    if (frame.hstime == undefined)
        animationObject.end = 1000 * 1000;
    else
        animationObject.end = parseFloat(frame.hstime) * 1000;
    animationObject.distance = frame.dist;
    animationObject.originalPos = frame.ox;
    animationObject.object = frame;
    animationObject.source = null;
    animationObject.type = frame.stype;
    animationObject.init();
    frame.animation = animationObject;
    return frame;
}

AnimationController.prototype.createElements = function (element) {
    var objects = [];
    var elementDetail = {};
    for (var eIndex = 0; eIndex < element.attributes.length; eIndex++)
        elementDetail[element.attributes[eIndex].name] = element.attributes[eIndex].value;
    var animationObject = new Animation().getAnimationController(elementDetail.stype);
    animationObject.start = parseFloat(elementDetail.stime) * 1000;
    animationObject.end = parseFloat(elementDetail.etime) * 1000;
    animationObject.distance = elementDetail.dist;
    animationObject.originalPos = elementDetail.ox;
    animationObject.object = elementDetail;
    animationObject.source = null;
    animationObject.type = elementDetail.stype;
    animationObject.init();

    //if (objects.indexOf(animationObject) == -1)
    objects.push(animationObject);
    var source = animationObject;

    // if hide time is specified then it means the object need to hidden at the given time.
    if (elementDetail.htype != undefined) {
        var animationObject = new Animation().getAnimationController(elementDetail.htype);
        animationObject.type = elementDetail.htype;
        animationObject.start = parseFloat(elementDetail.hstime) * 1000;
        animationObject.end = parseFloat(elementDetail.hetime) * 1000;
        animationObject.distance = elementDetail.dist;
        animationObject.source = source;
        source.source = animationObject;
        animationObject.object = elementDetail;
        animationObject.init();
        objects.push(animationObject);
    }
    return objects;
}

AnimationController.prototype.loadObjects = function (frames) {
    try {
        
        this.startTime == null; // Reset the start time for each frame load
        this.frames.length = 0;
        for (var index = 0; index < frames.length; index++) {
            var frame = this.createFrame(frames[index]);
            var elements = frames[index].getElementsByTagName("element");
            for (var eindex = 0; eindex < elements.length; eindex++) {
                var element = this.createElements(elements[eindex]);
                for (var counter = 0; counter < element.length; counter++)
                    frame.elements.push(element[counter]);
            }
            this.frames.push(frame);
        }
    }
    catch (err) {
    }
}
AnimationController.prototype.setCurrentTime = function (time) {
    this.currentTime = time * 1000;
    if (this.state != State.PLAYING)
        this.performAnimation();
}

AnimationController.prototype.performAnimation = function () {
    if (this.startTime == null)
        this.startTime = new Date();
    
    var audio = this;
    this.requestAnimFrame.call( window, function () {
        try {
            var activeFrame = null;
            // First iterate through the frames and ensure only one frame is activate based on audio time.
            for (var index = 0; index < audio.frames.length ; index++) {
                var frame = audio.frames[index];            
                if (audio.currentTime > frame.animation.start && audio.currentTime < frame.animation.end) {
                    // Check whether the audio time is between frame start and end time.
                    // If so active the frame and make it play
                    if(frame.animation.state == State.ACTIVE) {
                        frame.animation.state = State.PLAYING;
                        frame.animation.startAnimate();
                        frame.animation.draw(0);
                    }
                    else if(frame.animation.state == State.COMPLETED) {
                        frame.animation.state = State.PLAYING;
                        frame.animation.reset();
                        frame.animation.startAnimate();
                        frame.animation.draw(0);
                    }
                    activeFrame = frame; // Set the frame as active for element processing.
                }
                else if(frame.animation.end < audio.currentTime) {
                    // Check whether the audio time passed the frame time.
                    // If so deactive the frame and make it completed.
                    if(frame.animation.state == State.PLAYING) {
                        frame.animation.state = State.COMPLETED;
                        frame.animation.endAnimate();
                    }
                }
                else if(frame.animation.start > audio.currentTime) {
                    // Check whether the audio time is less than the current frame start time.
                    // If so reset the frame for animation future animation.
                    if(frame.animation.state == State.PLAYING ) {
                        frame.animation.state = State.ACTIVE;
                        frame.animation.reset();
                    }
                }
            }

            if (activeFrame != null) {           
                for (var index = 0; index < activeFrame.elements.length; index++) {
                    var object = activeFrame.elements[index];               
                    if (audio.currentTime >= object.start && audio.currentTime <= object.end) {
                        // Check whether the audio time is between element start and end time.
                        // If so active the frame and make it play
                        if(object.state == State.ACTIVE) {
                            object.state = State.PLAYING;
                            object.startAnimate();
                            object.startTime = new Date();
                        }
                        else if(object.state == State.COMPLETED) {
                            object.state = State.PLAYING;
                            object.reset();
                            object.startAnimate();
                            object.startTime = new Date();
                        }
                        object.draw(new Date() - object.startTime);
                    }
                    else if(object.end < audio.currentTime) {
                        // Check whether the audio time passed the element time.
                        // If so deactive the element and make it completed.
                        if(object.state == State.PLAYING || object.state == State.ACTIVE) {
                            object.state = State.COMPLETED;
                            object.endAnimate();
                        }
                    }
                    else if(object.start > audio.currentTime) {
                        // Check whether the audio time is less than the current element start time.
                        // If so reset the element for animation future animation.
                        if (object.state == State.PLAYING || object.state == State.COMPLETED) {
                            object.state = State.ACTIVE;
                            object.reset();
                        }
                    }
                }
            }
        } catch (e) { }
        if (audio.state == State.PLAYING)
            audio.performAnimation();
    });
}

AnimationController.prototype.performAnimationAt = function (time) {
    if (this.startTime == null)
        this.startTime = new Date();
    var me = this;
}

AnimationController.prototype.pause = function () {
    this.state = State.PAUSED;
}
AnimationController.prototype.stop = function () {
    this.state = State.STOPPED;
}
AnimationController.prototype.play = function () {
    this.state = State.PLAYING;
    this.performAnimation();
}
AnimationController.prototype.play = function (time) {
    this.startTime = new Date();
    this.lastTime = time;
    this.state = State.PLAYING;
    this.performAnimation();
}
//#endregion

//#region Animation base object
var State = {
    STOPPED : 1,
    PLAYING : 2,
    PAUSED: 3,
    COMPLETED: 4,
    ACTIVE : 5
};
function Animation() {
    this.state = State.ACTIVE;
    this.start = 1;
    this.end = 2;
    this.distance = 1;
    this.speed = 1 / (this.end - this.start);
    this.originalPos = 0;
}
Animation.prototype.setStartTime = function (time) {
    this.start = time;
    this.duration = this.end - this.start;
    if (this.duration > 0)
        this.speed = this.distance / this.duration;
}
Animation.prototype.setEndTime = function (time) {
    this.end = time;
    this.duration = this.end - this.start;
    if (this.duration > 0)
        this.speed = this.distance / this.duration;
}
Animation.prototype.setDistance = function (distance) {
    this.distance = distance;
    this.duration = this.end - this.start;
    if (this.duration > 0)
        this.speed = this.distance / this.duration;
}
Animation.prototype.getSpeed = function (distance) {
    
    var duration = this.end - this.start;
    if (duration > 0)
        return distance / duration;
    return 0;
}

Animation.prototype.startAnimate = function () {
    // Overload this method to do drawing
}

Animation.prototype.draw = function () {
    // Overload this method to do drawing
}

Animation.prototype.endAnimate = function () {
    // Overload this method to do drawing
}

Animation.prototype.reset = function () {
    // Overload this method to do drawing
}
//#endregion




Animation.prototype.getAnimationController = function(type) {
    switch (type) {
        case "vbar":
            return new BarAnimation(BarType.VERTICAL);
        case "hbar":
            return new BarAnimation(BarType.HORIZONTAL);
        case "fadein":
            return new FadeAnimation(FadeType.IN);
        case "fadeout":
            return new FadeAnimation(FadeType.OUT);
        case "show":
            return new ShowAnimation();
        case "move":
            return new TransformAnimation();
        case "zoom":
            return new ZoomAnimation();
        case "manualzoom":
            return new ManualZoom();
        case "frame":
            return new FrameController();
    }
}

//#region Frame controller 
function FrameController() {
}
FrameController.prototype = new Animation();

FrameController.prototype.reset = function () {
    this.elementStyle.opacity = 0;
}
FrameController.prototype.init = function () {
    this.elementStyle = document.getElementById(this.object.id).style;
}
FrameController.prototype.startAnimate = function () {
    this.elementStyle.opacity = 1;
}
FrameController.prototype.draw = function (time) {
    this.elementStyle.opacity = 1;
}

FrameController.prototype.endAnimate = function () {
    this.elementStyle.opacity = 0;
}

//#endregion
//#region Zoom animation controller
function ZoomAnimation() {
}
ZoomAnimation.prototype = new Animation();

ZoomAnimation.prototype.reset = function () {
    this.elementStyle.left = "0px";
    this.elementStyle.top = "0px";
    this.elementStyle.width = this.widthoffset + "px";
    this.elementStyle.height = this.heightoffset + "px";
}
ZoomAnimation.prototype.init = function () {
    
    this.start = parseFloat(this.start);
    this.end = isNaN(this.end) ? this.start + 2000 : parseFloat(this.end); // Default fade time
    this.object.percent = parseInt(this.object.percent);
    this.object.x = parseInt(this.object.x);
    this.object.y = parseInt(this.object.y);
    this.object.gap = parseInt(this.object.gap);
    this.object.t = ((this.end - this.start) - this.object.gap) / 2;
    this.topmove = {};
    this.topmove.xspeed = this.object.x / this.object.t;
    this.topmove.yspeed = this.object.y / this.object.t;
    this.duration = this.end - this.start;

    this.setDistance((this.distance == undefined) ? Math.max(this.object.x, this.object.y) : parseFloat(this.distance));
    this.element = document.getElementById(this.object.id);
    this.xoffset = this.element.offsetLeft;
    this.yoffset = this.element.offsetTop;
    this.widthoffset = this.element.offsetWidth;
    this.heightoffset = this.element.offsetHeight;
    this.bottommove = {};
    this.bottommove.newx = this.element.naturalWidth * this.object.percent / 100;
    this.bottommove.newy = this.element.naturalHeight * this.object.percent / 100;
    this.bottommove.xdist = this.bottommove.newx - this.element.offsetWidth;
    this.bottommove.ydist = this.bottommove.newy - this.element.offsetHeight;
    this.bottommove.xspeed = this.bottommove.xdist / this.object.t;
    this.bottommove.yspeed = this.bottommove.ydist / this.object.t;
    this.elementStyle = this.element.style;
    
}

ZoomAnimation.prototype.draw = function (time) {
  try {
        this.elementStyle.zIndex = 1;
        // This is to zoom the element(image)
        var elapsed = time;
        if (elapsed <= ((this.duration - this.object.gap) / 2)) {
            this.elementStyle.left =  (this.topmove.xspeed * -elapsed) + "px";
            this.elementStyle.top = (this.topmove.yspeed * -elapsed) + "px";          
            this.elementStyle.width = this.widthoffset + (this.bottommove.xspeed * elapsed) + "px";
            this.elementStyle.height = this.heightoffset +(this.bottommove.yspeed * elapsed) + "px";
        }
        else if (elapsed <= (this.duration / 2 + (this.object.gap / 2))) {
        }
        else {
            elapsed -= this.object.gap + this.object.t;
            this.elementStyle.left =(this.topmove.xspeed * elapsed) - this.object.x + "px";
            this.elementStyle.top = (this.topmove.yspeed * elapsed) - this.object.y + "px";
           
            this.elementStyle.width = this.bottommove.newx - (this.bottommove.xspeed * elapsed) + "px";
            this.elementStyle.height = this.bottommove.newy - (this.bottommove.yspeed * elapsed) + "px";
        }
    } catch (e) {
    }
}
ZoomAnimation.prototype.endAnimate = function () {
    this.elementStyle.left = "0px";
    this.elementStyle.top = "0px";
    this.elementStyle.width = this.widthoffset + "px";
    this.elementStyle.height = this.heightoffset + "px";
}
//#endregion

//#region Bar animation controller
var BarType = {
    HORIZONTAL: 1,
    VERTICAL : 2
};
var FadeType = {
    IN: 1,
    OUT: 2
};
function BarAnimation(barType) {
    this.barType = barType;
    
    this.x = this.y = this.w = this.l = 0;
}
BarAnimation.prototype = new Animation();

BarAnimation.prototype.reset = function () {
    var canvas = document.getElementById(this.object.id);
    this.context.clearRect(0, 0, canvas.width, canvas.height);
}

BarAnimation.prototype.init = function () {
    this.start = parseFloat(this.start);
    this.end = isNaN(this.end) ? this.start + 4000 : parseFloat(this.end); // Default fade time
    this.setDistance((this.object.l == undefined) ? 0 : parseFloat(this.object.l));
    this.context = document.getElementById(this.object.id).getContext("2d");
    this.gradient = (this.barType == BarType.VERTICAL) ? this.context.createLinearGradient(0, 0, 0, 190) :
            this.context.createLinearGradient(0, 0, 190, 0);
    if (this.object.gradient != undefined && this.object.gradient != "") {
        var gradArray = this.object.gradient.split(";");
        for (var index = 0; index < gradArray.length; index++) {
            var gradSetting = gradArray[index].split(",");
            this.gradient.addColorStop(parseFloat(gradSetting[0]), gradSetting[1]);
        }
    }
    else
        this.gradient.addColorStop(0, "#000000");  
}

BarAnimation.prototype.draw = function (time) { 
    try {   
        if (time <= (this.end - this.start)) {
            var pos = time * this.speed;
            this.context.fillStyle = this.gradient;
            if (this.barType == BarType.VERTICAL)
                this.context.fillRect(this.object.x, this.object.y, this.object.w, -pos);
            else
                this.context.fillRect(this.object.x, this.object.y, pos, this.object.w);
        }
        
    } catch (e) {       
    }
}

BarAnimation.prototype.endAnimate = function () {
    try {
		this.context.fillStyle = this.gradient;
		if (this.barType == BarType.VERTICAL)
			this.context.fillRect(this.object.x, this.object.y, this.object.w, -this.object.l);
		else
			this.context.fillRect(this.object.x, this.object.y, this.object.l, this.object.w);
    } catch (e) {
    }
}


//#endregion

//#region Fade animation controller
function FadeAnimation(fadeType) {
    this.fadeType = fadeType;
}

FadeAnimation.prototype = new Animation();

FadeAnimation.prototype.reset = function () {
    this.elementStyle.opacity = (this.fadeType == FadeType.IN) ? 0 : 0;
}

FadeAnimation.prototype.init = function () {
    this.start = parseFloat(this.start);
    this.end = isNaN(this.end) ? this.start + 2000 : parseFloat(this.end); // Default fade time      
    this.setDistance((this.distance == undefined) ? 1 : parseFloat(this.distance));
    this.elementStyle = document.getElementById(this.object.id).style;
}

FadeAnimation.prototype.startAnimate = function () {
}

FadeAnimation.prototype.draw = function (time) { 
    var value = time * this.speed;
    this.elementStyle.opacity = Math.abs((this.fadeType == FadeType.IN) ? value : 1 - value);
    if (this.elementStyle.opacity < 0.2)
        this.elementStyle.opacity = 0;
   
}
FadeAnimation.prototype.endAnimate = function () {
    var val = parseFloat(this.elementStyle.opacity);
    this.elementStyle.opacity = (this.fadeType == FadeType.IN) ? 1 : 0;
}
//#endregion  

//#region Transform animation controller
var TransformType = {
    LEFT: 1,
    RIGHT: 2,
    UP: 3,
    DOWN: 4,
    LEFTTOP: 5,
    LEFTDOWN: 6,
    RIGHTTOP: 7,
    RIGHTDOWN: 8
};

function TransformAnimation() {
    
}

TransformAnimation.prototype = new Animation();

TransformAnimation.prototype.reset = function () {
    this.elementStyle.opacity = 0;
    if (this.transformType == TransformType.RIGHT || this.transformType == TransformType.LEFT)
        this.elementStyle.left = this.originalPos + "px";
    else
        this.elementStyle.top = this.originalPos + "px";

}
TransformAnimation.prototype.init = function () {
    this.transformType = TransformType[this.object.movetype];
    this.start = parseFloat(this.start);
    this.end = isNaN(this.end) ? this.start + 2000 : parseFloat(this.end); // Default fade time
    this.setDistance((this.distance == undefined) ? 1 : parseFloat(this.distance));
    this.element = document.getElementById(this.object.id);
    this.elementStyle = document.getElementById(this.object.id).style;
}

TransformAnimation.prototype.draw = function (time) {
    var value = time  * this.speed;
    this.elementStyle.opacity = 1;
    if (this.transformType == TransformType.RIGHT)
        this.elementStyle.left = parseInt(this.originalPos) + (value) + "px";
    else if (this.transformType == TransformType.LEFT)
        this.elementStyle.left = parseInt(this.originalPos) + (-value) + "px";
    else if (this.transformType == TransformType.UP)
        this.elementStyle.top = parseInt(this.originalPos) + (-value) + "px";
    else if (this.transformType == TransformType.DOWN)
        this.elementStyle.top = parseInt(this.originalPos) + (value) + "px";

}

TransformAnimation.prototype.endAnimate = function () {
    if (this.transformType == TransformType.LEFT || this.transformType == TransformType.RIGHT) {
        this.elementStyle.left = this.object.x + "px";
    }
    else if (this.transformType == TransformType.DOWN || this.transformType == TransformType.UP) {
        this.elementStyle.top = this.object.x + "px";
    }   
}

//#endregion

//#region Show animation controller
var ShowType = {
    LEFT2RIGHT: 1,
    RIGHT2LEFT: 2,
    TOP2BOTTOM: 3,
    BOTTOM2TOP: 4,
    LTOP2RIGHTB: 5,
    RIGHTB2LTOP: 6,
    RIGHTT2LBOTTOM: 7,
    LBOTTOM2RIGHTT: 8,
}

function ShowAnimation() {

}

ShowAnimation.prototype = new Animation();

ShowAnimation.prototype.reset = function () {
    this.elementStyle.left = this.position.left + "px";
    this.elementStyle.top = this.position.top + "px";
    this.elementStyle.width = this.position.width + "px";
    this.elementStyle.height = this.position.height + "px";
    this.elementStyle.right = this.position.right + "px";
    if (this.object.type == 2)
        this.element.children[0].style.left = this.childposition.left + "px";
}

ShowAnimation.prototype.init = function () {
    this.start = parseFloat(this.start);
    this.end = isNaN(this.end) ? this.start + 4000 : parseFloat(this.end); // Default fade time
    this.object.h = parseInt(this.object.h);
    this.object.l = parseInt(this.object.l);
    this.object.x = parseInt(this.object.x);
    this.object.y = parseInt(this.object.y);
    this.object.gap = parseInt(this.object.gap);
    this.object.type = parseInt(this.object.type);
    if ( isNaN(this.object.h))
        this.object.h = this.object.l;
    this.distance = Math.max(this.object.h, this.object.l);
    this.setDistance((this.distance == undefined) ? 1 : parseFloat(this.distance));
    
    this.element = document.getElementById(this.object.id);
    this.object.width = parseInt(this.element.offsetWidth);
    this.elementStyle = this.element.style;
 
    var me = this;
    this.position = {
        left: me.element.offsetLeft,
        top: me.element.offsetTop,
        width: me.element.offsetWidth,
        height: me.element.offsetHeight,
        right: me.element.offsetRight
    };
  
    if (this.object.type == 2) {
        this.childposition = {
            left: me.element.children[0].offsetLeft
        };
    }
    if (this.object.type == 3) {
        this.childposition = {
            right: me.element.children[0].offsetRight
        };
    }
}

ShowAnimation.prototype.draw = function (time) {
    if (this.object.type == 1) {
        this.elementStyle.zIndex = 1;
        // This is to zoom the element(image)
        var elapsed = time;
        var inc = 1;
        if (elapsed <= ((this.duration - this.object.gap) / 2)) {
            if (parseInt(this.element.offsetWidth) <= this.object.l) {
                this.elementStyle.left = (parseInt(this.element.offsetLeft) - inc) + "px";
                this.elementStyle.top = (parseInt(this.element.offsetTop) - inc) + "px";
                this.elementStyle.width = (parseInt(this.element.offsetWidth) + inc) + "px";
                this.elementStyle.height = (parseInt(this.element.offsetHeight) + inc) + "px";
            }
        }
        else if (elapsed <= (this.duration / 2 + (this.object.gap / 2))) {
        }
        else {
            if (parseInt(this.element.offsetWidth) > this.object.width) {
               // console.log("Object zoom out size : " + parseInt(this.element.offsetLeft));
                this.elementStyle.left = (parseInt(this.element.offsetLeft) + inc) + "px";
                this.elementStyle.top = (parseInt(this.element.offsetTop) + inc) + "px";
                this.elementStyle.width = (parseInt(this.element.offsetWidth) - inc) + "px";
                this.elementStyle.height = (parseInt(this.element.offsetHeight) - inc) + "px";
            }
        }
    }
    if (this.object.type == 2) {
        // this is to zoom the element(image) from top right to bottom left
        var speed = this.object.distance / (this.end - this.start);
        pos = speed * time;
        pos = parseInt(pos);

        this.element.children[0].style.left = (parseInt(this.element.children[0].offsetLeft) + pos) + "px";
        this.elementStyle.left = (parseInt(this.element.offsetLeft) - pos) + "px";
        this.elementStyle.width = (parseInt(this.element.offsetWidth) + pos) + "px";
        this.elementStyle.height = (parseInt(this.element.offsetHeight) + pos) + "px";
    }
    else if (this.object.type == 3) {
        // this is to zoom the element(image) from top left to bottom right
        var speed = this.object.distance / (this.end - this.start);
        pos = speed * time;
        pos = parseInt(pos);
        //this.element.children[0].style.right = (parseInt(this.element.children[0].offsetRight) + speed) + "px";
        //this.elementStyle.right = (parseInt(this.element.offsetRight) - speed) + "px";
        this.elementStyle.width = pos + "px";
        //this.elementStyle.height = pos + "px";
        //console.log("Speed : " + speed);
    }

    //type 4 show animation for zoom image in right

    if (this.object.type == 4) {
        this.elementStyle.zIndex = 1;
        // this is to zoom the element(image)
        var elapsed = time;
        var inc = 1;//parseInt(this.speed * time);
        if (elapsed <= ((this.duration - this.object.gap) / 2)) {
            if (parseInt(this.element.offsetWidth) <= this.object.l) {
                // console.log("Object zoom in size : " + parseInt(this.element.offsetLeft));
                this.elementStyle.right = (parseInt(this.element.offsetRight) - inc) + "px";
                this.elementStyle.top = (parseInt(this.element.offsetTop) - inc) + "px";
                this.elementStyle.width = (parseInt(this.element.offsetWidth) + inc) + "px";
                this.elementStyle.height = (parseInt(this.element.offsetHeight) + inc) + "px";
            }
        }
        else if (elapsed <= (this.duration / 2 + (this.object.gap / 2))) {
        }
        else {
            if (parseInt(this.element.offsetWidth) > this.object.width) {
                // console.log("Object zoom out size : " + parseInt(this.element.offsetLeft));
                this.elementStyle.right = (parseInt(this.element.offsetRight) + inc) + "px";
                this.elementStyle.top = (parseInt(this.element.offsetTop) + inc) + "px";
                this.elementStyle.width = (parseInt(this.element.offsetWidth) - inc) + "px";
                this.elementStyle.height = (parseInt(this.element.offsetHeight) - inc) + "px";
            }
        }
    }

}
//#endregion

//#region Manual zoom animation controller
function ManualZoom() {
}
ManualZoom.prototype = new Animation();

ManualZoom.prototype.init = function () {
}
ManualZoom.prototype.draw = function (o) {
    var ani = $('#'+ this.object.id);

    $(ani).attr("class", "zoom");
    $(ani).find(".helper").html("click to zoom in");
    $(ani).zoom({
        on: 'click', onZoomIn: function () {
            $(ani).find(".helper").html("click to zoom out");
            $(ani).css("cursor", " -webkit-zoom-out");
            $(ani).css("cursor", " -moz-zoom-out;");
        }, onZoomOut: function () {
            $(ani).find(".helper").html("click to zoom in");
            $(ani).css("cursor", " -webkit-zoom-in");
            $(ani).css("cursor", " -moz-zoom-in;");
        }
    });
}

//extra animation code
function ManualZoom() {
}
ManualZoom.prototype = new Animation();

ManualZoom.prototype.init = function () {
}
ManualZoom.prototype.draw = function (time) {
    var ani = $('#' + this.object.id);

    $(ani).attr("class", "zoom");
    $(ani).find(".helper").html("Click to zoom in");
    $(ani).zoom({
        on: 'click', onZoomIn: function () {
            $(ani).find(".helper").html("Click to zoom out");
            $(ani).css("cursor", " -webkit-zoom-out");
            $(ani).css("cursor", " -moz-zoom-out;");
        }, onZoomOut: function () {
            $(ani).find(".helper").html("Click to zoom in");
            $(ani).css("cursor", " -webkit-zoom-in");
            $(ani).css("cursor", " -moz-zoom-in;");
        }
    });
}
//#endregion


var g_AnimationController = new AnimationController();