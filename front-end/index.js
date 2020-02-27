const LETTERS_URL = 'http://localhost:3000/letters'
const USERS_URL = 'http://localhost:3000/users'

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
    playerForm.addEventListener('submit', (e) => {
        e.preventDefault()
        fetch(USERS_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                accept: 'application/json'
            },
            body: JSON.stringify({'name': playerForm.name.value})
        })
    })
}

function returningUser(){
    form.add
}