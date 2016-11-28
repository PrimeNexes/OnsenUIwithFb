//Main

document.addEventListener('init', function (event) {
    var page = event.target;
    if (page.id === 'sp') {
        const promise = firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                document.querySelector('#mainNavigator').pushPage('home.html');
            }
            else {
                document.querySelector('#mainNavigator').pushPage('login.html');
            }
        });

    }

    if (page.id === 'login') {
        //If Already Logged in

        //If Already Logged in End
        page.querySelector('#loginBtn').onclick = function () {
            //Login Auth
            var loginUser = document.getElementById("loginUser").value;
            var loginPass = document.getElementById("loginPass").value;
            console.log(loginPass + loginUser);
            const lauth = firebase.auth();
            const promise = lauth.signInWithEmailAndPassword(loginUser, loginPass)
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode === 'auth/wrong-password') {
                    ons.notification.alert('Wrong password.');
                }
                else if (errorCode === 'auth/email-already-in-use') {
                    ons.notification.alert('User is already Loged in');
                }
                else {
                    ons.notification.alert(error);
                }
                console.log(error);

            });

            promise.then(function () {
                var user = firebase.auth().currentUser;
                if (user) { document.querySelector('#mainNavigator').pushPage('home.html'); }
            });

            //Login Auth End
        };

        page.querySelector('#signupBtn').onclick = function () {
            document.querySelector('#mainNavigator').pushPage('signup.html');
        };

    }
    else if (page.id === 'signup') {
        page.querySelector('#makeaccBtn').onclick = function () {
            //Signin Auth
            var signinUser = document.getElementById('signinUser').value;
            var signinPass = document.getElementById('signinPass').value;
            console.log(signinPass + signinUser);
            const sauth = firebase.auth();
            sauth.createUserWithEmailAndPassword(signinUser, signinPass)
                .then(function () {
                    //Set Display name of user                   
                    var user = firebase.auth().currentUser;
                    var str = user.email;
                    var i = str.indexOf("@");
                    var n = str.substr(0, i);
                    user.updateProfile(
                        {
                            displayName: n
                        }
                            );
                    console.log("User Created with displayName " + n);
                    //Set Display name of user End
                    user.sendEmailVerification().then(function () {
                        ons.notification.alert('Account Created ! Please Verify your Email by typing the Verification code in your Profile');
                    }, function (error) {
                        ons.notification.alert(error);
                    });
                })
                .catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode == 'auth/weak-password') {
                        ons.notification.alert('The password is too weak.');
                    }
                    else {
                        ons.notification.alert(error);
                    }

                    console.log(errorMessage);

                });
            //Signin Auth End         
        };
    }
    else if (page.id == 'home') {
        console.log("HOME");
        //MyAccount
        page.querySelector('#myAccBtn').onclick = function () {

            document.querySelector('#mainNavigator').pushPage('myAcc.html');
        };

        //Like
        page.querySelector('#likeBtn').onclick = function () {
            if (document.getElementById("likeIcon").getAttribute("icon") == "md-star") {
                document.getElementById("likeIcon").setAttribute("icon", "md-star-outline");
            }
            else {
                document.getElementById("likeIcon").setAttribute("icon", "md-star");
            }
        };

        //Download
        page.querySelector('#downloadBtn').onclick = function () {

            var dialog = document.getElementById('downloadingid');

            if (dialog) {
                dialog.show();
                dialog.hide();
            }
            else {
                ons.createDialog('downloading.html')
                  .then(function (dialog) {
                      dialog.show();
                      dialog.hide();
                  });
            }
        };

        //Poster's Profile
        page.querySelector('#profileBtn').onclick = function () {
            document.querySelector('#mainNavigator').pushPage('profile.html');

        };

        //Upload Wallpaper
        page.querySelector('#uwallBtn').onclick = function () {
            document.querySelector('#mainNavigator').pushPage('uwall.html');
        };


    }
    else if (page.id == 'myAcc') {
        var user = firebase.auth().currentUser;
        var username = user.displayName;
        document.getElementById('my-username').innerText = username;
        console.log(user.displayName);
        page.querySelector('#logoutBtn').onclick = function () {
            //Logout
            firebase.auth().signOut().then(function () {
                ons.notification.alert("Logout Successful");
                document.querySelector('#mainNavigator').pushPage('login.html');
            }, function (error) {
                ons.notification.alert("Error ! Try again");
            });
            //Logout End
        };
    }
    else if (page.id == 'uwall') {

        page.querySelector('#cameraTakePicture').onclick = function () {
            //Uploading

            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            });

            function onSuccess(imageURL) {
                var image = document.getElementById('myImage');
                image.src = imageURL;
            }

            function onFail(message) {
                ons.notification.alert('Failed because: ' + message);
            }



            //Uploading End
        };
    }

});
//Main End


