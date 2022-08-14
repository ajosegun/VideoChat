const APP_ID = '29f40bf594ee417cabbd74e1fc43b36b'
const CHANNEL = 'main'
const TOKEN = '00629f40bf594ee417cabbd74e1fc43b36bIAAJY901V6Xsol1E7mTynkPVN48scYLUeuZREgrNzpkuJGTNKL8AAAAAEACLq5A0Ac/6YgEAAQABz/pi'
let UID;

const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    UID = await client.join(APP_ID, CHANNEL, TOKEN, null)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let player = `<div class="video-container" id="user-container-${UID}"> 
                        <div class="username-wrapper"><span class="user-name">My Name</span></div>
                        <div class="video-player" id="user-${UID}"></div>
                    </div> `

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play()

}