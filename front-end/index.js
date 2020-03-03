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
            case 'Play Again':
                document.location.reload()
                break
            case 'Easy':
                difficulty = 'easy'
                introToGame()
                break
            case 'Medium':
                difficulty = 'medium'
                introToGame()
                break
            case 'Hard':
                difficulty = 'hard'
                introToGame()
                break
            case 'Unwinnable':
                difficulty = 'death'
                introToGame()
                break
        }
    })
}

const instructions = `
    <h3>Instructions:<h3>
    Drag one of each letter into the 'Keep' basket.<br>
    Drag all remaining letters into the 'Discard' basket.<br>
    Duplicate letters in the 'Keep' basket will give you a strike.<br>
    If a letter reaches the bottom of the play area<br>it will explode and give you a strike.<br>
    Five strikes and you lose.<br><br>
    `

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
    difficultySelection()
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

let difficulty
function difficultySelection(){
    introSlot.innerHTML = `
    <h2>Select Difficulty</h2>
    <button class='button'>Easy</button><br><br>
    <button class='button'>Medium</button><br><br>
    <button class='button'>Hard</button><br><br>
    <button class='button'>Unwinnable</button>
    `
}

let transition = document.getElementById("transition-page")
function introToGame(){
    introSlot.innerHTML = ''
    transition.style.display = 'none'
}

function postBestTimes(user){
    fetch(GAMES_URL)
    .then(resp => resp.json())
    .then(games => findBestTime(user, games))      
}

