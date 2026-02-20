import { Controller } from "@hotwired/stimulus"
import * as Credential from "credential";

export default class extends Controller {
  static targets = ["usernameField"]

  create(event) {
    var [data, status, xhr] = event.detail;
    console.log(data);
    var credentialOptions = data;
    Credential.get(credentialOptions);
  }

  error(event) {
    let response = event.detail[0];
    alert(response)
  }
}
