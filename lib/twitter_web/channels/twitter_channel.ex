defmodule TwitterWeb.TwitterChannel do
  use TwitterWeb, :channel

  def join("twitter:"<>username, payload, socket) do
    if authorized?(payload) do
      {:ok, %{channel: "twitter:#{username}"}, assign(socket, :user_id, username)}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end


  def handle_in("loginUser", payload, socket) do
    status = GenServer.call(:twitterServer,{:loginUser,payload["username"],payload["password"]})
    if(status) do
      broadcast!(socket, "twitter:#{payload["username"]}:login_pass",payload)
    else 
      broadcast!(socket, "twitter:#{payload["username"]}:login_fail",payload)
    end
    {:noreply, socket}
  end

  def handle_in("registerUser", payload, socket) do
    status = GenServer.call(:twitterServer,{:registerUser,payload["username"],payload["password"]})
    if(status) do
      broadcast!(socket, "twitter:#{payload["username"]}:register_pass",payload)
    else 
      broadcast!(socket, "twitter:#{payload["username"]}:register_fail",payload)
    end
    {:noreply, socket}
  end

  def handle_in("sendTweet", payload, socket) do
    user_id = socket.assigns[:user_id]
    GenServer.cast(:twitterServer,{:tweet,user_id,payload["message"]})
    {:noreply, socket}
  end

  def handle_in("sendRetweet", payload, socket) do
    user_id = socket.assigns[:user_id]
    GenServer.cast(:twitterServer,{:retweet,user_id,payload["message"]})
    {:noreply, socket}
  end

  def handle_in("getFollowers", payload, socket) do
    user_id = socket.assigns[:user_id]
    followerList = TwitterServer.getFollowers(user_id)
    payload = %{:followerList =>followerList}
    broadcast!(socket, "twitter:#{user_id}:followerList",payload)
    {:noreply, socket}
  end

  def handle_in("getFollowing", payload, socket) do
    user_id = socket.assigns[:user_id]
    followingList = TwitterServer.getFollowing(user_id)
    payload = %{:followingList =>followingList }
    broadcast!(socket, "twitter:#{user_id}:followingList",payload)
    {:noreply, socket}
  end

  def handle_in("displayTweets", payload, socket) do
    user_id = socket.assigns[:user_id]
    feedlist = GenServer.call(:twitterServer,{:liveFeed,user_id})
    payload = %{:feedlist =>feedlist }
    broadcast!(socket, "twitter:#{user_id}:feedlist",payload)
    {:noreply, socket}
  end

  def handle_in("hashtag", payload, socket) do
    user_id = socket.assigns[:user_id]
    result_list = GenServer.call(:twitterServer,{:queryHashtags,payload["searchquery"]})
    payload = %{:result_list =>result_list }
    broadcast!(socket, "twitter:#{user_id}:hashtagresult",payload)
    {:noreply, socket}
  end

  def handle_in("mentions", payload, socket) do
    user_id = socket.assigns[:user_id]
    result_list = GenServer.call(:twitterServer,{:queryMentions,payload["searchquery"]})
    payload = %{:result_list =>result_list}
    broadcast!(socket, "twitter:#{user_id}:mentionsresult",payload)
    {:noreply, socket}
  end

  def handle_in("follow", payload, socket) do
    user_id = socket.assigns[:user_id]
    result_list = GenServer.cast(:twitterServer,{:subscribeTo,user_id, payload["followId"]})
    broadcast!(socket, "twitter:#{user_id}:follow_success",payload)
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end