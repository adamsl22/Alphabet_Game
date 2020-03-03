const LETTERS_URL = 'http://localhost:3000/letters'
const USERS_URL = 'http://localhost:3000/users'
const GAMES_URL = 'http://localhost:3000/games'
const LG_URL = 'http://localhost:3000/lgs'

let introSlot = document.getElementById('intro-slot')


document.addEventListener('DOMContentLoaded', () => {
    introPage()
    buttons()
    dragAndDrop()
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
        <input type="submit" class="button" value="Submit" />
    </form>
`    

function introPage(){
    introSlot.innerHTML = `
        <h1>Welcome</h1>
        <button class="button">Returning Player</button>
        <h2>or</h2>
        <button class="button">New Player</button>
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

function introToGame(){
    let transition = document.getElementById("transition-page")
    introSlot.innerHTML = ''
    transition.remove()
}

function postBestTimes(user){
    fetch(GAMES_URL)
    .then(resp => resp.json())
    .then(games => findBestTime(user, games))      
}

function findBestTime(user, games){
    const successfulGames = games.filter(game => game.result === true)
    const successfulGamesSeconds = successfulGames.map(game => game.seconds)
    const universalBestTime = Math.min(...successfulGamesSeconds)
    const userWins = successfulGames.filter(game => game.user_id === user.id)

    let bestTimesSlot = document.getElementById('best-times')
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
}



let spaceKeyDetector = document.getElementById('pause')
let lettersArea = document.getElementById('letters-area')
let enabled = false
let enableAnimation = true

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
                    enableAnimation = false
                    spaceKeyDetector.innerText = 'Press Space to Resume Game'
                    break
                case 'Press Space to Resume Game':
                    enabled = true
                    enableAnimation = true
                    spaceKeyDetector.innerText = 'Press Space to Pause Game'
                    break
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
            .then(resp => resp.json())
            .then(lgs => {
                lgCharacters = lgs.map(lg => lg.letter.character)
                uncaughtLetters = letterArray.filter(letter => !lgCharacters.includes(letter))
                letterSample = uncaughtLetters[Math.floor(Math.random()*uncaughtLetters.length)]
                letterbomb(letterSample)
            })
        } else {
            letterSample = letterArray[Math.floor(Math.random()*letterArray.length)]
            letterbomb(letterSample)
        }
    }

    const canvas = document.getElementById('canvas')
    //let ctx = canvas.getContext("2d");

    function letterbomb(letter){
        let letterBomb = document.createElement('img')
        letterBomb.height = 30
        letterBomb.className = 'letterbomb'
        letterBomb.dataset.id = letter.id
        letterBomb.src = `./images/Letters/Letterbombs ${letter}W.jpg`
        canvas.appendChild(letterBomb)
        letterBomb.style.position = 'absolute'
        // letterBomb.style.transform = `translateX(${x}px)`
        setInterval(letterFall, 40)

        let x = (Math.random() * 250);
        document.documentElement.style.setProperty('--tx', `${x}`);
        //let y = 0
        //let dy = 1
        // let dx
        if (x > canvas.width/2){
            dx = Math.random() * -1;
        } else {
            dx = Math.random();
        }
        document.documentElement.style.setProperty('--dx', `${dx}`);
        let letterTimer = 0
        console.log(document.documentElement.style.getPropertyValue('--dx'))

        // function drawLb(){
        //     ctx.beginPath()
        //     ctx.drawImage(letterBomb,x,y)
        //     ctx.closePath()
        // }

        function letterFall(){
            if (enableAnimation === true){
                letterTimer += 1
                // letterBomb.style.transform = `translateX(${dx}px)`
                // letterBomb.style.transform = 'translateY(1px)'
                ticking(letterTimer)
                // drawLb()
                // x += dx
                // y += dy
            }
        }

        function ticking(time){
            switch (time){
                case 50:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}O.jpg`
                    break
                case 52:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}W.jpg`
                    break
                case 65:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}O.jpg`
                    break
                case 67:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}W.jpg`
                    break
                case 75:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}O.jpg`
                    break
                case 77:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}W.jpg`
                    break
                case 80:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}O.jpg`
                    break
                case 82:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}W.jpg`
                    break
                case 85:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}O.jpg`
                    break
                case 87:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}W.jpg`
                    break
                case 90:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}O.jpg`
                    break
                case 92:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}W.jpg`
                    break
                case 95:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}O.jpg`
                    break
                case 97:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter}W.jpg`
                    break
                case 100:
                    letterBomb.src = './images/Letterbombs Explosion.jpg'
                    break
                case 102:
                    letterBomb.remove()
                    break
            }
        }
    }
}


function dragAndDrop(){
    let dragged;

    /* events fired on the draggable target */
    document.addEventListener("drag", function(event){
    }, false);

    document.addEventListener("dragstart", function(event) {
    // store a ref. on the dragged elem
    dragged = event.target;
    // make it half transparent
    event.target.style.opacity = .5;
    }, false);

    document.addEventListener("dragend", function( event ) {
    // reset the transparency
    event.target.style.opacity = "";
    }, false);
    /* events fired on the drop targets */
    document.addEventListener("dragover", function( event ) {
    // prevent default to allow drop
    event.preventDefault();
    }, false);

    document.addEventListener("dragenter", function( event ) {
    // highlight potential drop target when the draggable element enters it
    if ( event.target.id === "right-basket" || event.target.id === "left-basket" ) {
        event.target.style.background = "white";
    }

    }, false);

    document.addEventListener("dragleave", function( event ) {
    // reset background of potential drop target when the draggable element leaves it
    if ( event.target.id === "right-basket" || event.target.id === "left-basket" ) {
        event.target.style.background = "";
    }

    }, false);

    document.addEventListener("drop", function( event ) {
    // prevent default action (open as link for some elements)
    event.preventDefault();
    // move dragged elem to the selected drop target
    if ( event.target.id == "right-basket" || event.target.id === "left-basket") {
        event.target.style.background = "";
        dragged.parentNode.removeChild(dragged);
        event.target.appendChild(dragged);
    }

    }, false)
}