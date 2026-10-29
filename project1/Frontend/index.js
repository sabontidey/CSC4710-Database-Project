
// This is the frontEnd that modifies the HTML page directly
// event-based programming,such as document load, click a button

/*
What is a Promise in Javascript? 

A Promise can be in one of three states:

    - Pending: The initial state; the promise is neither fulfilled nor rejected.

    - Fulfilled: The operation completed successfully, and the promise has a 
      resulting value.

    - Rejected: The operation failed, and the promise has a reason for the failure.

Promises have two main methods: then and catch.

    - The then method is used to handle the successful fulfillment of a promise. 
    It takes a callback function that will be called when the promise is resolved, 
    and it receives the resulting value.

    - The catch method is used to handle the rejection of a promise. It takes a 
    callback function that will be called when the promise is rejected, and it 
    receives the reason for the rejection.

What is a promise chain? 
    The Promise chain starts with some asyncOperation1(), which returns a promise, 
    and each subsequent ``then`` is used to handle the result of the previous Promise.

    The catch is used at the end to catch any errors that might occur at any point 
    in the chain.

    Each then returns a new Promise, allowing you to chain additional ``then`` calls to 
    handle subsequent results.

What is an arrow function?

    An arrow function in JavaScript is a concise way to write anonymous function 
    expressions.

    Traditional function syntax: 
        const add = function(x, y) {
           return x + y;
        };

    Arrow function syntax:
        const add = (x, y) => x + y;
    
    
Arrow functions have a few notable features:

    - Shorter Syntax: Arrow functions eliminate the need for the function keyword, 
      curly braces {}, and the return keyword in certain cases, making the syntax 
      more concise.

    - Implicit Return: If the arrow function consists of a single expression, it is 
      implicitly returned without needing the return keyword.

    - Lexical this: Arrow functions do not have their own this context; instead, they 
      inherit this from the surrounding code. This can be beneficial in certain situations,
      especially when dealing with callbacks and event handlers.
*/


// fetch call is to call the backend
document.addEventListener('DOMContentLoaded', function() {
    // one can point your browser to http://localhost:5050/getAll to check what it returns first.
    fetch('http://localhost:5050/getAll')     
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
});


// when the addBtn is clicked
const addBtn = document.querySelector('#add-name-btn');
addBtn.onclick = function (){
    const nameInput = document.querySelector('#name-input');
    const name = nameInput.value;
    nameInput.value = "";

    fetch('http://localhost:5050/insert', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({name: name})
    })
    .then(response => response.json())
    .then(data => insertRowIntoTable(data['data']));
}

// when the searchBtn is clicked
const searchBtn =  document.querySelector('#search-btn');
searchBtn.onclick = function (){
    const searchInput = document.querySelector('#search-input');
    const searchValue = searchInput.value;
    searchInput.value = "";

    fetch('http://localhost:5050/search/' + searchValue)
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
}

let rowToDelete; 

// when the delete button is clicked, since it is not part of the DOM tree, we need to do it differently
document.querySelector('table tbody').addEventListener('click', 
      function(event){
        if(event.target.className === "delete-row-btn"){

            deleteRowById(event.target.dataset.id);   
            rowToDelete = event.target.parentNode.parentNode.rowIndex;    
            debug("delete which one:");
            debug(rowToDelete);
        }   
        if(event.target.className === "edit-row-btn"){
            showEditRowInterface(event.target.dataset.id); // display the edit row interface
        }
      }
);

function deleteRowById(id){
    // debug(id);
    fetch('http://localhost:5050/delete/' + id,
       { 
        method: 'DELETE'
       }
    )
    .then(response => response.json())
    .then(
         data => {
             if(data.success){
                document.getElementById("table").deleteRow(rowToDelete);
                // location.reload();
             }
         }
    );
}

let idToUpdate = 0;

function showEditRowInterface(id){
    debug("id clicked: ");
    debug(id);
    document.querySelector('#update-name-input').value = ""; // clear this field
    const updateSetction = document.querySelector("#update-row");  
    updateSetction.hidden = false;
    // we assign the id to the update button as its id attribute value
    idToUpdate = id;
    debug("id set!");
    debug(idToUpdate+"");
}


// when the update button on the update interface is clicked
const updateBtn = document.querySelector('#update-row-btn');

updateBtn.onclick = function(){
    debug("update clicked");
    debug("got the id: ");
    debug(updateBtn.value);
    
    const updatedNameInput = document.querySelector('#update-name-input');

    fetch('http://localhost:5050/update',
          {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'PATCH',
            body: JSON.stringify(
                  {
                    id: idToUpdate,
                    name: updatedNameInput.value
                  }
            )
          }
    ) 
    .then(response => response.json())
    .then(data => {
        if(data.success){
            location.reload();
        }
        else 
           debug("no update occurs");
    })
}


