Feature: Login
 Scenario: should navigate to the chat page
   When I want to navigate to the chat "http://localhost:4200/chat"
   Then the page should contain the following "LOGIN CHAT EN3A"