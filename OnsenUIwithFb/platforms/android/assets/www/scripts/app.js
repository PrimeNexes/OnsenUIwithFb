//Main
function feed(urlData, keyData) {
    var feedData,likeData;
    feedData.push(urlData);
    likeData.push(keyData);

}


document.addEventListener('init', function (event) {

    firebase.database().goOnline();

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
            var loginUser = page.querySelector("#loginUser").value;
            var loginPass = page.querySelector("#loginPass").value;           
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

      
            //Login Auth End
        };

        page.querySelector('#signupBtn').onclick = function () {
            document.querySelector('#mainNavigator').pushPage('signup.html');
        };

    }
    else if (page.id === 'signup') {
        page.querySelector('#makeaccBtn').onclick = function () {
            //Signup Auth
            var signinUser = page.querySelector('#signinUser').value;
            var signinPass = page.querySelector('#signinPass').value;
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
                        //create userDB 
                        var userId = firebase.auth().currentUser.uid;
                        firebase.database().ref('userDB/' + userId).set({ followedBy: 0, followedByInt: 0, following: 0, followedByInt: 0, uploads: 0, wallpaperLiked: 0 });
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
            //Signup Auth End         
        };
    }
    else if (page.id === 'home') {

        //Feed 
        var wall = page.querySelector('#wall');
        var postCount = 0;
        var userId = firebase.auth().currentUser.uid;
        firebase.database().ref("wallpaperDB/").orderByChild('likes').on("child_added", function (data) {
            firebase.storage().ref('wid/' + data.key + '.jpeg').getDownloadURL().then(function (url) {

               
                firebase.database().ref('/userDB/' + userId + '/uploads/' + data.key).once('value').then(function (snapshot) {
                    if (snapshot.val() == true) {
                            //Not printing liked contents
                    }
                    else {
                        wall.appendChild(ons._util.createElement('<ons-list-item tappable><div class="left"><img class="list__item__thumbnail" src="http://placekitten.com/g/40/40" ></div> <div class="center"><span class="list__item__title">Cutest kitty</span><span class="list__item__subtitle">        </span></div> </ons-list-item>'));
                        wall.appendChild(ons._util.createElement('<ons-list-item tappable ripple><img style="width: 100%; width: 95vw;object-fit: cover;" src="' + url + '" alt="Loading....."/><ons-button id="' + data.key + '" modifier="large" style="width: 100%; width: 95vw;object-fit: cover;"> Like &  Download</ons-button> </ons-list-item>'));
                    

                        // onLike Click
                        page.querySelector('#' + data.key).onclick = function () {
                            page.querySelector('#' + data.key).setAttribute("disabled", "true");

                        };
                    }

                }).catch(function (error) {
                    console.log("Fetch Validating Error:" + error);
                });
             
      


            }).catch(function (error) { console.log("Stroage Fetching error :" + error); });
        });

        

        //Feed End
        //MyAccount
        page.querySelector('#myAccBtn').onclick = function () {

            document.querySelector('#mainNavigator').pushPage('myAcc.html');
        };

        //Like
        page.querySelector('#likeBtn').onclick = function () {
            if (page.querySelector("#likeIcon").getAttribute("icon") == "md-star") {
                page.querySelector("#likeIcon").setAttribute("icon", "md-star-outline");
            }
            else {
                page.querySelector("#likeIcon").setAttribute("icon", "md-star");
            }
        };

        //Download
        page.querySelector('#downloadBtn').onclick = function () {

            var dialog = page.querySelector('#downloadingid');

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

        //Uploading Wallpaper
        page.querySelector('#fileToUpload').onchange = function () {

           document.getElementById('uploadingDialog').show();
            var fileTBU = page.querySelector('#fileToUpload').files[0];

            if (fileTBU) {
                var progressBar = page.querySelector('#progessBar');
                var newPostKey = firebase.database().ref().child('wallpaperDB').push().key;
                var stroageRef = firebase.storage().ref('wid/' + newPostKey + '.jpeg');
                var task = stroageRef.put(fileTBU);
                task.on('state_changed', function (snapshot) {
                    var per = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progessBar.value = per;
                }, function (error) {
                    document.getElementById('uploadingDialog').hide();
                    ons.notification.alert("An error has occurred!</br>" + error);
                }, function () {
                    document.getElementById('uploadingDialog').hide();

                    //set the updated key

                    //get current user
                    var userId = firebase.auth().currentUser.uid;
                    //set wallpaper on db    
                    firebase.database().ref('wallpaperDB/' + newPostKey + '/').set({ uid: userId });
                    firebase.database().ref('wallpaperDB/' + newPostKey + '/likes/' + userId).set(true);
                    //set wallpaper on userdb
                    firebase.database().ref('userDB/' + userId + '/uploads/' + newPostKey).set(true);
                    firebase.database().ref('userDB/' + userId + '/wallpaperLiked/' + newPostKey).set(true);
                    ons.notification.alert("Uploaded Successfully");
                });


            }
            else {
                ons.notification.alert("Image can't be small than Heigh 1920 and Width 1080");
                document.getElementById('uploadingDialog').hide();
            }

            //Uploading Wallpaper End
        };



    }
    else if (page.id === 'myAcc') {
        var user = firebase.auth().currentUser;
        var username = user.displayName;
        page.querySelector('#my-username').innerHTML = username;      
        page.querySelector('#logoutBtn').onclick = function () {
            //Logout
            firebase.auth().signOut().then(function () {
                ons.notification.alert("Logout Successful");
                document.querySelector('#mainNavigator').pushPage('login.html');
            }, function (error) {
                ons.notification.alert("Error ! Try again");
            });
        };
        //Logout End
    }
    else if (page.id === 'profile') {
        page.querySelector('#followBtn').onclick = function () {


        };

    }



});
//Main End