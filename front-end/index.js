const LETTERS_URL = 'http://localhost:3000/letters'
const USERS_URL = 'http://localhost:3000/users'
const GAMES_URL = 'http://localhost:3000/games'

let introSlot = document.getElementById('intro-slot')


document.addEventListener('DOMContentLoaded', () => {
    introPage()
    buttons()
})

function buttons(){
    document.addEventListener('click', (e) => {
        switch  (e.target.innerText){
            case 'Returning Player':
                introSlot.innerHTML = playerForm
                returningUser()
                break
            case 'New Player':
                introSlot.innerHTML = `${instructions}<br>${playerForm}`
                addUser()
                break
            case 'Continue':
                introSlot.innerHTML = ''
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
function currentGame(game){
    spaceKeyDetector.innerText = 'Press SPACE to Start Game'
    fetch(LETTERS_URL)
    .then(resp => resp.json())
    .then(letters => letters.forEach(letter => {
        let letterSlot = document.createElement('span')
        letterSlot.innerText = ` ${letter.character}`
        lettersArea.append(letterSlot)
    }))
}
