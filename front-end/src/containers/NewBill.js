import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    // Get the form element for creating a new bill
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    // Listen for changes to the file input
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);

    // Initialize variables to store file information
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;

    // Initialize the logout feature
    new Logout({ document, localStorage, onNavigate });
  }

  // Handle changes to the file input
  handleChangeFile = (e) => {
    // Get the selected file and its name
    e.preventDefault();
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];

    if (!this.isFileEXtensionIsAllowed(fileName)) {
      alert(
        "l'extension de fichier n'est pas autorisée. Veuillez selectionner un des format de fichiers suivants : jpeg,jpg ou png"
      );
      fileInput.value = "";
    }
    // Create a FormData object and append the file and email to it
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    // Create a new bill using the store
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        console.log(fileUrl);
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch((error) => console.error(error));
  };

  isFileEXtensionIsAllowed(fileName) {
    const allowedExtension = ["jpg", "jpeg", "png"];
    const fileExtension = fileName.split(".").pop().toLowerCase();
    return allowedExtension.includes(fileExtension);
  }

  // Handle the submission of the new bill form
  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );

    // Get the user's email and form input values
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };

    // Update the bill using the store
    this.updateBill(bill);

    // Navigate to the Bills page
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  // Update a bill using the store
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
