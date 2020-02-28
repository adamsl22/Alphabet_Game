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
        <input type="text" name="name" placeholder="Your name" value="" />
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
        .then(user => currentUser(user))
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

function postBestTimes(user){
    fetch(GAMES_URL)
    .then(resp => resp.json())
    .then(games => universalBestTime(games))
    const universalBestTime = function(games){
        return Math.min(...games.seconds)
    }
    let bestTimesSlot = document.getElementById('best-times')
    const personalBestTime = Math.min(...user.games.seconds)
    bestTimesSlot.innerHTML = `
    <span>'Universal Best Time: '<span id='top-time'>'${universalBestTime} seconds'</span><br>
    'Personal Best Time: '<span id='top-time'>'${personalBestTime} seconds'</span></span>
    `
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
    .then(postBestTimes(user))
}

function introToGame(){
    let transition = document.getElementById("transition-page")
    introSlot.innerHTML = ''
    transition.remove()
}
