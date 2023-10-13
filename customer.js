const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const localCandidate = document.getElementById('local-candidate');
const remoteCandidate = document.getElementById('remote-candidate');

const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
const peerConnection = new RTCPeerConnection(configuration);

registerPeerConnectionListeners(peerConnection);

async function makeCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    localVideo.srcObject = localStream;

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    document.getElementById("customer-sdp").value = offer.sdp;
}

async function connectAgent() {
    const agentSDP = document.getElementById("agent-sdp").value;

    peerConnection.setRemoteDescription(new RTCSessionDescription({
        sdp: agentSDP,
        type: 'answer'
    }));
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
        console.log(`ICE connection state change: ${peerConn.iceConnectionState}`, e);
    });

    peerConnection.addEventListener('icecandidate', e => {
        if (e.candidate) {
            localCandidate.innerHTML = JSON.stringify(e.candidate);
        }
    });

    peerConnection.ontrack = event => {
        let remoteStream = new MediaStream();

        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });

        remoteVideo.srcObject = null;
        remoteVideo.srcObject = remoteStream;
    }

}
