Feature: Sample test suite
  @Login
  Scenario: Login
    Given I load data "USER"
    And I go to login page
    When I type test data "admin.username" to input "username"
    And I type test data "admin.password" to input "password"
    And I click button with locator "form > button"
    Then I should be in home page