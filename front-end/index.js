const LETTERS_URL = 'http://localhost:3000/letters'
const USERS_URL = 'http://localhost:3000/users'
const GAMES_URL = 'http://localhost:3000/games'
const LG_URL = 'http://localhost:3000/lgs'

let introSlot = document.getElementById('intro-slot')


document.addEventListener('DOMContentLoaded', () => {
    introPage()
    buttons()
    backgroundMusic.play()
    backgroundMusic.loop = true
})

//Functionality for each of the buttons in the game.
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
                difficulty = 'Easy'
                introToGame()
                break
            case 'Medium':
                difficulty = 'Medium'
                introToGame()
                break
            case 'Hard':
                difficulty = 'Hard'
                introToGame()
                break
            case 'Unwinnable':
                difficulty = 'Unwinnable'
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

//Welcome page
function introPage(){
    introSlot.innerHTML = `
        <h1>Welcome</h1>
        <button class="button">Returning Player</button>
        <h2>or</h2>
        <button class="button">New Player</button>
    `
}

//Creates a file for new users to record personal best times.
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

//Retrieves the file for returning users.
function returningUser(){
    let userForm = document.getElementById("form")

    userForm.addEventListener('submit', (e) => {
        e.preventDefault()
        fetch(USERS_URL)
        .then(resp => resp.json())
        .then(users => {
            const retUser = users.filter(user => user.name === userForm.name.value)[0]
            if (retUser){
                currentUser(retUser)
            } else {
                alert('This username does not match an existing player.')
            }
        })
    })
}

//Sets the indicated user and creates the new game file.
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

//Difficulty selection
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

//Removes the html layer over the main game screen once all game options are selected.
let transition = document.getElementById("transition-page")
function introToGame(){
    introSlot.innerHTML = ''
    transition.style.display = 'none'
}

//These next two functions display the universal and personal high scores in the corner of the main game screen.
//If the user has not yet won a game, the personal best will be displayed as --.
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
let diffSlot = document.getElementById('difficulty')

//Runs the timer once the game is started.
let timer = document.getElementById('clock')
let seconds = 0
function incrementSeconds(){
    if (enabled === true){
        seconds += 1
        timer.innerText = seconds.toString()
    }
}

//Most game functions are organized within this function to ensure
//that all required arguments and variables are properly detected.
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

    //KeyCode 32 is the space bar.
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

    //The first time the space bar is pressed starts the game.
    function startGame(){
        enabled = true
        
        //Displays the selected difficulty.
        diffSlot.innerText = `Difficulty: ${difficulty}`

        //Activates the timer.
        setInterval(incrementSeconds, 1000)

        //Sets the letter interval based on the difficulty selected.
        switch (difficulty){
            case 'Easy':
                setInterval(fetchLetters, 2000)
                break
            case 'Medium':
                setInterval(fetchLetters, 1500)
                break
            case 'Hard':
                setInterval(fetchLetters, 1000)
                break
            case 'Unwinnable':
                setInterval(fetchLetters, 500)
                break
        }
    }

    //Retrieves the letters to spawn at the top of the canvas.
    function fetchLetters(){
        if (enabled === true){
            const probArray = [1,2,3,4,5]
            const prob = probArray[Math.floor(Math.random()*probArray.length)]
            fetch(LETTERS_URL)
            .then(resp => resp.json())
            .then(letters => sampleLetters(letters, prob))
        }
    }

    //Selects the letter, with a 20% chance to guarantee that it
    //is not one the player already has in the 'Keep' basket.
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

    //Spawns and animates the letter.
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

        //Sets the CSS variables for the falling animation,
        //so that each letter falls at a different angle.
        document.documentElement.style.setProperty('--tx', `${x}`);
        let dx = (175 - x) * 2 * Math.random();
        document.documentElement.style.setProperty('--dx', `${dx}`);
        let letterTimer = 0
        let enableAnimation = true

        //For more info on the various experiments I ran while building this animation and why
        //I ultimately selected this combination of JS and CSS, check out my Medium post at
        //https://medium.com/@adaml22/three-methods-for-animating-movement-in-js-css-579365ec0725.
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
                    orange()
                    break
                case 52:
                    white()
                    break
                case 65:
                    orange()
                    break
                case 67:
                    white()
                    break
                case 75:
                    orange()
                    break
                case 77:
                    white()
                    break
                case 80:
                    orange()
                    break
                case 82:
                    white()
                    break
                case 85:
                    orange()
                    break
                case 87:
                    white()
                    break
                case 90:
                    orange()
                    break
                case 92:
                    white()
                    break
                case 95:
                    orange()
                    break
                case 97:
                    white()
                    break
                case 100:
                    explode()
                    break
                case 102:
                    letterBomb.remove()
                    break
            }
        }
        function orange(){
            if (Array.from(canvas.childNodes).includes(letterBomb)){
                letterBomb.src = `./images/Letters/Letterbombs ${letter.character}O.jpg`
            }
        }
        function white(){
            if (Array.from(canvas.childNodes).includes(letterBomb)){
                letterBomb.src = `./images/Letters/Letterbombs ${letter.character}W.jpg`
            }
        }
        function explode(){
            if (Array.from(canvas.childNodes).includes(letterBomb)){
                letterBomb.src = './images/Letterbombs Explosion.jpg'
                strike()
                explodeSound.play()
            }
        }
    }

    //The dreaded drag and drop, built by Adam Xiao.
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

        //The right basket is the 'Keep' basket.
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

        //The left basket safely discards extra letters to avoid strikes.
        } else if (event.target.id === "left-basket"){
            discardSound.play()
        }
        }, false)
    }

    //When a letter is deposited in the 'Keep' basket.
    function useLg(lg){
        const letterSlotsArray = Array.from(lettersArea.getElementsByTagName('span'))
        fetch(LETTERS_URL)
        .then(resp => resp.json())
        .then(letters => illuminateLetter(letters))

        //Checks whether the player has already added said letter to the 'Keep' basket. If not,
        //illuminates the letter on the right side of the game screen and checks for a win. If so,
        //adds a strike. The sound that plays is determined accordingly.
        function illuminateLetter(letters){
            const targetLetter = letters.filter(letter => letter.id === lg.letter_id)[0].character
            const targetSlot = Array.from(letterSlotsArray.filter(letterSlot => Array.from(letterSlot.innerText.split(" ")).includes(targetLetter)))[0]
            switch (targetSlot.className){
                case 'blackletterslot':
                    targetSlot.className = 'whiteletterslot'
                    correct.play()
                    checkForWin(game)
                    break
                case 'whiteletterslot':
                    strike()
                    wrong.play()
                    break
            }
        }
    }
}

