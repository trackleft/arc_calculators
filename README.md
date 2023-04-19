# Advising Resource Center Calculators

This repo contains a custom Drupal module for the Advising Resource Center 
website. The module provides two custom block types: GPA Calculator Block 
and Target GPA Calculator Block. Users can create blocks based on these 
block types and then embed those blocks on any page of the site. The 
calculators are intended to replicate the functionality of the GPA 
calculators on the Quickstart 1 Advising site.


## Lando configuration
This project includes a sample lando configuration file that can be
used to automatically build a local Arizona Quickstart site with your module
installed for development and testing.
```
lando start
lando install
```

The sample lando configuration also includes tooling that expose Quickstart's
code quality tools for checking that the module code adheres to Quickstart's
coding standards.
```
lando phpcs

lando phpcbf

lando phpstan
```
