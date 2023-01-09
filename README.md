## Installation

### OSX

`brew install node`

### Ubuntu
`sudo apt update`

`sudo apt install nodejs npm`

### To Run

`npm install`

`npm run dev`

The site should be located at: `localhost:3000`

### To build a static site:

modify `next.config.js` with the path you want to host from, then run

`npm run export`

## To run as a backend (i.e. for use with API routes):

`npm run start`

A systemd unit file (`gpuharbor.service`) is also included for use on Linux systems, and can be symlinked into the correct spot (e.g. `/lib/systemd/system/gpuharbor.service`).

### From the base template:

https://nextjs.org/learn
