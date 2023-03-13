# GPTChatPro
This is a blatant clone of [ChatGPT](https://chat.openai.com/) which uses the new gpt-3.5-turbo model. This can be used as an alternative to the ChatGPT Plus subscription service. You only need to pay the API costs of OpenAI on demand with this one. This is for the people who don't think they will use up 20$ of API credit per month.

<p>
  <img src="https://cloud.hs-augsburg.de/s/eDBcQyiJkHB4ezc/preview" alt="Demonstration of the UI" style="width:512px; height:auto">
</p>

## How to use
Clone this repository and create a .env file where you store your OpenAI API key ([FIND YOUR API KEY HERE](https://platform.openai.com/account/api-keys)).

The content of the .env file should look like this:
```
OPENAI_API_KEY = "YOUR API KEY"
```
and it should be placed in the same directory as the app.py file:
```
.
├── .env <-- This is where you store your API key
├── app.py
├── chat_handler.py
├── LICENSE
├...
├...
└── README.md
```


Then run install the required packages with `pip install -r requirements.txt`. Then run `python app.py` and you should be good to go.

## Feedback
If you have any feedback, please open an issue I would love to help you in any way I can and to improve this project. THANK YOU! :)
