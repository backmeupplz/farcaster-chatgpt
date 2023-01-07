# Farcaster ChatGPT

Listens to mentions and replies with ChatGPT.

## Installation and local launch

1. Clone this repo: `git clone https://github.com/backmeupplz/farcaster-chatgpt`
2. Launch the [mongo database](https://www.mongodb.com/) locally
3. Create `.env` with the environment variables listed below
4. Run `yarn` in the root folder
5. Run `yarn start`

And you should be good to go! Feel free to fork and submit pull requests.

## Environment variables

| Name                 | Description                    |
| -------------------- | ------------------------------ |
| `MONGO`              | URL of the mongo database      |
| `FARCASTER_MNEMONIC` | Mnemonic for the bot's account |
| `OPEN_AI_USERNAME`   | OpenAI API username            |
| `OPEN_AI_PASSWORD`   | OpenAI API password            |
| `TWO_CAPTCHA_TOKEN`  | 2Captcha API token             |

Also, please, consider looking at `.env.sample`.
