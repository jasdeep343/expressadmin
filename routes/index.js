var express = require('express');
var router = express.Router();
var session = require('express-session');
var firebase = require('firebase');
var FirebasePaginator = require('firebase-paginator')
var Math = require('mathjs');
var moment = require('moment-timezone');
//var jsonDate = now.toJSON();
var flash = require('express-flash');
var distance = require('google-distance');
distance.apiKey = 'AIzaSyDmJdQWIop20sxrufJJhVGvf9ls0eIxSiQ';
var TableUser = firebase.database().ref("node-client/TableUser/");
var BookRide = firebase.database().ref("node-client/BookRide/");
var Licence = firebase.database().ref("node-client/Documents/Licence/");
var VehicleInsurance = firebase.database().ref("node-client/Documents/VehicleInsurance/");
var VehicleRegistration = firebase.database().ref("node-client/Documents/VehicleRegistration/");
var Documents = firebase.database().ref("node-client/Documents/");
var Restaurants = firebase.database().ref("node-client/Restaurants/");
var loggedInusers = firebase.database().ref("node-client/loggedInusers/");

var sess; var day = []; var month = []; var week = []; var year = []; var to = []; var mo = [];
var we = []; var yr = []; var rider = [];var driver = [];var rides = [];var logindriver = [];var loginrides = [];

router.get('/', function(req, res) {
	res.render('index', { title: 'Vanbr Admin',msg:"W" });
});

/* POST home page. */
router.post('/', function(req, res) {
	sess=req.session;
	var email =  req.body.email;
	var password =  req.body.password;
	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		if(error){
			res.render('index', { title: 'Vanbr Admin',msg:"Authontication Fail" });
		}
	});
	firebase.auth().onAuthStateChanged((user) => {
		if (user.uid) {
			TableUser.child(user.uid).once('value', function(snapshot) {
				if (snapshot.val() === null) {
					res.render('index', { title: 'Vanbr Admin',msg:"Authontication key not found" });
				}else{
					if(snapshot.val().role_id){
						sess.uid =snapshot.val().uid;
						sess.email =snapshot.val().email;
						sess.role =snapshot.val().role_id;
						res.redirect('/userAuth');
					}else{
						res.render('index', { title: 'Vanbr Admin',msg:"Not a valid admin access" });
					}
				}
			});
			
		}
	});
});

/* GET after authontication. */
router.get('/userAuth', function(req, res) {
	if(sess){
		TableUser.once("value", function(snapshot) {
			rider = [];driver=[];rides=[];logindriver=[];loginrides=[];
			snapshot.forEach(function (snapshot) {
				if(snapshot.val().role_id == 2){
					rider.push(snapshot.val());
				}else if(snapshot.val().role_id == 3){
					driver.push(snapshot.val());
				}
			});
			BookRide.once("value", function(snap) {
				snap.forEach(function (snap) {
					if(snap.val().ride_state == 5){
						rides.push(snap.val());
					}
				});
				
				loggedInusers.once("value", function(login) {
					login.forEach(function (login) {
						if(login.val().status == 0 || login.val().status == 1 || login.val().status != undefined){
							logindriver.push(login.val());
						}else if(login.val().status == undefined){
							loginrides.push(login.val());
						}	
					});
					/* console.log(loginrides);
					console.log(logindriver); */
					res.render('dashboard', {
						title: 'Vanbr Admin',
						uid:sess.uid,
						email:sess.email,
						role:sess.role,
						rider:rider,
						driver:driver,
						rides:rides,
						loginrides:loginrides,
						logindriver:logindriver,
					});
					
				});
			});	
		});
	}else{
		res.redirect('/');
	}
});

/* GET Ride Details */
/* router.get('/rides', function(req, res) {
	if(sess){
		BookRide.once("value", function(snapshot) {
			if (snapshot.val() === null) {
				res.render('rideDetails', { title: 'Vanbr Rides',msg:"data not found",uid:sess.uid,email:sess.email });
			}else{
				res.render('rideDetails', { title: 'Vanbr Rides',msg:"user",data:snapshot.val(),uid:sess.uid,email:sess.email });
			}
		}, function (errorObject) {
		  console.log("The read failed: " + errorObject.code);
		});
	}else{
		res.redirect('/');
	}
}); */

