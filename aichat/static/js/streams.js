const APP_ID = '29f40bf594ee417cabbd74e1fc43b36b'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let UID = Number(sessionStorage.getItem('UID'))

let NAME = sessionStorage.getItem('name')

const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)



    try {
        // Join the channel
        await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        console.error(console.error)
        window.open('/', '_self')
    }

    // Get audio and video tracks
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let member = await createMember()

    // Create a player
    let player = `<div class="video-container" id="user-container-${UID}"> 
                        <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                        <div class="video-player" id="user-${UID}"></div>
                    </div> `

    // Append the player to a video stream
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    // Play it
    localTracks[1].play(`user-${UID}`)

    // Publish the track
    await client.publish([localTracks[0], localTracks[1]])

}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.UID] = user
    await client.subscribe(user, mediaType)

    if(mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.UID}`)

        if (player != null){
            player.remove()
        }
    }

    let member = await getMember(user)

    // Create a player
    let player = `<div class="video-container" id="user-container-${user.UID}"> 
                        <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                        <div class="video-player" id="user-${user.UID}"></div>
                    </div> `

    // Append the player to a video stream
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    user.videoTrack.play(`user-${user.UID}`)

    if(mediaType === 'audio'){
        user.audioTrack.play()
    }
} 

let handleUserLeft = async (user) => {
    delete remoteUsers[user.UID]
    document.getElementById(`user-container-${user.UID}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for (let i=0; localTracks>length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    deleteMember()

    window.open('/', '_self')
}

let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }else{
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }

}

let toggleMic = async (e) => {
    if(localTracks[1].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }else{
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }

}

let createMember = async () => {
    let response = await fetch('/create_member/', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name': NAME, 'UID': UID, 'room_name': CHANNEL})
    })
    let member = await response.json()
    return member
}

let getMember = async (user) => {
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name${CHANNEL}`)
    let member = await response.json()
    return member
}

let deleteMember = async () => {
    let response = await fetch('/delete_member/', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name': NAME, 'UID': UID, 'room_name': CHANNEL})
    })
    let member = await response.json()
}


joinAndDisplayLocalStream()

window.addEventListener('beforeunload', deleteMember)

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)