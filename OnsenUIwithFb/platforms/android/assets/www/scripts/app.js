//Main

document.addEventListener('init', function (event) {

    firebase.database().goOnline();
    //wallpaperKey
    var wKey;

    function setwKey(keyData)
    {
        wKey = keyData;
    }
    var paperCountRef = firebase.database().ref().child('wKey');
    paperCountRef.on('value', snap => setwKey(snap.val()));
    //wallpaperURL funs
    var wallURL;
    function setWallpaperURL(urlData) {
        wallURL = urlData;
        console.log(wallURL);
    }

    function getWallpaper(wid) {
        firebase.storage().ref('wid/' + wid + '.jpeg').getDownloadURL().then(function (url) { setWallpaperURL(url); console.log }).catch(function (error) { console.log("error in wid " + wid) });
    }

    //current wallpaper count
    

    var page = event.target;
    if (page.id === 'sp') {
        const promise = firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
               
                    document.querySelector('#mainNavigator').pushPage('home.html');
                    console.log(wKey);
      
                }
                else {
                    console.log(wKey);
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
            //Signup Auth
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
                        //create userDB 
                        var userId = firebase.auth().currentUser.uid;
                        firebase.database().ref('userDB/' + userId).set({ followedBy: { uid: true }, followedByInt: 0, following: { uid: true }, followedByInt: 0, uploads: { wid: true }, wallpaperLiked: { wid: true } });
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
    else if (page.id == 'home') {
        console.log("HOME");
        console.log(wKey);
        //Feed
        firebase.storage().ref('wid/0.jpeg').getDownloadURL().then(function (url) { document.getElementById('wp' + '0').setAttribute('src', url); }).catch(function (error) { console.log("error in wid " +error); });
 
        console.log(wallURL);
            carousel.addEventListener('postchange', function (event) {
                var carousel = document.getElementById('carousel');
                console.log(event.activeIndex);

               
               
                if (event.activeIndex === 3) {
                    console.log("going in");
                    carousel.first({ timing: 'ease-in' });

                }
            });

        //Feed End
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
        page.querySelector('#downloadBtn').onclick = function ()
        {

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
        page.querySelector('#profileBtn').onclick = function ()
        {
            document.querySelector('#mainNavigator').pushPage('profile.html');

        };

            //Uploading Wallpaper
        page.querySelector('#fileToUpload').onchange = function ()
        {
           
            document.getElementById('uploadingDialog').show();           
            var fileTBU = document.getElementById('fileToUpload').files[0];
            console.log(wKey);
            if (fileTBU) {
                        var progressBar = document.getElementById('progessBar');
                        console.log(wKey);
                        var stroageRef = firebase.storage().ref('wid/' + wKey +'.jpeg');
                        var task = stroageRef.put(fileTBU);
                        task.on('state_changed', function (snapshot) {
                            var per = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            progessBar.value = per;
                        }, function (error) {
                            document.getElementById('uploadingDialog').hide();
                            ons.notification.alert("An error has occurred!" + error);
                        }, function () {
                            document.getElementById('uploadingDialog').hide();
                            //+1 wKey
                            var upd = wKey+ 1;
                            console.log(upd);
                            //set the updated key
                            firebase.database().ref().child('wKey').set(upd);
                            //get current user
                            var userId = firebase.auth().currentUser.uid;
                            //set wallpaper on db
                            firebase.database().ref('wallpaperDB/' + wKey).set({ likes: 0, uid: userId });
                            //set wallpaper on userdb
                            firebase.database().ref('userDB/' + userId + '/uploads/'+wKey).set(true);
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

});
//Main End