// this function is used for debugging only, and should be deleted afterwards
function debug(data)
{
    fetch('http://localhost:5050/debug', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({debug: data})
    })
}

function insertRowIntoTable(data){

   debug("index.js: insertRowIntoTable called: ");
   debug(data);

   const table = document.querySelector('table tbody');
   debug(table);

   const isTableData = table.querySelector('.no-data');

  // debug(isTableData);

   let tableHtml = "<tr>";
   
   for(var key in data){ // iterating over the each property key of an object data
      if(data.hasOwnProperty(key)){   // key is a direct property for data
            if(key === 'dateAdded'){  // the property is 'dataAdded'
                data[key] = new Date(data[key]).toLocaleString(); // format to javascript string
            }
            tableHtml += `<td>${data[key]}</td>`;
      }
   }

   tableHtml +=`<td><button class="delete-row-btn" data-id=${data.id}>Delete</td>`;
   tableHtml += `<td><button class="edit-row-btn" data-id=${data.id}>Edit</td>`;

   tableHtml += "</tr>";

    if(isTableData){
       debug("case 1");
       table.innerHTML = tableHtml;
    }
    else {
        debug("case 2");
        // debug(tableHtml);

        const newrow = table.insertRow();
        newrow.innerHTML = tableHtml;
    }
}

