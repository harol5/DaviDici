const meeting = new Metered.Meeting();
const requestSupportForm = document.querySelector("#request-support-from");
const micButton = document.querySelector("#mic");
const screenShareButton = document.querySelector("#screenshare");
const fullScreenButton = document.querySelector("#fullscreen");
const leaveRoomButton = document.querySelector("#end-call");
const currentStreamMedia = [];


//=======================Add event listener to each button====================//
requestSupportForm.addEventListener("submit", async (e) =>{
    e.preventDefault();
    
    const customerName = document.querySelector("#customer-name").value;
    const customerCompany = document.querySelector("#customer-company").value;

    const meetingInfo = await meeting.join({
        roomURL: "davidici.metered.live/support",
        name: customerName,
    });
    
    console.log(meetingInfo)
    
    const text = document.createElement("h2");
    text.id = "display-text"
    text.style.cssText = `
        color: white;
        font-size: 2.6em;
        text-align: center;
    `;
    
    const isAdminPresent = meetingInfo.onlineParticipants.find(participant => participant.name === "admin");
    if(isAdminPresent) text.innerText = "admin has joined the room";
    else text.innerText = "waiting for admin to join, please wait";
    
    const localVideo = document.querySelector("#localvideo");
    localVideo.append(text);
    localVideo.scrollIntoView({ behavior: "smooth" });

    
    
    await jQuery.ajax({
        url:'/wp-json/hrcode/v1/send-notification',
        method:'POST',
        data:{
            customerName,
            customerCompany,
        },
        success: function(res) {
            console.log(res);
        },
        error: function(xhr, status, error) {
            console.log(error);
        }
    })
});


micButton.addEventListener("click", function(){
    let self = this;
    if(meeting.sharingAudio){
        meeting.stopAudio();
        this.querySelector("path").style.fill = "";
        document.querySelector("#mic-label h2").innerText = "mic off";
    }else{
        async function startAudio(){
            try {
                meeting.startAudio();
                self.querySelector("path").style.fill = "green";
                document.querySelector("#mic-label h2").innerText = "mic on";
            } catch (ex) {
                console.log("Error occurred whern sharing microphone", ex);
            }    
        }
        startAudio();
    }
});

screenShareButton.addEventListener("click",function(){
    let self = this;
    if(meeting.sharingScreen){
        meeting.stopVideo();
        self.querySelector("path").style.fill = "";
        document.querySelector("#screenshare-label h2").innerText = "share screen off";
    }else{
        async function shareScreen(){
            try {
                await meeting.startScreenShare();
                self.querySelector("path").style.fill = "green";
                document.querySelector("#screenshare-label h2").innerText = "share screen on";
            } catch (ex) {
                console.log("Error occurred when sharing screen", ex);
            }    
        }
        shareScreen();    
    }
});

fullScreenButton.addEventListener("click",()=>{
    const crrVideo = document.querySelector("video");
    if (crrVideo.webkitSupportsFullscreen) {
        crrVideo.webkitEnterFullscreen();
        return;
    }
    crrVideo.requestFullscreen();
});

leaveRoomButton.addEventListener("click",()=>{
    meeting.leaveMeeting();
    document.querySelectorAll("video").forEach(e=>{
        e.remove();
    })
    const displayText = document.querySelector("#display-text");
    displayText.innerText = "you have left the room. to start a new room, please refresh the page and click on 'JOIN ROOM' again";
    
    displayText.style.display = "block"; 
    
});


//================ SUBSCRIBING TO MEETING EVENTS ===================//
/**
 * participantInfo = {
 *       isAdmin: false
 *       meetingSessionId: "60fef02300f4a23904ab4861"
 *       name: "John Doe"
 *       roomId: "60fc7bcb1dc8562d6e4ab7b3"
 *       _id: "60fef02300f4a23904ab4862"
 *  }
 */
meeting.on("participantJoined",(participantInfo) => {
    if(participantInfo.name === "admin"){
        const displayText = document.querySelector("#display-text");
        displayText.innerText = "admin has joined the room";    
    }
});


/**
 * remoteTrackItem = { 
 *   streamId: "eaa6104b-390a-4b0a-b8d1-66f7d19f8c1a", 
 *   type: "video"
 *   participantSessionId: "60fef02300f4a23904ab4862"
 *   track: MediaStreamTrack,
 *   name: "Jane Smith"
 * }
 */
meeting.on("remoteTrackStarted", (remoteTrackItem) => {
    // Converting MediaStreamTrack to MediaStream
    const track = remoteTrackItem.track;
    const stream = new MediaStream([track]);
    
    //adding current stream media label to array.
    currentStreamMedia.push(remoteTrackItem.type);
    
    // Creating a videoTag to show the remote stream
    const videoTag = document.createElement("video");
    videoTag.autoplay = true;
    videoTag.srcObject = stream;
    videoTag.playsinline = true;
    // We are setting the id of the videoTag to the streamId
    // So that when this track is stopped we can remove the 
    // videoTag from the page.
    videoTag.id = remoteTrackItem.streamId;
    // Setting the class name to participantSessionId so that when this participant
    // leaves we can easily remove all the video tags associated with this
    // participant.
    videoTag.class = remoteTrackItem.participantSessionId;

    // Adding the video tag to container where we will display
    // All the remote streams
    const displayText = document.querySelector("#display-text");
    if(remoteTrackItem.type === "video"){
        displayText.style.display = "none";
        document.querySelector("#localvideo").append(videoTag);    
    }
});



/**
 * remoteTrackItem = { 
 *   streamId: "eaa6104b-390a-4b0a-b8d1-66f7d19f8c1a", 
 *   type: "video"
 *   participantSessionId: "60fef02300f4a23904ab4862"
 *   streamId: "eaa6104b-390a-4b0a-b8d1-66f7d19f8c1a"
 *   track: MediaStreamTrack,
 *   name: "Jane Smith"
 * }
 */
meeting.on("remoteTrackStopped", function(remoteTrackItem) {
    const index = currentStreamMedia.indexOf(remoteTrackItem.type);
    currentStreamMedia.splice(index,1);
    
    if(currentStreamMedia.length === 0){
        const displayText = document.querySelector("#display-text");
        displayText.style.display = "block";    
    }
    
    if(remoteTrackItem.type === "video"){
        document.getElementById(remoteTrackItem.streamId).remove();   
    }
});



/**
 * participantInfo = {
 *       isAdmin: false
 *       meetingSessionId: "60fef02300f4a23904ab4861"
 *       name: "John Doe"
 *       roomId: "60fc7bcb1dc8562d6e4ab7b3"
 *       _id: "60fef02300f4a23904ab4862"
 *  }
 */
meeting.on("participantLeft", function(participantInfo) {
    if(participantInfo.name === "admin"){
        const displayText = document.querySelector("#display-text");
        displayText.innerText = "admin has left the room, you can close this window now.";    
    }

    if(participantInfo.name !== "admin"){
        const displayText = document.querySelector("#display-text");
        displayText.innerText = "Due to innactivity, you have been removed from the room.\nTo start a new room, please refresh the page and click on 'JOIN ROOM' again";
    }

    // Just interating over all the video tags associate with the participant
    // and remove them
    Array.from(document.getElementsByClassName(participantInfo._id)).forEach((element) => element.remove());
});

