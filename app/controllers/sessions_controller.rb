# frozen_string_literal: true

class SessionsController < ApplicationController
  def new
  end

  def create
      get_options = WebAuthn::Credential.options_for_get(user_verification: "required")

      session[:current_authentication] = { challenge: get_options.challenge }

      respond_to do |format|
        format.json { render json: get_options }
      end
  end

  def callback
    webauthn_credential = WebAuthn::Credential.from_get(params[:credential])

    credential = Credential.find_by(external_id: webauthn_credential.id)

    begin
      webauthn_credential.verify(
        session[:current_authentication]["challenge"],
        public_key: credential.public_key,
        sign_count: credential.sign_count,
        user_verification: true,
      )

      credential.update!(sign_count: webauthn_credential.sign_count)
      sign_in(credential.user)

      respond_to do |format|
        format.json { render json: { message: "success!" } }
      end
    rescue WebAuthn::Error => e
      respond_to do |format|
        format.json { render json: { message: "verification failed" }, status: :forbidden }
      end
      respond_to do |format|
        format.json { render json: { message: "verification failed" }, status: :forbidden }
      end
    ensure
      session.delete(:current_authentication)
    end
  end
end