function loadHTMLTable(data){
    debug("index.js: loadHTMLTable called.");

    const table = document.querySelector('table tbody'); 
    
    if(data.length === 0){
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
        return;
    }
  
    /*
    In the following JavaScript code, the forEach method is used to iterate over the 
    elements of the data array. The forEach method is a higher-order function 
    that takes a callback function as its argument. The callback function is 
    executed once for each element in the array.
    
    In this case, the callback function takes a single argument, which is an object 
    destructuring pattern:


    function ({id, name, date_added}) {
        // ... code inside the callback function
    }

    This pattern is used to extract the id, name, and date_added properties from each 
    element of the data array. The callback function is then executed for each element
    in the array, and within the function, you can access these properties directly 
    as variables (id, name, and date_added).

    
    In summary, the forEach method is a convenient way to iterate over each element in 
    an array and perform some operation or execute a function for each element. 
    The provided callback function is what gets executed for each element in the 
    data array.
    */

    let tableHtml = "";
    data.forEach(function ({id, name, date_added}){
         tableHtml += "<tr>";
         tableHtml +=`<td>${id}</td>`;
         tableHtml +=`<td>${name}</td>`;
         tableHtml +=`<td>${new Date(date_added).toLocaleString()}</td>`;
         tableHtml +=`<td><button class="delete-row-btn" data-id=${id}>Delete</td>`;
         tableHtml += `<td><button class="edit-row-btn" data-id=${id}>Edit</td>`;
         tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}


// =====================================
// USER SEARCH - SEARCH 1
// First name or last name
// =====================================

const userSearchBtn = document.querySelector('#user-search-btn');

userSearchBtn.addEventListener('click', async function () {
    const searchType = document.querySelector('#user-search-type').value;

    if (searchType === 'user') {
        const username = document.querySelector('#user-search-value1').value.trim();
        const message = document.querySelector('#user-search-message');
    
        if (!username) {
            message.textContent = 'Please enter a username.';
            return;
        }
    
        try {
            const response = await fetch(
                'http://localhost:5050/api/search/user?username=' +
                encodeURIComponent(username)
            );
    
            if (!response.ok) {
                throw new Error('Search failed');
            }
    
            const users = await response.json();
            const tableBody = document.querySelector('#user-search-table tbody');
    
            tableBody.innerHTML = '';
    
            users.forEach(function (user) {
                const row = tableBody.insertRow();
    
                [
                    user.username,
                    user.firstname,
                    user.lastname,
                    user.salary,
                    user.age,
                    user.registerday
                        ? new Date(user.registerday).toLocaleDateString()
                        : '',
                    user.signintime
                        ? new Date(user.signintime).toLocaleString()
                        : 'Never'
                ].forEach(function (value) {
                    const cell = row.insertCell();
                    cell.textContent = value ?? '';
                });
            });
    
            message.textContent = users.length
                ? users.length + ' user(s) found.'
                : 'No matching users found.';
    
        } catch (error) {
            console.error(error);
            message.textContent = 'Unable to search users.';
        }
    
        return;
    }
    if (searchType === 'salary') {
        const min = document.querySelector('#user-search-value1').value.trim();
        const max = document.querySelector('#user-search-value2').value.trim();
        const message = document.querySelector('#user-search-message');
    
        if (min === '' || max === '' ||
            !Number.isFinite(Number(min)) ||
            !Number.isFinite(Number(max)) ||
            Number(min) > Number(max)) {
            message.textContent = 'Enter a valid minimum and maximum salary.';
            return;
        }
    
        try {
            const params = new URLSearchParams({ min, max });
    
            const response = await fetch(
                'http://localhost:5050/api/search/salary?' + params.toString()
            );
    
            if (!response.ok) {
                throw new Error('Search failed');
            }
    
            const users = await response.json();
            const tableBody = document.querySelector('#user-search-table tbody');
    
            tableBody.innerHTML = '';
    
            users.forEach(function (user) {
                const row = tableBody.insertRow();
    
                [
                    user.username,
                    user.firstname,
                    user.lastname,
                    user.salary,
                    user.age,
                    user.registerday
                        ? new Date(user.registerday).toLocaleDateString()
                        : '',
                    user.signintime
                        ? new Date(user.signintime).toLocaleString()
                        : 'Never'
                ].forEach(function (value) {
                    const cell = row.insertCell();
                    cell.textContent = value ?? '';
                });
            });
    
            message.textContent = users.length
                ? users.length + ' user(s) found.'
                : 'No matching users found.';
    
        } catch (error) {
            console.error(error);
            message.textContent = 'Unable to search users.';
        }
    
        return;
    }
    if (searchType === 'age') {
        const min = document.querySelector('#user-search-value1').value.trim();
        const max = document.querySelector('#user-search-value2').value.trim();
        const message = document.querySelector('#user-search-message');
    
        if (min === '' || max === '' ||
            !Number.isInteger(Number(min)) ||
            !Number.isInteger(Number(max)) ||
            Number(min) < 0 ||
            Number(min) > Number(max)) {
            message.textContent = 'Enter a valid minimum and maximum age.';
            return;
        }
    
        try {
            const params = new URLSearchParams({ min, max });
    
            const response = await fetch(
                'http://localhost:5050/api/search/age?' + params.toString()
            );
    
            if (!response.ok) {
                throw new Error('Search failed');
            }
    
            const users = await response.json();
            const tableBody = document.querySelector('#user-search-table tbody');
    
            tableBody.innerHTML = '';
    
            users.forEach(function (user) {
                const row = tableBody.insertRow();
    
                [
                    user.username,
                    user.firstname,
                    user.lastname,
                    user.salary,
                    user.age,
                    user.registerday
                        ? new Date(user.registerday).toLocaleDateString()
                        : '',
                    user.signintime
                        ? new Date(user.signintime).toLocaleString()
                        : 'Never'
                ].forEach(function (value) {
                    const cell = row.insertCell();
                    cell.textContent = value ?? '';
                });
            });
    
            message.textContent = users.length
                ? users.length + ' user(s) found.'
                : 'No matching users found.';
    
        } catch (error) {
            console.error(error);
            message.textContent = 'Unable to search users.';
        }
    
        return;
    }
    if (searchType === 'after-john') {
        const message = document.querySelector('#user-search-message');
    
        try {
            const response = await fetch(
                'http://localhost:5050/api/search/after-john'
            );
    
            if (!response.ok) {
                throw new Error('Search failed');
            }
    
            const users = await response.json();
            const tableBody = document.querySelector('#user-search-table tbody');
    
            tableBody.innerHTML = '';
    
            users.forEach(function (user) {
                const row = tableBody.insertRow();
    
                [
                    user.username,
                    user.firstname,
                    user.lastname,
                    user.salary,
                    user.age,
                    user.registerday
                        ? new Date(user.registerday).toLocaleDateString()
                        : '',
                    user.signintime
                        ? new Date(user.signintime).toLocaleString()
                        : 'Never'
                ].forEach(function (value) {
                    const cell = row.insertCell();
                    cell.textContent = value ?? '';
                });
            });
    
            message.textContent = users.length
                ? users.length + ' user(s) found.'
                : 'No matching users found.';
    
        } catch (error) {
            console.error(error);
            message.textContent = 'Unable to search users.';
        }
    
        return;
    }
    if (searchType === 'never-signed-in') {
        const message = document.querySelector('#user-search-message');
    
        try {
            const response = await fetch(
                'http://localhost:5050/api/search/never-signed-in'
            );
    
            if (!response.ok) {
                throw new Error('Search failed');
            }
    
            const users = await response.json();
            const tableBody = document.querySelector('#user-search-table tbody');
    
            tableBody.innerHTML = '';
    
            users.forEach(function (user) {
                const row = tableBody.insertRow();
    
                [
                    user.username,
                    user.firstname,
                    user.lastname,
                    user.salary,
                    user.age,
                    user.registerday
                        ? new Date(user.registerday).toLocaleDateString()
                        : '',
                    user.signintime
                        ? new Date(user.signintime).toLocaleString()
                        : 'Never'
                ].forEach(function (value) {
                    const cell = row.insertCell();
                    cell.textContent = value ?? '';
                });
            });
    
            message.textContent = users.length
                ? users.length + ' user(s) found.'
                : 'No matching users found.';
    
        } catch (error) {
            console.error(error);
            message.textContent = 'Unable to search users.';
        }
    
        return;
    }
    if (searchType === 'same-day-john') {
        const message = document.querySelector('#user-search-message');
    
        try {
            const response = await fetch(
                'http://localhost:5050/api/search/same-day-john'
            );
    
            if (!response.ok) {
                throw new Error('Search failed');
            }
    
            const users = await response.json();
            const tableBody = document.querySelector('#user-search-table tbody');
    
            tableBody.innerHTML = '';
    
            users.forEach(function (user) {
                const row = tableBody.insertRow();
    
                [
                    user.username,
                    user.firstname,
                    user.lastname,
                    user.salary,
                    user.age,
                    user.registerday
                        ? new Date(user.registerday).toLocaleDateString()
                        : '',
                    user.signintime
                        ? new Date(user.signintime).toLocaleString()
                        : 'Never'
                ].forEach(function (value) {
                    const cell = row.insertCell();
                    cell.textContent = value ?? '';
                });
            });
    
            message.textContent = users.length
                ? users.length + ' user(s) found.'
                : 'No matching users found.';
    
        } catch (error) {
            console.error(error);
            message.textContent = 'Unable to search users.';
        }
    
        return;
    }

    if (searchType === 'today') {
        const message = document.querySelector('#user-search-message');
    
        try {
            const response = await fetch(
                'http://localhost:5050/api/search/today'
            );
    
            if (!response.ok) {
                throw new Error('Search failed');
            }
    
            const users = await response.json();
            const tableBody = document.querySelector('#user-search-table tbody');
    
            tableBody.innerHTML = '';
    
            users.forEach(function (user) {
                const row = tableBody.insertRow();
    
                [
                    user.username,
                    user.firstname,
                    user.lastname,
                    user.salary,
                    user.age,
                    user.registerday
                        ? new Date(user.registerday).toLocaleDateString()
                        : '',
                    user.signintime
                        ? new Date(user.signintime).toLocaleString()
                        : 'Never'
                ].forEach(function (value) {
                    const cell = row.insertCell();
                    cell.textContent = value ?? '';
                });
            });
    
            message.textContent = users.length
                ? users.length + ' user(s) found.'
                : 'No matching users found.';
    
        } catch (error) {
            console.error(error);
            message.textContent = 'Unable to search users.';
        }
    
        return;
    }
    
    if (searchType !== 'name') {
        alert('We will connect the other search options next.');
        return;
    }

    const firstname = document.querySelector('#user-search-value1').value.trim();
    const lastname = document.querySelector('#user-search-value2').value.trim();
    const message = document.querySelector('#user-search-message');

    if (!firstname && !lastname) {
        message.textContent = 'Please enter a first name or last name.';
        return;
    }

    const params = new URLSearchParams({ firstname, lastname });

    try {
        const response = await fetch(
            'http://localhost:5050/api/search/name?' + params.toString()
        );

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const users = await response.json();
        const tableBody = document.querySelector('#user-search-table tbody');

        tableBody.innerHTML = '';

        users.forEach(function (user) {
            const row = tableBody.insertRow();

            [
                user.username,
                user.firstname,
                user.lastname,
                user.salary,
                user.age,
                user.registerday
                    ? new Date(user.registerday).toLocaleDateString()
                    : '',
                user.signintime
                    ? new Date(user.signintime).toLocaleString()
                    : 'Never'
            ].forEach(function (value) {
                const cell = row.insertCell();
                cell.textContent = value ?? '';
            });
        });

        message.textContent = users.length
            ? users.length + ' user(s) found.'
            : 'No matching users found.';

    } catch (error) {
        console.error(error);
        message.textContent = 'Unable to search users.';
    }
});

