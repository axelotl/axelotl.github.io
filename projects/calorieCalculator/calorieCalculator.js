$("#UI").fadeIn("slow");

// Calorie Calculation
let name, gender, unit, weight, height, age, activity, result;
let heightImperial = [];

let calculate = () => {
	name = $("#name").val();
	gender = $("input[name=gender]:checked").val();
	if (unit === "metric") {
		height = $("input[name=cm]").val()
		weight = $("#weight").val();
	}
	if (unit === "imperial") {
		heightImperial.push(Number($("input[name=feet]").val()));
		heightImperial.push(Number($("input[name=inch]").val()));
		height = unitConversion(heightImperial[0], heightImperial[1]);
		weight = $("#weight").val() * 0.453592;
	}
	age = $("#age").val();
	activity = $("select option:selected").val();
	
	result = bmrEquation(gender, weight, height, age, activity);
}

// BMR Equation
let bmrEquation = (gender, weight, height, age, activity) => {
	let bmr = Math.round(((10 * weight) + (6.25 * height) - (5 * age)) * activity);
	if (gender === "Male") return bmr + 5;
	else return bmr - 161;
}

// Focuser
let focus = 1;
let focuser = (focus) => {
	$("#focus").removeAttr('id');
	$(".userInput:nth-child("+ focus +")").attr('id', 'focus');
	$(".userInput:not(#focus)").hide();
	$("i").removeClass("borderColor");
	$("#focus").show();
	$("#focus input:nth-of-type(1):not(input[type=radio])").focus();
}
focuser(focus);

// Key press
$("body").on("keypress", function(e) {
	next(e);
})

// Arrow click
$("i").on("click", function(e) {
	let clicked = true;
	next(e, clicked);
})

// Validation for focuser
let next = (e, clicked) => {
	if (e.which === 13 && focus < $(".userInput").length 
			|| clicked && focus < $(".userInput").length) {
		if (focus > 1 || !hasNumber($("#name").val())) {
			if (!isEmptyOrSpaces($("#focus input").val()) || !isEmptyOrSpaces($("#focus input[name=feet]").val())) {
				if (focus < 3 || focus > 4 || $("#focus input[type=radio]").is(':checked') !== false) {
					focus++;
					focuser(focus);
				}
			}
		}
	} else if (e.which === 13 && focus === $(".userInput").length && $("select").val() !== "Activity level" 
						 || clicked && focus === $(".userInput").length && $("select").val() !== "Activity level") {
		focus++;
		$("#UI").hide();
		calculate();
		$("#end").toggleClass("double");
		results();
	}
}

// Set Unit of Measurement
$("input[name=unit]").one("click", function() {
	if ($("input[name=unit]").is(":checked")) {
		unit = $("input[name=unit]:checked").val();
		if (unit === "imperial") {
			$("#metricHeight").hide();
			$("#imperialHeight").show();
			$("#weightUnit").text("lbs");
		} else {
			$("#imperialHeight").hide();
			$("#metricHeight").show();
			$("#weightUnit").text("kg");
		}
	}
})

// Results Screen
let results = () => {
	<!-- Display user information -->
	$("#profile p:nth-of-type(1)").append(name);
	$("#profile p:nth-of-type(2)").append(gender);
	$("#profile p:nth-of-type(3)").append(age);
	if (unit === "imperial") {
		$("#profile p:nth-of-type(4)").append(Math.round((weight * 2.20462) * 100) / 100 + "lbs");
		$("#profile p:nth-of-type(5)").append(`${heightImperial[0]}ft ${heightImperial[1]}in`);
	} else {
		$("#profile p:nth-of-type(4)").append(weight + "kg");
		$("#profile p:nth-of-type(5)").append(height + "cm");
	}
	$("#profile p:nth-of-type(6)").append($("option:selected").text());
	
	<!-- Display results -->
	$("#results p:nth-of-type(1)").html(`<span>${result}</span> maintenence calories`);
	$("#results div p:nth-of-type(1)").html(`<span>${result - 500}</span> to lose 0.5kg per week`);
	$("#results div p:nth-of-type(2)").html(`<span>${result - 100}</span> to lose 1kg per week`);
	$("#results div p:nth-of-type(3)").html(`<span>${result + 500}</span> to gain 0.5kg per week`);
	$("#results div p:nth-of-type(4)").html(`<span>${result + 1000}</span> to gain 1kg per week`);
	
	$("#end").css("display", "grid");
	$("#results").fadeIn("fast");
	$("#profile").fadeIn("fast");
}

// Simple functions
function isEmptyOrSpaces(str){
	try {
		return str === null || str.match(/^ *$/) !== null;
	}
	catch(err) {
		return true;
	}
}

function unitConversion(feet, inch) {
	return ((feet * 12) + inch) * 2.54;
}

function hasNumber(str) {
return /\d/.test(str);
}

// Input selected animation
$("#imperialHeight input:nth-of-type(1)").on("focus", function() {
	$("#imperialText").addClass("red");
})
$("#imperialHeight input:nth-of-type(1)").on("focusout", function() {
	$("#imperialText").removeClass("red");
})
$('.radio').on("click", function(event) {
	$target = $(event.target);
	if ($('input[type=radio]').is(':checked')) {
		$("#focus .labelText").addClass("red");
		$("i").addClass("borderColor");
	}
	if ($target.is(':checked')) {
		$target.parent().addClass("borderBottom");
		$target.parent().siblings().removeClass("borderBottom");
	}
})
$(".custom-select").on("click", function() {
	$(".select-selected").addClass("red");
		$("i").addClass("borderColor");
})