//Five strikes and you're out.
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

    //Losing sound.
    backgroundMusic.pause()
    lossSound.play()

    //Stops game.
    enabled = false

    //Game over screen.
    transition.style.display = 'block'
    introSlot.innerHTML = `
    <h1>Game Over</h1>
    <button class='button'>Play Again</button><br>
    <h3>Best Times (${difficulty})</h3>
    `

    //Retrieve and post high scores for selected difficulty.
    fetchHighScores()
}

//Checks for a win each time a letter is illuminated on the right side of the screen.
function checkForWin(game){
    let whiteLetters = Array.from(document.getElementsByClassName('whiteletterslot'))
    if (whiteLetters.length === 26) {win(game)}
}

function win(game){

    //Winning sound.
    backgroundMusic.pause()
    winSound.play()

    //Stops game.
    enabled = false

    //Victory screen.
    transition.style.display = 'block'
    introSlot.innerHTML = `
        <h1>You Win!</h1>
        <button class='button'>Play Again</button><br>
        <h3>Best Times (${difficulty})</h3>
    `

    //Updates the game file to indicate victory and store the time as a
    //potential future high score, then retrieves the previous high scores.
    fetch(`${GAMES_URL}/${game.id}`,{
        method: 'PATCH',
        headers: {
            'content-type': 'application/json',
            accept: 'application/json'
        },
        body: JSON.stringify({'seconds':seconds, 'result':true, 'difficulty':difficulty})
    })
    .then(fetchHighScores())
}

//Retrieves the high scores to post on the victory or game over screen.
function fetchHighScores(){
    fetch(GAMES_URL)
    .then(resp => resp.json())
    .then(games => postHighScores(games))
}

//Posts the top ten high scores for the selected difficulty.
function postHighScores(games){
    let gamesOnDiff = games.filter(game => game.difficulty === difficulty)
    
    let wonGames = gamesOnDiff.filter(function(game){
        return game.result === true
    })

    let topTen = wonGames.sort(function(a,b){ return a.seconds - b.seconds }).slice(0, 10)

    fetch(USERS_URL)
    .then(resp => resp.json())
    .then(users => topScorers(users))
    
    function topScorers(users){
        
        //Creates the high score table.
        let scoreTable = document.createElement("table")
        scoreTable.className = 'table'
        scoreTable.innerHTML = `
            <tr><th>Player</th>&nbsp;<th>Time(s)</th></tr>
        `

        //Creates the rows for the table.
        topTen.forEach(hs => highScoreRow(hs))
        function highScoreRow(hs){
            let scorer = users.find(user => user.id === hs.user_id).name
            let scorePost = document.createElement('tr')
            scorePost.innerHTML = `
                <td>${scorer}</td><td>${hs.seconds}</td>
            `
            scoreTable.append(scorePost)
        }
        introSlot.append(scoreTable)
    }
}

//Sounds
const correct = new Audio("./sounds/correct.wav")
const discardSound = new Audio("./sounds/discard.wav")
const explodeSound = new Audio("./sounds/explosion.wav")
const lossSound = new Audio("./sounds/loss.wav")
const winSound = new Audio("./sounds/victoryff.mp3")
const wrong = new Audio("./sounds/wrong.mp3")
const backgroundMusic = new Audio("./sounds/background.wav")