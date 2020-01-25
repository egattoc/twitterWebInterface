defmodule TwitterWeb.PageController do
  use TwitterWeb, :controller


  def login(conn,_params) do
    render(conn, "login.html")
  end

  def homepage(conn,_params) do
    render(conn, "homepage.html")
  end  
end
