// content.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {


    if (request.action === 'accessPageElements') {
        console.log('in content script')
        // Your code to access page elements
        const messageElement = document.getElementById('menue_messages');

        if (messageElement) {
            console.log('Message Element:', messageElement);
            // Now you can manipulate the element or do whatever you need
            messageElement.click();
        } else {
            console.log('Message element not found on the page');
        }
    }

    if (request.action === 'accesWriteMessage') {
        const write_message_element = document.getElementsByClassName('awesome-tabs')

        console.log('wr', write_message_element)
        write_message_element[1].click()
    }

    if (request.action === 'writeRecipient') {
        const recipient_input = document.getElementsByClassName('player-name')

        console.log('ye', recipient_input)

        recipient_input[0].value = request.recipient_name
    }

    if (request.action === 'writeMessage') {
        const message_input = document.getElementById('message')

        console.log('ye', message_input)

        message_input.value = request.message
        const content = message_input.innerHTML.replace((/<br\s*\/?>/gi, '\n'))
        message_input.value = content
    }

    if (request.action === 'sendMessage') {
        const send_button = document.getElementsByClassName('awesome-button')

        send_button[0].click()
    }
});