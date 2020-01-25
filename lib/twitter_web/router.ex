defmodule TwitterWeb.Router do
  use TwitterWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", TwitterWeb do
    pipe_through :browser

    # get "/", PageController, :index
    get "/", PageController, :login
    get "/home", PageController, :homepage
    get "/searchquery", PageController, :searchquery

  end

  # Other scopes may use custom stacks.
  # scope "/api", TwitterWeb do
  #   pipe_through :api
  # end
end
