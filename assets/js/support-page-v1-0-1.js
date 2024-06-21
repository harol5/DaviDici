const meeting = new Metered.Meeting();
const requestSupportForm = document.querySelector("#request-support-from");
const micButton = document.querySelector("#mic");
const screenShareButton = document.querySelector("#screenshare");
const fullScreenButton = document.querySelector("#fullscreen");
const leaveRoomButton = document.querySelector("#end-call");
const localVideo = document.querySelector("#localvideo");
const currentStreamMedia = [];
let customerName;
let customerCompany;
let participantCardWrapper;

//=======================Add event listener to each button====================//
requestSupportForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  customerName = document.querySelector("#customer-name").value;
  customerCompany = document.querySelector("#customer-company").value;
  // create participantCardWrapper element
  participantCardWrapper = document.createElement("div");
  participantCardWrapper.classList.add("participantCardWrapper");

  const meetingInfo = await meeting.join({
    roomURL: "davidici.metered.live/support",
    name: customerName,
  });

  console.log(meetingInfo);

  // add card to each online participant
  meetingInfo.onlineParticipants.forEach((participantInfo) => {
    if (participantInfo.name !== customerName) {
      const participantCard = document.createElement("div");
      participantCard.classList.add("participantCard", participantInfo["_id"]);
      participantCard.innerHTML = `
        <h3>${participantInfo.name}</h3>    
      `;
      participantCardWrapper.append(participantCard);
    }
  });

  // create text element.
  const text = document.createElement("h2");
  text.id = "display-text";
  text.style.cssText = `
        color: white;
        font-size: 2.6em;
        text-align: center;
    `;

  // create text element.
  const greeting = document.createElement("h2");
  greeting.id = "greeting";
  greeting.innerText = `Hello ${customerName}`;
  greeting.style.cssText = `
        color: white;
        font-size: 2.6em;
        text-align: center;
    `;

  const isAdminPresent = meetingInfo.onlineParticipants.find(
    (participant) => participant.name === "admin"
  );

  if (isAdminPresent) text.innerText = "admin has joined the room";
  else text.innerText = "waiting for admin to join, please wait...";

  localVideo.append(greeting);
  localVideo.append(text);
  localVideo.append(participantCardWrapper);
  localVideo.scrollIntoView({ behavior: "smooth" });

  await jQuery.ajax({
    url: "/wp-json/hrcode/v1/send-notification",
    method: "POST",
    data: {
      customerName,
      customerCompany,
    },
    success: function (res) {
      console.log(res);
    },
    error: function (xhr, status, error) {
      console.log(error);
    },
  });
});

micButton.addEventListener("click", function () {
  let self = this;
  if (meeting.sharingAudio) {
    meeting.stopAudio();
    this.querySelector("path").style.fill = "";
    document.querySelector("#mic-label h2").innerText = "mic off";
  } else {
    async function startAudio() {
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

screenShareButton.addEventListener("click", function () {
  let self = this;
  if (meeting.sharingScreen) {
    meeting.stopVideo();
    self.querySelector("path").style.fill = "";
    document.querySelector("#screenshare-label h2").innerText =
      "share screen off";
  } else {
    async function shareScreen() {
      try {
        await meeting.startScreenShare();
        self.querySelector("path").style.fill = "green";
        document.querySelector("#screenshare-label h2").innerText =
          "share screen on";
      } catch (ex) {
        console.log("Error occurred when sharing screen", ex);
      }
    }
    shareScreen();
  }
});

fullScreenButton.addEventListener("click", () => {
  const crrVideo = document.querySelector("video");
  if (crrVideo.webkitSupportsFullscreen) {
    crrVideo.webkitEnterFullscreen();
    return;
  }
  crrVideo.requestFullscreen();
});

leaveRoomButton.addEventListener("click", () => {
  meeting.leaveMeeting();
  document.querySelectorAll("video").forEach((e) => {
    e.remove();
  });
  document.querySelectorAll(".participantCard").forEach((e) => {
    e.remove();
  });

  const displayText = document.querySelector("#display-text");
  displayText.innerText =
    "you have left the room. to start a new room, please refresh the page and click on 'JOIN ROOM' again";

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
meeting.on("participantJoined", (participantInfo) => {
  console.log(participantInfo);

  const participantCard = document.createElement("div");
  participantCard.classList.add("participantCard", participantInfo["_id"]);
  participantCard.innerHTML = `
    <h3>${participantInfo.name}</h3>    
  `;
  participantCardWrapper.append(participantCard);

  if (participantInfo.name === "admin") {
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
  //videoTag.class = remoteTrackItem.participantSessionId;
  videoTag.classList.add(remoteTrackItem.participantSessionId);

  // Adding the video tag to container where we will display
  // All the remote streams
  const displayText = document.querySelector("#display-text");
  if (remoteTrackItem.type === "video") {
    displayText.style.display = "none";
    localVideo.append(videoTag);
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
meeting.on("remoteTrackStopped", function (remoteTrackItem) {
  const index = currentStreamMedia.indexOf(remoteTrackItem.type);
  currentStreamMedia.splice(index, 1);

  if (currentStreamMedia.length === 0) {
    const displayText = document.querySelector("#display-text");
    displayText.style.display = "block";
  }

  if (remoteTrackItem.type === "video") {
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
meeting.on("participantLeft", function (participantInfo) {
  console.log(participantInfo);
  if (participantInfo.name === "admin") {
    const displayText = document.querySelector("#display-text");
    displayText.innerText =
      "admin has left the room, you can close this window now.";
    document.getElementsByClassName(`${participantInfo["_id"]}`)[0].remove();
  }

  if (
    participantInfo.name !== "admin" &&
    participantInfo.name !== customerName
  ) {
    const displayText = document.querySelector("#display-text");
    document.getElementsByClassName(`${participantInfo["_id"]}`)[0].remove();
  }

  if (participantInfo.name !== customerName) {
    displayText.innerText =
      "Due to innactivity, you have been removed from the room.\nTo start a new room, please refresh the page and click on 'JOIN ROOM' again";
    document.getElementsByClassName(`${participantInfo["_id"]}`)[0].remove();
  }
  // Just interating over all the video tags associate with the participant
  // and remove them
  Array.from(document.getElementsByClassName(participantInfo._id)).forEach(
    (element) => element.remove()
  );
});

// participantCardWrapper = document.createElement("div");
// participantCardWrapper.classList.add("participantCardWrapper");
// localVideo.append(participantCardWrapper);

// const participantCard = document.createElement("div");
// participantCard.classList.add("participantCard");
// participantCard.innerHTML = `
//     <h3>carlos</h3>
//   `;

// participantCardWrapper.append(participantCard);

// const participantCardTwo = document.createElement("div");
// participantCardTwo.classList.add("participantCard");
// participantCardTwo.innerHTML = `
//     <h4>carlosmartinez</h4>
//   `;

// participantCardWrapper.append(participantCardTwo);
