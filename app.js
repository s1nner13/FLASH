const STORAGE_KEY = "FLASH_V0";

let state = loadState();


/* =========================
   DOM
========================= */

const setup = document.getElementById("setup");
const chat = document.getElementById("chat");

const usernameInput = document.getElementById("username");
const durationInput = document.getElementById("duration");

const createButton = document.getElementById("createAccount");

const userDisplay = document.getElementById("userDisplay");
const timer = document.getElementById("timer");

const messagesContainer = document.getElementById("messages");

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

const deleteButton = document.getElementById("deleteAccount");

const error = document.getElementById("error");


/* =========================
   STORAGE
========================= */

function loadState() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {
                account: null,
                messages: []
            };
        }

        return JSON.parse(saved);

    } catch {

        return {
            account: null,
            messages: []
        };
    }
}


function saveState() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}


/* =========================
   ACCOUNT
========================= */

function createAccount() {

    const username =
        usernameInput.value.trim();

    const duration =
        Number(durationInput.value);


    if (!username) {

        error.textContent =
            "Choisis un pseudo.";

        return;
    }


    if (username.length < 2) {

        error.textContent =
            "Le pseudo doit faire au moins 2 caractères.";

        return;
    }


    state.account = {

        id: crypto.randomUUID(),

        username: username,

        createdAt: Date.now(),

        expiresAt:
            duration === 0
                ? 0
                : Date.now() + duration

    };


    state.messages = [];


    saveState();

    error.textContent = "";

    showChat();
}


/* =========================
   ACCOUNT EXPIRATION
========================= */

function isExpired() {

    if (!state.account) {
        return false;
    }


    if (state.account.expiresAt === 0) {
        return false;
    }


    return Date.now() >=
        state.account.expiresAt;
}


/* =========================
   DELETE ACCOUNT
========================= */

function deleteAccount() {

    if (!state.account) {
        return;
    }


    const confirmation =
        confirm(
            "Supprimer ton compte Flash ?\n\n" +
            "Ton compte ET tous ses messages " +
            "seront supprimés."
        );


    if (!confirmation) {
        return;
    }


    state.account = null;

    state.messages = [];


    saveState();

    showSetup();
}


/* =========================
   MESSAGES
========================= */

function sendMessage(text) {

    if (!state.account) {
        return;
    }


    if (isExpired()) {

        expireAccount();

        return;
    }


    state.messages.push({

        id: crypto.randomUUID(),

        username:
            state.account.username,

        text: text,

        createdAt: Date.now()

    });


    saveState();

    renderMessages();
}


function renderMessages() {

    messagesContainer.innerHTML = "";


    for (const message of state.messages) {

        const element =
            document.createElement("article");

        element.className = "message";


        const header =
            document.createElement("div");

        header.className =
            "message-header";


        const username =
            document.createElement("span");

        username.className =
            "message-user";

        username.textContent =
            "@" + message.username;


        const time =
            document.createElement("span");

        time.textContent =
            " · " +
            new Date(
                message.createdAt
            ).toLocaleTimeString(
                "fr-FR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


        header.appendChild(username);

        header.appendChild(time);


        const content =
            document.createElement("div");

        content.className =
            "message-content";

        content.textContent =
            message.text;


        element.appendChild(header);

        element.appendChild(content);


        messagesContainer.appendChild(element);
    }


    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}


/* =========================
   EXPIRATION
========================= */

function expireAccount() {

    state.account = null;

    state.messages = [];


    saveState();

    showSetup();
}


/* =========================
   TIMER
========================= */

function updateTimer() {

    if (!state.account) {
        return;
    }


    if (state.account.expiresAt === 0) {

        timer.textContent =
            "♾️ Illimitée";

        return;
    }


    const remaining =
        state.account.expiresAt -
        Date.now();


    if (remaining <= 0) {

        expireAccount();

        return;
    }


    timer.textContent =
        "⏳ " +
        formatDuration(remaining);
}


function formatDuration(ms) {

    let seconds =
        Math.floor(ms / 1000);


    const days =
        Math.floor(seconds / 86400);

    seconds %= 86400;


    const hours =
        Math.floor(seconds / 3600);

    seconds %= 3600;


    const minutes =
        Math.floor(seconds / 60);


    seconds %= 60;


    if (days > 0) {

        return (
            days + "j " +
            hours + "h"
        );
    }


    if (hours > 0) {

        return (
            hours + "h " +
            minutes + "min"
        );
    }


    if (minutes > 0) {

        return (
            minutes + "min " +
            seconds + "s"
        );
    }


    return seconds + "s";
}


/* =========================
   UI
========================= */

function showChat() {

    setup.classList.add("hidden");

    chat.classList.remove("hidden");


    userDisplay.textContent =
        "@" + state.account.username;


    renderMessages();

    updateTimer();
}


function showSetup() {

    chat.classList.add("hidden");

    setup.classList.remove("hidden");


    usernameInput.value = "";

    messageInput.value = "";

    error.textContent = "";
}


/* =========================
   EVENTS
========================= */

createButton.addEventListener(
    "click",
    createAccount
);


deleteButton.addEventListener(
    "click",
    deleteAccount
);


messageForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const text =
            messageInput.value.trim();


        if (!text) {
            return;
        }


        sendMessage(text);


        messageInput.value = "";

        messageInput.focus();
    }
);


/* =========================
   STARTUP
========================= */

if (state.account) {

    if (isExpired()) {

        expireAccount();

    } else {

        showChat();
    }

} else {

    showSetup();
}


/* =========================
   CLOCK
========================= */

setInterval(
    updateTimer,
    1000
);
