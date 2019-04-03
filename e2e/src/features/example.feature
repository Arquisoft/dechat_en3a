Feature: Example
 Scenario: should navigate to the main page
   When I navigate to "https://angular.io/"
   Then the title should be "Angular"
 
Scenario: should be able to see the Docs page
   When I navigate to "https://angular.io/"
   When I click the Docs button
   Then I should see a "What is Angular?" article

Scenario: should be able to see Features page
  When I navigate to "https://angular.io/"
  When I click the Features button
  Then I should see a "FEATURES & BENEFITS" article

Scenario: should be able to see Angular Twitter page
  When I navigate to "https://angular.io/"
  When I click the Twitter icon
  Then I should see a the "Angular Twitter" page

Scenario: should be able to see Resources page
  When I navigate to "https://angular.io/"
  When I click the Resources button
  Then I should see a "EXPLORE ANGULAR RESOURCES" article
