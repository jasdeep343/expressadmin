function formValidation(){
	var isValid;
	$("input").each(function() {
	   var element = $(this);
	   if (element.val() == "") {
			isValid = false;
			element.focus();
		    element.prop('required',true);
			if(element.attr('id') === 'locate')
				document.getElementById("data").innerHTML = "<p style='color:red;'> Select location from map </p>";
			
	   }
	});
	return isValid;
}

function logout(){
	swal({
		title: 'Are your sure you want to logout',
		type: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Logout!',
		cancelButtonText: 'Cancel!',
		confirmButtonClass: 'btn btn-success',
		cancelButtonClass: 'btn btn-danger',
		buttonsStyling: false,
		reverseButtons: true
	}).then((result) => {
		if (result.value) {
			$.post('/logout',function(data){
				console.log(data.status);
				if(data.status == '1'){
					swal('Logged Out!')
					window.location.href = '/';
				}
			});
		}
	})
}