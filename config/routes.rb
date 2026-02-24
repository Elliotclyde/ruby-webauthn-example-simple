# frozen_string_literal: true

Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  resource :session, only: [:new, :create] do
    post :callback
  end

  resource :registration, only: [:new, :create] do
    post :callback
  end

  # redirects if unauthenticated
  root to: "home#index"
end
