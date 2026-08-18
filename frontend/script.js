console.log("♡ EduMate AI script loaded!");


// =========================================================
// BACKEND URL
// =========================================================

const API_BASE_URL =
    "https://ai-college-assistant-kqmk.onrender.com";


// =========================================================
// GLOBAL DATA
// =========================================================

let chats =
    JSON.parse(localStorage.getItem("collegeChats")) || [];

let currentChatId = null;


// =========================================================
// ELEMENTS
// =========================================================

const questionInput =
    document.getElementById("question");

const chatBox =
    document.getElementById("chat-box");

const welcome =
    document.getElementById("welcome");

const historyBox =
    document.getElementById("history");


// =========================================================
// SAVE CHATS
// =========================================================

function saveChats() {

    localStorage.setItem(
        "collegeChats",
        JSON.stringify(chats)
    );

}


// =========================================================
// RENDER HISTORY
// =========================================================

function renderHistory() {

    if (!historyBox) {
        return;
    }

    historyBox.innerHTML = "";

    if (chats.length === 0) {

        historyBox.textContent =
            "No chats yet";

        return;
    }


    chats.forEach(function(chat) {

        const item =
            document.createElement("div");

        item.className =
            "history-item";

        item.textContent =
            "♡ " + chat.title;

        item.addEventListener(
            "click",
            function() {

                openChat(chat.id);

            }
        );

        historyBox.appendChild(item);

    });

}


// =========================================================
// CREATE CHAT
// =========================================================

function createNewChat(firstMessage) {

    const chat = {

        id: Date.now(),

        title:
            firstMessage.substring(0, 30),

        messages: []

    };


    chats.unshift(chat);

    currentChatId =
        chat.id;

    saveChats();

    renderHistory();

    return chat;

}


// =========================================================
// OPEN CHAT
// =========================================================

function openChat(chatId) {

    const chat =
        chats.find(function(chat) {

            return chat.id === chatId;

        });


    if (!chat) {
        return;
    }


    currentChatId =
        chat.id;


    chatBox.innerHTML = "";


    if (welcome) {

        welcome.style.display =
            "none";

    }


    chat.messages.forEach(
        function(message) {

            addMessageToScreen(
                message.role,
                message.text
            );

        }
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// =========================================================
// ADD MESSAGE TO SCREEN
// =========================================================

function addMessageToScreen(
    role,
    text
) {

    const div =
        document.createElement("div");


    if (role === "user") {

        div.className =
            "user-message";

        div.textContent =
            "♡ " + text;

    } else {

        div.className =
            "ai-message";

        div.textContent =
            "✦ " + text;

    }


    chatBox.appendChild(div);

    return div;

}


// =========================================================
// GET CURRENT CHAT
// =========================================================

function getCurrentChat() {

    if (currentChatId === null) {

        return null;

    }


    return chats.find(
        function(chat) {

            return chat.id === currentChatId;

        }
    );

}


// =========================================================
// SAVE MESSAGE
// =========================================================

function saveMessage(
    role,
    text
) {

    const chat =
        getCurrentChat();


    if (!chat) {
        return;
    }


    chat.messages.push({

        role: role,

        text: text

    });


    saveChats();

}


// =========================================================
// HIDE WELCOME
// =========================================================

function hideWelcome() {

    if (welcome) {

        welcome.style.display =
            "none";

    }

}


// =========================================================
// SEND NORMAL MESSAGE
// =========================================================

async function sendMessage() {

    const question =
        questionInput.value.trim();


    if (!question) {

        return;

    }


    // =====================================================
    // IMAGE QUESTION
    // =====================================================

    if (
        imageFile &&
        imageFile.files.length > 0
    ) {

        await askAboutImage();

        return;

    }


    hideWelcome();


    // Create chat if needed

    if (currentChatId === null) {

        createNewChat(question);

    }


    const chat =
        getCurrentChat();


    if (!chat) {
        return;
    }


    // User message

    addMessageToScreen(
        "user",
        question
    );


    saveMessage(
        "user",
        question
    );


    // Clear input

    questionInput.value = "";

    questionInput.focus();


    // Thinking

    const thinking =
        addMessageToScreen(
            "ai",
            "Thinking..."
        );


    chatBox.scrollTop =
        chatBox.scrollHeight;


    try {

        const response =
            await fetch(
                API_BASE_URL + "/chat",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            message:
                                question

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "FastAPI error: " +
                response.status
            );

        }


        const data =
            await response.json();


        const reply =
            data.reply ||
            "No response received.";


        thinking.textContent =
            "✦ " + reply;


        saveMessage(
            "ai",
            reply
        );


    } catch (error) {

        console.error(error);


        thinking.textContent =
            "♡ Error connecting to EduMate AI: " +
            error.message;

    }


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// =========================================================
// NEW CHAT
// =========================================================

const newChatButton =
    document.getElementById("new-chat");


if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        function() {

            currentChatId =
                null;

            chatBox.innerHTML =
                "";


            questionInput.value =
                "";


            // Clear selected image

            if (imageFile) {

                imageFile.value = "";

            }


            // Clear selected PDF

            if (pdfFile) {

                pdfFile.value = "";

            }


            if (welcome) {

                welcome.style.display =
                    "flex";

            }


            questionInput.focus();

        }
    );

}


