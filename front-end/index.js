const LETTERS_URL = 'http://localhost:3000/letters'
const USERS_URL = 'http://localhost:3000/users'
const GAMES_URL = 'http://localhost:3000/games'

let introSlot = document.getElementById('intro-slot')

function introPage(){
    introSlot.innerHTML = `
        <h1>Welcome</h1>
        <button>Returning Player</button>
        <h2>or</h2>
        <button>New Player</button>
    `
}

document.addEventListener('DOMContentLoaded', () => {
    introPage()
    buttons()
})

const playerForm = `
    <form id='form'>
        <input type="text" name="name" placeholder="Your name" value="" />
        <input type="submit" value="Submit" />
    </form>
`    

function buttons(){
    document.addEventListener('click', (e) => {
        switch  (e.target.innerText){
            case 'Returning Player':
                introSlot.innerHTML = playerForm
                returningUser()
                break
            case 'New Player':
                introSlot.innerHTML = playerForm
                addUser()
                break

        }
    })
}

function addUser(){
form.addEventListener('submit', (e) => {
    const form = document.getElementById('form')
    e.preventDefault()
    fetch(USERS_URL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            accept: 'application/json'
        },
        body: JSON.stringify({'name': form.name.value})
    })
    .then(resp => resp.json())
    .then(user => currentUser(user))
    .then(introSlot.innerHTML = '')
})
}

function returningUser(){
form.addEventListener('submit', (e) => {
    fetch(USERS_URL)
    .then(resp => resp.json())
    .then(users => currentUser(users.filter(user => user.name === form.name.value)[0]))
    .then(introSlot.innerHTML = '')
})
}

function currentUser(user){
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
    .then(postBestTimes(user))
}