/* GET users Details */
/* router.get('/users', function(req, res) {
	if(sess){
		TableUser.once("value", function(snapshot) {
		
		if (snapshot.val() === null) {
				res.render('userDetails', { title: 'Vanbr Rides',msg:"data not found",uid:sess.uid,email:sess.email });
			}else{
				res.render('userDetails', { title: 'Vanbr Rides',msg:"user",data:snapshot.val(),uid:sess.uid,email:sess.email });
			}
		}, function (errorObject) {
		  console.log("The read failed: " + errorObject.code);
		});
	}else{
		res.redirect('/');
	}
}); */

/* GET drivers Details */
/* router.get('/drivers', function(req, res) {
	if(sess){
		TableUser.once("value", function(snapshot) {
			if (snapshot.val() === null) {
				res.render('driverDetails', { title: 'Vanbr Rides',msg:"data not found",uid:sess.uid,email:sess.email });
			}else{
				res.render('driverDetails', { title: 'Vanbr Driver',msg:"driver",data:snapshot.val(),uid:sess.uid,email:sess.email });
			}
		});
	}else{
		res.redirect('/');
	}
}); */

/* GET adv Details */
router.get('/adv/:type', function(req, res) {
	if(sess){
		var type = req.params.type;
		if(type == 'view'){
			Restaurants.once("value", function(snapshot) {
				if (snapshot.val() === null) {
					res.render('advertisement', { title: 'Vanbr Rides',msg:"data not found",uid:sess.uid,email:sess.email });
				}else{
					res.render('advertisement', { title: 'Vanbr Driver',msg:"adv",data:snapshot.val(),uid:sess.uid,email:sess.email });
				}
			});
		}else if(type == 'add'){
			res.render('addAdv',{title: 'Advertisement',msg:"Add adv",uid:sess.uid,email:sess.email });
		}
	}else{
		res.redirect('/');
	}
});

/* router.post('/upload', function(req, res) {
	var file = req.files.myfile;
	file.mv('public/images/resturents/'+req.files.myfile.name, function(err) {
		if (err){
			console.log(err);
		}else{
			var url = "http://192.169.236.161:3000/images/resturents/"+req.files.myfile.name;
			console.log(url);
		}
	});
}); */

router.post('/addAdv', function(req, res) {
	if(sess){
		var file = req.files.myfile;
		
		
		var name = req.body.name;
		var description = req.body.description;
		var website = req.body.website;
		var userfile = req.body.userfile;
		var locate = req.body.locate;
		var lat = req.body.lat;
		var lng = req.body.lng;
		file.mv('public/images/resturents/'+req.files.myfile.name, function(err) {
			if (err){
				console.log(err);
			}else{
				var url = "http://192.169.236.161:3000/images/resturents/"+req.files.myfile.name;
				var usersRef = Restaurants.push();
					var usersRef1 = usersRef.set({
						description:description,
						name:name,
						image:url,
						l:{
							0:lat,
							1:lng
						},
						location:locate,
						website:website,
					});
					if(usersRef1){
						res.redirect('/adv/view');
					}else{
						res.redirect('/');
					}
			}
		});
		
	}else{
		res.redirect('/');
	}
});
/* GET adv Details */
router.get('/updateAdv/:id/:type', function(req, res) {
	if(sess){
		var id = req.params.id; 
		var type = req.params.type; 
		if(type == 1){			//edit
			
		}else if(type == 2){	//delete
			var removed =  Restaurants.child(id).remove();
			if(removed){
				res.redirect('/adv/view');
			}
		}
		//console.log(type);
	}else{
		res.redirect('/');
	}
});

