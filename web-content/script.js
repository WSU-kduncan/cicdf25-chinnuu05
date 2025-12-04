// Prints the first and last name from the <input> tags in the form when form is submitted
function printName() {
	
	console.log("The form was submitted!");
	
	let firstName = document.forms["contactForm"]["first_name"].value;
	let lastName = document.forms["contactForm"]["last_name"].value;
	if ( lastName == "" || firstName == "")
	{
		alert("Hey you forgot to enter the last name");
		
	}
	
	else {
		alert("Hello " + firstName + " " + lastName);
	} 


	let first_name = document.getElementById("first_name").value;
	let last_name = document.getElementById("last_name").value;

	let first_number = document.getElementById("first_number").value;
	let second_number = document.getElementById("second_number").value;

	console.log(`The first number is ${first_number} and the second number is ${second_number}`);
	console.log(`The user's name is ${first_name} ${last_name}`);

	alert(`Hello ${first_name} ${last_name}, welcome to Wright State Marker store!`);

	alert(`The sum of ${first_number} and ${second_number} is ${parseInt(first_number) + parseInt(second_number)}`);
}



function doSomethingOnButtonClick() {
	alert("Button was clicked!");
}


	
	function addNumbers(num1, num2) {
	return num1 + num2;
	}

	function promptNumbers() {

	const inputOne = prompt("Enter first number"); 
	const inputTwo = prompt("Enter second number");
	const total = addNumbers(parseInt(inputOne), parseInt(inputTwo));

	console.log(`Result from adding Number one ${inputOne} to number two ${inputTwo} is ${total}`);
	
	alert(`Result is ${total}`);
	}
	
	function changeColor() {
		
		
		let heading = document.getElementById("changeColor");
		console.log("Getting heading");
		
		var change = true;
		
		if (heading.style.color == "red") {
			
			console.log("Heading color is red, setting change to false");
			change = false;	
			
		}
		
		else {
			
			change = true
			
		}
		
		if (change) {
			
			console.log("Changing heading color to red") 
			
			heading.style.color = "red";
			change = false; 
			
		}
		
		
		else {
			
			console.log("Change was false, changeing color of heading to black");
			
			heading.style.color = "black";
			change = true
			
			
		} 
		
	
	
		
	}


function retrieveMarkerInfo() {

	const markerJson = localStorage.getItem("products");
	console.log("Retrieved marker info from localStorage: " + markerJson);

	const parsedJson = JSON.parse(markerJson);

	// console.log(parsedJson[0].markerColor);
	
	// Just show the first product in the list
	parsedItem = parsedJson[0];

	document.getElementById("marker_display_brand_name").innerHTML = parsedItem.product_name;
	document.getElementById("marker_display_color").innerHTML = parsedItem.product_color;
	document.getElementById("marker_display_stock_count").innerHTML = parsedItem.product_quantity;
	document.getElementById("marker_display_manufactured_date").innerHTML = parsedItem.product_manufacture_date;
	document.getElementById("marker_display_rate").innerHTML = parsedItem.product_rate;
	document.getElementById("marker_display_total_cost").innerHTML = parsedItem.product_total_cost;


}

// Saves product info into list in localStorage
document.getElementById("markerForm")
.addEventListener("submit", function(event) {
	event.preventDefault();
	let name = document.getElementById("brand_name").value;
	let color = document.getElementById("marker_color").value;
	let quantity = document.getElementById("num_of_markers").value;	
	let rate = document.getElementById("marker_rate").value;	
	let total_cost = rate * quantity;
	
	console.log(`Product total cost: ${total_cost}, using rate: ${rate} and quantity: ${quantity}`);

	let product = {
		product_name: name,
		product_color: color,
		product_quantity: quantity,
		product_manufacture_date: document.getElementById("manufactured_on").value,
		product_rate: rate,
		product_total_cost: rate * quantity 
	};

	let products = JSON.parse(localStorage.getItem("products") || "[]");

	products.push(product);

	localStorage.setItem("products", JSON.stringify(products));
	document.getElementById("markerForm").reset();
	alert("Product saved!");

});

