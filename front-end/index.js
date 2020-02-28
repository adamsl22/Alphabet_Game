const LETTERS_URL = 'http://localhost:3000/letters'
const USERS_URL = 'http://localhost:3000/users'
const GAMES_URL = 'http://localhost:3000/games'
const LG_URL = 'http://localhost:3000/lgs'

let introSlot = document.getElementById('intro-slot')


document.addEventListener('DOMContentLoaded', () => {
    introPage()
    buttons()
})

function buttons(){
    document.addEventListener('click', (e) => {
        switch  (e.target.innerText){
            case 'Returning Player':
                introSlot.innerHTML = `${instructions}<br>${playerForm}`
                returningUser()
                break
            case 'New Player':
                introSlot.innerHTML = `${instructions}<br>${playerForm}`
                addUser()
                break
        }
    })
}

const instructions = `<h3>Instructions:<h3>`

const playerForm = `
    <form id='form'>
        <input type="text" name="name" placeholder="Username" value="" />
        <input type="submit" value="Submit" />
    </form>
`    

function introPage(){
    introSlot.innerHTML = `
        <h1>Welcome</h1>
        <button>Returning Player</button>
        <h2>or</h2>
        <button>New Player</button>
    `
}

function addUser(){
    let userForm = document.getElementById("form")
    userForm.addEventListener('submit', (e) => {
        e.preventDefault()

        let data = {
            "name": userForm.name.value
        }
        
        fetch(USERS_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                accept: 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(resp => resp.json())
        .then(user => {
            if(user.id){
                currentUser(user)
            } else {
                alert('This username is already in use.')
            }
        })
    })
}

function returningUser(){
    let userForm = document.getElementById("form")
    userForm.addEventListener('submit', (e) => {
        e.preventDefault()
        fetch(USERS_URL)
        .then(resp => resp.json())
        .then(users => currentUser(users.filter(user => user.name === userForm.name.value)[0]))
    })
}

function introToGame(){
    let transition = document.getElementById("transition-page")
    introSlot.innerHTML = ''
    transition.remove()
}

function currentUser(user){
    introToGame()
    postBestTimes(user)
    fetch(GAMES_URL,{
        method: "Post",
        headers: {
            "content-type": "application/json",
            accept: "application/json"
        },
        body: JSON.stringify({'user_id': user.id})
    })
    .then(resp => resp.json())
    .then(game => currentGame(game))
}

function postBestTimes(user){
    let bestTimesSlot = document.getElementById('best-times')
    fetch(GAMES_URL)
    .then(resp => resp.json())
    .then(games => {
        const successfulGames = games.filter(game => game.result === true)
        const successfulGamesSeconds = successfulGames.map(game => game.seconds)
        const universalBestTime = Math.min(...successfulGamesSeconds)
        const userWins = successfulGames.filter(game => game.user_id === user.id)
        let personalBestTime
        if (userWins.length > 0){
            const userWinsSeconds = userWins.map(game => game.seconds)
            personalBestTime = Math.min(...userWinsSeconds)
        } else {
            personalBestTime = '--'
        }
        bestTimesSlot.innerHTML = `
        <span>Universal Best Time: <span id='top-time'>${universalBestTime} seconds</span><br>
        Personal Best Time: <span id='top-time'>${personalBestTime} seconds</span></span>
    `        
    })
}

let spaceKeyDetector = document.getElementById('pause')
let lettersArea = document.getElementById('letters-area')
let enabled = false

let timer = document.getElementById('clock')
let seconds = 0
function incrementSeconds(){
    if (enabled === true){
        seconds += 1
        timer.innerText = seconds.toString()
    }
}

function currentGame(game){
    spaceKeyDetector.innerText = 'Press SPACE to Start Game'
    fetch(LETTERS_URL)
    .then(resp => resp.json())
    .then(letters => letters.forEach(letter => {
        let letterSlot = document.createElement('span')
        letterSlot.innerText = ` ${letter.character}`
        lettersArea.append(letterSlot)
    }))

    document.addEventListener('keypress', (e) => {
        if (e.keyCode === 32){
            switch (spaceKeyDetector.innerText){
                case 'Press SPACE to Start Game':
                    spaceKeyDetector.innerText = 'Press Space to Pause Game'
                    enabled = true
                    break
                case 'Press Space to Pause Game':
                    enabled = false
                    spaceKeyDetector.innerText = 'Press Space to Resume Game'
                    break
                case 'Press Space to Resume Game':
                    enabled = true
                    spaceKeyDetector.innerText = 'Press Space to Pause Game'
                    break
            }
            if (enabled === true){
                setInterval(incrementSeconds, 1000)
            }
        }
    })

    setInterval(incrementSeconds, 1000)
    setInterval(fetchLetters, 500)

    function fetchLetters(){
        if (enabled === true){
            const probArray = [1,2,3,4,5,6,7,8,9,10]
            const prob = probArray[Math.floor(Math.random()*probArray.length)]
            fetch(LETTERS_URL)
            .then(resp => resp.json())
            .then(letters => sampleLetters(letters, prob))
        }
    }

    function sampleLetters(letters, prob){
        let letterArray = letters.map(letter => letter.character)
        let letterSample
        if (prob === 10){
            fetch(LG_URL)
            .then(resp.json())
            .then(lgs => {
                lgCharacters = lgs.map(lg => lg.letter.character)
                uncaughtLetters = letterArray.filter(letter => !lgCharacters.include(letter))
                letterSample = uncaughtLetters[Math.floor(Math.random()*uncaughtLetters.length)]
            })
        } else {
            letterSample = letterArray[Math.floor(Math.random()*letterArray.length)]
        }
        letterbomb(letterSample)
    }

    const canvas = document.getElementById('canvas')
    function letterbomb(letter){
        let letterBomb = document.createElement('span')
        letterBomb.className = letterbomb
        letterBomb.innerText = letter
        canvas.append(letterBomb)
    }
}


let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
var x = canvas.width/2;
var y = canvas.height-30;
var dx = 2;
var dy = -2;

function drawBall() {
ctx.beginPath();
ctx.arc(x, y, 10, 0, Math.PI*2);
ctx.fillStyle = "#0095DD";
ctx.fill();
ctx.closePath();
}

function draw() {
ctx.clearRect(0, 0, canvas.width, canvas.height);
drawBall();
x += dx;
y += dy;
}
