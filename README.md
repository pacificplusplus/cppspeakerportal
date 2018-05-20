# C++ Speaker Portal

## Introduction

The goal of this project is to provide a tool enabling speakers to submit talks to a C++ conference.

The Speaker Portal allows users to create a speaking profile, and submit talks for a specific conference under their
profile.

The portal is implemented using Google's Firebase technology (https://firebase.google.com/). There is no backend code
other than the security rules entered into the Firebase Console. The rules dictate what data can be read and written
where by who. For security reasons, the rules are not published in this repository but are available via request.

The frontend for the portal is implemented in Javascript (obviously) and is using the Firebase SDK for application logic,
and Twitter Bootstrap for the UI.

## Extending to support other C++ conferences

There has been some interested from other conference to eliminate easy chair and replace it with something more flexible
and not such a pain to use.

Right now, the portal is hardcoded to Pacific++, but could easily be made more generic. This has not been done yet as
I am unsure of the best way to do this.

It could be done at runtime in Javascript, or we could use a templating tool to substitute in conference specific details.
Another approach would be to have a common website among all C++ conference involved, where the speaker profile would be
shared. When the speaker submits a talk, they would choose for what conference.

## Important

The current database keys contained in this repository point to the production instance of the Pacific++ Firebase backend.
This is not a security concern because these keys are served up to anyone viewing the website anyway. Please be
thoughtful when submitting bogus talks or profiles.

## Getting started

1. Clone this repository
2. Serve the repository. `python -m SimpleHTTPServer 8000` or something else, I use https://www.npmjs.com/package/serve
for development, or Nginx in production.

To test it out on your own Firebase backend, make an account and update the config near the top of `index.html` to point
to your own backend.

## Viewing Submissions

Currently, I have a Python script that dumps the talks out to a file in JSON format. Obviously not ideal or a final
solution but it works for now.









