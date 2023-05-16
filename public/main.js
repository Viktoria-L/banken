const loginForm = document.querySelector("#loginOrReg-form");
const logoutForm = document.querySelector("#logout");
const firstname = document.getElementById("firstname");
const lastname = document.getElementById("lastname");
const username = document.getElementById("user");
const pass = document.getElementById("pass");
const submitBtn = document.querySelector(".submitBtn");
const welcomeText = document.querySelector("#welcome");
const loginSection = document.querySelector(".loginSection");
const changeBtn = document.querySelector(".changeBtn");
const userSection = document.querySelector(".userSection");
const accountDiv = document.querySelector(".accounts");

let state = "";

let onPageLoad = async () => {
    let response = await fetch('/api/loggedin');
    let data = await response.json();
    console.log(data)
    if(data.user){
        welcomeText.innerHTML = "Welcome back, " + data.user;
        loginSection.classList.add("hidden");
        userSection.classList.remove("hidden");
        logoutForm.classList.remove("hidden");
    } else {
        state = 'login';      
    }
}
onPageLoad();

changeBtn.addEventListener("click", () => {
    firstname.classList.toggle('hidden');
    lastname.classList.toggle('hidden');
    if (state === 'login') {
    state = 'register';
    firstname.required = true;
    lastname.required = true;
    submitBtn.innerText = "Registrera dig";
    changeBtn.innerText = `Är du redan medlem, klicka här för att logga in!`     
} else { 
        state = 'login';
        firstname.required = false;
        lastname.required = false;
        submitBtn.innerText = "Logga in";
        changeBtn.innerText = `Är du inte medlem än? Klicka här för att registrera dig!`;
    }
})

//Skapa användare eller logga in
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usernameInput = username.value;
    const passwordInput = pass.value;

    if(state === 'login'){
        let res = await fetch('/api/login',
        {
        method: "POST",
        body: JSON.stringify({
            user: usernameInput,
            pass: passwordInput,
        }),
        headers: {
            "Content-Type": "application/json",
            }
        })
        let data = await res.json();
        console.log(data);
        if(data.user){
        loginSection.classList.add("hidden");
        userSection.classList.remove("hidden");
        welcomeText.innerText = "Välkommen, du är inloggad";
        //Ska det verkligen skickas vidare till en enskild users sida?
        //window.location.href = `api/users/${data.id}`;
        getUserAccounts(data.id)
        } else {
            welcomeText.innerText = data.error;
        }

    } else if (state === 'register'){
        const firstnameInput = firstname.value;
        const lastnameInput = lastname.value;

       let res = await fetch('/api/register',
        {
        method: "POST",
        body: JSON.stringify({
            firstname: firstnameInput,
            lastname: lastnameInput,
            user: usernameInput,
            pass: passwordInput,
        }),
        headers: {
            "Content-Type": "application/json",
            }
        })

        let data = await res.json();
        console.log(data);
        if(data.user){
        loginSection.classList.add("hidden");
        userSection.classList.remove("hidden");
        welcomeText.innerText = "Välkommen, tack för att du har registrerat dig!";
        } else {
            welcomeText.innerText = "Något gick fel vid registreringen";
        }
    }
})

//Logga ut användare
logoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await fetch('/api/logout', 
    {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    });
    location.reload();
})

//Hämta användares konton
let getUserAccounts = async (id) => {
    let res = await fetch(`/api/user/${id}`);
    let data = await res.json();
    console.log(data)

}


