Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  get "/letters", to: "games#letters"
  
  get "/users", to: "games#users"
  post "/users", to: "games#newUser"

end
