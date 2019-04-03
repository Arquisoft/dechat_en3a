Feature: Register
 Scenario: should navigate to the register page
   When I want to navigate to "http://localhost:4200/"
   Then the title should be something like " Login Chat EN3A "
   When I click the Register button
   Then the page should contain "Select Solid Identity Provider"
   