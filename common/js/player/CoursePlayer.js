var disableAll = true;
var count = 1;
var g_totalscore = 0;
var isIpad = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
var _gLastSlideID = 0;

window.requestAnimFrame = function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();

function BarAnimation(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (this.canvas == null) {
        throw "Canvas not found.";
    }
    this.context = this.canvas.getContext("2d");
}

BarAnimation.prototype.animateHorizontalBar = function (img, angle) {
    if (angle == 0)
        return;
    this.context.clearRect(0, 0, 350, 350);
    this.context.save();
    this.context.translate(100, 100);
    this.context.rotate(angle * Math.PI / 180);
    this.context.fillRect(-15, -15, 30, 30);
    this.context.restore();
    var me = this;
    window.setTimeout(function () {
        requestAnimFrame(function () {
            angle -= 0.1;
            me.animate("test", angle);
        });
    }, 1000 / 60);
}

BarAnimation.prototype.animateHBar = function (height, start, x, y, w) {
    var my_gradient = this.context.createLinearGradient(0, 0, 170, 0);
    my_gradient.addColorStop(0, "#fde4d8");
    my_gradient.addColorStop(0.15, "#ed1c24");
    my_gradient.addColorStop(1, "#ed1c24");

    if (height <= parseInt(start))
        return;
    if (start == undefined || start == null)
        start = 0;

    this.context.clearRect(0, 0, 350, 350);
    this.context.save();
    this.context.fillStyle = my_gradient;
    this.context.fillRect(x, y, start, w);
    this.context.restore();
    var me = this;
    window.setTimeout(function () {
        requestAnimFrame(function () {
            start += 0.5;
            me.animateHBar(height, start, x, y, w);
        });
    }, 1000 / 60);
}

BarAnimation.prototype.animateVBar = function (height, start, x, y, w) {
    var my_gradient = this.context.createLinearGradient(0, 0, 0, 170);
    my_gradient.addColorStop(0, "#ed1c24");
    my_gradient.addColorStop(0.40, "#ed1c24");
    my_gradient.addColorStop(1, "#fde4d8");

    if (height <= parseInt(start))
        return;
    if (start == undefined || start == null)
        start = 0;
    this.context.save();
    this.context.fillStyle = my_gradient;
    this.context.fillRect(x, y, w, -start);
    this.context.restore();
    var me = this;
    window.setTimeout(function () {
        requestAnimFrame(function () {
            start += 0.5;
            me.animateVBar(height, start, x, y, w);
        });
    }, 1000 / 60);
}

function CoursePlayer(audioID, sinkObject) {
    this.currentSlide = null;
    this.currentView = null;
    this.sinkObject = sinkObject;
    this.audioPlayer = document.getElementById(audioID);
    var me = this;
    this.audioPlayer.addEventListener("error", function (e) { me.onAudioError(e); });
    this.audioPlayer.addEventListener("ended", function (e) { me.OnAudioComplete(e); });
    this.audioPlayer.addEventListener("timeupdate", function (e) { me.onProgress(e); });
}

CoursePlayer.prototype.onAudioError = function (e) {
    try {
        sinkObject.AudioFailed(this.currentSlide.getElementsByTagName("audio")[0].src);
    }
    catch (error) { }
}

CoursePlayer.prototype.OnAudioComplete = function (e) {
    updatePlaybutton(false);
    if (this.slideIndex < (this.Slides.length - 1)) {
        $('#NxtImg').tooltip('show');
    }
    this.playStatus = false;
    g_AnimationController.stop();
    disableAll = false;

    var sessionTime = GetTimeDifference(startTime, new Date());
    if (sessionTime != undefined) {
        SetSessionTime(sessionTime);
        SetTotalTime(sessionTime);
    }
}

CoursePlayer.prototype.SetCurrentTime = function (time) {
    this.audioPlayer.currentTime = time * this.audioPlayer.duration;
    g_AnimationController.performAnimationAt(time * this.audioPlayer.duration * 1000);
}

CoursePlayer.prototype.onPlay = function () {
    $('#NxtImg').removeClass('nextbuttonglow');
    var slideCount = this.slideIndex;
    var slideTotalsec = this.currentSlide.getAttribute("duration");
    $('#slideduration').html(slideTotalsec);
    $('#slideCount').html('Frames ' + (parseInt(slideCount) + 1) + ' of ' + (this.Slides.length ));
}

