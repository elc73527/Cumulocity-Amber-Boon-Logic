
# Amber RCA Widget for Cumulocity


## Overview

The Amber RCA widget help you to track real-time RCA values, when ever Anamoly is detected which would be AD>0.
This widget is designed to display the chart for the specific measurement  type - AD. It groups the measurements based on the interval selected (hour/minute basis with real time enabled) and displays the line chart against timeline for each. 

And when ever AD>0 on click one can see the relavent RCA.

 ## Features

 *  **Support single device:** Based on widget configuration.
 *  **Display realtime measurement update:** whenever a new measurement  is triggered it updates the chart.
 * **Displays the RCA when AD > 0:** Displays the current state based on last event status.

## Supported Product Versions

###  Amber RCA widget - Cumulocity/Application builder version:

|APPLICATION BUILDER | CUMULOCITY | AMBER RCA  WIDGET |
|--------------------|------------|-------------------|
| 1.3.x              | >= 1011.x.x| 2.x.x             |

## Installation

### Runtime Widget Deployment?

* This widget support runtime deployment. Download **[Runtime Binary](https://labcase.softwareag.com/projects/boon-logic/storage/files/1335524/download)** and use application builder to install your runtime widget.

### Installation of widget through Appbuilder 

**Prerequisites:**
  
* Git
  
* NodeJS (release builds are currently built with `v14.18.0`)
  
* NPM (Included with NodeJS)
  
**External dependencies:**

```

 "@angular/cdk": "^11.2.13",

 "chart.js": "^2.9.3",

 "@angular/core": "~11.1.2",

"ng2-charts": "^2.3.2",

"@c8y/ngx-components": "1011.0.12",

"@c8y/ng1-modules": "1011.0.12",

"@c8y/style": "1011.0.12",

```

**Installation Steps For App Builder:**

**Note:** If you are new to App Builder or not yet downloaded/clone app builder code then please follow [App builder documentation(Build Instructions)](https://github.com/SoftwareAG/cumulocity-app-builder) before proceeding further.

1. Open Your existing App Builder project and install external dependencies by executing below command or install it manually.

  - Ng2-charts version ^2.4.3

    Installation command:  ```npm install ng2-charts@2.4.3 --save``` 

  - Chart.js version 2.9.3

      Installation command :  ```npm i chart.js@2.9.3 ``` 

2. Grab the Amber RCA Chart **[Latest Release Binary](https://labcase.softwareag.com/projects/boon-logic/storage/files/1335525/download)**

3. Install the Binary file in app builder.

```
npm i <binary  file  path>/gp-lib-rca-1.0.0.tgz
```
4. Open index.less located at /cumulocity-app-builder/ui-assets/

5. Update index.less file with below theme. Import at first line in file/begining of file(Please ignore this step if it already exist).

```
@import '~@angular/material/prebuilt-themes/indigo-pink.css';
@import '~@c8y/style/main.less';
@import '~@c8y/style/extend.less';
```
6. Import GpLibRcaModule in app.module.ts and also place the imported Module under `@NgModule`.

```

import {GpLibRcaModule} from 'gp-lib-rca';

@NgModule({

  imports: [

    GpLibRcaModule    

      ]

  })

```

7.  Congratulation! Installation is now completed. Now you can run app builder locally or build and deploy it into your tenant.
  
```
//Start App Builder
npm run start
// Build App
npm run build
// Deploy App
npm run deploy
```

## Build Instructions
  
**Note:** It is only necessary to follow these instructions if you are modifying/extending this widget, otherwise see the [Installation Guide](#Installation).
  
**Prerequisites:**
  
* Git
  
* NodeJS (release builds are currently built with `v14.18.0`)
  
* NPM (Included with NodeJS)

**Instructions**

1. Clone the repository:
```
git clone https://labcase.softwareag.com/labcase/boon-logic.boon-logic.git
```
2. Change directory:

  ```cd cumulocity-root-cause-analysis-widget```

3. run npm i command to install all library files specified in source code

  ```npm i ``` 

4. run npm run buildMinor command to create a binary file under dist folder

  ```npm run buildMinor ``` 

5. (Optional) Local development server:
  
  ```npm start```

6. Build the app:

  ```npm run build```

7. Deploy the app:
  ```npm run deploy```

## QuickStart
This guide will teach you how to add widget in your existing or new dashboard.

1. Open the Application Builder from the app switcher (Next to your username in the top right)

2. Click Add application

3. Enter the application details and click Save

4. Select Add dashboard

5. Click Blank Dashboard

6. Enter the dashboard details and click Save

7. Select the dashboard from the navigation

8. Check for your widget and test it out.



Congratulations! RCA Chart is configured.


## User Guide
1. Target Assets/Devices - deviceid of interest(need to be pre configured with Amber)
2. Select Device Specific relavent RCA measurements - name of the RCA measurements for which you want chart.
3. Legend - position of legend by defaut is top (not configurable)
4. Interval -  Group AD value for last hour/last minute.
                
One can also select the custom chart color and Border color to beautify the chart, if not default colors will be picked.