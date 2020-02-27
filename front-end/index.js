const lettersURL = "http://localhost:3000/letters"

document.addEventListener('DOMContentLoaded', () => {
    fetchLetters()
})

function fetchLetters(){
    fetch(lettersURL)
    .then(resp => resp.json())
    .then(json => introPage(json))
}

function introPage(json){
    let introBox = document.getElementById("intro-slot")
    

    json.forEach(function(letter){
        let intro = document.createElement("h3")
        intro.innerHTML = `${letter.character}`

        introBox.append(intro)
    }) 
}