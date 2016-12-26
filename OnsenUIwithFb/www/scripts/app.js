//Main
//On Profile Click for Main wall and Upload Wall
var onClickDataVar;
var fromPage;
var onClickData = function (data) {
    onClickDataVar = data;
};
var myNavigator = document.getElementById('mainNavigator');
document.addEventListener('init', function (event)
{   firebase.database().goOnline();
var page = event.target;



var nav = function () {

    page.querySelector('#myLikesBtn').onclick = function () {
        document.querySelector('#mainNavigator').pushPage('myUpd.html');
    };
    page.querySelector('#homeBtn').onclick = function () {
        document.querySelector('#mainNavigator').pushPage('home.html');
    };
    page.querySelector('#catBtn').onclick = function () {
        document.querySelector('#mainNavigator').pushPage('cat.html');
    };
    page.querySelector('#myAccBtn').onclick = function () {

        document.querySelector('#mainNavigator').pushPage('myAcc.html');
    };
    page.querySelector('#tuploadBtn').onclick = function () {

        document.querySelector('#mainNavigator').pushPage('uploading.html');
    };


}


    //

    if (page.id === 'sp')
    {
        const promise = firebase.auth().onAuthStateChanged(function (user)
        {
            if (user)
            {
                if (user.emailVerified)
                {
                    //DO NOTHING 
                }
                else
                { ons.notification.alert('Verify your Account to get full access.The verification email is sent to your email address'); }

                document.querySelector('#mainNavigator').pushPage('home.html');             
            }
            else
            {
                document.querySelector('#mainNavigator').pushPage('login.html');
            }

        });
    }

    if (page.id === 'login')
    {
        //If Already Logged in
        myNavigator.onDeviceBackButton.disable();
        //If Already Logged in End
        page.querySelector('#loginBtn').onclick = function ()
        {
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
        page.querySelector('#signupBtn').onclick = function ()
        {
            document.querySelector('#mainNavigator').pushPage('signup.html');
        };
        page.querySelector('#fpassBtn').onclick = function ()
        {
            document.querySelector('#mainNavigator').pushPage('fpass.html');
        };

    }
    else if (page.id === 'signup')
    {
        myNavigator.onDeviceBackButton.enable();
        page.querySelector('#makeaccBtn').onclick = function ()
        {
            //Signup Auth
            var signinUser = page.querySelector('#signinUser').value;
            var signinPass = page.querySelector('#signinPass').value;
            console.log(signinPass + signinUser);
            const sauth = firebase.auth();
            sauth.createUserWithEmailAndPassword(signinUser, signinPass)
                .then(function ()
                {
                    //Set Display name of user                   
                    var user = firebase.auth().currentUser;
                    var str = user.email;
                    var i = str.indexOf("@");
                    var n = str.substr(0, i);
                    user.updateProfile({ displayName: n });
                    console.log("User Created with displayName " + n);
                    //Set Display name of user End
                    user.sendEmailVerification().then(function () {
                        //create userDB 
                        var userId = firebase.auth().currentUser;
                        firebase.database().ref('userDB/' + userId.uid).set({ followedBy: { followedByInt: 0 }, following: { followingInt: 0 }, uploads: 0, wallpaperLiked: 0 });
                        firebase.storage().ref('profilePicture/icon-user-default.png').getDownloadURL().then(function (url) {
                            userId.updateProfile({ photoURL: url });
                        });
                        ons.notification.alert('Account created !');
                    }, function (error) {
                        ons.notification.alert("Can't send Email for verification ! Re-try sending the mail underprofile page");
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
    else if (page.id === 'fpass')
    {
        page.querySelector('#sendfpassBtn').onclick = function ()
        {
            var fpassEmail = page.querySelector('#fpassEmail').value;
            var auth = firebase.auth();
            auth.sendPasswordResetEmail(fpassEmail).then(function ()
            {
                ons.notification.confirm("Email sent.Reset your password via the link provided");
            },
            function (error)
            {
                ons.notification.confirm("No such email found.");
            });
        }

    }
    else if (page.id === 'home')
    {
        myNavigator.onDeviceBackButton.disable();     
        var mainwall = page.querySelector('#mainwall');

        //Feed Engine
        function mainwallEngine()
        {  
            var userId = firebase.auth().currentUser;

            firebase.database().ref("wallpaperDB/").orderByChild('likes').on("child_added", function (data)
            {
                firebase.storage().ref('wid/' + data.key + '.jpeg').getDownloadURL().then(function (url)
                {
                    firebase.database().ref('/userDB/' + userId.uid + '/wallpaperLiked/' + data.key).once('value').then(function (userWallLoop)
                    {
                        firebase.database().ref('/userDB/' + data.val().uid + '/followedBy/').on('value', function (followersLoop)
                        {
                            if (userWallLoop.val() === true)
                            {
                                //page.querySelector('#pageLoaging').style.display = "none";
                                //mainwall.innerHTML = '<ons-list-item>Looks like you are out of Wallpapers</ons-list-item>';
                                //Not printing liked contents
                            }
                            else {
                                //display wallpaper
                                firebase.storage().ref('profilePicture/' + data.val().uid + '/dp.jpeg').getDownloadURL().then(function (urlDP) {
                                    page.querySelector('#pageLoaging').style.display = "none";
                                    console.log(url);
                                    mainwall.appendChild(ons._util.createElement(
                                    '<div><ons-list-item ripple modifier="nodivider">'
                                    +'<div class="left"><img class="list__item__thumbnail" src="' + urlDP + '" width="40" height="40"></div>'
                                    +'<div class="center" style="padding:0px 0px 0px 0px;">'
                                    +'<span class="list__item__title" ><a class="' + data.val().uid + 'User">' + data.val().uname + '</a></span>'
                                    +'<span class="list__item__subtitle">Followers : ' + followersLoop.val().followedByInt + '</span>'
                                    +'</div></ons-list-item>'
                                    +'<ons-list-item ripple style="padding:0px 0px 0px 0px;" modifier="nodivider">'
                                    +'<div class="center" style="padding:0px 0px 0px 0px;">'
                                    +'<img style="max-width:100%; width:100%;" src="'+url+'" alt="Loading....." /> '
                                    +'<table style="font-size:10px;opacity:0.87;padding-left:10px;">'
                                    + '<tr><td id="' + data.key + 'Likes">'+ data.val().likes+'</td><td>Likes</td><td></td>'
                                    + '<td id="' + data.key + 'Downloads">'+ data.val().downloads+'</td><td>Downloads</td><td></td>'
                                    + '<td id="' + data.key + 'Walls">' + data.val().walls + '</td><td>Walls</td><td></td>'
                                    +'</tr></table></div></ons-list-item>'
                                    +'<ons-list-item style="padding:0px 0px 0px 0px;border-bottom:2px solid #e2e2e2;" modifier="nodivider">'
                                    +'<div class="center" style="padding:0px 0px 0px 0px;">'                                  
                                    +'<ons-button modifier="quiet" id="' + data.key + 'OnLike" style="font-size:10px;height:auto;width:auto;">Like</ons-button>'               
                                    +'<ons-button modifier="quiet" id="' + data.key + 'OnDownload" style="font-size:10px;height:auto;width:auto;"><a style="text-decoration: none;color:inherit;" href="' + url + '" download="' + data.key + '">Download</a></ons-button>'    
                                    +'<ons-button modifier="quiet" id="' + data.key + 'OnWall" style="font-size:10px;height:auto;width:auto;"><a style="text-decoration: none;color:inherit;" href="' + url + '" download="' + data.key + '">Wall</a></ons-button>'
                                    +'</div><div class="right" style="padding:0px 0px 0px 0px;">'
                                    +'<ons-button modifier="quiet" id="' + data.key + 'OnReport" style="font-size:10px;height:auto;width:auto;">Report</ons-button>'
                                    +'</div></ons-list-item></div>'));
    
                                    //Cheack Email Verification
                                    if (userId.emailVerified)
                                    {
                                        console.log('Email is verified at Home Wall');
                                    }
                                    else
                                    {
                                        document.getElementById(data.key + 'OnLike').setAttribute("disabled", "true");
                                        document.getElementById(data.key + 'OnDownload').setAttribute("disabled", "true");
                                        document.getElementById(data.key + 'OnReport').setAttribute("disabled", "true");
                                        document.getElementById(data.key + 'OnWall').setAttribute("disabled", "true");
                                        console.log('Email is not verified at Home Wall');

                                    }
                                
                                    //onProfile Click                         
                                                               
                                    var profileClassId = document.getElementsByClassName(data.val().uid + "User");
                                
                                    for (var i = 0; i < profileClassId.length; i++)
                                    {
                                    
                                        profileClassId[i].onclick = function ()
                                        {
                                            onClickData(data);
                                            document.querySelector('#mainNavigator').pushPage('profile.html');
                                        }
                                    };
                                    document.addEventListener("show", function (event)
                                    {
                                        if (event.target.id === 'profile') {                                    
                                            document.getElementById('profileUsername').innerHTML = onClickDataVar.val().uname;
                                            firebase.database().ref('/userDB/' + onClickDataVar.val().uid + '/followedBy/followedByInt').once('value').then(function (profileData) {
                                                firebase.storage().ref('profilePicture/' + onClickDataVar.val().uid + '/dp.jpeg').getDownloadURL().then(function (urlDP) {
                                                    document.getElementById('profileFollowers').innerHTML = "Followers : " + profileData.val();
                                                    document.getElementById('profileDPView').setAttribute('src', urlDP);
                                                });
                                                firebase.database().ref('/userDB/' + userId.uid + '/following/' + onClickDataVar.val().uid).once('value').then(function (checkiffolwing) {  
                                                    if (checkiffolwing.val() === null) {                                                   
                                                        document.getElementById('followBtn').onclick = function () {
                                                   
                                                            firebase.database().ref('/userDB/' + userId.uid + '/following/' + onClickDataVar.val().uid).set(true);
                                                            console.log("setting follwing in current user");
                                                            firebase.database().ref('/userDB/' + userId.uid + '/following/followingInt').once('value').then(function (followingpp)
                                                            {
                                                                firebase.database().ref('/userDB/' + userId.uid + '/following/followingInt').set(followingpp.val() + 1);
                                                                console.log("setting follwingInt in current user");
                                                            });
                                                            firebase.database().ref('/userDB/' + onClickDataVar.val().uid + '/followedBy/' + userId.uid).set(true);
                                                            console.log("setting follwed by in profile user");
                                                            firebase.database().ref('/userDB/' + onClickDataVar.val().uid + '/followedBy/followedByInt').set(profileData.val() + 1);
                                                            console.log("setting follwedbyInt in profile user");
                                                            this.setAttribute("disabled", "true");
                                                        }

                                                    }
                                                    else if (checkiffolwing.val() === true) {
                                                        document.getElementById('followBtn').setAttribute("disabled", "true");
                                                    }
                                                });
                                            });
                                        }
                                    });
                                
                                    // onLike Click
                                    document.getElementById(data.key + 'OnLike').onclick = function ()
                                    {
                                        firebase.database().ref('/userDB/' + userId.uid + '/wallpaperLiked/' + data.key).set(true);
                                        firebase.database().ref('wallpaperDB/' + data.key).child('likes').set(data.val().likes + 1);
                                        this.setAttribute("disabled", "true");
                                        console.log('Liked');
                                    };
                                    // onDownload Click
                                    document.getElementById(data.key + 'OnDownload').onclick = function ()
                                    {
                                        firebase.database().ref('wallpaperDB/' + data.key).child('downloads').set(data.val().downloads + 1);
                                        var dialog = page.querySelector('#downloadingid');
                                        if (dialog)
                                        {
                                            dialog.show();
                                            dialog.hide();
                                        }
                                        else
                                        {
                                            ons.createDialog('downloading.html')
                                            .then(function (dialog) {
                                                dialog.show();
                                                dialog.hide();
                                            });
                                        }
                                        var fileTransfer = new FileTransfer();
                                        var fileURL = "///storage/emulated/0/MyWallpapers/wall" + data.key + ".jpeg";
                                        fileTransfer.download(
                                           url, fileURL, function (entry)
                                           {
                                               ons.notification.confirm("Download completed");
                                           },

                                           function (error)
                                           {
                                               ons.notification.confirm("Download error source :" + error.source);
                                               ons.notification.confirm("Download error target :" + error.target);
                                               ons.notification.confirm("Download error code :" + error.code);
                                           },
                                           false, {
                                               headers:
                                               {
                                                   "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                               }
                                           }
                                        );
                                    };
                                    // onWall Click
                                    document.getElementById(data.key + 'OnWall').onclick = function () {

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
                                               window.plugins.wallpaper.setImageHttp(url);
                                               ons.notification.confirm("Wallpaper set");
                                               firebase.database().ref('wallpaperDB/' + data.key).child('walls').set(data.val().walls + 1);
                                               firebase.database().ref('wallpaperDB/' + data.key).child('likes').set(data.val().likes + 1);
                                               firebase.database().ref('wallpaperDB/' + data.key).child('downloads').set(data.val().downloads + 1);
                                               document.getElementById(data.key + 'OnWall').setAttribute("disabled", "true");
                                               document.getElementById(data.key + 'OnLike').setAttribute("disabled", "true");
                                               ons.notification.confirm("Wallpaper set");
                                           },

                                           function (error) {
                                               ons.notification.confirm("Download error source :" + error.source);
                                               ons.notification.confirm("Download error target :" + error.target);
                                               ons.notification.confirm("Download error code :" + error.code);
                                           },
                                           false, {
                                               headers:
                                               {
                                                   "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                               }
                                           }
                                        );                                     
                                        
                                        
                                        console.log('Walled');
                                    };
                                    // onReport Click
                                    document.getElementById(data.key + 'OnReport').onclick = function ()
                                    {
                                        ons.createDialog('report.html')
                                        .then(function (dialog)
                                        {
                                            dialog.show();
                                            document.getElementById('reportBtn').onclick = function ()
                                            {
                                                dialog.hide();
                                                var copyvio = document.getElementById('radio-1').value;
                                                var spam = document.getElementById('radio-2').value;
                                                var offence = document.getElementById('radio-3').value;
                                           
                                            };
                                        });
                                    }
                                });
                            }
                        });
                    }).catch(function (error)
                    {
                        console.log("Fetch Validating Error:" + error);
                    });
                }).catch(function (error) { console.log("Stroage Fetching error :" + error); });
            });
            // update likes at 5 sec interval
            function statsUpdate() {
                firebase.database().ref("wallpaperDB/").orderByChild('likes').on("child_added", function (data) {
                    if (document.getElementById(data.key + 'Likes')) {
                        //console.log("Updating Likes .....");
                        document.getElementById(data.key + 'Likes').innerHTML = data.val().likes;
                    }

                });
                firebase.database().ref("wallpaperDB/").orderByChild('walls').on("child_added", function (data) {
                    if (document.getElementById(data.key + 'Walls')) {
                        //console.log("Updating W .....");
                        document.getElementById(data.key + 'Walls').innerHTML = data.val().likes;
                    }

                });
                firebase.database().ref("wallpaperDB/").orderByChild('downloads').on("child_added", function (data) {
                    if (document.getElementById(data.key + 'Downloads')) {
                        //console.log("Updating D .....");
                        document.getElementById(data.key + 'Downloads').innerHTML = data.val().likes;
                    }

                });
            }
            setInterval(statsUpdate, 5000);
            //On Refresh
            

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
        
        //Navigator
        nav();

    }
    else if (page.id === 'myAcc') {
        myNavigator.onDeviceBackButton.enable();
        //Navigator
        nav();

        var userId = firebase.auth().currentUser;
        page.querySelector('#my-username').innerHTML = userId.displayName;
        console.log(userId.uid);
        firebase.database().ref('/userDB/' + userId.uid + '/followedBy/followedByInt').once('value').then(function (data)
        {
            page.querySelector('#my-followedBy').innerHTML = data.val();

        });
        firebase.database().ref('/userDB/' + userId.uid + '/following/followingInt').once('value').then(function (data) {
            page.querySelector('#my-following').innerHTML = data.val();

        });

        page.querySelector('#profile-image-DP').setAttribute("src", userId.photoURL);
   
        //Upload DP
        document.getElementById('profileDPUpload').onchange = function () {

            document.getElementById('uploadingDialog').show();

            var fileTBU = page.querySelector('#profileDPUpload').files[0];
            if (fileTBU) {

                var progressBar = page.querySelector('#progessBar');
                var stroageRef = firebase.storage().ref('profilePicture/' + userId.uid + '/dp.jpeg');
                var task = stroageRef.put(fileTBU);
                task.on('state_changed', function (snapshot) {
                    var per = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progessBar.value = per;
                }, function (error) {
                    document.getElementById('uploadingDialog').hide();
                    ons.notification.alert("An error has occurred!</br>" + error);
                }, function () {
                    firebase.storage().ref('profilePicture/' + userId.uid + '/dp.jpeg').getDownloadURL().then(function (url)
                    {
                        userId.updateProfile({ photoURL: url }).then(function () { console.log(userId.photoURL);});
                                
                        page.querySelector('#profile-image-DP').setAttribute("src", url);
                    });
                    document.getElementById('uploadingDialog').hide();
                          
                });                                 

            }
            else {               
                document.getElementById('uploadingDialog').hide();
            }
        };

        //Logout
        page.querySelector('#logoutBtn').onclick = function () {
            
            firebase.auth().signOut().then(function () {
                ons.notification.confirm("Logout Successful");
                document.querySelector('#mainNavigator').pushPage('login.html');
            }, function (error) {
                ons.notification.alert("Error ! Try again");
            });
        };

        //Logout End
    }
    else if (page.id === 'uploading') {

        //Navigator
        nav();
        //Check Email verification
        var userId = firebase.auth().currentUser;
        var uploadBtn = document.getElementById('fileToUpload');
        if (userId.emailVerified) {
            uploadBtn.setAttribute('disabled', '');
            uploadBtn.removeAttribute('disabled');
        }
        else {
            uploadBtn.setAttribute('disabled', '');
            console.log('Email is not verified at upload');
        }
        //Upload Wallpaper Engine
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
                            firebase.database().ref('wallpaperDB/' + newPostKey + '/').set({ uname: userId.displayName, uid: userId.uid, likes: 1, downloads: 1, walls: 1 });
                            //set wallpaper on userdb
                            firebase.database().ref('userDB/' + userId.uid + '/uploads/' + newPostKey).set(true);
                            firebase.database().ref('userDB/' + userId.uid + '/wallpaperLiked/' + newPostKey).set(true);

                            document.getElementById('uploadingDialog').hide();
                            ons.notification.confirm("Uploaded Successfully");
                        });
                    }
                    else {
                        ons.notification.confirm("You can't upload Low Quality Wallpapers ! Wallpaper must have Heigh 1920 and Width 1080");
                        document.getElementById('uploadingDialog').hide();
                    }
                }

            }
            else {
                ons.notification.alert("Oh No an error ! Try again");
                document.getElementById('uploadingDialog').hide();
            }


        };
        //Uploading Wallpaper End

    }
    else if (page.id === 'cat') {

        //Navigator
        nav();
    }

    else if (page.id === 'myUpd') {

        myNavigator.onDeviceBackButton.enable();
        //Navigator
        nav();

        var uwall = page.querySelector('#myUpdWall');
        // Feed Engine
        function uwallEngine() {

            var userId = firebase.auth().currentUser;

            firebase.database().ref("wallpaperDB/").orderByChild('likes').on("child_added", function (data) {
                firebase.storage().ref('wid/' + data.key + '.jpeg').getDownloadURL().then(function (url) {
                    firebase.database().ref('/userDB/' + userId.uid + '/wallpaperLiked/' + data.key).once('value').then(function (snapshot) {
                        firebase.database().ref('/userDB/' + data.val().uid + '/followedBy/').on('value', function (followersLoop) {
                            if (snapshot.val() === true) {
                                firebase.storage().ref('profilePicture/' + data.val().uid + '/dp.jpeg').getDownloadURL().then(function (urlDP) {
                                    page.querySelector('#pageLoaging').style.display = "none";
                                    uwall.appendChild(ons._util.createElement(
                                        '<div><ons-list-item ripple modifier="nodivider">'
                        + '<div class="left"><img class="list__item__thumbnail" src="' + urlDP + '" width="40" height="40"></div>'
                        + '<div class="center" style="padding:0px 0px 0px 0px;">'
                            + '<span class="list__item__title" ><a class="' + data.val().uid + 'Likes">' + data.val().uname + '</a></span>'
                            + '<span class="list__item__subtitle">Followers : ' + followersLoop.val().followedByInt + '</span>'
                        + '</div></ons-list-item>'
                        + '<ons-list-item ripple style="padding:0px 0px 0px 0px;" modifier="nodivider">'
                        + '<div class="center" style="padding:0px 0px 0px 0px;">'
                            + '<img style="max-width:100%; width:100%;" src="' + url + '" alt="Loading....." /> '
                            + '<table style="font-size:10px;opacity:0.87;padding-left:10px;">'
                            + '<tr><td id="' + data.key + 'Likes">200</td><td>Likes</td><td></td>'
                                + '<td >200</td><td>Downloads</td><td></td>'
                                + '<td >200</td><td>Walls</td><td></td>'
                          + '</tr></table></div></ons-list-item>'
                    + '<ons-list-item style="padding:0px 0px 0px 0px;border-bottom:2px solid #e2e2e2;" modifier="nodivider">'
                       + ' <div class="center" style="padding:0px 0px 0px 0px;">'
                            + '<ons-button modifier="quiet" id="' + data.key + 'OnDownload" style="font-size:10px;height:auto;width:auto;"><a style="text-decoration: none;color:inherit;" href="' + url + '" download="' + data.key + '">Download</a></ons-button>'
                            + '<ons-button modifier="quiet" id="' + data.key + 'OnWall" style="font-size:10px;height:auto;width:auto;"><a style="text-decoration: none;color:inherit;" href="' + url + '" download="' + data.key + '">Wall</a></ons-button>'
                        + '</div><div class="right" style="padding:0px 0px 0px 0px;">'
                            + '<ons-button modifier="quiet" id="' + data.key + 'OnReport" style="font-size:10px;height:auto;width:auto;">Report</ons-button>'
                        + '</div></ons-list-item></div>'));
                                    page.querySelector('#' + data.key + 'Likes').innerHTML = " " + data.val().likes;

                                    if (userId.emailVerified) {
                                        console.log("Email verified at Upload Wall");
                                    }
                                    else {
                                        console.log("Email not verified at Upload Wall");
                                        page.querySelector('#' + data.key + 'OnReport').setAttribute("disabled", "");
                                        page.querySelector('#' + data.key + 'OnDownload').setAttribute("disabled", "");
                                        page.querySelector('#' + data.key + 'OnWall').setAttribute("disabled", "");
                                    }


                                    //onProfile Click                         

                                    var profileClassId = document.getElementsByClassName(data.val().uid + "Likes");

                                    for (var i = 0; i < profileClassId.length; i++) {

                                        profileClassId[i].onclick = function () {
                                            onClickData(data);
                                            document.querySelector('#mainNavigator').pushPage('profile.html');
                                        }
                                    };
                                    document.addEventListener("show", function (event) {
                                        if (event.target.id === 'profile') {
                                            document.getElementById('profileUsername').innerHTML = onClickDataVar.val().uname;
                                            firebase.database().ref('/userDB/' + onClickDataVar.val().uid + '/followedBy/followedByInt').once('value').then(function (profileData) {
                                                firebase.storage().ref('profilePicture/' + onClickDataVar.val().uid + '/dp.jpeg').getDownloadURL().then(function (urlDP) {
                                                    document.getElementById('profileFollowers').innerHTML = "Followers : " + profileData.val();
                                                    document.getElementById('profileDPView').setAttribute('src', urlDP);
                                                });
                                                firebase.database().ref('/userDB/' + userId.uid + '/following/' + onClickDataVar.val().uid).once('value').then(function (checkiffolwing) {
                                                    if (checkiffolwing.val() === null) {
                                                        document.getElementById('followBtn').onclick = function () {

                                                            firebase.database().ref('/userDB/' + userId.uid + '/following/' + onClickDataVar.val().uid).set(true);
                                                            console.log("setting follwing in current user");
                                                            firebase.database().ref('/userDB/' + onClickDataVar.val().uid + '/followedBy/' + userId.uid).set(true);
                                                            console.log("setting follwed by in profile user");
                                                            firebase.database().ref('/userDB/' + onClickDataVar.val().uid + '/followedBy/followedByInt').set(profileData.val() + 1);
                                                            console.log("setting follwedbyInt in profile user");
                                                            this.setAttribute("disabled", "true");
                                                        }

                                                    }
                                                    else if (checkiffolwing.val() === true) {
                                                        document.getElementById('followBtn').setAttribute("disabled", "true");
                                                    }
                                                });
                                            });
                                        }
                                    });



                                    //OnDownload Click
                                    document.getElementById(data.key + 'OnDownload').onclick = function () {
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

                                               ons.notification.confirm("Download completed");
                                           },

                                           function (error) {

                                               ons.notification.confirm("Download error source :" + error.source);
                                               ons.notification.confirm("Download error target :" + error.target);
                                               ons.notification.confirm("Download error code :" + error.code);
                                           },

                                           false, {
                                               headers: {
                                                   "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                               }
                                           }
                                        );

                                    }
                                    // onReport Click
                                    document.getElementById(data.key + 'OnReport').onclick = function () {
                                        ons.createDialog('report.html')
                                        .then(function (dialog) {
                                            dialog.show();

                                            document.getElementById('reportBtn').onclick = function () {
                                                dialog.hide();
                                                var copyvio = document.getElementById('radio-1').value;
                                                var spam = document.getElementById('radio-2').value;
                                                var offence = document.getElementById('radio-3').value;

                                            };
                                        });
                                    }

                                });
                            }
                            else {
                                page.querySelector('#pageLoaging').style.display = "none";
                                uwall.innerHTML = '<ons-list-item>Looks like you are out of Wallpapers</ons-list-item>';
                                //Ignore Likes
                            }



                        });
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