// =========================================================
// SEND BUTTON
// =========================================================

const sendButton =
    document.getElementById("send-btn");


if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );

}


// =========================================================
// ENTER KEY
// =========================================================

if (questionInput) {

    questionInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


// =========================================================
// PDF FILE INPUT
// =========================================================

const pdfFile =
    document.getElementById("pdf-file");


// =========================================================
// PDF TRIGGER
// =========================================================

const pdfTrigger =
    document.getElementById("pdf-trigger");


if (
    pdfTrigger &&
    pdfFile
) {

    pdfTrigger.addEventListener(
        "click",
        function() {

            pdfFile.click();

        }
    );

}


// =========================================================
// UPLOAD PDF
// =========================================================

async function uploadPDF() {

    if (!pdfFile) {
        return;
    }


    const file =
        pdfFile.files[0];


    if (!file) {

        alert(
            "Please choose a PDF first."
        );

        return;

    }


    hideWelcome();


    const message =
        addMessageToScreen(
            "ai",
            "Uploading " +
            file.name +
            "..."
        );


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    try {

        const response =
            await fetch(
                API_BASE_URL + "/upload-pdf",
                {

                    method: "POST",

                    body: formData

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.error ||
                "PDF upload failed."
            );

        }


        message.textContent =
            "✦ " +
            (
                data.message ||
                "PDF uploaded successfully."
            );


        console.log(
            "PDF:",
            data.filename
        );


        console.log(
            "Characters:",
            data.text_length
        );


    } catch (error) {

        console.error(error);


        message.textContent =
            "♡ Error uploading PDF: " +
            error.message;

    }


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// =========================================================
// PDF UPLOAD BUTTON
// =========================================================

const uploadButton =
    document.getElementById("upload-btn");


if (uploadButton) {

    uploadButton.addEventListener(
        "click",
        function() {

            if (
                pdfFile &&
                !pdfFile.files.length
            ) {

                pdfFile.click();

                return;

            }


            uploadPDF();

        }
    );

}


// =========================================================
// AUTO UPLOAD PDF WHEN SELECTED
// =========================================================

if (pdfFile) {

    pdfFile.addEventListener(
        "change",
        function() {

            if (
                pdfFile.files.length
            ) {

                uploadPDF();

            }

        }
    );

}


// =========================================================
// IMAGE INPUT
// =========================================================

const imageFile =
    document.getElementById("image-file");

const imageButton =
    document.getElementById("image-btn");


// =========================================================
// IMAGE BUTTON
// =========================================================

if (
    imageButton &&
    imageFile
) {

    imageButton.addEventListener(
        "click",
        function() {

            imageFile.click();

        }
    );

}


// =========================================================
// ASK ABOUT IMAGE
// =========================================================

async function askAboutImage() {

    if (!imageFile) {

        alert(
            "Image input was not found."
        );

        return;

    }


    const file =
        imageFile.files[0];


    const question =
        questionInput.value.trim();


    // =====================================================
    // CHECK IMAGE
    // =====================================================

    if (!file) {

        alert(
            "Please choose an image first."
        );

        return;

    }


    // =====================================================
    // CHECK QUESTION
    // =====================================================

    if (!question) {

        alert(
            "Type a question about the image first."
        );

        questionInput.focus();

        return;

    }


    hideWelcome();


    // =====================================================
    // CREATE CHAT
    // =====================================================

    if (
        currentChatId === null
    ) {

        createNewChat(
            question
        );

    }


    // =====================================================
    // USER MESSAGE
    // =====================================================

    addMessageToScreen(
        "user",
        question
    );


    saveMessage(
        "user",
        question
    );


    // =====================================================
    // THINKING
    // =====================================================

    const thinking =
        addMessageToScreen(
            "ai",
            "Looking at the image..."
        );


    chatBox.scrollTop =
        chatBox.scrollHeight;


    // =====================================================
    // FORM DATA
    // =====================================================

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "question",
        question
    );


    try {

        console.log(
            "♡ Sending image:",
            file.name
        );


        console.log(
            "♡ Image type:",
            file.type
        );


        console.log(
            "♡ Image size:",
            file.size,
            "bytes"
        );


        const response =
            await fetch(
                API_BASE_URL + "/ask-image",
                {

                    method: "POST",

                    body: formData

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.error ||
                "Image request failed."
            );

        }


        const reply =
            data.reply ||
            "No answer received.";


        thinking.textContent =
            "✦ " + reply;


        saveMessage(
            "ai",
            reply
        );


        // Clear question

        questionInput.value = "";


        // Clear image

        imageFile.value = "";


    } catch (error) {

        console.error(
            "♡ Image error:",
            error
        );


        thinking.textContent =
            "♡ Image error: " +
            error.message;

    }


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// =========================================================
// IMAGE SELECTED
// =========================================================

if (imageFile) {

    imageFile.addEventListener(
        "change",
        async function() {

            if (!imageFile.files.length) {
                return;
            }

            const file = imageFile.files[0];

            console.log(
                "♡ Image selected:",
                file.name
            );

            // Show selected image in chat

            hideWelcome();

            const message =
                addMessageToScreen(
                    "ai",
                    "🖼️ Image selected: " +
                    file.name
                );

            // Ask user for question

            questionInput.focus();

        }
    );

}


// =========================================================
// VOICE INPUT
// =========================================================

const micButton =
    document.getElementById("mic-btn");


const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;


if (
    SpeechRecognition &&
    micButton
) {

    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.onstart =
        function() {

            micButton.textContent =
                "●";

            micButton.style.color =
                "var(--accent)";

        };


    recognition.onresult =
        function(event) {

            const transcript =
                event.results[0][0]
                    .transcript;


            questionInput.value =
                transcript;


            questionInput.focus();

        };


    recognition.onend =
        function() {

            micButton.textContent =
                "🎙";

            micButton.style.color =
                "";

        };


    recognition.onerror =
        function(event) {

            console.error(
                "Voice error:",
                event.error
            );


            micButton.textContent =
                "🎙";

            micButton.style.color =
                "";

        };


    micButton.addEventListener(
        "click",
        function() {

            try {

                recognition.start();

            } catch (error) {

                console.log(
                    "Voice already running."
                );

            }

        }
    );


} else if (micButton) {

    micButton.disabled =
        true;

    micButton.title =
        "Voice input is not supported by this browser.";

}


// =========================================================
// READ LAST AI ANSWER
// =========================================================

const voiceButton =
    document.getElementById("voice-btn");


if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        function() {

            const aiMessages =
                document.querySelectorAll(
                    ".ai-message"
                );


            if (
                aiMessages.length === 0
            ) {

                alert(
                    "There is no AI answer to read yet."
                );

                return;

            }


            const lastMessage =
                aiMessages[
                    aiMessages.length - 1
                ];


            const text =
                lastMessage.innerText
                    .replace(/^✦\s*/, "")
                    .replace(/^♡\s*/, "");


            if (
                !window.speechSynthesis
            ) {

                alert(
                    "Text-to-speech is not supported."
                );

                return;

            }


            window.speechSynthesis.cancel();


            const speech =
                new SpeechSynthesisUtterance(
                    text
                );


            speech.lang =
                "en-US";


            speech.rate =
                1;


            speech.pitch =
                1;


            window.speechSynthesis.speak(
                speech
            );

        }
    );

}


