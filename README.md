# Introduction
Foward notifications to E-Mail.<br >
Multiple receipts can be defined.

> [!IMPORTANT] 
> Dont forget to configure the SMPT Server & credentials

# Installation
1) Create a new plugin over the OpenHaus backend HTTP API
2) Mount the plugin source code folder into the backend
3) run `npm install`

# Development
Add plugin item via HTTP API:<br />
[PUT] `http://{{HOST}}:{{PORT}}/api/plugins/`
```json
{
   "name":"oh-plg-smtp-sender",
   "version": "1.0.0",
   "intents":[
      "store",
      "vault"
   ],
   "uuid": "bc9b8757-be61-4f23-bfaa-1d0a0b61d1c5"
}
```

Mount the source code into the backend plugins folder
```sh
sudo mount --bind ~/projects/OpenHaus/plugins/oh-plg-smtp-sender/ ~/projects/OpenHaus/backend/plugins/bc9b8757-be61-4f23-bfaa-1d0a0b61d1c5/
```
