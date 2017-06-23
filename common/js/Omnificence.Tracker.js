function FrameTracker(count) {
    this.MAX_SLIDE_PER_SLOT = 30;
    this.trackerInfo = [0];
    this.maxCount = count;

    // Identify max slot need for given count
    this.SLOTS = parseInt(this.maxCount / this.MAX_SLIDE_PER_SLOT);
    
    //Initialize the slots
    for (var index = 0; index < this.SLOTS; index++)
        this.trackerInfo[index] = 0;
}

FrameTracker.prototype.loadData = function (data) {
    data = unescape(data);
    var temp = JSON.parse(data);
    this.MAX_SLIDE_PER_SLOT = temp.MAX_SLIDE_PER_SLOT;
    this.trackerInfo = temp.trackerInfo;
    this.maxCount = temp.maxCount;
    this.SLOTS = temp.SLOTS;
    
}
FrameTracker.prototype.getData = function () {
    return escape(JSON.stringify(this));
}

FrameTracker.prototype.trackFrame = function (frameid) {
    if (frameid > this.maxCount)
        return;
    var slot = parseInt(frameid / this.MAX_SLIDE_PER_SLOT);
    var currentInfo = this.trackerInfo[slot];
    var tem = frameid % this.MAX_SLIDE_PER_SLOT;
    if (tem == 0)
        tem = 1;
    currentInfo |= Math.pow(2, (tem) - 1);

    this.trackerInfo[slot] = currentInfo;
}

FrameTracker.prototype.isViewed = function (frameid) {
    if (frameid > this.maxCount)
        return;

    var slot = parseInt(frameid / this.MAX_SLIDE_PER_SLOT);
    var currentInfo = this.trackerInfo[slot];
    var tem = frameid % this.MAX_SLIDE_PER_SLOT;
    if (tem == 0)
        tem = 1;
    var bViewed = currentInfo & Math.pow(2, (tem) - 1 );

    return bViewed != 0;
}
FrameTracker.prototype.isAllFramesViewed = function () {
    
    for (var index = 1; index < this.maxCount; index++) {
        if (!this.isViewed(index))
            return false;        
    }
    return true;  
}