// =========================================================
// GENERIC AI TOOL
// =========================================================

async function generateToolResponse(
    buttonId,
    userLabel,
    loadingText,
    prompt
) {

    const button =
        document.getElementById(
            buttonId
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async function() {

            const topic =
                questionInput.value.trim();


            if (!topic) {

                alert(
                    "Type a topic first."
                );

                questionInput.focus();

                return;

            }


            hideWelcome();


            if (
                currentChatId === null
            ) {

                createNewChat(
                    topic
                );

            }


            addMessageToScreen(
                "user",
                userLabel +
                ": " +
                topic
            );


            saveMessage(
                "user",
                userLabel +
                ": " +
                topic
            );


            const thinking =
                addMessageToScreen(
                    "ai",
                    loadingText
                );


            try {

                const response =
                    await fetch(
                        API_BASE_URL + "/chat",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    message:
                                        prompt(topic)

                                })

                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "FastAPI error: " +
                        response.status
                    );

                }


                const data =
                    await response.json();


                const reply =
                    data.reply ||
                    "No response received.";


                thinking.textContent =
                    "✦ " + reply;


                saveMessage(
                    "ai",
                    reply
                );


            } catch (error) {

                console.error(error);


                thinking.textContent =
                    "♡ Error: " +
                    error.message;

            }


            chatBox.scrollTop =
                chatBox.scrollHeight;

        }
    );

}


// =========================================================
// STUDY NOTES
// =========================================================

