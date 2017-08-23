# n-syndication [![CircleCI](https://circleci.com/gh/Financial-Times/n-syndication.svg?style=svg)](https://circleci.com/gh/Financial-Times/n-syndication)

## How does it work

The `n-syndication` module first checks to see if a user is "syndication enabled". 

If they are it aggregates all the content IDs it finds on a page by querying for all the `[data-content-id]` attributes in each [n-teaser](https://github.com/Financial-Times/n-teaser).

It sends them to the [next-syndication-api](https://github.com/Financial-Times/next-syndication-api), which returns back an Array of Objects for each content ID that can be syndicated according to what this user's contract specifies. 

When a user then clicks a syndicator icon, a modal is displayed with `save` and/or `download` buttons enabled/disabled, along with the appropriate messaging, also according to the user's contractual rights.

## I can't see the icons!

You need to be a syndication subscriber to see them - on a technical level this means having `S1` in your [products list](https://session-next.ft.com/products).  To get this contact Rika Niekzad or, failing that, maybe syndhelp@ft.com can help you.

## Where does the data come from?
The Content API has the property `canBeSyndicated` which is a string containing either `yes`, `no` or `verify`.  This property is available in Next's Elastic search cluster and in [Next API](https://github.com/Financial-Times/next-api)

## This is just some javascript - is there other code elsewhere?
Yep - These links will probably be wrong pretty soon but will hopefully point you in the right direction:

**n-teaser** - https://github.com/Financial-Times/n-teaser/blob/master/src/presenters/teaser-presenter.js#L77
Here we add an additional modifier if syndication is available on this article

**next-article** - https://github.com/Financial-Times/next-article/blob/master/views/content.html#L20
Here a data attribute is added containing the syndication status of the article.

**generic** - add the following data attributes to your markup:

* `data-syndicatable-uuid` – the uuid of the content to syndicate
* `data-syndicatable-title` – the title of the content to syndicate
* `data-syndicatable` – `yes` / `no` / `verify`
* `data-syndicatable-target` – the element to insert the syndication flag
