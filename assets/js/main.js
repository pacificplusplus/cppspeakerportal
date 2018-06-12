// FirebaseUI config.
var uiConfig = {
    signInSuccessUrl: '/',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    // Terms of service url.
    tosUrl: '/privacy-policy.html'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

if (ui.isPendingRedirect()) {
    ui.start('#firebaseui-auth-container', uiConfig);
}

initApp = function () {

    var conferenceName = "pacificpp2018";

    //
    // Login Handler
    //
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;

            user.getIdToken().then(function (accessToken) {

                document.getElementById('firebaseui-auth-container').style.display = 'none';
                document.getElementById('sign-in-container').style.display = 'none';

                document.getElementById('submission-area').style.display = 'block';

                $("#logged-in-name")[0].innerText = displayName;

                firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/profile').once('value').then(function (snapshot) {
                    var val = snapshot.val()
                    if (val) {
                        if (val.name == "") {
                            $('#bio-name').val(displayName);
                        } else {
                            $('#bio-name').val(val.name);
                        }

                        $('#bio-twitter').val(val.twitter);
                        $('#bio-text').val(val.bio);
                        $('#experience-text').val(val.experience);
                        $('#bio-country').val(val.country);
                        $('#bio-contact').val(val.contact);
                    }
                });

                firebase.database().ref('/users/' + firebase.auth().currentUser.uid + "/submissions/").on('value', function (snapshot) {
                    var submissionIds = snapshot.val();

                    $("#my-submissions").empty();

                    for (var submissionId in submissionIds) {

                        firebase.database().ref("/submissions/" + conferenceName + "/" + submissionId).once('value').then(function (snapshot) {
                            var submission = snapshot.val();

                            $("#my-submissions").append("<h3>" + submission.title + "</h3>");
                            $("#my-submissions").append("<p class='lead'> Submitted: " + new Date(submission.date).toString() + "</p>");
                            $("#my-submissions").append("<p>Skill Level: " + submission.skillLevel + "</p>");
                            $("#my-submissions").append("<pre>" + submission.abstract + "</pre>");
                            $("#my-submissions").append("<hr/>");

                        }).catch(function () {
                            console.log("Failed fetching talk " + submissionId)
                        });
                    }
                });
            });
            $(".hide-when-logged-out").show();
        } else {
            // User is signed out.
            $("#logged-in-name")[0].innerText = ""

            $(".hide-when-logged-out").hide();

            document.getElementById('firebaseui-auth-container').style.display = 'block'
            document.getElementById('sign-in-container').style.display = 'block';
            document.getElementById('submission-area').style.display = 'none'
        }
    }, function (error) {
        console.log(error);
    });

    //
    // Log out handler
    //
    document.getElementById("sign-out-button").onclick = function () {
        firebase.auth().signOut().then(function () {
            console.log('Signed Out');
            location.reload();
        }, function (error) {
            console.error('Sign Out Error', error);
        });
    }

    //
    // Profile Saving
    //
    document.getElementById("save-profile-button").addEventListener("click", function () {
        var name = $('#bio-name').val();
        var twitter = $('#bio-twitter').val().replace("@", "");
        var bio = $('#bio-text').val();
        var experience = $('#experience-text').val();
        var contact = $('#bio-contact').val();
        var country = $('#bio-country').val();

        var updates = {};
        updates['/users/' + firebase.auth().currentUser.uid + "/profile"] = {
            "name": name,
            "twitter": twitter,
            "bio": bio,
            "experience": experience,
            "contact": contact,
            "country": country
        };

        $('#profile-alert').empty();
        firebase.database().ref().update(updates).then(function () {
            $('#profile-alert').append("<div class='alert alert-success alert-dismissible fade show' role='alert'> Your profile was successfully updated. " +
                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
            window.scrollTo(0, 0);
        }).catch(function () {
            $('#profile-alert').append("<div class='alert alert-danger alert-dismissible fade show' role='alert'> Your profile failed to update. " +
                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
        });
    });

    //
    // Talk Submitting
    //
    document.getElementById('submission-form').addEventListener('submit', function (e) {
        if (e.preventDefault) e.preventDefault();

        var dbLocation = '/submissions/' + conferenceName + "/";

        var newSubmissionKey = firebase.database().ref().child(dbLocation).push().key;

        var skillLevel = "beginner"
        if (document.getElementById('talk-audience-intermediate').checked) {
            skillLevel = "intermediate"
        } else if (document.getElementById('talk-audience-advanced').checked) {
            skillLevel = "advanced"
        }

        var updates = {};
        updates[dbLocation + newSubmissionKey] = {
            "title": document.getElementById('talk-title').value,
            "abstract": document.getElementById('talk-abstract').value,
            "canMentor": document.getElementById('talk-can-mentor').checked,
            "wantMentor": document.getElementById('talk-want-mentor').checked,
            "skillLevel": skillLevel,
            "uid": firebase.auth().currentUser.uid,
            "date": new Date().toISOString()
        };

        updates['/users/' + firebase.auth().currentUser.uid + "/submissions/" + newSubmissionKey] = true

        $('#submission-alert').empty();
        firebase.database().ref().update(updates).then(function () {
            $('#submission-alert').append("<div class='alert alert-success' role='alert'> Congratulations, your talk was successfully submitted. </div>");

            window.scrollTo(0, 0);

        }).catch(function () {
            $('#submission-alert').append("<div class='alert alert-danger' role='alert'> Your talk failed to submit. </div>");
        });

        return false;
    });
};

window.addEventListener('load', function () {
    initApp()
});