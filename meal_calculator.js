
var tax_percent = 10;
var tip_percent = 20;
var num_diners = 2;

var Diner = function(name, dishes) {
	this.name = name;
	this.dishes = dishes;
	this.tax = 0;
	this.total_before_tax = 0;
};

var Dish = function(name, price) {
	this.name = name;
	this.price = price;
};

// Create some dishes
var Lasagna = new Dish('Lasagna', 9.50);
var Steak = new Dish('Steak', 22.50);
var IceCream = new Dish('IceCream', 5.00);
var Pesto = new Dish('Pesto', 18.00);
var Salad = new Dish('Salad', 14.00);
var Cake = new Dish('Cake', 12.00);

// Create some diners
var Sebastian = new Diner('Sebastian', [Lasagna, Steak, IceCream]);
var Dia = new Diner('Dia', [Pesto, Salad, Cake]);

// Add a specified percentage to a specified amount
function calculate_percentage(total_cost, percentage){
	return total_cost*(percentage/100);
}

// Calculate tip and print bill summary
function bill_summary(total_cost) {
	console.log();
	total_tip = calculate_percentage(total_cost, tip_percent);
	console.log('Total before tip: $' + total_cost.toFixed(2));
	console.log('Tip percentage: $' + tip_percent + '%');
	console.log('Tip amount: $' + total_tip.toFixed(2));
	console.log('Total: $' + (total_cost + total_tip).toFixed(2));	
}

function diner_summary(diner){
	console.log('Total before tax: $' + diner.total_before_tax.toFixed(2));
	console.log('Tax: $' + diner.tax.toFixed(2));
	console.log('Total with tax: $' + (diner.total_before_tax + diner.tax).toFixed(2));
	console.log();
}

// Calculate the bill for all specified diners
function calculate_bill(diners) {
	var total_cost = 0;

	for(i=0; i< diners.length; i++){
		console.log(diners[i].name + ':');
		for(j=0; j<diners[i].dishes.length; j++){
			console.log(diners[i].dishes[j].name + ': $' + diners[i].dishes[j].price.toFixed(2));
			diners[i].total_before_tax += diners[i].dishes[j].price;
			diners[i].tax += diners[i].dishes[j].price * (tax_percent/100);
		}
		total_cost += diners[i].total_before_tax + diners[i].tax;
		diner_summary(diners[i]);
	}
	bill_summary(total_cost);
}

calculate_bill([Sebastian, Dia]);