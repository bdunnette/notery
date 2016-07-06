// Initialize Firebase
var config = {
    apiKey: "AIzaSyCA4r_dMIA1OPhOL73yMvzzs1P-V7c3QfM",
    authDomain: "notery-ced8e.firebaseapp.com",
    databaseURL: "https://notery-ced8e.firebaseio.com",
    storageBucket: "notery-ced8e.appspot.com",
};

firebase.initializeApp(config);

var app = angular.module('notery', ['ngRoute', 'ngMaterial', 'firebase'])
    .config(['$locationProvider', '$routeProvider',
        function config($locationProvider, $routeProvider) {
            // $locationProvider.hashPrefix('!');

            $routeProvider.
            when('/', {
                templateUrl: 'views/notes.html',
                controller: 'MainController'
            }).
            when('/episode/:episodeId', {
                templateUrl: 'views/episode.html',
                controller: 'EpisodeCtrl'
            }).
            when('/feed/:feedId', {
                templateUrl: 'views/feed.html',
                controller: 'FeedCtrl'
            }).
            otherwise('/');
        }
    ]).config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('teal')
            .accentPalette('amber');
    });

// Came from the comments here:  https://gist.github.com/maruf-nc/5625869
app.filter('titlecase', function() {
    return function(input) {
        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

        input = input.toLowerCase();
        return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
            if (index > 0 && index + match.length !== title.length &&
                match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
                (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }

            if (match.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }

            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    };
});

app.controller('MainController', function($scope, $firebaseArray, $firebaseAuth) {
    var ref = firebase.database().ref().child("notes").orderByChild('date').limitToLast(10);
    // create a synchronized array
    // click on `index.html` above to see it used in the DOM!
    $scope.notes = $firebaseArray(ref);

    $scope.authObj = $firebaseAuth();
    $scope.firebaseUser = $scope.authObj.$getAuth();

    $scope.resetNote = function() {
        $scope.editingNote = {
            "front": {
                "text": ""
            },
            "back": {
                "text": ""
            },
            "owner": $scope.firebaseUser.uid
        };
    }

    $scope.editNote = function(note) {
        $scope.editingNote = note;
    }

    $scope.saveNote = function(note) {
        if (note.$id) {
            $scope.notes.$save(note).then(function(ref) {
                var id = ref.key;
                console.log("saved record with id " + ref.key);
            });
        } else {
            $scope.notes.$add(note).then(function(ref) {
                var id = ref.key;
                console.log("added record with id " + id);
            });
        }
    }

    $scope.resetNote();
});

app.controller('NavbarController', function($scope, $firebaseAuth) {
    $scope.authObj = $firebaseAuth();
    $scope.firebaseUser = $scope.authObj.$getAuth();

    $scope.login = function(authType) {
        switch (authType) {
            case 'google':
            default:
                // login with Google
                $scope.authObj.$signInWithPopup(authType).then(function(firebaseUser) {
                    // console.log("Signed in as:", firebaseUser.uid);
                    // console.log($scope.authObj.$getAuth());
                }).catch(function(error) {
                    console.log("Authentication failed:", error);
                });
        }
    }
});