router.get('/Documents', function(req, res) {
	if(sess){
		var id = req.query.id;
		
		var licenceStatus = req.query.licenceStatus;
		var insuranceStatus = req.query.insuranceStatus;
		var vehregistrationStatus = req.query.vehregistrationStatus;
		
		var Licence = Documents.child('Licence').child(id);
		var VehicleInsurance = Documents.child('VehicleInsurance').child(id);
		var VehicleRegistration = Documents.child('VehicleRegistration').child(id);
		
		Licence.once("value", function(licence) {
			if(licence.val() != null){
				VehicleInsurance.once("value", function(insurance) {
					if(insurance.val()!= null){
						VehicleRegistration.once("value", function(registration) {
							if(registration.val()!= null){
								res.render('documents', {
													title: 'Documents',
													msg:"Documents",
													licence:licence.val(),
													licenceStatus:licenceStatus,
													insurance:insurance.val(),
													insuranceStatus:insuranceStatus,
													registration:registration.val(),
													vehregistrationStatus:vehregistrationStatus,
													uid:sess.uid,
													email:sess.email,
													id:id 
								});
							}else{
								res.render('documents', {title: 'Documents',msg:"not",uid:sess.uid,email:sess.email,id:id });
							}
						});
					}else{
						res.render('documents', {title: 'Documents',msg:"not",uid:sess.uid,email:sess.email,id:id });
					}
				});
			}else{
				res.render('documents', {title: 'Documents',msg:"not",uid:sess.uid,email:sess.email,id:id });
			}
		});	
	}else{
		res.redirect('/');
	}
});

/* update driver documentation status */
router.get('/UpdateStatus', function(req, res) {
	if(sess){
		var id = req.query.id;
		var type = req.query.type;
		var licenceStatus = req.query.licenceStatus;
		var insuranceStatus = req.query.insuranceStatus;
		var vehregistrationStatus = req.query.vehregistrationStatus;
		if(type == "licence"){
			TableUser.child(id).update({
				licenceStatus:licenceStatus
			});
			res.redirect('/Documents?id='+ id + '&licenceStatus='+ licenceStatus + '&insuranceStatus='+ insuranceStatus+ '&vehregistrationStatus='+ vehregistrationStatus);
		}else if(type == "insurance"){
			TableUser.child(id).update({
				insuranceStatus:insuranceStatus
			});
			res.redirect('/Documents?id='+ id + '&licenceStatus='+ licenceStatus + '&insuranceStatus='+ insuranceStatus+ '&vehregistrationStatus='+ vehregistrationStatus);
		}else if(type == "registration"){
			TableUser.child(id).update({
				vehregistrationStatus:vehregistrationStatus
			});
			res.redirect('/Documents?id='+ id + '&licenceStatus='+ licenceStatus + '&insuranceStatus='+ insuranceStatus+ '&vehregistrationStatus='+ vehregistrationStatus);
		}
	}else{
		res.redirect('/');
	}
});

/* view single view ride */
router.get('/viewRide/:id', function(req, res) {
	if(sess){
		var id = req.params.id;
		if(id != "" || id != undefined){
			BookRide.child(id).once("value", function(snapshot) {
				var start = moment(snapshot.val().booking_time);
				//start.tz('America/New_York').format('ha z');
				start.tz('America/New_York').format();
				//var start = new Date();
				console.log();
					 var a = {
						booking_time:start,
						ride_state:snapshot.val().ride_state,
						vehicle_type:snapshot.val().vehicle_type,
						finalFare:snapshot.val().finalFare,
						points:snapshot.val().points,
						tax:snapshot.val().tax,
						totalFare:snapshot.val().totalFare,
						totalcost:snapshot.val().totalcost,
						travellingCost:snapshot.val().fareEarned,
						vanbrFee:snapshot.val().vanbrAccount,
						tip:snapshot.val().tip,
					}; /**/
					//console.log(a);
				res.render('viewRide', { title: 'View Ride',msg:"ride",data:a,uid:sess.uid,email:sess.email }); 
			}); 
		}else{
			console.log("data");
		}
	}else{
		res.redirect('/');
	}
});

