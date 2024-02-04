// popup.js
document.addEventListener('DOMContentLoaded', function () {
    const accessPageElementsButton = document.getElementById('message-link');
    const loadMessagesBtn = document.getElementById('load-messages-div');
    const sendMessagesBtn = document.getElementById('send-msgs-button');
    const messagesContainer = document.getElementById('messages-container');


    console.log('in popup js')

    accessPageElementsButton.addEventListener('click', sendMessage);


    loadMessagesBtn.addEventListener('click', function () {
        const URL = 'https://forum-gladiatora-api-71bf050544da.herokuapp.com/messages/'

        fetch(URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // or response.text() for plain text
            })
            .then(data => {
                console.log('API response:', data);
                // Perform actions with the retrieved data


                // Get the messages-container element
                const messagesContainer = document.getElementById('messages-container');

                // Clear previous content in messages-container
                messagesContainer.innerHTML = '';

                // Iterate over the data array and append elements for each message
                data.forEach(message => {
                    // Create a div with the class "message-item"
                    const messageItem = document.createElement('div');
                    messageItem.classList.add('message-item');

                    // Create h1 element for recipient name
                    const recipientNameElement = document.createElement('h1');
                    recipientNameElement.textContent = message.recipient_name;

                    // Create p element for message
                    const messageElement = document.createElement('p');
                    messageElement.textContent = message.message;

                    // Append h1 and p elements to the message-item div
                    messageItem.appendChild(recipientNameElement);
                    messageItem.appendChild(messageElement);

                    // Append the message-item div to messages-container
                    if (!message.has_been_sent) {
                        messagesContainer.appendChild(messageItem);
                    }
                });


            })
            .catch(error => {
                console.error('Error during GET request:', error);
            });
    });

    sendMessagesBtn.addEventListener('click', async function () {
        // get users 
        // Get all "message-item" divs within messages-container
        const messageItems = messagesContainer.querySelectorAll('.message-item');

        // Create an array to store the extracted data
        const messagesArray = [];

        // Iterate over each "message-item" div
        messageItems.forEach((messageItem, index) => {
            // Find the h1 and p elements within the current message-item div
            const recipientNameElement = messageItem.querySelector('h1');
            const messageElement = messageItem.querySelector('p');

            // Extract the content of h1 and p elements
            const recipientName = recipientNameElement.textContent.trim();
            const message = messageElement.textContent.trim();

            // Create an object and push it to the messagesArray
            const messageObject = {
                recipient_name: recipientName,
                message: message,
                index: index
            };
            messagesArray.push(messageObject);
        });

        // Output the array of objects
        console.log(messagesArray);

        for (const messageItem of messagesArray) {
            console.log('tryna send', messageItem);
            if (messageItem.index === 0) {
                await sendMessage(messageItem);
            } else {
                await sendAnotherMessage(messageItem);
            }
        }
        // for every user send out messages
    })
})

async function sendMessage(messageItem) {

    console.log('message ite', messageItem.recipient_name)
    return new Promise(resolve => {
        // Send a message to the content script
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            const activeTab = tabs[0];

            // Access page elements
            await sendMessageWithDelay(activeTab, { action: 'accessPageElements' }, 0);

            // Write message
            await sendMessageWithDelay(activeTab, { action: 'accesWriteMessage' }, 3000);

            // Write message recipient
            await sendMessageWithDelay(activeTab, { action: 'writeRecipient', recipient_name: messageItem.recipient_name }, 3000);

            // Write message
            await sendMessageWithDelay(activeTab, { action: 'writeMessage', message: messageItem.message }, 3000);

            // Send the message
            await sendMessageWithDelay(activeTab, { action: 'sendMessage' }, 3000);

            // Set Has Been set in backend
            await markMessageAsSent(messageItem.recipient_name)

            // Resolve the promise when all actions are completed
            resolve();
        });
    });
}

async function sendAnotherMessage(messageItem) {
    return new Promise(resolve => {

        console.log('sending another')

        // Send a message to the content script
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            const activeTab = tabs[0];

            // Write message recipient
            await sendMessageWithDelay(activeTab, { action: 'writeRecipient', recipient_name: messageItem.recipient_name }, 3000);

            // Write message
            await sendMessageWithDelay(activeTab, { action: 'writeMessage', message: messageItem.message }, 3000);

            // Send the message
            await sendMessageWithDelay(activeTab, { action: 'sendMessage' }, 3000);

            // Set Has Been set in backend
            await markMessageAsSent(messageItem.recipient_name)

            // Resolve the promise when all actions are completed
            resolve();
        });
    });
}

async function markMessageAsSent(recipientName) {
    const apiUrl = 'https://forum-gladiatora-api-71bf050544da.herokuapp.com/messages/';

    console.log('test in mark', recipientName)

    try {
        // Send a POST request to the API endpoint
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipient_name: recipientName }),
        });

        // Check if the response is successful (status code 200-299)
        if (response.ok) {
            // Parse the JSON response
            const data = await response.json();

            // Use the data as needed (e.g., display it in the UI)
            console.log(data);
        } else {
            // Handle errors if the response is not successful
            console.error('Failed to send POST request:', response.status, response.statusText);
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error('Error sending POST request:', error);
    }
}

// Helper function to send a message with a delay
function sendMessageWithDelay(activeTab, message, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            chrome.tabs.sendMessage(activeTab.id, message, resolve);
        }, delay);
    });
}