generateToolResponse(

    "notes-btn",

    "✦ Generate notes",

    "Creating your study notes...",

    function(topic) {

        return `
You are EduMate AI, a college study assistant.

Create clear, exam-friendly study notes about:

${topic}

IMPORTANT:

Use the uploaded PDF as the primary source when available.

Do not invent information that is not supported by the uploaded PDF.

Use simple language that a college student can understand.

FORMATTING RULES:

Do NOT use Markdown formatting.

Do NOT use:
##
###
**
***
---
backticks

Do not put # or * around words.

Use clean plain-text headings.

Use bullet points with the • symbol only.

Use this style:

STUDY NOTES

1. Definition

Explain the definition clearly.

2. Important Concepts

• Concept one
• Concept two
• Concept three

3. Key Points

• Important point
• Important point

4. Examples

Give simple examples when they are present in the PDF.

5. Advantages and Disadvantages

• Advantage
• Disadvantage

Only include this section when applicable.

6. Important Exam Points

• Point one
• Point two
• Point three

7. Quick Revision

Give a short revision summary.

Keep the response clean, organized and easy to read.
`;

    }

);


// =========================================================
// QUIZ
// =========================================================

generateToolResponse(

    "quiz-btn",

    "✦ Generate quiz",

    "Creating your quiz...",

    function(topic) {

        return `
You are EduMate AI, a college quiz generator.

Create a 10-question multiple-choice quiz about:

${topic}

Use the uploaded PDF as the primary source when available.

Do not invent information that is not supported by the uploaded PDF.

FORMATTING RULES:

Do NOT use Markdown formatting.

Do NOT use:
##
###
**
***
---
backticks

Do not use Markdown tables.

Use this exact clean style:

PRACTICE QUIZ

Question 1

What is the answer?

A) Option one
B) Option two
C) Option three
D) Option four

Continue until Question 10.

After all questions, write:

ANSWER KEY

1. B
2. A
3. C

Then provide:

EXPLANATIONS

1. B — Short explanation.
2. A — Short explanation.

Keep explanations short.

Make the quiz suitable for a college student.

Keep the formatting clean and readable.
`;

    }

);


// =========================================================
// STUDY PLANNER
// =========================================================

generateToolResponse(

    "planner-btn",

    "✦ Create study plan",

    "Creating your study plan...",

    function(request) {

        return `
You are EduMate AI, a college study planner.

Create a practical study plan based on:

${request}

FORMATTING RULES:

Do NOT use Markdown formatting.

Do NOT use:
##
###
**
***
---
backticks

Do not use Markdown tables.

Use clean plain-text headings.

Use this format:

STUDY PLAN

DAY 1

Subject:
Topic:
Study time:
Tasks:

• Task one
• Task two
• Task three

DAY 2

Subject:
Topic:
Study time:
Tasks:

• Task one
• Task two

Continue for all required days.

Also include:

REVISION

• Revision activity

PRACTICE

• Practice activity

FINAL REVIEW

• Final revision activity

Do not overload one day.

Keep the plan realistic for a college student.

Use information from the uploaded PDF when relevant.
`;

    }

);


// =========================================================
// THEME SYSTEM
// =========================================================

const themeButton =
    document.getElementById(
        "theme-btn"
    );


const themeMenu =
    document.getElementById(
        "theme-menu"
    );


const themeOptions =
    document.querySelectorAll(
        ".theme-option"
    );


// Open theme menu

if (
    themeButton &&
    themeMenu
) {

    themeButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            themeMenu.classList.toggle(
                "show"
            );

        }
    );

}


// Select theme

themeOptions.forEach(
    function(option) {

        option.addEventListener(
            "click",
            function() {

                const theme =
                    this.dataset.theme;


                document.body.setAttribute(
                    "data-theme",
                    theme
                );


                localStorage.setItem(
                    "edumate-theme",
                    theme
                );


                themeMenu.classList.remove(
                    "show"
                );

            }
        );

    }
);


// Load saved theme

const savedTheme =
    localStorage.getItem(
        "edumate-theme"
    );


if (savedTheme) {

    document.body.setAttribute(
        "data-theme",
        savedTheme
    );

} else {

    document.body.setAttribute(
        "data-theme",
        "light"
    );

}


// Close theme menu outside click

document.addEventListener(
    "click",
    function(event) {

        if (
            themeMenu &&
            themeButton &&
            !themeMenu.contains(
                event.target
            ) &&
            !themeButton.contains(
                event.target
            )
        ) {

            themeMenu.classList.remove(
                "show"
            );

        }

    }
);


// =========================================================
// INITIALIZE
// =========================================================

renderHistory();

console.log(
    "♡ EduMate AI initialized successfully!"
);