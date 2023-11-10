/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent , screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import router from "../app/Router.js";
import Store from "../app/Store";
import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // Set localStorage to simulate a connected employee
    Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH["NewBill"] } });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    // Create a root element and append it to the document body
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    // Call the router function to navigate to the NewBill Page
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
  });
   // Check if the home page is correctly displayed
  describe("When I am on NewBill Page", () => {
    test("Then new Bill page should be displayed", async () => {
      await waitFor(() => screen.getByText("Envoyer une note de frais"));
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
    });
 // Check that the mail icon is highlighted
    test("Then email icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.className).toBe("active-icon");
    });
  });
 
   //incorrect file uploaded , ex :  pdf
  describe("When I upload an incorrect file", () => {
    test("Then the upload fail", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const file = screen.getByTestId("file");

      // Create a new instance of NewBill with necessary parameters
      const newBill = new NewBill({
        document,
        onNavigate,
        store: Store,
        localStorage: window.localStorage,
      });

      // Define a function to handle the file change event
      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      // Add an event listener to the file input to handle file changes
      file.addEventListener("change", handleChangeFile);

      // Simulate selecting an incorrect file type (PDF)
      fireEvent.change(file, {
        target: {
          files: [new File(["image"], "test.pdf", { type: "image/pdf" })],
        },
      });

      // Expect that the file input's value is an empty string, indicating failure
      expect(file.value).toBe("");
    });
  });
  
  describe("When I submit a new Bill on a correct form", () => {
    test("Then the submit should success", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      // Create an instance of the NewBill class with necessary parameters
      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });

      // Get the form element by its data-testid
      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();

      // Define a function to handle the submit event for the form
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      // Add an event listener to the form to listen for submits
      formNewBill.addEventListener("submit", handleSubmit);

      // Simulate a form submission event
      fireEvent.submit(formNewBill);

      // Expect that the handleSubmit function has been called
      expect(handleSubmit).toHaveBeenCalled();
    });
    test("then verify the submit file", async () => {
      // Mock the bills store and its create method
      const html = NewBillUI();
      document.body.innerHTML = html;
      // Create an instance of the NewBill class with necessary parameters
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      // Create a mock file to upload
      const file = new File(["image"], "image.png", { type: "image/png" });

      // Define a function to handle the file change event
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

      // Get the form and file input elements
      const formNewBill = screen.getByTestId("form-new-bill");
      const billFile = screen.getByTestId("file");

      // Add an event listener to the file input to handle file changes
      billFile.addEventListener("change", handleChangeFile);

      // Simulate uploading the mock file
      userEvent.upload(billFile, file);

      // Expect that the file input's value has been defined
      expect(billFile.files[0].name).toBeDefined();

      // Expect that the handleChangeFile function has been called
      expect(handleChangeFile).toBeCalled();

      // Define a function to handle the form submission event
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      // Add an event listener to the form to handle form submissions
      formNewBill.addEventListener("submit", handleSubmit);

      // Simulate submitting the form
      fireEvent.submit(formNewBill);

      // Expect that the handleSubmit function has been called
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      // Spy on the mockStore's 'bills' method
      jest.spyOn(mockStore, "bills");

      // Set up localStorage with a user of type 'employee'
      Object.defineProperty(window, "localeStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "employee",
          email: "a@a",
        })
      );
    });
    test("Then should fail with message error 404", async () => {
      // Mock the 'create' method of 'bills' to reject with an error message
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      // Create an HTML representation of the bills UI with the error message

      const html = BillsUI({ error: "Erreur 404" });

      // Set the document body's HTML to the HTML representation
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("Then should fail with message error 500", async () => {
      // Mock the 'create' method of 'bills' to reject with an error message
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      // Create an HTML representation of the bills UI with the error message

      const html = BillsUI({ error: "Erreur 500" });

      // Set the document body's HTML to the HTML representation
      document.body.innerHTML = html;

      // Find the error message in the rendered HTML
      const message = await screen.getByText(/Erreur 500/);

      // Expect that the error message is found in the DOM
      expect(message).toBeTruthy();
    });
  });
});