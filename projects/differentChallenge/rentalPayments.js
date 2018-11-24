//Search function
let input = document.querySelector('input');
let button = document.querySelector('button');

let search = (lease) => {
	clearTable();
	if (lease) {
		query = url + lease;
	} else {
		query = url + input.value;
	}
	getLease();
	input.value = "";
	document.getElementById('tenants').style.display = 'none';
	document.getElementById('lease').style.display = 'block';
	document.querySelector('body').classList.remove('flex');
}

//Click button to search
button.addEventListener("click", function() {
	if (input.value.length > 0) {
		search();
	}
});

//Press enter to search
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
		search();
  }
});

//Click tenants button to display tenants
let tenantsButton = document.getElementById('tenantsButton');
tenantsButton.addEventListener("click", function() {
	document.getElementById('tenants').style.display = 'block';
	document.getElementById('lease').style.display = 'none';
	getTenants();
});

//Lease information variables
let id, startDate, endDate, rent, frequency, paymentDay;

//Retrieve lease info from API
const url = "https://hiring-task-api.herokuapp.com/v1/leases/";
let query = "";

async function getLease() {
	try {
		let response = await fetch(query);
		if (response.ok) {
			let jsonResponse = await response.json();
			let result = jsonResponse;
			
			id = result.id;
			startDate = new Date(result.start_date);
			endDate = new Date(result.end_date);
			rent = result.rent;
			frequency = result.frequency;
			paymentDay = result.payment_day;
			
			let leaseId = document.querySelector('#leaseId');
			leaseId.innerHTML = id;
			let payments = calculatePayments(startDate, paymentDay, rent, frequency);
			displayTable(payments);
			
			return jsonResponse;
		} throw new Error('Request failed!')
	} catch(error) {
		console.log(error);
	}
}

//Tenant information variables
let tenants;

//Retrieve lease info from API
async function getTenants() {
	try {
		let response = await fetch(url);
		if (response.ok) {
			let jsonResponse = await response.json();
			tenants = jsonResponse;
			displayTable(tenants);
			
			//Click tenant row to search lease ID
			let tenantRow = document.querySelectorAll('#tenants tr');
			for (let i = 1;i < tenants.length + 1;i++) {
				tenantRow[i].addEventListener("click", function() {
					search(tenantRow[i].childNodes[1].textContent);
				});
			}
			
			return jsonResponse;
		} throw new Error('Request failed!')
	} catch(error) {
		console.log(error);
	}
}



//Add days function
Date.prototype.addDays = function(days) {
	let date = new Date(this.valueOf());
	date.setDate(date.getDate() + (days - 1));
	return date;
}

//Display date in correct format function
let displayDate = (date) => {
	const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
	let dateFormat = "";
	dateFormat += monthNames[date.getMonth()] + ", ";
	dateFormat += date.getDate() + ord(date.getDate()) + " ";
	dateFormat += date.getFullYear();
	return dateFormat;
}

//Date ordinal indicator function
let ord = (d) => {
  if (d > 3 && d < 21) return 'th'; 
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

//Days until next payment day
let daysUntil = (date, payday) => {
	let dayCount = 1;
	let week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
	let currentDay = date.getDay();
	let paymentDay = week.indexOf(payday);
	
	for (let i = currentDay;i !== paymentDay;i++) {
		dayCount++;
		if (i === 6) i = 0;
	}
	
	return dayCount;
}

//Calculate each payment from start to end
let calculatePayments = (startDate, paymentDay, rent, frequency) => {
	let payments = [];
	
	//Variables for amount of days
	let totalDays = dateDifference(startDate, endDate);
	let firstPaymentDays = daysUntil(startDate, paymentDay);
	let dayFrequency = frequencyDays(frequency);
	
	//Calculations to work out each payment and days
	let restOfDays = totalDays - firstPaymentDays;
	let numberOfEqualPayments = Math.floor(restOfDays / dayFrequency);
	let totalEqualPaymentDays = numberOfEqualPayments * dayFrequency;
	let lastPaymentDays = totalDays - (totalEqualPaymentDays + firstPaymentDays);
	
	//Push first payment
	payments.push({
		startDate: displayDate(startDate), 
		endDate: displayDate(startDate.addDays(firstPaymentDays)),
		days: firstPaymentDays, 
		amount: "$" + convertDecimal(amount(rent, firstPaymentDays))
	});
	
	//Push equal amount payments
	let newStartDate = startDate.addDays(firstPaymentDays + 1);
	for (let i = 0;i < numberOfEqualPayments;i++) {
		payments.push({
			startDate: displayDate(newStartDate), 
			endDate: displayDate(newStartDate.addDays(dayFrequency)),
			days: dayFrequency, 
			amount: "$" + convertDecimal(amount(rent, dayFrequency))
		});
		newStartDate = newStartDate.addDays(dayFrequency + 1);
	}
	
	//Push last payment
	payments.push({
			startDate: displayDate(newStartDate), 
			endDate: displayDate(newStartDate.addDays(lastPaymentDays)),
			days: lastPaymentDays, 
			amount: "$" + convertDecimal(amount(rent, lastPaymentDays))
	});
	
	return payments;
}

//Calculate days between two dates including the end date
let dateDifference = (firstDate, secondDate) => Math.round((secondDate-firstDate)/(1000*60*60*24)) + 1;

//Calculate number of days based on frequency
let frequencyDays = f => {
	switch (f) {
    case 'weekly':	return 7;
    case 'fortnightly':	return 14;
    case 'monthly': return 28;
  }
}

//Calculate each payment
let amount = (rent, days) => (rent / 7) * days;

//Convert to 1 decimal place
let convertDecimal = (amount) => (Number.isInteger(amount)) ? amount : amount.toFixed(1);

//Display information in table
let displayTable = (array) => {
	let table, row;
	if (array[0].startDate) {
		table = document.querySelector('#lease table');
	} else {
		table = document.querySelector('#tenants table');
	}
	for (let i = 0;i < array.length;i++) {
		row = table.insertRow(i + 1);
		row.classList.add('data');
		let cell1 = row.insertCell(0);
		let cell2 = row.insertCell(1);
		if (array[0].startDate) {
			let cell3 = row.insertCell(2);
			let cell4 = row.insertCell(3);
			cell1.innerHTML = array[i].startDate;
			cell2.innerHTML = array[i].endDate;
			cell3.innerHTML = array[i].days;
			cell4.innerHTML = array[i].amount;
		} else {
			cell1.innerHTML = array[i].tenant;
			cell2.innerHTML = array[i].id;
		}
	}
}

//Clear table for new query
let clearTable = () => {
	let data = document.getElementsByClassName('data');
	while (data[0]) data[0].parentNode.removeChild(data[0]);
}