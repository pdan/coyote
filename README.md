# Coyote

Simple Dynamic DNS console app which using [Cloudflare](https://cloudflare.com) to update DNS records.

![Coyote Settings](https://cldup.com/kYwNLJXjMx.png)

## Installation

Make sure you've installed Node.js - It's recommended the latest **Node v4.x** release.

1. Download or clone the latest release of Coyote.

1. `cd` to `coyote` directory.

1. `npm install`

1. `NODE_ENV=production node index.js`

1. Fire up a browser and enter `http://localhost:11235` (Or your server address instead of `localhost`)

1. Go to **Settings** tab and fill boxes and click on **Save** button to save informations.

   ![Coyote Settings](https://cldup.com/yo7acQlvEB.png)

1. Go to **Zones List** tab and click on **Refresh Zones List** to fetch your zones list from Cloudflare.

1. Check your zones which you want to be set as a dynamic IP and click on **Save** button.

1. Now database is ready, you can kill this app process.

1. In console run `./bin/coyote -c` to check your external IP Address every x second (Based on your settings)

    *Also you can using `crontab` to run `./bin/coyote` (without `-c` switch).*

    ​