/* view driver earnings */
router.get('/viewEarnings/:driverid', function(req, res) {
	if(sess){
		var driverid = req.params.driverid;
		BookRide.orderByChild("driver_id").equalTo(driverid).once('value', function(snapshot) {
			day = [];week = [];month = [];year = [];to=[];mo=[];we=[];yr=[];
			snapshot.forEach(function (snapshot) {
				if(snapshot.val().ride_state == 5){
					var today = new Date();
					today.setHours(0,0,0,0);
					
					var currentdatelessweek = new Date();
					currentdatelessweek.setDate(currentdatelessweek.getDate() - 7); 
					
					var currentdatelessmonth = new Date();
					currentdatelessmonth.setMonth(currentdatelessmonth.getMonth() - 1);
					
					
					var currentdatelessyear = new Date();
					currentdatelessyear.setYear(currentdatelessyear.getFullYear() - 1);
					
					var bookingdate = new Date(snapshot.val().booking_time);
					
					if(bookingdate.getTime() > today.getTime()){
						day.push(snapshot.val().totalFare);
						to.push(snapshot.val());
					}
					
					if(bookingdate.getTime() > currentdatelessweek.getTime()){
						week.push(snapshot.val().totalFare);
						we.push(snapshot.val());
					} 
					
					if(bookingdate.getTime() > currentdatelessmonth.getTime()){
						month.push(snapshot.val().totalFare);
						mo.push(snapshot.val());
					}
					
					if(bookingdate.getTime() > currentdatelessyear.getTime()){
						year.push(snapshot.val().totalFare);
						yr.push(snapshot.val());
					}
				}
			});
				res.render('viewEarning',{
					title: 'Driver Earnings',
					uid:sess.uid,
					email:sess.email,
					role:sess.role,
					earningsperday :Math.sum(day),
					earningspermonth :Math.sum(month),
					earningperweek :Math.sum(week),
					earningperyear:Math.sum(year),
					today :to,
					week:we,
					month:mo,
					year:yr,
					driverid:driverid
				});
		});
	}else{
		res.redirect('/');
	}
});


router.get('/earningRides/:driverid', function(req, res) {
	/* var a; */
	if(sess){
		var driverid = req.params.driverid;
		var type = req.query.type;
		BookRide.orderByChild("driver_id").equalTo(driverid).once('value', function(snapshot) {
		to=[];
			snapshot.forEach(function (snapshot) {
				if(snapshot.val().ride_state == 5){
					
					var today = new Date();
					today.setHours(0,0,0,0);
					var bookingdate = new Date(snapshot.val().booking_time);
					
					if(type == "today"){
						if(bookingdate.getTime() > today.getTime()){
							var source_lat= parseFloat(snapshot.val().source_lat);
							var source_long= parseFloat(snapshot.val().source_long);
							var destination_lat1= parseFloat(snapshot.val().destination_lat);
							var destination_long1= parseFloat(snapshot.val().destination_long);
							var origin = source_lat + ","+ source_long;
							var destination = destination_lat1 + ","+ destination_long1;
							distance.get({index: 1,origin: origin,destination: destination},function(err, data) {
								var a = {
									totalFare:snapshot.val().totalFare,
									source:data.origin	
								};
								
								/* console.log(snapshot.val());
								console.log(data.origin);
								console.log(data.destination); */
								to.push(a);
								/*to.push({
									source:data.origin		
								}); */
								//console.log(data);console.log('3');
							});
							console.log(to);console.log('2');
						}
					}else if(type == "week"){
						console.log("week");
					}
				}
			});
			/* console.log(to);console.log('0'); */
			/* res.render('r', {
						title: 'Vanbr Rides',
						msg:"user",
						data:to,
						uid:sess.uid,
						email:sess.email 
			}); */
		});
	}else{
		res.redirect('/');
	}
});

