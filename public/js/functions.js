$(function() {

	//local variables initialized
	var weight = 0.0,
		height = 0,
		age = 0,
		BMR = 0,
		BMI = 0,
		TDEE = 0,
		user = 'user',
		inc = 0,
		units = '',
		metric = false,
		male = true,
		protein = 0,
		carbs = 0,
		fat = 0,
		gender = '',
		activityName = '';

	// Modal Box initiation
	$("#btn9,#btn0").animatedModal();
	$('#btn6').on('click', function (){
		calcBMI();
	});

	//Second progress bar at the top initiation
	$(document).on('ready', function() {
		var winHeight = $(window).height(),
			docHeight = $(document).height(),
			progressBar = $('progress'),
			max, value;
		max = docHeight - winHeight;
		progressBar.attr('max', max);
		$(document).on('scroll', function(){
			value = $(window).scrollTop();
			progressBar.attr('value', value);
		});
	});


	//####################################################################
	// GENDER START
	//####################################################################
	//activate progress bar on male click
	$('#gmale').on("click", function(){
		male = true;
		$('#superBoy,#finishLine').css("display", "block");
		$('#superGirl').css("display", "none");
		gender = 'male';
	});
	//activate progress bar on male click
	$('#gfemale').on("click", function(){
		male = false;
		$('#superGirl,#finishLine').css("display", "block");
		$('#superBoy').css("display", "none");
		gender = 'female';
	});
	//####################################################################
	// GENDER END
	//####################################################################


	//####################################################################
	// Personal Start
	//####################################################################
	$('#personalDetails input').prop('disabled',true);
	$('#personalDetails input').css('background','rgba(255,255,255,0.3)');
	//check unit selection
	$( "#units" ).change(function() {
		$('#personalDetails input').prop('disabled',false);
		$('#personalDetails input').css('background','rgba(255,255,255,1)');
		adjustUnits();
	});

	//weight input capturing
	$('#weightInput').keyup(function(){
		var temp = parseFloat($('#weightInput').val());
		if( isNaN(temp)){
			$('#weightInput').css('background','#CF4A30');
		}else{
			weight = parseFloat($('#weightInput').val());
			$('#weightInput').css('background','#88A825');
		}
	});
	//height input capturing
	$('#heightInput').keyup(function(){
		var temp = parseFloat($('#heightInput').val());
		if( isNaN(temp)){
			$('#heightInput').css('background','#CF4A30');
		}else{
			height = parseFloat($('#heightInput').val());
			$('#heightInput').css('background','#88A825');
		}
	});
	//age input capturing
	$('#ageInput').keyup(function(){
		var temp = parseFloat($('#ageInput').val());
		if( isNaN(temp)){
			$('#ageInput').css('background','#CF4A30');
		}else{
			age = parseFloat($('#ageInput').val());
			$('#ageInput').css('background','#88A825');
			calcBMR(weight,height,age);
		}
	});
	//####################################################################
	// Personal END
	//####################################################################

	//calculate TDEE when activity button is clicked
	$('#btn1,#btn2,#btn3,#btn4,#btn5').on('click',function(){
		var btn = parseInt($(this).text());
		calcTDEE(btn);
	});
	//Calculate deficit or surplus when a button is clicked
	$('#btn7,#btn8,#btn9,#btn0').on('click',function(){
		var btn = parseInt($(this).attr('id').replace('btn',''));
		calcDefOrSurp(btn);
	});
	//unit check
	function adjustUnits(){
		units = $('#units').val();
		if(units == 'metric'){
			metric = true;
			$('#weightInput').attr('placeholder','Your weight in kilos');
			$('#heightInput').attr('placeholder','Your height in cm');
		}else{
			metric = false;
			$('#weightInput').attr('placeholder','Your weight in lbs');
			$('#heightInput').attr('placeholder','Your height in inches');
		}
	}
	//Using mLab API to save data
	function saveData(gen,wei,hei,age,bm,act){
		$.ajax( { url: "https://api.mlab.com/api/1/databases/mongo/collections/details?apiKey=CFtPUbhD7L8QuM9nNL6IjSPh2t3A3v87",
			data: JSON.stringify( [ { "gender" : gen ,  "weight" : wei,  "height" : hei ,  "age" : age ,  "bmi" : bm ,  "activity" : act , "date": {"$date": new Date().toISOString()}} ] ),
			type: "POST",
			contentType: "application/json" } );
	}
	//Calculation of body mass index
	function calcBMI(){
		if(metric){
			if(weight != 0  && height != 0 && age != 0){
				BMI = (weight / ((height / 100) * (height / 100))).toFixed(1);
				if (BMI < 18.5){
					$('#screen').text('Your BMI: ' + BMI + ', you are underweight');
				}else if(BMI >= 18.5 && BMI <= 25){
					$('#screen').text('Your BMI: ' + BMI + ', you are in a healthy range');
				}else if(BMI > 25 && BMI <= 30){
					$('#screen').text('Your BMI: ' + BMI + ', you are overweight');
				}else if(BMI > 30){
					$('#screen').text('Your BMI: ' + BMI + ', you are obese!');
				}
			}else{
				$('#screen').text('Enter your details by clicking on gender button');
			}
		}else{
			if(weight != 0  && height != 0 && age != 0){
			var kgWeight = weight / 2.2;
			var kgHeight = height * 2.54;
			BMI = (kgWeight / ((kgHeight / 100) * (kgHeight / 100))).toFixed(1);
				if (BMI < 18.5){
					$('#screen').text('Your BMI: ' + BMI + ', you are underweight');
				}else if(BMI >= 18.5 && BMI <= 25){
					$('#screen').text('Your BMI: ' + BMI + ', you are in a healthy range');
				}else if(BMI > 25 && BMI <= 30){
					$('#screen').text('Your BMI: ' + BMI + ', you are overweight');
				}else if(BMI > 30){
					$('#screen').text('Your BMI: ' + BMI + ', you are obese!');
				}
			}else{
				$('#screen').text('Enter your details by clicking on gender button');
			}
		}
	}

	function bmiForSave(){
			BMI = (weight / ((height / 100) * (height / 100))).toFixed(1);
	}

	//Calculation of basic metabolic rate
	function calcBMR(w, h, a){
		//Metric conversion
		if(metric == true){
			if(male){
				//calculating metric for male
				BMR = 88 + (13.4 * w) + (4.8 * h) - (5.7 * a);
				changeMacrosPercent();
			}else{
				//calculating metric for female
				BMR = 448 + (9.2 * w) + (3.1 * h) - (4.3 * a);
				changeMacrosPercent();
			}
			//Doing imperial conversions
		}else{
			if(male){
				//calculating imperial for male
				BMR = 88 + (6.1 * w) + (12.2 * h) - (5.7 * a);
				changeMacrosPercent();
			}else{
				//calculating imperial for female
				BMR = 448 + (4.2 * w) + (7.9 * h) - (4.3 * a);
				changeMacrosPercent();
			}
		}

	}
	//Calculation for total daily energy expenditure
	function calcTDEE(activityLvl){
		//Check user's activity level
		var actLvl = 0;
		switch(activityLvl) {
			case 1:
				actLvl = 1.2;
				activityName = 'Sedentary';
				break;
			case 2:
				actLvl = 1.375;
				activityName = 'Light Active';
				break;
			case 3:
				actLvl = 1.55;
				activityName = 'Moderate Active';
				break;
			case 4:
				actLvl = 1.725;
				activityName = 'Very Active';
				break;
			case 5:
				actLvl = 1.9;
				activityName = 'Extremely Active';
				break;
			default:
				$('#screen').text('You forgot to add numbers');
		}

		//check if activity level is right and show data in the calculator
		if(actLvl != 0 && actLvl != NaN && BMR != 0 && BMR != NaN){
			TDEE = BMR * actLvl;
			bmiForSave();
			saveData(gender,weight,height,age,BMI,activityName);
			var tdeeText = 'Your daily calories to maintain weight are equal to: ' + Math.round(TDEE) + ' cals' + '\n' + '\n' +
				'. You need ' + Math.round((TDEE*0.25)/4) + 'g of protein,' + '\n' +
				' ' + Math.round((TDEE*0.45)/4) + 'g of carbs' + '\n' +
				' and ' + Math.round((TDEE*0.3)/9) + 'g of fats daily.';
			$('#screen').text(tdeeText);
			flexiMacros(TDEE);
		}else{
			$('#screen').text('Please enter personal details by selecting gender');
		}
	}
	//Adjusting pages according to personal details
	function changeMacrosPercent(){
		var macroTemp = BMR * 1.2;
		protein = Math.round(macroTemp * 0.25);
		carbs = Math.round(macroTemp * 0.45);
		fat = Math.round(macroTemp * 0.3);
		$('#protDistribution').html('<strong>Assuming low activity levels (e.g. you work at a desk job), you should consume: ' + Math.round(protein/4) + 'g of protein a day, which is equivalent to ' + protein + 'cals to maintain your current weight.</strong>');
		$('#carbDistribution').html('<strong>Assuming low activity levels (e.g. you work at a desk job), you should consume: ' + Math.round(carbs/4) + 'g of carbohydrates a day, which is equivalent to ' + carbs + 'cals to maintain your current weight.</strong>');
		$('#fatDistribution').html('<strong>Assuming low activity levels (e.g. you work at a desk job), you should consume: ' + Math.round(fat/9) + 'g of fat a day, which is equivalent to ' + fat + 'cals to maintain your current weight.</strong>');
	}
	//show flexible dieting information
	function flexiMacros(tdee){
		protein = Math.round(tdee * 0.25);
		carbs = Math.round(tdee * 0.45);
		fat = Math.round(tdee * 0.3);
		$('#flexiPro').text('Your diet should consist of ' + Math.round(protein/4) + 'g of protein which is equivalent to ' + protein + 'cals');
		$('#flexiCarb').text('and ' + Math.round(carbs/4) + 'g of carbohydrates which is equivalent to ' + carbs + 'cals');
		$('#flexiFat').text('and ' + Math.round(fat/9) + 'g of fats which is equivalent to ' + fat + 'cals');
	}

	//Calculation of caloric deficit and surplus
	function calcDefOrSurp(temp){
		var deficit = TDEE;
		var surplus = TDEE;
		switch(temp) {
			case 7:
				deficit = TDEE * 0.85;
				var tdeeTextDeficit = 'Your daily calories to lose weight: ' + Math.round(deficit) + 'cals.' + '\n' + '\n' +
					'You need ' + Math.round((deficit*0.3)/4) + 'g of protein,' + '\n' +
					' ' + Math.round((deficit*0.4)/4) + 'g of carbs,' + '\n' +
					' ' + Math.round((deficit*0.3)/9) + 'g of fats daily.';
				$('#screen').text(tdeeTextDeficit);
				flexiMacros(Math.round(deficit));
				break;
			case 8:
				surplus = TDEE * 1.1;

				var tdeeTextSurplus = 'Your daily calories to gain weight: ' + Math.round(deficit) + 'cals' + '\n' + '\n' +
					'You need ' + Math.round((surplus*0.25)/4) + 'g of protein,' + '\n' +
					' ' + Math.round((surplus*0.45)/4) + 'g of carbs,' + '\n' +
					'' + Math.round((surplus*0.3)/9) + 'g of fats daily.';
				$('#screen').text(tdeeTextSurplus);
				flexiMacros(Math.round(surplus));
				break;
			case 9:
				male = true;
				gender = 'male';
				modalFunc();
				break;
			case 0:
				male = false;
				gender = 'female';
				modalFunc();
				break;
			default:
				$('#screen').text('Your daily calories were not added');
		}
	}

	//Modal function
	function modalFunc(){
		$('#TDEEPersonal input').val('');
		$('#modalClosing').on('click',function(){
			units = $('#modalUnits').val();
			if(units == 'metric'){
				metric = true;
			}else{
				metric = false;
			}
			weight = parseFloat($('#modalWeight').val());
			height = parseFloat($('#modalHeight').val());
			age = parseFloat($('#modalAge').val());

			if(weight != 0 && weight != false && height != 0 && height != false && age != 0 && age != false){
				calcBMR(weight, height, age);
			}else{
				$('#screen').text('You entered wrong values');
			}
		});
	}

	//initialize tooltips
	$('[title!=""]').qtip({
		position: {
			target: 'mouse',
			adjust: { x: 10, y: 15 }
		},
		style: { classes: 'qtip-bootstrap' }
	});

	//show tooltips on specific graphics
	$('#stat5, #stat6').qtip();

	//show tooltips on side effects
	$('#side1,#side2,#side3,#side4,#side5,#side6,#side7,#side8,#side9').qtip({
		content: {
			text: function(event, api) {
				return $(this).attr('sideText');
			},
			title: function(event, api) {
				return $(this).attr('sideTitle');
			}
		},
		position: {
			target: 'mouse',
			adjust: { x: 10, y: 15 }
		},
		style : {classes : 'qtip-bootstrap'}
	});

	//show tooltips on healthy and fast food
	$('#healthyGra,#fatGra').qtip({
		content: {
			text: function(event, api) {
				return $(this).attr('foodText');
			},
			title: function(event, api) {
				return $(this).attr('foodTitle');
			}
		},
		position: {
			target: 'mouse',
			adjust: { x: 10, y: 15 }
		},
		style : {classes : 'qtip-bootstrap'}
	});

	//UK map hover effects
	$("#pointScotland").on('mouseover',function(){
		$("#imgScotland").css("display","block");
	}).on('mouseout',function(){
		$("#imgScotland").css("display","none");
	});
	$("#pointEngland").on('mouseover',function(){
		$("#imgEngland").css("display","block");
	}).on('mouseout',function(){
		$("#imgEngland").css("display","none");
	});
	$("#pointWales").on('mouseover',function(){
		$("#imgWales").css("display","block");
	}).on('mouseout',function(){
		$("#imgWales").css("display","none");
	});
	$("#pointIreland").on('mouseover',function(){
		$("#imgIreland").css("display","block");
	}).on('mouseout',function(){
		$("#imgIreland").css("display","none");
	});

})();