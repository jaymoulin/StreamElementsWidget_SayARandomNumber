(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    container.setAttribute("style", 'font-size: {titleSize}px;color:{titleColor};font-family: "{titleStyle}", sans-serif;');


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
        .then(async _ => await sleep(parseInt(showTime || 7500)))
        .catch(e => console.error(e))
        .finally(_ => container.setAttribute("class", "hide"))
    audio.play()
})


},{"./tts":2}],2:[function(require,module,exports){
const TTS = {
    async playAudios(audioUrls) {
        let audios = [];
        for (let url of audioUrls) {
            audios.push(new Audio(url));
        }
        for (let audio of audios) {
            await new Promise((resolve, reject) => {
                audio.onerror = reject;
                audio.onended = resolve;
                audio.play();
            });
            audio.remove();
        }
    },
    splitSentence(text) {
        let words = text.split(" ");
        let result = [];
        let current = "";
        let i = 0;
        while (words.length > -1) {
            let word = words[0];
            if (!word) {
                result.push(current);
                current = "";
                break;
            }
            if (current.length + word.length <= 199) {
                current += word + " ";
                words.shift();
            } else if (current.length > 0) {
                result.push(current);
                current = "";
            } else {
                current = word.substring(0, 198);
                result.push(current);
                current = "";
                words.shift();
                words.unshift(word.substring(198, word.length - 1));
            }
        }
        return result;
    },
    async textToSpeech(text, language) {
        let parts = this.splitSentence(text);
        let urls = [];
        for (let part of parts) {
            urls.push(this.getTTSUrl(part, language));
        }
        await this.playAudios(urls)
    },
    getTTSUrl(text, language) {
        return `https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=${text.length}&client=tw-ob&q=${text}&tl=${language}`
    }
}

module.exports = TTS

},{}]},{},[1]);