document.getElementById("displayAllData").onclick = function() {
	const products = JSON.parse(localStorage.getItem("products") || "[]");
	const tableBody = document.getElementById("resultTable");

	// Clear everything in the table before adding new rows
	while (tableBody.rows.length > 1) {
		tableBody.deleteRow(1);
	}

	products.forEach((product, index) => {
		const row = document.createElement("tr"); 
		const nameCell = document.createElement("td");

		const nameInput = document.createElement("input");
		nameInput.type = "text";
		nameInput.value = product.product_name;
		nameCell.appendChild(nameInput);

		const colorCell = document.createElement("td");
		const colorInput = document.createElement("input");
		colorInput.type = "text";
		colorInput.value = product.product_color;
		colorCell.appendChild(colorInput);

		const quantityCell = document.createElement("td");
		const quantityInput = document.createElement("input");
		quantityInput.type = "number";
		quantityInput.value = product.product_quantity;
		quantityCell.appendChild(quantityInput);

		const manufactureDateCell = document.createElement("td");
		const dateInput = document.createElement("input");
		dateInput.type = "date";
		dateInput.value = product.product_manufacture_date;
		manufactureDateCell.appendChild(dateInput);

		const rateCell = document.createElement("td");
		const rateInput = document.createElement("input");
		rateInput.type = "number";
		rateInput.value = product.product_rate;
		rateCell.appendChild(rateInput);

		const totalCostCell = document.createElement("td");
		const totalCostInput = document.createElement("input");
		totalCostInput.type = "number";
		totalCostInput.value = product.product_total_cost;
		totalCostInput.disabled = true;
		totalCostCell.appendChild(totalCostInput);

		const editCell = document.createElement("td");
		const editButton = document.createElement("button");
		editButton.textContent = "Edit";

		editButton.onclick = function () {

			// update the total cost just in case quantity or rate were edited
			const editedQuantity = Number(quantityInput.value);
			const editedRate = Number(rateInput.value);
			const newTotal = editedQuantity * editedRate;
			totalCostInput.value = newTotal;

			products[index] = {
				product_name: nameInput.value,
				product_color: colorInput.value,
				product_quantity: quantityInput.value,
				product_manufacture_date: dateInput.value,
				product_rate: rateInput.value,
				product_total_cost: newTotal
			};

			localStorage.setItem("products", JSON.stringify(products));
			alert("Updated marker");
		};

		editCell.appendChild(editButton);

		const deleteCell = document.createElement("td");
		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";

		deleteButton.onclick = function () {
			products.splice(index, 1);
			localStorage.setItem("products", JSON.stringify(products));
			row.remove();
		};

		deleteCell.appendChild(deleteButton);

		row.appendChild(nameCell);
		row.appendChild(colorCell);
		row.appendChild(quantityCell);
		row.appendChild(manufactureDateCell);
		row.appendChild(rateCell);
		row.appendChild(totalCostCell);
		row.appendChild(editCell);
		row.appendChild(deleteCell);

		tableBody.appendChild(row);
	});

}


function timeStamp() {
	
	const today_date = new Date();
	const month = Number(today_date.getMonth()) + 1;
	
	const year = today_date.getFullYear();
	const day = today_date.getDate();

	const hours = today_date.getHours();
	const minutes = today_date.getMinutes();
	const seconds = today_date.getSeconds();
	
	var convertedHours = 0;
	var isPM = false;
	
	if (hours >= 12) {
		
		// PM If greater than 12, AM if less than 12
		isPM = true;
		
		convertedHours = hours - 12;
		
	}
	
	
	// 0 in military time = 12 PM
	else if (hours == 0) {
		
		convertedHours = 12;
		
	}
	
	
	const timeMessage = `The converted 12 hour time is: ${convertedHours}:${minutes}:${seconds} ` + (isPM ? " PM" : " AM");
	console.log(timeMessage); 
	
	//alert(timeMessage);
	
	
	purchaseButton = document.getElementById("purchase-button") 
	purchaseButton.innerHTML = timeMessage;
	
}