CoursePlayer.prototype.onProgress = function (e) {
    var minutes = parseInt(Math.floor(e.currentTarget.currentTime / 60));
    var seconds = parseInt(e.currentTarget.currentTime - minutes * 60);
    $('#timeduration').html((minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
    var progressbarValue = e.currentTarget.currentTime / e.currentTarget.duration;
    $('#progress-bar').simpleSlider("setValue", progressbarValue);
    var elements = this.elementArray;
    g_AnimationController.setCurrentTime(e.currentTarget.currentTime);
    return;
}

CoursePlayer.prototype.initialize = function (xmlFilePath) {

    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    }

    else {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xhttp.open("GET", xmlFilePath, false);
    xhttp.send();
    if (window.DOMParser) {
        parser = new DOMParser();
        this.ModuleContent = xhttp.responseXML;
        this.loadSlides();
        this.loadPlayList();
        return;
    }
    this.ModuleContent = null;
    count = 1;
}

CoursePlayer.prototype.loadSlides = function () {
    this.slideIndex = -1;
    this.Slides = this.ModuleContent.getElementsByTagName("slide");
    if (this.Slides.length > 0) {
        this.tracker = new FrameTracker(this.Slides.length);
        this.slideIndex = 0;
        this.currentSlide = this.Slides[this.slideIndex];
        this.audioPlayer.autoplay = false;
        this.loadCurrentSlide();
    }

    if (_gLastSlideID != undefined) {
        this.LoadbySlide(_gLastSlideID);
    }      
}

CoursePlayer.prototype.loadPlayList = function () {
    this.Slides = this.ModuleContent.getElementsByTagName("slide");
    this.Module = this.ModuleContent.getElementsByTagName("module")[0];

    var html = "";
    for (var slideIndex = 0; slideIndex < this.Slides.length ; slideIndex++) {
        var slide = this.Slides[slideIndex];
        var slideName = slide.getAttribute("name");
        var slideDuration = slide.getAttribute("duration");
        var type = slide.getAttribute("type");
        var sno = slide.getAttribute("sno");

        if (parseInt(type) == 2) {
            var main = slide.getAttribute("maintitle");
            html += '<h5 style="font-family:scalasans; font-weight:Bold;">' + main + "</h5>"
            if (slideIndex < 9)
                html += '<div class="list-items" style="margin-left:25px;" id="listitem' + slideIndex + '" onclick="onClickPlayList(' + slideIndex + ',this);" >' + sno + ". " + slideName + '<span>' + slideDuration + '</span></div>';
            else
                html += '<div class="list-items" style="margin-left:20px;" id="listitem' + slideIndex + '" onclick="onClickPlayList(' + slideIndex + ',this);" >' + sno + ". " + slideName + '<span>' + slideDuration + '</span></div>';
        }

        else if (parseInt(type) == 3) {
            var main = slide.getAttribute("maintitle");
            html += '<h5 style="font-family:scalasans; font-weight:Bold;">' + main + "</h5>";
        }

        else if (parseInt(type) == 4) {

        }

        else {
            if (slideIndex < 9)
                html += '<div class="list-items" style="margin-left:25px;" id="listitem' + slideIndex + '" onclick="onClickPlayList(' + slideIndex + ',this);" >' + sno + ". " + slideName + '<span>' + slideDuration + '</span></div>';
            else
                html += '<div class="list-items" style="margin-left:20px;" id="listitem' + slideIndex + '" onclick="onClickPlayList(' + slideIndex + ',this);" >' + sno + ". " + slideName + '<span>' + slideDuration + '</span></div>';
        }
    }

    $('#playlist').html(html);
    $('#totalDuration').html(this.Module.getAttribute("totalduration"));
}


CoursePlayer.prototype.LoadbySlide = function (slideIndex) {
    this.currentSlide = this.Slides[slideIndex];
    this.slideIndex = slideIndex;
    this.loadCurrentSlide();
    this.play();
    return true;
}

CoursePlayer.prototype.nextSlide = function () {
    count = count + 1;
    $('#progress-bar').simpleSlider("setValue", 0);
    if (this.slideIndex < this.Slides.length - 1) {
        this.tracker.trackFrame(this.slideIndex + 1);
        this.currentSlide = this.Slides[++this.slideIndex];
        this.setCourseStatus();
        this.loadCurrentSlide();
        return true;
    }
    return false;
}

CoursePlayer.prototype.setCourseStatus = function () {
    if (this.tracker.isAllFramesViewed()) {
        g_scromManager.doLMSSetValue("cmi.core.lesson_status", "passed");
        g_scromManager.doLMSSetValue("cmi.core.lesson_location", "" + (this.slideIndex));
        g_scromManager.doLMSCommit();
    }

    else {
        g_scromManager.doLMSSetValue("cmi.core.lesson_status", "incomplete");
        g_scromManager.doLMSSetValue("cmi.core.lesson_location", "" + (this.slideIndex));
        g_scromManager.doLMSSetValue("cmi.suspend_data", this.tracker.getData());
        g_scromManager.doLMSCommit();
    }
}

CoursePlayer.prototype.loadCurrentSlide = function () {
    $('.dropdown-panel').html("");
    if (this.currentView != null) {
        this.currentView.parentNode.removeChild(this.currentView);
    }

    var masterSlide = document.getElementById(this.currentSlide.getAttribute("id"));
    this.currentView = masterSlide.cloneNode(true);
    this.currentView.id = "curslide";
    masterSlide.parentNode.insertBefore(this.currentView, masterSlide);
    this.currentView.style.display = "";

    if (this.currentSlide.getAttribute("initialize") == "dragdrop") {
        initDragDropScript(this.currentSlide.getAttribute("id"));
    }

    $('.dropdown-panel').html($('#' + this.currentSlide.getAttribute("refid")).html());
    $('#slideTitle').html(this.currentSlide.getAttribute("title"));

    LoadTranscript(this.currentView);

    // Element array list to animate
    this.elementArray = new Array();
    var elements = this.currentSlide.getElementsByTagName("frame");
    g_AnimationController.loadObjects(elements);

    this.audioPlayer.src = this.currentSlide.getElementsByTagName("audio")[0].getAttribute("src");

    try {
        g_AnimationController.setCurrentTime(0);
        this.audioPlayer.currentTime = 0;
    } catch (ex) { }

    g_AnimationController.play(this.audioPlayer.currentTime * 1000);
    this.onPlay();
}

CoursePlayer.prototype.prevSlide = function () {
    count = count - 1;
    $('#progress-bar').simpleSlider("setValue", 0);
    if (this.slideIndex > 0) {
        this.currentSlide = this.Slides[--this.slideIndex];
        this.tracker.trackFrame(this.slideIndex + 1);
        this.setCourseStatus();
        this.loadCurrentSlide();
        return true;
    }
    return false;
}

CoursePlayer.prototype.play = function () {
    UpdatePlayListItem(this.slideIndex);
    this.audioPlayer.play();
    g_AnimationController.play(this.audioPlayer.currentTime * 1000);
    this.playStatus = !this.audioPlayer.paused;
    updatePlaybutton(this.playStatus);
}

CoursePlayer.prototype.pause = function () {
    this.audioPlayer.pause();
    g_AnimationController.pause();
    this.playStatus = !this.audioPlayer.paused;
    updatePlaybutton(this.playStatus);
}

CoursePlayer.prototype.getPlayerStatus = function () {
    return this.playStatus;
}

// On close of the window store the status of the frame
function UpdatePlayListItem(id) {
    var elements = $('#listitem' + id).parent().find('div');
    for (var index = 0; index < elements.length; index++) {
        elements[index].className = "list-items";
    }
    $('#listitem' + id).attr('class', 'list-items active');
}

function updatePlaybutton(status) {
    if (status) {
        document.getElementById("toggelbutton").src = "../common/img/pauseBtn.png";
    }
    else {
        document.getElementById("toggelbutton").src = "../common/img/playBtn.png";
    }
}

function ElementData() {
    this.id = "";
    this.time = 0;
    this.type = "";
}

//function LoadTranscript(slideView) {
//    if (transcriptState) {
//        $(slideView).find('#stickyContent').hide();
//        $(slideView).find('#transcript-hide').show();
//        $(slideView).find('.slidecontent').css("width", "70%");
//    }
//    else {
//        $(slideView).find('#transcript-hide').hide();
//        $(slideView).find('.slidecontent').css("width", "100%");
//        $(slideView).find('#stickyContent').show();
//    }
//}

function LoadTranscript(slideView) {
    if (transcriptState) {

        $(slideView).find('#transcript-hide').hide();
        $(slideView).find('.slidecontent').css("width", "99%");
        $(slideView).find('#stickyContent').show();
        $(slideView).find(".frame").css("margin-left", "130px");
        if ($(slideView).attr('data-interactivity') == "true") {
            $(slideView).find(".frame").css("margin-left", "0px");
            // $(slideView).css("background-color", "rgba(255,255,255,0.8)");
        }

    }
    else {
        $(slideView).css("background-color", "transparent");
        $(slideView).find('#stickyContent').hide();
        $(slideView).find('#transcript-hide').show();
        $(slideView).find('.slidecontent').css("width", "70%");
        $(slideView).find(".frame").css("margin-left", "0px");
    }

}

$(window).load(function () {
    $(".loader").fadeOut("slow");
    setTimeout(function () {
        reDirect()
    }, 2000);
});

function reDirect() {

}


function createAttempt() {
    
    g_scromManager.doLMSInitialize();
    _gTime = g_scromManager.doLMSGetValue("cmi.core.total_time");
    totalSpendTime = _gTime;
    var status = g_scromManager.doLMSGetValue("cmi.core.lesson_status");
    if (status != "completed") {
        g_scromManager.doLMSSetValue("cmi.core.lesson_status", "incomplete");
        g_scromManager.doLMSCommit("");
    }
    var slideid = g_scromManager.doLMSGetValue("cmi.core.lesson_location");
    if (slideid == "" || slideid == "22") {
        g_scromManager.doLMSSetValue("cmi.core.lesson_location", "0");
        g_scromManager.doLMSCommit("");
        _gLastSlideID = 0;
     
    }
    else {
        _gLastSlideID = parseInt(slideid);
    }
    
    Init();
    
    var trackerData = g_scromManager.doLMSGetValue("cmi.suspend_data");
    if (trackerData != "") {
        coursePlayer.tracker.loadData(trackerData);
	
        if (parseInt(slideid) >= parseInt(g_end_slide)) {
            disable_all();
            coursePlayer.LoadbySlide(0);
        }
    }
  Disclaimer_Onload();  
}

CoursePlayer.prototype.customonclickAnswerpost = function (ele) {
    if (this.currentSlide.getAttribute("initialize") != "dragdrop") {
        onclickAnswerpost(ele);
    }
}