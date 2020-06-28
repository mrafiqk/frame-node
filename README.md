# Welcome to frame node!

`frame-node` is a framework which is used NodeJS. You can install this package using the following command.

    $ npm i -g frame-node

# Create new project

Create an node framework using NodeJS of the blank one to start fresh. Get started with the `ionic new` command

    $ frame-node new <project name>

# Run an app
To run the nodejs framework using the `npm`  command.

    $ npm run run

# Create a request
Request is the file which is mainly used for manipulating the validation and verification process. To create a request using the below command.

    $ frame-node generate request <controller-name> <request-name>

for e.g. `frame-node generate request user get` will create a get request for the get user method which is used in controller.

# Create a response
Response is the file which is mainly used to return the response. You can format the response output in this method. To create a response using the below command.

    $ frame-node generate response <controller-name> <response-name>

for e.g. `frame-node generate response user get` will create a get response for the get user method which is used in controller.

# Create a controller
Controllers act as an interface between Model and Response components to process all the business logic and incoming requests, manipulate data using the Model component and interact with the Response to render the final output. To create a controller using the below command.

    $ frame-node generate controller <controller-name> <method-name>

for e.g. `frame-node generate controller user get` will create a controller which has get user method.

# Create a model
The Model component corresponds to all the data-related logic that the user works with. This can represent either the data that is being transferred between the Response and Controller components. To create a model using the below command.

    $ frame-node generate model <model-name>

for e.g `frame-node generate model user` will create a user model with the default columns. If you want more column you can add it as manually.

# Create all component is one at a time
To create `Request`, `Response`, `Controller`, `Model` and `Routes` in singe command.

    $ frame-node create <controller-name>

for e.g. `frame-node create user` will creates all `Request`, `Response`, `Controller`, `Model` and `Routes` for user component.
