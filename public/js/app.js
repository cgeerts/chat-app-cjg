
        (() => {


            let vue_vm = new Vue({

        
                data: {

                },
                template: `
                <div class="chat-container">
        <header class="chat-header">
          <h1>Chat Application</h1>
          <div>
            <select name="" id="colour-select">
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="black">Black</option>
            </select>
            <a id="change-theme" class="button">Change Theme</a>
            <a id="leave-button" class="button">Quit</a>
          </div>
        </header>
        <main class="chat-main">
          <div class="chat-sidebar">
            <h3>Chat Room</h3>
            <h2 id="room-name"></h2>
            <h3>Users</h3>
            <ul id="users"></ul>
          </div>
          <div class="chat-messages"></div>
        </main>
        <div class="chat-form-container">
          <form id="chat-form">
            <input id="msg" type="text" placeholder="Enter Message" required autocomplete="off"/><button class="message-button">Send</button>
          </form>
        </div>
      </div> 
                `,
        
                mounted: function() {
                    const chatForm = document.getElementById('chat-form');
                    const chatMessages = document.querySelector('.chat-messages');
                    const roomName = document.getElementById('room-name');
                    const userList = document.getElementById('users');
                    const changeThemeButton = document.querySelector('#change-theme');
                    const colorOption = document.querySelector('#colour-select');
                                    
                    // Get username and room from URL
                    const { username, room } = Qs.parse(location.search, {
                      ignoreQueryPrefix: true,
                    });
                    
                    const socket = io();
                    
                    // Join chatroom
                    socket.emit('joinRoom', { username, room });
                    
                    // Get room and users
                    socket.on('roomUsers', ({ room, users }) => {
                      outputRoomName(room);
                      outputUsers(users);
                    });
                    
                    // Message from server
                    socket.on('message', (message) => {
                      console.log(message);
                      outputMessage(message);
                    
                      // Scroll down
                      chatMessages.scrollTop = chatMessages.scrollHeight;
                    });
                    
                    socket.on('colorSwap', (color) => {
                        let chatHeader = document.querySelector('.chat-header')
                        let chatSidebar = document.querySelector('.chat-sidebar')
                        let chatformContainer = document.querySelector('.chat-form-container')
                    
                        chatHeader.style.backgroundColor = color.trueColor.main;
                        chatSidebar.style.backgroundColor = color.trueColor.sub;
                        chatformContainer.style.backgroundColor = color.trueColor.main;
                    });
                    
                    changeThemeButton.addEventListener('click', () => {
                      // colorOption.options[colorOption.selectedIndex].value grabs the color value from selected option
                      let color = colorOption.options[colorOption.selectedIndex].value
                    
                      socket.emit('colourSwapClient', {color});
                    });
                    
                    // Message submit
                    chatForm.addEventListener('submit', (e) => {
                      e.preventDefault();
                    
                      // Get message text
                      let msg = e.target.elements.msg.value;
                    
                      msg = msg.trim();
                    
                      if (!msg) {
                        return false;
                      }
                    
                      // Emit message to server
                      socket.emit('chatMessage', msg);
                    
                      // Clear input
                      e.target.elements.msg.value = '';
                      e.target.elements.msg.focus();
                    });
                    
                    // Output message to DOM
                    function outputMessage(message) {
                      const div = document.createElement('div');
                      div.classList.add('message');
                      const p = document.createElement('p');
                      p.classList.add('meta');
                      p.innerText = message.username;
                      p.innerHTML += `<span>${message.time}</span>`;
                      div.appendChild(p);
                      const para = document.createElement('p');
                      para.classList.add('text');
                      para.innerText = message.text;
                      div.appendChild(para);
                      document.querySelector('.chat-messages').appendChild(div);
                    }
                    
                    // Add room name to DOM
                    function outputRoomName(room) {
                      roomName.innerText = room;
                    }
                    
                    // Add users to DOM
                    function outputUsers(users) {
                      userList.innerHTML = '';
                      users.forEach((user) => {
                        const li = document.createElement('li');
                        li.innerText = user.username;
                        userList.appendChild(li);
                      });
                    }
                    
                    //Prompt the user before leave chat room
                    document.getElementById('leave-button').addEventListener('click', () => {
                      const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
                      if (leaveRoom) {
                        window.location = '../index.html';
                      } else {
                      }
                    });
                },
        
                // run a method when we change our view (update the DOM with Vue)
                updated: function() {
                    console.log('Vue just updated the DOM');
                },
        
                methods: {
                    logClicked() {
                        console.log("clicked on a list item");
                    },
        
                    
                }
            }).$mount("#app"); // also connects Vue to your wrapper in HTML
        })();