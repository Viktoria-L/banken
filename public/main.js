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

const createAccForm = document.querySelector("#createAccount-form");

let state = "";

let onPageLoad = async () => {
  let response = await fetch("/api/loggedin");
  let data = await response.json();
  if (data.user) {
    welcomeText.innerHTML = "Välkommen tillbaka " + data.user + "! Här nedan kan du se bankkonton, ta ut och sätta in pengar samt skapa nya konton.";
    loginSection.classList.add("hidden");
    userSection.classList.remove("hidden");
    logoutForm.classList.remove("hidden");
    getUserAccounts();
  } else {
    state = "login";
  }
};
onPageLoad();

changeBtn.addEventListener("click", () => {
  firstname.classList.toggle("hidden");
  lastname.classList.toggle("hidden");
  if (state === "login") {
    state = "register";
    firstname.required = true;
    lastname.required = true;
    submitBtn.innerText = "Registrera dig";
    changeBtn.innerText = `Är du redan medlem, klicka här för att logga in!`;
  } else {
    state = "login";
    firstname.required = false;
    lastname.required = false;
    submitBtn.innerText = "Logga in";
    changeBtn.innerText = `Är du inte medlem än? Klicka här för att registrera dig!`;
  }
});

//Skapa användare eller logga in
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const usernameInput = username.value;
  const passwordInput = pass.value;

  if (state === "login") {
    let res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        user: usernameInput,
        pass: passwordInput,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let data = await res.json();

    if (data.user) {
      loginSection.classList.add("hidden");
      userSection.classList.remove("hidden");
      welcomeText.innerText = `Välkommen, du är inloggad som ${data.user}. Här nedan kan du se bankkonton, ta ut och sätta in pengar samt skapa nya konton.`;
      getUserAccounts();
    } else {
      welcomeText.innerText = data.error;
    }
  } else if (state === "register") {
    const firstnameInput = firstname.value;
    const lastnameInput = lastname.value;

    let res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        firstname: firstnameInput,
        lastname: lastnameInput,
        user: usernameInput,
        pass: passwordInput,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    let data = await res.json();
    //loggar in nyligen registrerad användare
    if (data.user) {
   
    let loginres = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        user: usernameInput,
        pass: passwordInput,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let data = await loginres.json();

      if (data.user) {
        loginSection.classList.add("hidden");
        userSection.classList.remove("hidden");
        logoutForm.classList.remove("hidden");

        welcomeText.innerText = `Välkommen, du är inloggad som ${data.user}`;
        getUserAccounts();
      } else {
        welcomeText.innerText = data.error;
      }
  }
}});

//Logga ut användare
logoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await fetch("/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  location.reload();
});

//Hämta alla konton
let getUserAccounts = async () => {
  let accountUl = document.querySelector(".accountList");
  let res = await fetch(`/api/accounts`);
  let data = await res.json();

  if (data.length === 0) {
    accountDiv.innerText = "Det finns inga konton ännu";
  } else {
    data.forEach((account) => {
      let div = document.createElement("div");
      div.className = "account-div";
      accountUl.append(div);

      let li = document.createElement("li");
      li.innerHTML = `<a href="/api/account/${account._id}">${account.name}</a><br>Kontonummer: ${account._id}<br>Saldo: ${account.balance} SEK`;

      let depositDiv = document.createElement("div");
      depositDiv.className = "depositDiv";

      let depositBtn = document.createElement("button");
      depositBtn.innerText = "Insättning";
      let depositInput = document.createElement("input");
      depositInput.type = "number";
      depositInput.className = "hidden";
      depositInput.required = true;
      depositInput.min = 1;
      let saveBtn = document.createElement("button");
      saveBtn.innerText = "Sätt in";
      saveBtn.className = "hidden";
      saveBtn.id = `${account._id}`;
      depositDiv.append(depositBtn, depositInput, saveBtn);

      let withdrawalDiv = document.createElement("div");
      withdrawalDiv.className = "withdrawalDiv";

      let withdrawalBtn = document.createElement("button");
      withdrawalBtn.innerText = "Uttag";
      let withdrawalInput = document.createElement("input");
      withdrawalInput.type = "number";
      withdrawalInput.className = "hidden";
      withdrawalInput.required = true;
      withdrawalInput.min = 1;
      let withdrawBtn = document.createElement("button");
      withdrawBtn.innerText = "Ta ut";
      withdrawBtn.className = "hidden";
      withdrawBtn.id = `${account._id}`;
      withdrawalDiv.append(withdrawalBtn, withdrawalInput, withdrawBtn);
      let deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Radera konto";
      deleteBtn.id = `delete${account._id}`;

      div.append(li, depositDiv, withdrawalDiv, deleteBtn);
      saveBtn.addEventListener("click", async (e) => {
        let accountId = e.target.id;
        let deposit = Number(depositInput.value);

        await fetch(`/api/accounts/${accountId}`, {
          method: "PUT",
          body: JSON.stringify({
            type: "deposit",
            balance: deposit,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        location.reload();
      });

      withdrawBtn.addEventListener("click", async (e) => {
        let accountId = e.target.id;
        let withdrawal = Number(withdrawalInput.value);

        if (account.balance - withdrawal >= 0) {
          await fetch(`/api/accounts/${accountId}`, {
            method: "PUT",
            body: JSON.stringify({
              type: "withdraw",
              balance: withdrawal,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          location.reload();
        } else {
          alert("Du kan inte ta ut pengar som du inte har.");
        }
      });

      depositBtn.addEventListener("click", async () => {
        saveBtn.classList.toggle("hidden");
        depositInput.classList.toggle("hidden");
      });
      withdrawalBtn.addEventListener("click", () => {
        withdrawBtn.classList.toggle("hidden");
        withdrawalInput.classList.toggle("hidden");
      });

      deleteBtn.addEventListener("click", async (e) => {
        let accountId = e.target.id;
        const id = accountId.replace("delete", "");
        console.log(id);

        let confirmDelete = confirm(
          "Är du säker på att du vill ta bort kontot?"
        );
        if (confirmDelete) {
          await fetch(`/api/accounts/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          location.reload();
        }
      });
    });
  }
};

// Skapar nytt konto
createAccForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let accountName = document.getElementById("accountName").value;
  let accountBalance = document.getElementById("balance").value;
  await fetch("/api/accounts", {
    method: "POST",
    body: JSON.stringify({
      name: accountName,
      balance: accountBalance,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  location.reload();
});

//Meny-navbar
const hamburger = document.querySelector(".hamburger");
const dropdownMenu = document.querySelector(".dropdown-menu");

hamburger.addEventListener("click", () => {
  dropdownMenu.classList.toggle("show");
});
