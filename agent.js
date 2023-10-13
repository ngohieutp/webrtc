const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const localCandidate = document.getElementById('local-candidate');
const remoteCandidate = document.getElementById('remote-candidate');

const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
const peerConnection = new RTCPeerConnection(null);

registerPeerConnectionListeners(peerConnection);

async function answerCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    localVideo.srcObject = localStream;

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    const customerSDP = document.getElementById("customer-sdp").value;

    peerConnection.setRemoteDescription(new RTCSessionDescription({
        sdp: customerSDP,
        type: 'offer'
    }));

    const answer = await peerConnection.createAnswer();

    document.getElementById("agent-sdp").value = answer.sdp;

    await peerConnection.setLocalDescription(answer);
}

async function addRemoteCandidate() {
    await peerConnection.addIceCandidate(JSON.parse(remoteCandidate.value));
}

function registerPeerConnectionListeners(peerConn) {
    peerConn.addEventListener('icegatheringstatechange', (e) => {
        console.log(`ICE gathering state changed: ${peerConn.iceGatheringState}`, e.candidate);
    });

    peerConn.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConn.connectionState}`);
    });

    peerConn.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConn.signalingState}`);
    });

    peerConn.addEventListener('iceconnectionstatechange ', (e) => {
        console.log(`ICE connection state change: ${peerConn.iceConnectionState}`, e.candidate);
    });

    peerConnection.addEventListener('icecandidate', e => {
        if (e.candidate) {
            localCandidate.innerHTML = JSON.stringify(e.candidate);
        }
    });

    let remoteStream = new MediaStream();

    peerConnection.ontrack = event => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });

        remoteVideo.srcObject = null;
        remoteVideo.srcObject = remoteStream;
    }
}

