const GoogleTTS = require('./tts')

let line = '{line}'
let showTime = '{showtime}'
let audioUrl = '{audioUrl}'
let audioVolume = '{audioVolume}'
let ttsLang = '{ttsLang}'
const commandRegexp = /^!d([0-9]+)$/

let channelName = ''

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

window.addEventListener('onWidgetLoad', function (obj) {
    channelName = obj.detail.channel.username.toLowerCase()
})

window.addEventListener('onEventReceived', function (obj) {
    if (obj.detail.listener !== "message") return
    let data = obj.detail.event.data
    if (data["displayName"].toLowerCase() !== channelName) return
    let message = data["text"]
    if (!commandRegexp.test(message)) return
    let matches = data["text"].match(commandRegexp)
    console.log("Playing audio", audioUrl)
    let container = document.getElementById('random-number')
    container.setAttribute("style", 'font-size: {titleSize}px;color:{titleColor};font-family: "{titleStyle}", sans-serif;')


    let audio = new Audio()
    audio.src = audioUrl
    audio.volume = (parseFloat(audioVolume) / 100)
    audio.onended = _ => Promise.resolve(_ => 1 + Math.floor(Math.random() * parseInt(matches[1])))
        .then(number => {
            let text = line.replace("{number}", number)
            container.innerText = text
            container.setAttribute("class", "")
            return text
        })
        .then(text => GoogleTTS.textToSpeech(text, ttsLang || 'en'))
        .catch(e => console.error(e))
        .then(async _ => await sleep(parseInt(showTime || 7500)))
        .finally(_ => container.setAttribute("class", "hide"))
    audio.play()
})

