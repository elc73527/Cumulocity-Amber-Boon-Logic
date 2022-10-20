# Cumulocity Amber Integration Microservice

## Summary

The `Cumulocity Amber Integration Microservice` manages the communication between Cumulocity and Boon Logic Amber. The Microservice allows to register new sensors and their corresponding configurations in Amber. An existing configuration for a sensor can be updated afterwards using the Microservice. Measurements sent to Cumulocity will only be forwarded for registered devices to Amber.

The OpenApi definition for this Microservice is available in the `./OpenApi-definition.json` file. It describes all existing endpoints, which are defined in `com/softwareag/amber/controller/RestController.java`. You can use the [Swagger Editor](https://editor.swagger.io/) to see all available endpoints and their definition. Furthermore, the Microservice comes with an additional endpoint `/swagger-ui/index.html`. If the Microservice runs locally or in Cumulocity you can access this endpoint (Authentication required) to view the existing endpoints. In the input field in the header bar enter following path: `/service/amber-integration/v3/api-docs/`.

![image](https://user-images.githubusercontent.com/57527184/185068347-40cb4a04-48ea-4d9e-aaa6-fe18cc51d16f.png)

## Configure connection to Amber

The connection to Amber is configured via the endpoint `POST /configure`. The endpoint expects a URL, username and password. Credentials will be verified against the Amber instance. If the connection was successful, the credentials will be stored as TenantOptions (encrypted) in Cumulocity. In case the Microservice is restarted, the credentials are loaded from the TenantOptions (`com/softwareag/amber/service/CredentialsConfigurationService.java`) to establish the connection to Amber again.

The status of the connection to Amber can be checked via the endpoint `GET status`. The endpoint will either return `NOT_CONNECTED` or `READY`.

## Device registration and forwarding data to Amber

A new sensor is registered in Amber via the endpoint `POST /sensors`. The endpoint expects the typical parameters for the Amber sensor. In addition, the Cumulocity data points need to be configured for the device as well. This is required to know to which measurements the Microservice should listen to and forward to Amber as a vector. If a new sensor has been successfully registered in Amber, the configuration for the sensor is stored on the respective device Managed Object in the fragment `c8y_AmberSensorConfiguration`.

Furthermore, the Microservice will listen to all incoming measurements of the respective device. If a measurement matches one of the configured data points it will be added to the data vector. If the vector has all required data points set, it is sent to Amber. The response from Amber is stored directly on the Managed Object of the corresponding device in the fragment `c8y_AmberSensorStatus`. Additionally, an Amber measurement is created in Cumulocity for the device. The measurement contains information about `ad`, `aw`, `si`or `id`. If an anomaly has been detected the root cause is queried from Amber and stored on the Amber measurement as well.

If the ML model has changed its state, a corresponding Cumulocity event is created for the device to notify about the change of state.

See `com/softwareag/amber/service/DeviceConfigurationService.java` for related implementation.

## How to run locally:

1. Build project

   mvn clean install

2. Create a new Microservice application on your Cumulocity IoT tenant. In the directory `Postman` you will find a Postman collection `c8y-Microservice.postman_collection.json`, which contains template requests to create a Microservice and to query the corresponding bootstrap user. Import the collection into your Postman environment.

   `POST https://{base-url}/application/applications`

   Request body:

   ```json
   {
     "key": "amber-integration-dev",
     "name": "amber-integration-dev",
     "contextPath": "amber-integration-dev",
     "type": "MICROSERVICE",
     "manifest": {},
     "requiredRoles": [
       "ROLE_INVENTORY_READ",
       "ROLE_INVENTORY_CREATE",
       "ROLE_INVENTORY_ADMIN",
       "ROLE_IDENTITY_READ",
       "ROLE_IDENTITY_ADMIN",
       "ROLE_AUDIT_READ",
       "ROLE_AUDIT_ADMIN",
       "ROLE_TENANT_MANAGEMENT_READ",
       "ROLE_TENANT_MANAGEMENT_ADMIN",
       "ROLE_OPTION_MANAGEMENT_READ",
       "ROLE_OPTION_MANAGEMENT_ADMIN",
       "ROLE_MEASUREMENT_READ",
       "ROLE_MEASUREMENT_ADMIN",
       "ROLE_EVENT_ADMIN",
       "ROLE_EVENT_READ",
       "ROLE_ALARM_ADMIN",
       "ROLE_ALARM_READ"
     ],
     "roles": []
   }
   ```

   Make sure to provide the correct authorization for the request.

3. Subscribe the Microservice application to your tenant via UI

4. Acquire microservice bootstrap credentials

   `GET https://{base-url}/application/applications/{applicationId}/bootstrapUser`

   Response body:

   ```json
   {
     "password": "************************",
     "name": "servicebootstrap_amber-integration-dev",
     "tenant": "<your tenant>"
   }
   ```

   Make sure to provide the correct authorization for the request.

5. Provide bootstrap credentials

   Add the bootstrap credentials to your `src/main/resources/application.properties`. Comment in all the properties.

6. Start microservice

   Either run the Microservice on command line with `java -jar amber-integration.jar` or within your IDE.

