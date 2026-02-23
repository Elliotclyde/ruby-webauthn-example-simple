# frozen_string_literal: true

class SessionsController < ApplicationController
  def new
  end

  def create
    user = User.find_by(username: params[:username])

    if user
      get_options = WebAuthn::Credential.options_for_get(
        allow: user.credentials.pluck(:external_id),
        user_verification: "required"
      )

      session[:current_authentication] = { challenge: get_options.challenge, username: params[:username] }

      respond_to do |format|
        format.json { render json: get_options }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: [ "Username doesn't exist" ] }, status: :unprocessable_content }
      end
    end
  end

  def callback
    webauthn_credential = WebAuthn::Credential.from_get(JSON.parse(params[:credential]))

    user = User.find_by(username: session[:current_authentication]["username"])
    raise "user #{session[:current_authentication]["username"]} never initiated sign up" unless user

    credential = user.credentials.find_by(external_id: webauthn_credential.id)

    begin
      webauthn_credential.verify(
        session[:current_authentication]["challenge"],
        public_key: credential.public_key,
        sign_count: credential.sign_count,
        user_verification: true,
      )

      credential.update!(sign_count: webauthn_credential.sign_count)
      sign_in(user)

      redirect_to root_path, notice: "Successfully signed in!"
    rescue WebAuthn::Error => e
      redirect_to new_session_path, alert: "Verification failed: #{e.message}"
    ensure
      session.delete(:current_authentication)
    end
  end

  def destroy
    sign_out
    redirect_to root_path
  end
end
