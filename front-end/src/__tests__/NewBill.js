/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent , screen, waitFor } from "@testing-library/dom";
import { ROUTES_PATH } from "../constants/routes.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import router from "../app/Router.js";
import Store from "../app/Store";

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
});