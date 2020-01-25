// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative paths, for example:
import socket from "./socket"

let tweetChannel;
let init_fun;
window.loginPage = function(event){
    var username = document.getElementById("username")
    var password = document.getElementById("password")
    if(username.length!=0 && password.length!=0){
        tweetChannel = socket.channel(`twitter:${username.value}`, {});
        tweetChannel.join()
            .receive("ok", resp => { console.log("Joined successfully", resp) })
            .receive("error", resp => { console.log("Unable to join", resp) })
        tweetChannel.push('loginUser', { 
            username: username.value,
            password: password.value
        }); //sending login credentials to the channel
        tweetChannel.on(`twitter:${username.value}:login_pass`, function (payload) {
            window.location.href = "./home?username="+username.value;
        }); //login done successfully

        tweetChannel.on(`twitter:${username.value}:login_fail`, function (payload) {
            alert("Invalid Username or Password. Please try again");
        });
    }
 }

 window.registerPage = function(event){
    var username = document.getElementById("username")
    var password = document.getElementById("password")
    if(username.length!=0 && password.length!=0){
        tweetChannel = socket.channel(`twitter:${username.value}`, {});
        tweetChannel.join()
            .receive("ok", resp => { console.log("Joined successfully", resp) })
            .receive("error", resp => { console.log("Unable to join", resp) })
        tweetChannel.push('registerUser', { 
            username: username.value,
            password: password.value
        });
        tweetChannel.on(`twitter:${username.value}:register_pass`, function (payload) {
            window.location.href = "./home?username="+username.value;
        });//on successful registration, user is directly logged in

        tweetChannel.on(`twitter:${username.value}:register_fail`, function (payload) {
            alert("Invalid Username or Password. Please try again");
        });
    }
 }

var url = new URL(window.location.href);
var username = url.searchParams.get("username");

if(username!=null){
    displayHomePage()
}

function displayHomePage() {
    var username_header = document.getElementById("username");
    username_header.innerText = username;
    tweetChannel = socket.channel(`twitter:${username}`, {});
    tweetChannel.join();
    displayFollowerList();
    displayFollowingList();
    if(window.location.href.indexOf("home") > -1){
        displayTweets()
    }
}

window.logoutPage = function(event){
    window.location.href = "./";
    // taking user back to registration page
}
 
window.tweet = function() { 
    let tweetMessage = document.getElementById("tweettext");
    if(tweetMessage.value.length > 0){
        tweetChannel.push('sendTweet', { 
            message: tweetMessage.value   
        });
        tweetMessage.value = '';  
    }
}

window.gethashtag = function() { 
    let search = document.getElementById("searchhashtag");
    if(search.value.length > 0){
        if(search.value.includes("#")){
            tweetChannel.push('hashtag', { 
                searchquery: search.value   
            });
        }
        search.value = '';  
    }

    tweetChannel.on(`twitter:${username}:hashtagresult`, function (payload) {
        let ul = document.getElementById("hashtag-list");
        ul.innerHTML = '';
        if(payload.result_list.length == 0){
            var li = document.createElement("li"); 
            li.innerHTML =  '<b> No Result Found</b>'; //populating list with the results
            ul.insertBefore(li, ul.childNodes[0]);     
        }else{
            for(var tweet in payload.result_list) {
                var li = document.createElement("li"); 
                li.innerHTML =  '<b>' + payload.result_list[tweet] + '</b>'; //populating list with the results of hashtag search
                ul.insertBefore(li, ul.childNodes[0]);     
            }
        }
    });
}

window.getmentions = function() { 
    let search = document.getElementById("searchmentions");
    if(search.value.length > 0){
        if(search.value.includes("@")){
            tweetChannel.push('mentions', { 
                searchquery: search.value   
            });
        }
        search.value = '';  
    }

    tweetChannel.on(`twitter:${username}:mentionsresult`, function (payload) {
        let ul = document.getElementById("mentions-list");
        ul.innerHTML = '';
        if(payload.result_list.length == 0){
            var li = document.createElement("li");
            li.innerHTML =  '<b> No Result Found</b>';// populating list with the results 
            ul.insertBefore(li, ul.childNodes[0]);     
        }else{
            for(var tweet in payload.result_list) {
                var li = document.createElement("li");
                li.innerHTML =  '<b>' + payload.result_list[tweet] + '</b>'; //populating list with results of user mention search
                ul.insertBefore(li, ul.childNodes[0]);     
            }
        }
    });
}

window.follow = function() { 
    let followId = document.getElementById("followId");
    if(followId.value.length > 0){
        tweetChannel.push('follow', { 
            followId: followId.value   
        });
        followId.value = '';  
    }

    tweetChannel.on(`twitter:${username}:follow_success`, function (payload) {
        alert("You are now following "+ payload.followId);//displaying alert after subscribing
        displayFollowerList(); //populating the list of Followers
        displayFollowingList();//populating the list of Following
    });
    
}
window.homepage = function() { 
    window.location.href = "./home?username="+username;
}

function displayTweets(){
    tweetChannel.push('displayTweets', {
        user: username
    });

    tweetChannel.on(`twitter:${username}:feedlist`, function (payload) {
        let ul = document.getElementById("feedlist");
        for(var tweet in payload.feedlist) {
            var li = document.createElement("li");
            var rt = document.createElement("button");
            rt.innerHTML = 'Retweet';
            var userTweeted = payload.feedlist[tweet][0];
            var tweetmsg = payload.feedlist[tweet][1];
            rt.value = userTweeted + ' : ' + tweetmsg;
            // displaying all tweets with a Retweet option
            rt.onclick = function(){
                sendRetweets(this.value)
            }
            li.innerHTML =  '<b>' + userTweeted + ' : </b>' + tweetmsg;
            li.appendChild(rt);
            ul.insertBefore(li, ul.childNodes[0]);     
        }
    });
}

function sendRetweets(msg){
    tweetChannel.push('sendRetweet',{
        message: msg
    });
}

function displayFollowingList(){
    // populates the list of a users that a user is following
    tweetChannel.push('getFollowing',{
        user: username
    });

    tweetChannel.on(`twitter:${username}:followingList`, function (payload) {
        console.log(payload);
        let ul = document.getElementById("followingList");
        ul.innerHTML = '';
        var followingList = payload.followingList.sort()
        for(var following in followingList) {
            let li = document.createElement("li");
            li.innerHTML =  payload.followingList[following];
            ul.appendChild(li);
        }
    });
}

function displayFollowerList(){
    // populates the list of a user's subscribers
    tweetChannel.push('getFollowers', {
        user: username
    });

    tweetChannel.on(`twitter:${username}:followerList`, function (payload) {
        let ul = document.getElementById("followerList");
        var followerList = payload.followerList.sort()
        ul.innerHTML = '';
        for(var follower in followerList) {
            let li = document.createElement("li");
            li.innerHTML =  payload.followerList[follower];
            ul.appendChild(li);     
        }
    });
}