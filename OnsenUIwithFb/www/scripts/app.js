﻿//Main
var myNavigator = document.getElementById('mainNavigator');
document.addEventListener('init', function (event) {

    firebase.database().goOnline();

    
    var page = event.target;
    if (page.id === 'sp') {
        const promise = firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                if (user.emailVerified) {
                    //DO NOTHING 
                }
                else { ons.notification.alert('Verify your Account to get full access.The verification email is sent to your email address'); }
                document.querySelector('#mainNavigator').pushPage('home.html');
              

            }
            else {

                document.querySelector('#mainNavigator').pushPage('login.html');

            }

        });


    }

    if (page.id === 'login') {
        //If Already Logged in
        myNavigator.onDeviceBackButton.disable();
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
        page.querySelector('#fpassBtn').onclick = function () {
            document.querySelector('#mainNavigator').pushPage('fpass.html');
        };

    }
    else if (page.id === 'signup') {
        myNavigator.onDeviceBackButton.enable();
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
                        ons.notification.alert('Account created !');

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
    else if (page.id === 'fpass') {
        page.querySelector('#sendfpassBtn').onclick = function () {
            var fpassEmail = page.querySelector('#fpassEmail').value;
            var auth = firebase.auth();
            auth.sendPasswordResetEmail(fpassEmail).then(function () {
                ons.notification.alert("Email sent.Reset your password via the link provided");
            }, function (error) {
                ons.notification.alert("No such email found.");
            });
        }

    }
    else if (page.id === 'home') {
        myNavigator.onDeviceBackButton.disable();


        //Check Email verification

        var mainwall = page.querySelector('#mainwall');
        //Feed Engine
        function mainwallEngine() {

            var userId = firebase.auth().currentUser;

            //Check Email verification
            var uploadBtn = document.getElementById('fileToUpload');
            if (userId.emailVerified) {
                uploadBtn.setAttribute('disabled', '');
                uploadBtn.removeAttribute('disabled');
                console.log('Email is verified');

            }
            else {
                uploadBtn.setAttribute('disabled', '');
                console.log('Email is not verified at upload');

            }





            firebase.database().ref("wallpaperDB/").orderByChild('likes').on("child_added", function (data) {
                firebase.storage().ref('wid/' + data.key + '.jpeg').getDownloadURL().then(function (url) {
                    firebase.database().ref('/userDB/' + userId.uid + '/wallpaperLiked/' + data.key).once('value').then(function (snapshot) {
                        console.log("id of the poster before filler" + data.val().uname);
                        if (snapshot.val() === true) {
                            //Not printing liked contents
                        }
                        else {
     
                                mainwall.appendChild(ons._util.createElement('<ons-if platform="android"><ons-list-item style="background-color:#009688;" modifier="longdivider">' +
                                '<div class="left"><img class="list__item__thumbnail" src="http://placekitten.com/g/40/40"></div>' +
                                '<div class="center"><span class="list__item__title"style="color:white;" ><b>' + data.val().uname + '</b></span><span class="list__item__subtitle" style="color:white;">Followers </span>' +
                                '</div><div class="right" style="color:white;"> <ons-icon icon="md-thumb-up" /><b id="' + data.key + 'Likes">0</b></div> </ons-list-item></ons-if>'));

                                mainwall.appendChild(ons._util.createElement('<ons-if platform="ios other"><ons-list-item modifier="longdivider">' +
                                '<div class="left"><img class="list__item__thumbnail" src="http://placekitten.com/g/40/40"></div>' +
                                '<div class="center"><span class="list__item__title"><b>' + data.val().uname + '</b></span><span class="list__item__subtitle">Followers </span>' +
                                '</div><div class="right" > <ons-icon icon="md-thumb-up" /><b id="' + data.key + 'Likes"> 0 </b></div> </ons-list-item></ons-if>'));
                                mainwall.appendChild(ons._util.createElement('<ons-list-item tappable ripple style="padding:0px 0px 0px 6px;">'+
                                '<img style="max-width:100%;" src="' + url + '" alt="Loading....." />' +
                                '<ons-button modifier="large" style="-webkit-border-radius: 0px;-webkit-box-shadow: 0 0px 0px 0 ;width:20%;" id="' + data.key + 'OnLike"><ons-icon icon="md-thumb-up" /></ons-button>' +
                                '<ons-button modifier="large" style="-webkit-border-radius: 0px;-webkit-box-shadow: 0 0px 0px 0 ;width:65%;" id="' + data.key + 'OnDownload"><ons-icon icon="md-download" /></ons-button>' +
                                '<ons-button modifier="large" style="-webkit-border-radius: 0px;-webkit-box-shadow: 0 0px 0px 0 ;width:15%;" id="' + data.key + 'OnReport"><ons-icon icon="fa-flag" /></ons-button></ons-list-item>'));






                           // mainwall.appendChild(ons._util.createElement('<ons-list-item tappable><div class="left"><img class="list__item__thumbnail" src="http://placekitten.com/g/40/40" ></div> <div class="center"><span class="list__item__title"><b>' + data.val().uname + '</b></span><span class="list__item__subtitle">Followers:</span></div><div class="right"><ons-icon icon="md-thumb-up"><b> Likes : <b id="' + data.key + 'Likes">0</b></b></div> </ons-list-item>'));
                           // mainwall.appendChild(ons._util.createElement('<ons-list-item tappable ripple style="padding:0px 0px 0px 6px"><img style="max-width:100%;" src="' + url + '" alt="Loading....."/><ons-button modifier="large" id="' + data.key + 'OnLike">Like &<a style="text-decoration: none;color:inherit;" href="' + url + '" download="' + data.key + '" >  Download </a></ons-button></ons-list-item>'));
                            page.querySelector('#' + data.key + 'Likes').innerHTML = " "+ data.val().likes;
                            if (userId.emailVerified) {
                                console.log('Email is verified');
                            }
                            else {
                                page.querySelector('#' + data.key + 'OnLike').setAttribute("disabled", "true");
                                page.querySelector('#' + data.key + 'OnDownload').setAttribute("disabled", "true");
                                page.querySelector('#' + data.key + 'OnReport').setAttribute("disabled", "true");
                                console.log('Email is not verified');

                            }
                            // onLike Click
                            page.querySelector('#' + data.key + 'OnLike').onclick = function () {

                                firebase.database().ref('/userDB/' + userId.uid + '/wallpaperLiked/' + data.key).set(true);
                                firebase.database().ref('wallpaperDB/' + data.key).child('likes').set(data.val().likes + 1);
                                console.log('Liked');
                            };
                                page.querySelector('#' + data.key + 'OnDownload').onclick = function () {
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
                                page.querySelector('#' + data.key + 'OnLike').setAttribute("disabled", "true");
                                var fileTransfer = new FileTransfer();

                                var fileURL = "///storage/emulated/0/MyWallpapers/wall" + data.key + ".jpeg";

                                fileTransfer.download(
                                   url, fileURL, function (entry) {

                                       ons.notification.alert("Download completed");
                                   },

                                   function (error) {

                                       ons.notification.alert("Download error source :" + error.source);
                                       ons.notification.alert("Download error target :" + error.target);
                                       ons.notification.alert("Download error code :" + error.code);
                                   },

                                   false, {
                                       headers: {
                                           "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                       }
                                   }
                                );


         

                            };


                        }


                    }).catch(function (error) {
                        console.log("Fetch Validating Error:" + error);
                    });




                }).catch(function (error) { console.log("Stroage Fetching error :" + error); });

            });
            // update likes at 5 sec interval
            function likesUpdate() {
                firebase.database().ref("wallpaperDB/").orderByChild('likes').on("child_added", function (data) {

                    if (page.querySelector('#' + data.key + 'Likes')) {
                        //console.log("Updating Likes .....");
                        page.querySelector('#' + data.key + 'Likes').innerHTML = " "+data.val().likes;
                    }

                });
            }
            var likeInterval = setInterval(likesUpdate, 5000);
        }
        //Feed Engine End

        //Init Engine
        mainwallEngine();
        //Pull to refresh
        var pullhookmainwall = page.querySelector('#pull-hook-mainwall');
        pullhookmainwall.addEventListener('changestate', function (event) {
            var message = '';

            switch (event.state) {
                case 'initial':
                    message = 'Pull to refresh';
                    break;
                case 'preaction':
                    message = 'Release';
                    break;
                case 'action':
                    message = 'Loading...';
                    mainwall.innerHTML = "";
                    
                    break;
            }

            pullhookmainwall.innerHTML = message;
        });
        pullhookmainwall.onAction = function (done) {
            setTimeout(done, 1000);
            mainwallEngine();
        };
        //Pull to refresh End

        //MyAccount
        page.querySelector('#myAccBtn').onclick = function () {

            document.querySelector('#mainNavigator').pushPage('myAcc.html');
        };


        //Poster's Profile
        // page.querySelector('#profileBtn').onclick = function () {
        //     document.querySelector('#mainNavigator').pushPage('profile.html');

        //  };

        //Uploading Wallpaper
        page.querySelector('#fileToUpload').onchange = function () {

            document.getElementById('uploadingDialog').show();

            var fileTBU = page.querySelector('#fileToUpload').files[0];
            if (fileTBU) {
                var img = new Image();
                img.src = window.URL.createObjectURL(fileTBU);
                img.onload = function () {
                    if (img.width === 1080 && img.height === 1920) {
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
                            //get current user
                            var userId = firebase.auth().currentUser;
                            //set wallpaper on db    
                            firebase.database().ref('wallpaperDB/' + newPostKey + '/').set({ uname: userId.displayName, uid: userId.uid, likes: 1 });
                            //set wallpaper on userdb
                            firebase.database().ref('userDB/' + userId.uid + '/uploads/' + newPostKey).set(true);
                            firebase.database().ref('userDB/' + userId.uid + '/wallpaperLiked/' + newPostKey).set(true);

                            document.getElementById('uploadingDialog').hide();
                            ons.notification.alert("Uploaded Successfully");
                        });
                    }
                    else {
                        ons.notification.alert("You can't upload Low Quality Wallpapers ! Wallpaper must have Heigh 1920 and Width 1080");
                        document.getElementById('uploadingDialog').hide();
                    }
                }

            }
            else {
                ons.notification.alert("Oh No an error ! Try again");
                document.getElementById('uploadingDialog').hide();
            }

            //Uploading Wallpaper End
        };



    }
    else if (page.id === 'myAcc') {
        myNavigator.onDeviceBackButton.enable();
        var user = firebase.auth().currentUser;
        var username = user.displayName;
        page.querySelector('#my-username').innerHTML = username;

        page.querySelector('#myUpdBtn').onclick = function () {
            document.querySelector('#mainNavigator').pushPage('myUpd.html');

        };


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
    else if (page.id === 'myUpd') {

        myNavigator.onDeviceBackButton.enable();

        var uwall = page.querySelector('#myUpdWall');
        // Feed Engine
        function uwallEngine() {

            var userId = firebase.auth().currentUser;
            firebase.database().ref("wallpaperDB/").orderByChild('likes').on("child_added", function (data) {
                firebase.storage().ref('wid/' + data.key + '.jpeg').getDownloadURL().then(function (url) {
                    firebase.database().ref('/userDB/' + userId.uid + '/wallpaperLiked/' + data.key).once('value').then(function (snapshot) {
                        if (snapshot.val() == true) {

                            uwall.appendChild(ons._util.createElement('<ons-if platform="android"><ons-list-item style="background-color:#009688;" modifier="longdivider">' +
                              '<div class="left"><img class="list__item__thumbnail" src="http://placekitten.com/g/40/40"></div>' +
                              '<div class="center"><span class="list__item__title"style="color:white;" ><b>' + data.val().uname + '</b></span><span class="list__item__subtitle" style="color:white;">Followers </span>' +
                              '</div><div class="right" style="color:white;"> <ons-icon icon="md-thumb-up" /><b id="' + data.key + 'Likes">0</b></div> </ons-list-item></ons-if>'));

                            uwall.appendChild(ons._util.createElement('<ons-if platform="ios other"><ons-list-item modifier="longdivider">' +
                            '<div class="left"><img class="list__item__thumbnail" src="http://placekitten.com/g/40/40"></div>' +
                            '<div class="center"><span class="list__item__title"><b>' + data.val().uname + '</b></span><span class="list__item__subtitle">Followers </span>' +
                            '</div><div class="right" > <ons-icon icon="md-thumb-up" /><b id="' + data.key + 'Likes"> 0 </b></div> </ons-list-item></ons-if>'));
                            uwall.appendChild(ons._util.createElement('<ons-list-item tappable ripple style="padding:0px 0px 0px 6px;">' +
                            '<img style="max-width:100%;" src="' + url + '" alt="Loading....." />' +       
                            '<ons-button modifier="large" style="-webkit-border-radius: 0px;-webkit-box-shadow: 0 0px 0px 0 ;width:100%;" id="' + data.key + 'OnDwnUser"><ons-icon icon="md-download" /></ons-button>'));
                            page.querySelector('#' + data.key + 'Likes').innerHTML = " "+data.val().likes;
                        }
                        else {
                            //Ignore Likes

                        }
                        page.querySelector('#' + data.key + 'OnDwnUser').onclick = function () {
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
                            var fileTransfer = new FileTransfer();

                            var fileURL = "///storage/emulated/0/MyWallpapers/wall" + data.key + ".jpeg";

                            fileTransfer.download(
                               url, fileURL, function (entry) {

                                   ons.notification.alert("Download completed");
                               },

                               function (error) {

                                   ons.notification.alert("Download error source :" + error.source);
                                   ons.notification.alert("Download error target :" + error.target);
                                   ons.notification.alert("Download error code :" + error.code);
                               },

                               false, {
                                   headers: {
                                       "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                   }
                               }
                            );

                        }




                    }).catch(function (error) {
                        console.log("Fetch Validating Error:" + error);
                    });




                }).catch(function (error) { console.log("Stroage Fetching error :" + error); });

            });
        }


        //Init upload wallpaper
        uwallEngine();
        //Pull to refresh upload wallpaper
        var pullhookuwall = page.querySelector('#pull-hook-uwall');
        pullhookuwall.addEventListener('changestate', function (event) {
            var message = '';

            switch (event.state) {
                case 'initial':
                    message = 'Pull to refresh';
                    break;
                case 'preaction':
                    message = 'Release';
                    break;
                case 'action':
                    message = 'Loading...';
                    uwall.innerHTML = "";
                    uwallEngine();
                    break;
            }

            pullhookuwall.innerHTML = message;
        });
        pullhookuwall.onAction = function (done) {
            setTimeout(done, 1000);
        };
        //Pull to refresh upload wallpaper End

    }


});
//Main End