router.get('/riders', function(req, res) {
	if(sess){
		var page1 = req.query.page;
		var search = req.query.search;
		
		if(search!= undefined){
			var str = search.trim();
			TableUser.orderByChild("first_name").startAt(str).endAt(str +"\uf8ff").once("value", function(snapshot) {
				if (snapshot.val() === null) {
					TableUser.orderByChild("email").startAt(str).endAt(str +"\uf8ff").once("value", function(snapshot) {
						if (snapshot.val() === null) {
							res.render('searchDetails', { title: 'Vanbr Driver',msg:"No Match Found",uid:sess.uid,email:sess.email });
						}else{
							res.render('searchDetails', { title: 'Rider Search',msg:"Rider search",data:snapshot.val(),uid:sess.uid,email:sess.email,page:page1 });
						}
					});
				}else{
					res.render('searchDetails', { title: 'Rider Search',msg:"Rider search",data:snapshot.val(),uid:sess.uid,email:sess.email,page:page1 });
				}
			});
		}else{
			TableUser.orderByChild("role_id").equalTo('2').once("value", function(snapshot) {
				if (snapshot.val() === null) {
					res.render('ridersDetails', { title: 'Vanbr Rider',msg:"data not found",uid:sess.uid,email:sess.email });
				}else{
					res.render('ridersDetails', { title: 'Vanbr Rider',msg:"Rider",data:snapshot.val(),uid:sess.uid,email:sess.email,page:page1 });
				}
			});
		}
	}else{
		res.redirect('/');
	}
});

router.get('/driver', function(req, res) {
	if(sess){
		var page1 = req.query.page;
		var search = req.query.search;
		if(search!= undefined){
		var str = search.trim();
			TableUser.orderByChild("first_name").startAt(str).endAt(str +"\uf8ff").once("value", function(snapshot) {
				if (snapshot.val() === null) {
					TableUser.orderByChild("email").startAt(str).endAt(str +"\uf8ff").once("value", function(snapshot) {
						if (snapshot.val() === null) {
							res.render('searchDetails', { title: 'Vanbr Driver',msg:"No Match Found",uid:sess.uid,email:sess.email });
						}else{
							res.render('searchDetails', { title: 'Driver Search',msg:"Driver search",data:snapshot.val(),uid:sess.uid,email:sess.email,page:page1 });
						}
					});
				}else{
					res.render('searchDetails', { title: 'Driver Search',msg:"Driver search",data:snapshot.val(),uid:sess.uid,email:sess.email,page:page1 });
				}
			});
		}else{
			TableUser.orderByChild("role_id").equalTo('3').once("value", function(snapshot) {
				if (snapshot.val() === null) {
					res.render('ridersDetails', { title: 'Vanbr Driver',msg:"data not found",uid:sess.uid,email:sess.email });
				}else{
					res.render('ridersDetails', { title: 'Vanbr Driver',msg:"Driver",data:snapshot.val(),uid:sess.uid,email:sess.email,page:page1 });
				}
			});
		}
	}else{
		res.redirect('/');
	}
});

router.get('/ride', function(req, res) {
	if(sess){
		var page1 = req.query.page;
			BookRide.once("value", function(snapshot) {
				if (snapshot.val() === null) {
					res.render('ridersDetails', { title: 'Vanbr Rides',msg:"data not found",uid:sess.uid,email:sess.email });
				}else{
					res.render('ridersDetails', { title: 'Vanbr Rides',msg:"ride",data:snapshot.val(),uid:sess.uid,email:sess.email,page:page1});
				}
			});
	}else{
		res.redirect('/');
	}
});
router.get('/searchRide', function(req, res) {
	if(sess){
		var page1 = req.query.page;
		var to = decodeURIComponent(req.query.to);
		console.log(req.query.to);
		var from = decodeURIComponent(req.query.from);
		console.log(to);
		console.log(from);
		var end = new Date(to);	//end
		var start = new Date(from);	//start
		
		BookRide.orderByChild("booking_time").startAt(start.toJSON()).endAt(end.toJSON()).once("value", function(snapshot) {
				if (snapshot.val() === null) {
					res.render('ridersDetails', { title: 'Vanbr Rides',msg:"data not found",uid:sess.uid,email:sess.email,page:page1});
				}else{
					res.render('rideDetails', { title: 'Vanbr Rides',msg:"ride",data:snapshot.val(),uid:sess.uid,email:sess.email,page:page1,to:to,from:from});
				}
			});
		

	}else{
		res.redirect('/');
	}
});
/* GET logout. */
router.post('/logout', function(req, res) {
	firebase.auth().signOut().then(function() {
		delete sess.uid;
		delete sess.email;
		delete sess.role_id;
		res.json({'status':'1','msg':"loggedout"})
		//res.redirect('/');
	}).catch(function(error) {
		console.log(error);
	});
});

module.exports = router;