function findBestTime(user, games){
    const successfulGames = games.filter(game => game.result === true)
    let universalBestTime
    if (successfulGames.length > 0){
        const successfulGamesSeconds = successfulGames.map(game => game.seconds)
        universalBestTime = Math.min(...successfulGamesSeconds)
    } else {
        universalBestTime = '--'
    }

    const userWins = successfulGames.filter(game => game.user_id === user.id)
    let personalBestTime
    if (userWins.length > 0){
        const userWinsSeconds = userWins.map(game => game.seconds)
        personalBestTime = Math.min(...userWinsSeconds)
    } else {
        personalBestTime = '--'
    }

    let bestTimesSlot = document.getElementById('best-times')
    bestTimesSlot.innerHTML = `
        <span>Universal Best Time: <span id='top-time'>${universalBestTime} seconds</span><br>
        Personal Best Time: <span id='top-time'>${personalBestTime} seconds</span></span>
    `        
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
    dragAndDrop(game)
    spaceKeyDetector.innerText = 'Press SPACE to Start Game'
    fetch(LETTERS_URL)
    .then(resp => resp.json())
    .then(letters => letters.forEach(letter => {
        let letterSlot = document.createElement('span')
        letterSlot.innerText = ` ${letter.character}`
        letterSlot.className = 'blackletterslot'
        lettersArea.append(letterSlot)
    }))

    document.addEventListener('keypress', (e) => {
        if (e.keyCode === 32){
            switch (spaceKeyDetector.innerText){
                case 'Press SPACE to Start Game':
                    spaceKeyDetector.innerText = 'Press Space to Pause Game'
                    startGame()
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
        }
    })
    function startGame(){
        enabled = true
        setInterval(incrementSeconds, 1000)
        switch (difficulty){
            case 'easy':
                setInterval(fetchLetters, 2000)
                break
            case 'medium':
                setInterval(fetchLetters, 1500)
                break
            case 'hard':
                setInterval(fetchLetters, 1000)
                break
            case 'death':
                setInterval(fetchLetters, 500)
                break
        }
    }

    function fetchLetters(){
        if (enabled === true){
            const probArray = [1,2,3,4,5,6]
            const prob = probArray[Math.floor(Math.random()*probArray.length)]
            fetch(LETTERS_URL)
            .then(resp => resp.json())
            .then(letters => sampleLetters(letters, prob))
        }
    }

    function sampleLetters(letters, prob){
        let letterSample
        if (prob === 1){
            fetch(LG_URL)
            .then(resp => resp.json())
            .then(lgs => {
                lgLetters = lgs.map(lg => lg.letter)
                uncaughtLetters = letters.filter(letter => !lgLetters.includes(letter))
                letterSample = uncaughtLetters[Math.floor(Math.random()*uncaughtLetters.length)]
                letterbomb(letterSample)
            })
        } else {
            letterSample = letters[Math.floor(Math.random()*letters.length)]
            letterbomb(letterSample)
        }
    }

    const canvas = document.getElementById('canvas')

    function letterbomb(letter){
        let letterBomb = document.createElement('img')
        letterBomb.height = 40
        letterBomb.className = 'letterbomb'
        letterBomb.dataset.id = letter.id
        letterBomb.src = `./images/Letters/Letterbombs ${letter.character}W.jpg`
        canvas.appendChild(letterBomb)
        letterBomb.style.position = 'absolute'
        let x = (Math.random() * 300);
        letterBomb.style.transform = `translateX(${x}px)`
        setInterval(letterFall, 50)

        document.documentElement.style.setProperty('--tx', `${x}`);
        let dx = (175 - x) * 2 * Math.random();
        document.documentElement.style.setProperty('--dx', `${dx}`);
        let letterTimer = 0
        let enableAnimation = true

        function letterFall(){
            pauseAnimation()
            if (enableAnimation === true){
                letterTimer += 1
                ticking(letterTimer)
            }
        }

        function pauseAnimation(){
            switch (enabled){
                case true:
                    letterBomb.style.webkitAnimationPlayState = "running"
                    enableAnimation = true
                    break
                case false:
                    letterBomb.style.webkitAnimationPlayState = "paused"
                    enableAnimation = false
                    break
            }
        }

        function ticking(time){
            switch (time){
                case 50:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}O.jpg`
                    break
                case 52:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}W.jpg`
                    break
                case 65:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}O.jpg`
                    break
                case 67:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}W.jpg`
                    break
                case 75:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}O.jpg`
                    break
                case 77:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}W.jpg`
                    break
                case 80:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}O.jpg`
                    break
                case 82:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}W.jpg`
                    break
                case 85:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}O.jpg`
                    break
                case 87:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}W.jpg`
                    break
                case 90:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}O.jpg`
                    break
                case 92:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}W.jpg`
                    break
                case 95:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}O.jpg`
                    break
                case 97:
                    letterBomb.src = `./images/Letters/Letterbombs ${letter.character}W.jpg`
                    break
                case 100:
                    letterBomb.src = './images/Letterbombs Explosion.jpg'
                    if (Array.from(canvas.childNodes).includes(letterBomb)){
                        strike()
                    }
                    break
                case 102:
                    letterBomb.remove()
                    break
            }
        }
    }

    function dragAndDrop(game){
        let dragged;

        /* events fired on the draggable target */
        document.addEventListener("drag", function(event){
        }, false);

        document.addEventListener("dragstart", function(event) {
        // store a ref. on the dragged elem
        if (event.target.className === 'letterbomb' && enabled === true){
            dragged = event.target;
        }
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
        if ( event.target.id === "right-basket" ) {
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
            // event.target.appendChild(dragged);
        }
        if (event.target.id === "right-basket"){
            fetch(LG_URL,{
                method: "Post",
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json'
                },
                body: JSON.stringify({'game_id':game.id,'letter_id':dragged.dataset.id})
            })
            .then(resp => resp.json())
            .then(lg => useLg(lg))
        }
        }, false)
    }

    function useLg(lg){
        const letterSlotsArray = Array.from(lettersArea.getElementsByTagName('span'))
        fetch(LETTERS_URL)
        .then(resp => resp.json())
        .then(letters => illuminateLetter(letters))

        function illuminateLetter(letters){
            const targetLetter = letters.filter(letter => letter.id === lg.letter_id)[0].character
            const targetSlot = Array.from(letterSlotsArray.filter(letterSlot => Array.from(letterSlot.innerText.split(" ")).includes(targetLetter)))[0]
            switch (targetSlot.className){
                case 'blackletterslot':
                    targetSlot.className = 'whiteletterslot'
                    checkForWin(game)
                    break
                case 'whiteletterslot':
                    strike()
                    break
            }
        }
    }
}

const s1 = document.getElementById('s1')
const s2 = document.getElementById('s2')
const s3 = document.getElementById('s3')
const s4 = document.getElementById('s4')
const s5 = document.getElementById('s5')
let strikes = 0

function strike(){
    strikes += 1
    switch (strikes){
        case 1:
            s1.src = './images/Letterbombs Strike.jpg'
            break
        case 2:
            s2.src = './images/Letterbombs Strike.jpg'
            break
        case 3:
            s3.src = './images/Letterbombs Strike.jpg'
            break
        case 4:
            s4.src = './images/Letterbombs Strike.jpg'
            break
        case 5:
            s5.src = './images/Letterbombs Strike.jpg'
            loss()
            break
    }
}

function loss(){
    enabled = false
    transition.style.display = 'block'
    introSlot.innerHTML = `
    <h1>Game Over</h1>
    <button class='button'>Play Again</button><br>
    <h3>Best Times</h3>
    `
    fetchHighScores()
}

function checkForWin(game){
    let whiteLetters = Array.from(document.getElementsByClassName('whiteletterslot'))
    if (whiteLetters.length === 26){
        enabled = false
        transition.style.display = 'block'
        introSlot.innerHTML = `
            <h1>You Win!</h1>
            <button class='button'>Play Again</button><br>
            <h3>Best Times</h3>
        `
        fetch(`${GAMES_URL}/${game.id}`,{
            method: 'PATCH',
            headers: {
                'content-type': 'application/json',
                accept: 'application/json'
            },
            body: JSON.stringify({'seconds':seconds, 'result':true})
        })
        .then(fetchHighScores())
    }
}

function fetchHighScores(){
    fetch(GAMES_URL)
    .then(resp => resp.json())
    .then(games => postHighScores(games))
}

function postHighScores(games){
    let wonGames = games.filter(function(game){
        return game.result === true
    })

    let topTen = wonGames.sort(function(a,b){ return a.seconds - b.seconds }).slice(0, 10)

    fetch(USERS_URL)
    .then(resp => resp.json())
    .then(users => topScorers(users))
    
    function topScorers(users){
        
        let scoreTable = document.createElement("table")
        scoreTable.className = 'grid'
        scoreTable.innerHTML = `
        <tr><th>Player</th><th>Time(s)</th></tr>
        `

        topTen.forEach(hs => highScoreHash(hs))
        function highScoreHash(hs){
            let scorer = users.find(user => user.id === hs.user_id).name
            let score = hs.seconds
            let scorePost = document.createElement('tr')
            scorePost.innerHTML = `
                <td>${scorer}</td><td>${score}</td>
            `
            scoreTable.append(scorePost)
        }
        introSlot.append(scoreTable)
    }
}